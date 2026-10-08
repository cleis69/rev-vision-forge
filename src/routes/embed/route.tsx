import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PublicProviders } from "@/components/public/Common";

// Sales plan for the promoters' own websites, in an iframe (code in the
// Partage tab). Rendered in the browser, never indexed.
export const Route = createFileRoute("/embed")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => (
    <PublicProviders>
      <Outlet />
    </PublicProviders>
  ),
});
