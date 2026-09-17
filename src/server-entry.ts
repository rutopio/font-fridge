import serverEntry from "@tanstack/react-start/server-entry";
import type { FontRecord } from "@/lib/fonts/types";
import { mcpEndpoint } from "@/mcp/server";

const BASE_URL = "https://font.chingru.com";
const DETAIL_TABS = [
  "instances",
  "paragraph",
  "glyphs",
  "detail",
  "designer",
  "use",
  "license",
];

const LINK_HEADER = [
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</openapi.json>; rel="service-desc"; type="application/openapi+json"',
].join(", ");

const HOME_CACHE_SECONDS = 600;
const HOME_SWR_SECONDS = 3600;

// Home keys on BUILD_ID (asset hashes change); detail keys on DATA_VERSION
// so code-only deploys don't invalidate cached detail renders.
declare const __BUILD_ID__: string;
declare const __DATA_VERSION__: string;

async function resolveCatalogUrl(signal?: AbortSignal): Promise<string> {
  try {
    const m = await fetch("/catalog-manifest.json", { signal });
    if (!m.ok) return "/catalog.json";
    const { path } = (await m.json()) as { path?: string };
    return path ?? "/catalog.json";
  } catch (err) {
    return "/catalog.json";
  }
}

async function generateSitemap(): Promise<string> {
  const catalogUrl = await resolveCatalogUrl();
  const res = await fetch(new URL(catalogUrl, BASE_URL));
  if (!res.ok) throw new Error(`catalog fetch failed: ${res.status}`);
  const fonts = (await res.json()) as FontRecord[];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const font of fonts) {
    for (const tab of DETAIL_TABS) {
      xml += `
  <url>
    <loc>${BASE_URL}/${tab}/${encodeURIComponent(font.id)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return xml;
}

function cacheKey(request: Request, version: string): Request {
  const url = new URL(request.url);
  url.searchParams.set("__b", version);
  return new Request(url, request);
}

const DETAIL_CACHE_SECONDS = 86400;
const DETAIL_SWR_SECONDS = 604800;
const DETAIL_TAB_SLUGS = new Set([
  "instances",
  "paragraph",
  "glyphs",
  "detail",
  "designer",
  "use",
  "license",
]);

function isCacheableDetail(url: URL): boolean {
  if (url.search !== "") return false;
  const parts = url.pathname.split("/");
  return (
    parts.length === 3 && DETAIL_TAB_SLUGS.has(parts[1]) && parts[2] !== ""
  );
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  // Keep in sync with public/_headers (static assets); this covers SSR HTML.
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com; connect-src 'self' https://fonts.googleapis.com https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};

export default {
  async fetch(
    ...args: Parameters<typeof serverEntry.fetch>
  ): Promise<Response> {
    const request = args[0] as Request;
    const assets = (args[1] as { ASSETS?: { fetch: typeof fetch } })?.ASSETS;

    const mcp = await mcpEndpoint(request, assets);
    if (mcp) return mcp;

    const url = new URL(request.url);
    if (url.pathname === "/sitemap.xml") {
      const xml = await generateSitemap();
      return new Response(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const accept = request.headers?.get?.("accept") ?? "";
    if (accept.includes("text/markdown") && !accept.includes("text/html")) {
      const url = new URL(request.url);
      const llms = assets
        ? await assets.fetch(new Request(new URL("/llms.txt", url)))
        : undefined;
      const body = llms?.ok
        ? await llms.text()
        : "# FontFridge\n\nSee /llms.txt";
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          Link: LINK_HEADER,
          "X-Content-Type-Options": "nosniff",
          // Every URL can answer as HTML or as markdown depending on Accept.
          // Without this a CDN caches whichever variant it saw first and then
          // serves it to the other kind of client (acceptmarkdown.com).
          Vary: "Accept, Accept-Encoding",
        },
      });
    }

    const isGet = request.method === "GET";
    const isCacheableHome = isGet && url.pathname === "/" && url.search === "";
    const isCacheablePage =
      import.meta.env.PROD &&
      (isCacheableHome || (isGet && isCacheableDetail(url)));
    const cache = (caches as unknown as { default: Cache }).default;
    const key = isCacheablePage
      ? cacheKey(request, isCacheableHome ? __BUILD_ID__ : __DATA_VERSION__)
      : request;
    if (isCacheablePage) {
      const hit = await cache.match(key);
      if (hit) return hit;
    }

    const res = await serverEntry.fetch(...args);

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return res;

    const next = new Response(res.body, res);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      next.headers.set(name, value);
    }
    next.headers.set("Link", LINK_HEADER);
    // Pairs with the markdown branch above: these URLs vary on Accept, so the
    // HTML variant must say so too or a cache can hand it to an agent that
    // asked for markdown.
    next.headers.set("Vary", "Accept, Accept-Encoding");

    if (isCacheablePage && next.status === 200) {
      next.headers.set(
        "Cache-Control",
        isCacheableHome
          ? `public, max-age=${HOME_CACHE_SECONDS}, stale-while-revalidate=${HOME_SWR_SECONDS}`
          : `public, max-age=${DETAIL_CACHE_SECONDS}, stale-while-revalidate=${DETAIL_SWR_SECONDS}`
      );
      const ctx = (args as unknown[])[2] as ExecutionContext | undefined;
      const write = cache.put(key, next.clone());
      if (ctx?.waitUntil) ctx.waitUntil(write);
    }
    return next;
  },
};
