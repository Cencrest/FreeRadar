import * as cheerio from "cheerio";
import { createClient } from "@/lib/supabase/server";

const NYC_FREE_STUFF_URL =
  "https://newyork.craigslist.org/search/zip#search=2~gallery~6";

const MAX_RESULTS_TO_IMPORT = 24;
const IMPORT_COOLDOWN_MINUTES = 15;

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

async function fetchHtml(url: string) {
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
  const html = await fetchHtml(searchUrl);
  const $ = cheerio.load(html);

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();

    if (!href || !text) return;

    const absolute = absoluteUrl(href, searchUrl);

    if (!absolute.includes("craigslist.org")) return;
    if (!absolute.includes(".html")) return;
    if (seen.has(absolute)) return;

    seen.add(absolute);

    results.push({
      source_url: absolute,
      title: text,
    });
  });

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
    $("#postingbody")
      .text()
      .replace("QR Code Link to This Post", "")
      .trim()
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
  };
}

export async function importCraigslistNycFreeStuff(options?: {
  force?: boolean;
}) {
  const supabase = await createClient();
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
      throw new Error(recentError.message);
    }

    if (recentRows && recentRows.length > 0) {
      return {
        imported: 0,
        skipped: true,
      };
    }
  }

  const searchResults = await extractSearchResults(NYC_FREE_STUFF_URL);

  if (searchResults.length === 0) {
    return {
      imported: 0,
      skipped: false,
    };
  }

  const sourceUrls = searchResults.map((r) => r.source_url);

  const { data: existingRows, error: existingError } = await supabase
    .from("listings")
    .select("source_url")
    .in("source_url", sourceUrls);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existing = new Set(
    (existingRows ?? []).map((row) => row.source_url)
  );

  const newResults = searchResults.filter(
    (result) => !existing.has(result.source_url)
  );

  const importedRows: Array<Record<string, unknown>> = [];

  for (const result of newResults) {
    try {
      const extracted = await extractListingFromDetailPage(result);

      importedRows.push({
        title: extracted.title || "Untitled listing",
        description: extracted.description || "Imported from Craigslist.",
        image_url: extracted.image_url || null,
        source_url: extracted.source_url,
        category: extracted.category,
        city: extracted.city || null,
        state: extracted.state || "NY",
        zip: extracted.zip || null,
        is_active: true,
        active_until: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    } catch (error) {
      console.error(
        "Failed to import Craigslist listing:",
        result.source_url,
        error
      );
    }
  }

  if (importedRows.length > 0) {
    const { error: insertError } = await supabase
      .from("listings")
      .insert(importedRows);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return {
    imported: importedRows.length,
    skipped: false,
  };
}
