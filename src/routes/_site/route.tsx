import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SiteChrome } from "@/components/rev/SiteChrome";

// Showcase site: every page under this pathless layout gets the site header
// and footer. URLs are unchanged.
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <SiteChrome>
      <Outlet />
    </SiteChrome>
  );
}
