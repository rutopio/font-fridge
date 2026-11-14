import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => {
    const canonical = absoluteUrl("/contact");
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Contact ${SITE_NAME}`,
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

function Contact() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-invert max-w-none">
        <h1>Contact</h1>

        <p>
          FontFridge is made by <a href="https://chingru.com">ChingRu</a>, a
          designer and developer interested in open-source typography tools and
          making font discovery accessible to everyone. For inquiries, feature
          requests, or to report issues with font metadata, please reach out
          using one of the channels below.
        </p>

        <h2>Reach out</h2>

        <p>
          For questions about FontFridge, font metadata errors, or feature
          requests, you can contact the author through:
        </p>

        <ul>
          <li>
            Email: <a href="mailto:hello@chingru.com">hello@chingru.com</a>
          </li>
          <li>
            Portfolio: <a href="https://chingru.com">chingru.com</a>
          </li>
          <li>
            This project is open-source:{" "}
            <a href="https://github.com/rutopio/font-fridge">
              github.com/rutopio/font-fridge
            </a>
          </li>
        </ul>

        <h2>Font metadata issues</h2>

        <p>
          If you find an error in a font's tags, classifications, or axes (for
          example, wrong weight range, missing features, misclassified language
          support), these often trace to the upstream Google Fonts repository or
          the harvester. Consider filing an issue upstream first.
        </p>

        <h2>Privacy</h2>

        <p>
          FontFridge collects no personal data beyond what Cloudflare logs (IP,
          User-Agent, referer). See <a href="/privacy">privacy policy</a>.
        </p>
      </article>
    </main>
  );
}
