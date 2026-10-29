export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREST_SOURCES = [
  "https://upload.wikimedia.org/wikipedia/commons/b/b5/Presbyterian_Church_of_Ghana_Crest.png",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Presbyterian_Church_of_Ghana_Crest.png",
];

export async function GET() {
  for (const source of CREST_SOURCES) {
    try {
      const response = await fetch(source, {
        headers: { "User-Agent": "PeaceCongregationPWA/1.0 (church website icon)" },
        next: { revalidate: 86400 },
      });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("image/")) continue;
      const image = await response.arrayBuffer();
      if (!image.byteLength) continue;
      return new Response(image, {
        status: 200,
        headers: {
          "Content-Type": contentType.includes("png") ? "image/png" : contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // Try the next official Wikimedia source if the first one is unavailable.
    }
  }
  return new Response("The official Presbyterian Church of Ghana crest is temporarily unavailable.", {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}
