import { useEffect } from "react";
import { Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { AppTopBar } from "@/components/app/AppTopBar";
import { OrganizationsProvider } from "@/components/app/Organizations";
import { currentSession, useAuth } from "@/lib/supabase/auth";

// Every page of the promoter space requires a session; without one the
// visitor goes to the sign-in page and comes back here afterwards.
export const Route = createFileRoute("/app/_espace")({
  beforeLoad: async ({ location }) => {
    if (!(await currentSession())) {
      throw redirect({ to: "/app/login", search: { redirect: location.href } });
    }
  },
  component: EspaceLayout,
});

function EspaceLayout() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();

  // Signed out elsewhere (another tab, expired session): back to sign-in.
  useEffect(() => {
    if (ready && !session) void navigate({ to: "/app/login", replace: true });
  }, [ready, session, navigate]);

  return (
    <OrganizationsProvider>
      <div className="min-h-svh">
        <AppTopBar />
        <main className="pb-16">
          <Outlet />
        </main>
      </div>
    </OrganizationsProvider>
  );
}
