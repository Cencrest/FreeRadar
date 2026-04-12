import * as cheerio from "cheerio";
import { createAdminClient } from "@/lib/supabase/admin";

const NYC_FREE_STUFF_URL = "https://newyork.craigslist.org/d/free-stuff/search/zip";
const MAX_RESULTS_TO_IMPORT = 36;
const IMPORT_COOLDOWN_MINUTES = 15;
const IMPORT_OWNER_USER_ID = process.env.IMPORT_OWNER_USER_ID || null;

type SearchResult = {
  source_url: string;
  title: string;
  original_posted_at: string | null;
};

type ImportedListing = {
  title: string;
  description: string;
  image_url: string;
  source_url: string;
  category: string;
  city: string;
  state: string;
  zip: string;
  original_posted_at: string | null;
};

function pickFirst(...values: Array<string | undefined | null>) {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return "";
}

function absoluteUrl(value: string | undefined | null, base: string) {
  if (!value) return "";
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function normalizePostedAt(value: string | undefined | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function inferCityState(locationText: string) {
  const cleaned = (locationText || "").trim();

  if (!cleaned) {
    return { city: "", state: "NY" };
  }

  const parts = cleaned
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1].toUpperCase(),
    };
  }

  return {
    city: cleaned,
    state: "NY",
  };
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FreeRadarBot/1.0; +https://free-radar.vercel.app)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return response.text();
}

async function extractSearchResults(searchUrl: string): Promise<SearchResult[]> {
  const html = await fetchText(searchUrl);
  const $ = cheerio.load(html);

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  // Current Craigslist markup (2024–2025): li[data-pid] with a.cl-app-anchor
  $("li[data-pid]").each((_, el) => {
    const linkEl = $(el).find("a.cl-app-anchor, a").first();
    const href = linkEl.attr("href") || "";
    const title = $(el).find(".label, .titlestring, a").first().text().trim();
    const absolute = absoluteUrl(href, searchUrl);

    if (!absolute || !title) return;
    if (!absolute.includes("craigslist.org")) return;
    if (!absolute.includes(".html")) return;
    if (seen.has(absolute)) return;

    const postedAt = normalizePostedAt(
      $(el).find("time").attr("datetime") || null
    );

    seen.add(absolute);
    results.push({ source_url: absolute, title, original_posted_at: postedAt });
  });

  // Fallback: newer gallery/list hybrid markup
  if (results.length === 0) {
    $(".cl-search-result, .cl-static-search-result").each((_, el) => {
      const linkEl = $(el).find("a").first();
      const href = linkEl.attr("href") || "";
      const title = linkEl.text().trim() || $(el).find(".label").text().trim();
      const absolute = absoluteUrl(href, searchUrl);

      if (!absolute || !title) return;
      if (!absolute.includes("craigslist.org")) return;
      if (!absolute.includes(".html")) return;
      if (seen.has(absolute)) return;

      const postedAt = normalizePostedAt(
        $(el).find("time").attr("datetime") || null
      );

      seen.add(absolute);
      results.push({ source_url: absolute, title, original_posted_at: postedAt });
    });
  }

  // Legacy fallback: old Craigslist markup
  if (results.length === 0) {
    $(".result-row").each((_, el) => {
      const linkEl = $(el).find(".result-title").first();
      const href = linkEl.attr("href") || "";
      const title = linkEl.text().trim();
      const absolute = absoluteUrl(href, searchUrl);

      if (!absolute || !title) return;
      if (!absolute.includes("craigslist.org")) return;
      if (!absolute.includes(".html")) return;
      if (seen.has(absolute)) return;

      const postedAt = normalizePostedAt(
        $(el).find("time").attr("datetime") || null
      );

      seen.add(absolute);
      results.push({ source_url: absolute, title, original_posted_at: postedAt });
    });
  }

  // Last resort: grab any craigslist .html links on the page
  if (results.length === 0) {
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const title = $(el).text().trim();
      const absolute = absoluteUrl(href, searchUrl);

      if (!absolute || !title) return;
      if (!absolute.includes("craigslist.org")) return;
      if (!absolute.includes(".html")) return;
      if (seen.has(absolute)) return;
      if (title.length < 4) return;

      seen.add(absolute);
      results.push({ source_url: absolute, title, original_posted_at: null });
    });
  }

  results.sort((a, b) => {
    const aTime = new Date(a.original_posted_at || 0).getTime();
    const bTime = new Date(b.original_posted_at || 0).getTime();
    return bTime - aTime;
  });

  return results.slice(0, MAX_RESULTS_TO_IMPORT);
}

