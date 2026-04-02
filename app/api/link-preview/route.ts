import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

function pickFirst(...values: (string | undefined | null)[]) {
  for (const v of values) {
    if (v && v.trim()) return v.trim();
  }
  return "";
}

function absoluteUrl(url: string | undefined, base: string) {
  if (!url) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FreeRadarBot/1.0)",
      },
      cache: "no-store",
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = pickFirst(
      $('meta[property="og:title"]').attr("content"),
      $('meta[name="twitter:title"]').attr("content"),
      $("title").text()
    );

    const description = pickFirst(
      $('meta[property="og:description"]').attr("content"),
      $('meta[name="twitter:description"]').attr("content"),
      $('meta[name="description"]').attr("content")
    );

    const imageUrl = absoluteUrl(
      pickFirst(
        $('meta[property="og:image"]').attr("content"),
        $('meta[name="twitter:image"]').attr("content"),
        $("img").first().attr("src")
      ),
      url
    );

    return NextResponse.json({
      title,
      description,
      imageUrl,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
