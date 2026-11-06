import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },

    scrollRestoration: false,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultStaleTime: 5 * 60_000,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  if (typeof window !== "undefined" && import.meta.env.PROD) {
    // The GA config disables automatic page views; record the first resolved
    // route and subsequent client-side navigations exactly once.
    router.subscribe("onResolved", ({ fromLocation, toLocation }) => {
      window.gtag?.("event", "page_view", {
        page_path: toLocation.pathname,
        page_location: window.location.href,
        page_referrer: fromLocation
          ? new URL(fromLocation.href, window.location.origin).href
          : document.referrer,
      });
    });
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
