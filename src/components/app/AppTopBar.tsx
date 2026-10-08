import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Check, ChevronDown, ExternalLink, LogOut, Plus, Settings } from "lucide-react";

import { RevLogo } from "@/components/rev/Logo";
import { Container } from "@/components/rev/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth";
import { NewOrganizationDialog } from "./OrganizationForms";
import { useOrganizations } from "./Organizations";

const ROLE_LABELS = { owner: "Propriétaire", commercial: "Commercial" } as const;

export function AppTopBar() {
  const { session } = useAuth();
  const { memberships, active, setActiveId } = useOrganizations();
  const navigate = useNavigate();
  const email = session?.user.email ?? "";
  const [creating, setCreating] = useState(false);

  const signOut = async () => {
    await getSupabase().auth.signOut();
    await navigate({ to: "/app/login", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <Container className="flex h-16 items-center gap-3">
        <Link
          to="/app"
          className="flex shrink-0 items-center gap-3"
          aria-label="Espace promoteur, accueil"
        >
          <RevLogo className="h-9 w-auto" />
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Espace promoteur
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          {active ? (
            // Not modal, so the "Nouvelle organisation" dialog can take the focus.
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-border px-3 text-sm transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Building2 className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="truncate">{active.organization.name}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-60">
                <DropdownMenuLabel>Organisation</DropdownMenuLabel>
                {memberships.map((m) => (
                  <DropdownMenuItem
                    key={m.organization.id}
                    onSelect={() => setActiveId(m.organization.id)}
                  >
                    <span className="flex-1 truncate">{m.organization.name}</span>
                    {m.organization.id === active.organization.id ? (
                      <Check className="size-4 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/organisation">
                    <Settings className="size-4" aria-hidden />
                    Réglages de l'organisation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCreating(true)}>
                  <Plus className="size-4" aria-hidden />
                  Nouvelle organisation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-sm font-medium uppercase transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Compte ${email}`}
            >
              {email.slice(0, 1) || "?"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm">{email}</span>
                {active ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {ROLE_LABELS[active.role]}
                  </span>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/" target="_blank" rel="noopener">
                  <ExternalLink className="size-4" aria-hidden />
                  Voir le site REV
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={signOut}>
                <LogOut className="size-4" aria-hidden />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Container>
      <NewOrganizationDialog open={creating} onOpenChange={setCreating} />
    </header>
  );
}
