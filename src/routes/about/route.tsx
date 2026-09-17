import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => {
    const canonical = absoluteUrl("/about");
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `About ${SITE_NAME}`,
      description: SITE_DESCRIPTION,
      url: canonical,
    });
    return {
      meta: [
        { property: "og:url", content: canonical },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [{ type: "application/ld+json", children: jsonLd }],
    };
  },
});

function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-invert max-w-none">
        <h1>About FontFridge</h1>

        <p>
          FontFridge is an enhanced Google Fonts browser built by{" "}
          <a href="https://chingru.com">ChingRu</a> to make discovering and
          comparing open-source fonts easier. The site runs on Cloudflare
          Workers and serves its catalog as static JSON, with no database and no
          rate limits. Each family includes extracted font-binary data (OpenType
          features, variable axes, metrics, writing systems) plus subjective
          style classifications, so you can answer specific questions like "a
          playful variable sans" or "a high-contrast serif that supports
          Devanagari" directly from the catalog without needing to download or
          preview every family individually.
        </p>

        <h2>What FontFridge does</h2>

        <p>
          Google Fonts publishes 1,942+ open-source font families. FontFridge
          enriches that catalog with extracted data from the font binaries
          themselves:
        </p>

        <ul>
          <li>Variable font axes and their ranges</li>
          <li>OpenType feature support (ligatures, small caps, etc.)</li>
          <li>Exact writing system support via Unicode coverage</li>
          <li>Font metrics (x-height, cap height, contrast)</li>
          <li>Subjective style classifications from Google</li>
        </ul>

        <p>
          This data lets you answer specific questions: "a playful variable
          sans", "a high-contrast serif that supports Devanagari", or "a
          monospace with small-caps for code comments". The UI filters,
          previews, and lets you save favorites across devices via JSON export.
        </p>

        <h2>How the data works</h2>

        <p>
          FontFridge does not store or serve font files. All downloads link to
          Google Fonts. The catalog is rebuilt daily from upstream sources:
        </p>

        <ul>
          <li>
            Family metadata and classifications from{" "}
            <a href="https://fonts.google.com">Google Fonts</a>
          </li>
          <li>
            Font binary analysis using{" "}
            <a href="https://github.com/googlefonts/lang">gflanguages</a>
          </li>
          <li>OpenType feature extraction via fontTools</li>
        </ul>

        <p>
          The full or slim catalog is served as static JSON, cached for hours at
          Cloudflare's edge. No authentication required, no rate limits.
        </p>

        <h2>Contact</h2>

        <p>
          Built by <a href="https://chingru.com">ChingRu</a>. For questions or
          feedback, see <a href="/contact">contact details</a>.
        </p>

        <h2>Data sources</h2>

        <p>
          Each font keeps its own license (OFL, Apache 2.0, Ubuntu Font
          License). The FontFridge metadata index is MIT-licensed. See{" "}
          <a href="/llms.txt">llms.txt</a> and the LICENSE file for details.
        </p>
      </article>
    </main>
  );
}
