import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PublicProviders } from "@/components/public/Common";

// Public pages of the programmes, in the promoters' colours. Rendered in the
// browser (data from Supabase) and never indexed: they are shared by link.
export const Route = createFileRoute("/en/p")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => (
    <PublicProviders>
      <Outlet />
    </PublicProviders>
  ),
});