async function extractListingFromDetailPage(
  result: SearchResult
): Promise<ImportedListing> {
  const html = await fetchText(result.source_url);
  const $ = cheerio.load(html);

  const title = pickFirst(
    $('meta[property="og:title"]').attr("content"),
    $('meta[name="twitter:title"]').attr("content"),
    $("#titletextonly").text(),
    $("title").text(),
    result.title
  );

  const description = pickFirst(
    $('meta[property="og:description"]').attr("content"),
    $('meta[name="description"]').attr("content"),
    $("#postingbody").text().replace("QR Code Link to This Post", "").trim()
  );

  const imageUrl = absoluteUrl(
    pickFirst(
      $('meta[property="og:image"]').attr("content"),
      $('meta[name="twitter:image"]').attr("content"),
      $("img").first().attr("src")
    ),
    result.source_url
  );

  const locationText = pickFirst(
    $(".postingtitletext small").text(),
    $(".mapaddress").text(),
    $('meta[property="geo.placename"]').attr("content")
  );

  const rawPostedAt = pickFirst(
    $("time[datetime]").attr("datetime"),
    $('meta[property="article:published_time"]').attr("content"),
    $('meta[name="date"]').attr("content"),
    result.original_posted_at
  );

  const originalPostedAt = normalizePostedAt(rawPostedAt);
  const { city, state } = inferCityState(locationText);

  return {
    title: title || result.title,
    description,
    image_url: imageUrl,
    source_url: result.source_url,
    category: "free stuff",
    city,
    state,
    zip: "",
    original_posted_at: originalPostedAt,
  };
}

export async function importCraigslistNycFreeStuff(options?: {
  force?: boolean;
}) {
  const supabase = createAdminClient();
  const force = options?.force ?? false;

  const cooldownCutoff = new Date(
    Date.now() - IMPORT_COOLDOWN_MINUTES * 60 * 1000
  ).toISOString();

  if (!force) {
    const { data: recentRows, error: recentError } = await supabase
      .from("listings")
      .select("id")
      .eq("category", "free stuff")
      .like("source_url", "%craigslist.org%")
      .gte("created_at", cooldownCutoff)
      .limit(1);

    if (recentError) {
      throw new Error(`Recent rows check failed: ${recentError.message}`);
    }

    if (recentRows && recentRows.length > 0) {
      return {
        imported: 0,
        skipped: true,
        checked: 0,
      };
    }
  }

  const searchResults = await extractSearchResults(NYC_FREE_STUFF_URL);

  if (searchResults.length === 0) {
    return {
      imported: 0,
      skipped: false,
      checked: 0,
    };
  }

  const sourceUrls = searchResults.map((r) => r.source_url);

  const { data: existingRows, error: existingError } = await supabase
    .from("listings")
    .select("source_url")
    .in("source_url", sourceUrls);

  if (existingError) {
    throw new Error(`Existing rows check failed: ${existingError.message}`);
  }

  const existing = new Set((existingRows ?? []).map((row) => row.source_url));
  const newResults = searchResults.filter(
    (result) => !existing.has(result.source_url)
  );

  const importedRows: Array<Record<string, unknown>> = [];
  const preparedTitles = new Set<string>();

  for (const result of newResults) {
    try {
      const extracted = await extractListingFromDetailPage(result);

      const dedupeKey = `${(extracted.title || "").trim().toLowerCase()}::${(
        extracted.city || ""
      )
        .trim()
        .toLowerCase()}`;

      if (preparedTitles.has(dedupeKey)) {
        continue;
      }

      preparedTitles.add(dedupeKey);

      const row: Record<string, unknown> = {
        title: extracted.title || "Untitled listing",
        description: extracted.description || "Imported from Craigslist.",
        image_url: extracted.image_url || null,
        source_url: extracted.source_url,
        category: extracted.category,
        city: extracted.city || null,
        state: extracted.state || "NY",
        zip: extracted.zip || null,
        original_posted_at: extracted.original_posted_at,
        is_active: true,
        active_until: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      if (IMPORT_OWNER_USER_ID) {
        row.user_id = IMPORT_OWNER_USER_ID;
      }

      importedRows.push(row);
    } catch (error) {
      console.error(
        "Failed to extract listing detail page:",
        result.source_url,
        error
      );
    }
  }

  if (importedRows.length > 0) {
    const { error: upsertError } = await supabase
      .from("listings")
      .upsert(importedRows, {
        onConflict: "source_url",
        ignoreDuplicates: true,
      });

    if (upsertError) {
      throw new Error(`Upsert failed: ${upsertError.message}`);
    }
  }

  return {
    imported: importedRows.length,
    skipped: false,
    checked: searchResults.length,
  };
}
