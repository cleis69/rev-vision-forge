import { useState } from "react";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthCard } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/supabase/auth";

// Promoter space. Rendered in the browser only: it holds a private session
// and nothing in it is meant for search engines.
export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Espace promoteur — REV" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AppRoot,
  notFoundComponent: AppNotFound,
});

function AppNotFound() {
  return (
    <AuthCard title="Page introuvable" description="Cette adresse n'existe pas dans l'espace promoteur.">
      <Button asChild className="h-11 w-full">
        <Link to="/app">Retour à mes programmes</Link>
      </Button>
    </AuthCard>
  );
}

function AppRoot() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
