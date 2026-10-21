import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => {
    const canonical = absoluteUrl("/privacy");
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Privacy Policy - ${SITE_NAME}`,
      description: "How FontFridge handles your data",
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

function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-invert max-w-none">
        <h1>Privacy Policy</h1>

        <p>
          <strong>Last updated: September 2024</strong>
        </p>

        <p>
          FontFridge respects your privacy. The site is designed to work without
          collecting personal information. When you use FontFridge, you interact
          only with the public, read-only font catalog. All font preferences
          (favorites, theme, sort order) are stored locally in your browser and
          never sent to any server.
        </p>

        <h2>What we collect</h2>

        <p>FontFridge does not collect personal data directly. However:</p>

        <ul>
          <li>
            <strong>Cloudflare logs:</strong> Request IP addresses, User-Agent
            strings, and referring domains are logged by Cloudflare (our hosting
            provider) for security and performance monitoring.
          </li>
          <li>
            <strong>Web Analytics:</strong> Cloudflare Web Analytics records
            pageviews and basic traffic patterns. No cookies or personal
            identifiers are stored.
          </li>
          <li>
            <strong>localStorage:</strong> Your browser stores preferences
            locally (theme, view mode, sort order, saved favorites). This data
            never leaves your device.
          </li>
        </ul>

        <h2>What we do not do</h2>

        <ul>
          <li>No tracking pixels or third-party analytics</li>
          <li>No login system or user accounts</li>
          <li>No selling or sharing of data</li>
          <li>No cookies for advertising or behavior tracking</li>
          <li>No external API calls that identify you</li>
        </ul>

        <h2>Font files</h2>

        <p>
          FontFridge does not serve font files. All downloads link directly to
          Google Fonts. When you download, you are interacting with Google's
          infrastructure, not FontFridge.
        </p>

        <h2>Data retention</h2>

        <p>
          Cloudflare retains access logs for a limited time (see their{" "}
          <a href="https://www.cloudflare.com/privacypolicy/">privacy policy</a>
          ). The font catalog is refreshed daily and stored in Cloudflare's
          cache, but is publicly available and not tied to individual users.
        </p>

        <h2>Contact</h2>

        <p>
          For privacy questions, contact{" "}
          <a href="mailto:hello@chingru.com">hello@chingru.com</a>.
        </p>
      </article>
    </main>
  );
}
