import * as cheerio from "cheerio";
import { createAdminClient } from "@/lib/supabase/admin";

const NYC_FREE_STUFF_URL = "https://newyork.craigslist.org/search/zip";
const MAX_RESULTS_TO_IMPORT = 24;
const IMPORT_COOLDOWN_MINUTES = 15;
const IMPORT_OWNER_USER_ID = process.env.IMPORT_OWNER_USER_ID || null;

type SearchResult = {
  source_url: string;
  title: string;
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

function normalizePostedAt(value: string | undefined | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

async function fetchHtml(url: string) {
  console.log("Fetching URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FreeRadarBot/1.0; +https://free-radar.vercel.app)",
    },
    cache: "no-store",
  });

  console.log("Fetch status:", url, response.status);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return response.text();
}

async function extractSearchResults(searchUrl: string): Promise<SearchResult[]> {
  const html = await fetchHtml(searchUrl);
  const $ = cheerio.load(html);

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    const absolute = absoluteUrl(href, searchUrl);

    if (!href || !text) return;
    if (!absolute.includes("craigslist.org")) return;
    if (!absolute.includes(".html")) return;
    if (seen.has(absolute)) return;

    seen.add(absolute);

    results.push({
      source_url: absolute,
      title: text,
    });
  });

  console.log("Search results found:", results.length);
  console.log(
    "First few results:",
    results.slice(0, 5).map((r) => r.source_url)
  );

  return results.slice(0, MAX_RESULTS_TO_IMPORT);
}

async function extractListingFromDetailPage(
  result: SearchResult
): Promise<ImportedListing> {
  const html = await fetchHtml(result.source_url);
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
    $('meta[name="date"]').attr("content")
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

  console.log("=== IMPORT START ===");
  console.log("Force:", force);
  console.log("IMPORT_OWNER_USER_ID present:", !!IMPORT_OWNER_USER_ID);

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
      console.log("Skipping import due to cooldown");
      return {
        imported: 0,
        skipped: true,
        checked: 0,
      };
    }
  }

  const searchResults = await extractSearchResults(NYC_FREE_STUFF_URL);

  if (searchResults.length === 0) {
    console.log("No search results found");
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

  console.log("Existing rows found:", existing.size);
  console.log("New results to import:", newResults.length);

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
        console.log("Skipping duplicate prepared row:", dedupeKey);
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

  console.log("Rows prepared for upsert:", importedRows.length);

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

  console.log("=== IMPORT COMPLETE ===");

  return {
    imported: importedRows.length,
    skipped: false,
    checked: searchResults.length,
  };
}
