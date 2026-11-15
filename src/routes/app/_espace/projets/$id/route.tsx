import { useEffect, useRef } from "react";
import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  Box,
  ChartColumn,
  Image,
  Inbox,
  Languages,
  LayoutDashboard,
  LayoutTemplate,
  MapPin,
  Palette,
  Rows3,
  Settings,
  Share2,
  View,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState, StatusBadge } from "@/components/app/Blocks";
import { useOrganizations } from "@/components/app/Organizations";
import { ProjectProvider } from "@/components/app/ProjectContext";
import { Container } from "@/components/rev/ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads, useLiveLeads } from "@/lib/app/leads";
import { useProject } from "@/lib/app/projects";

export const Route = createFileRoute("/app/_espace/projets/$id")({
  component: ProjectLayout,
});

type Tab = { label: string; to: string; icon: LucideIcon };

// The sections of a programme, in two groups: what the team does every day
// (statuses, requests, figures, links), then what the public page is made of.
const GROUPS: { label: string; tabs: Tab[] }[] = [
  {
    label: "Au quotidien",
    tabs: [
      { label: "Aperçu", to: "/app/projets/$id/apercu", icon: LayoutDashboard },
      { label: "Lots", to: "/app/projets/$id/lots", icon: Rows3 },
      { label: "Demandes", to: "/app/projets/$id/demandes", icon: Inbox },
      { label: "Statistiques", to: "/app/projets/$id/statistiques", icon: ChartColumn },
      { label: "Partage", to: "/app/projets/$id/partage", icon: Share2 },
    ],
  },
  {
    label: "Contenu de la page",
    tabs: [
      { label: "Vues", to: "/app/projets/$id/plan", icon: Box },
      { label: "Typologies", to: "/app/projets/$id/typologies", icon: LayoutTemplate },
      { label: "Médias", to: "/app/projets/$id/medias", icon: Image },
      { label: "Visite 360°", to: "/app/projets/$id/visite", icon: View },
      { label: "Marque", to: "/app/projets/$id/marque", icon: Palette },
      { label: "Anglais", to: "/app/projets/$id/anglais", icon: Languages },
      { label: "Réglages", to: "/app/projets/$id/reglages", icon: Settings },
    ],
  },
];

function ProjectLayout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { memberships, active, setActiveId, loading } = useOrganizations();
  const query = useProject(id);

  // New visit requests: counted on the tab and announced wherever the user is.
  const leads = useLeads(id);
  const fresh = leads.data?.filter((l) => l.status === "nouveau").length ?? 0;
  useLiveLeads(id, (lead) =>
    toast(`Nouvelle demande de visite : ${lead.nom}`, {
      action: {
        label: "Voir",
        onClick: () => void navigate({ to: "/app/projets/$id/demandes", params: { id } }),
      },
    }),
  );
  // On a phone the sections are a rail: the current one is brought into sight.
  const rail = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    rail.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);
  const project = query.data;
  const membership = project
    ? memberships.find((m) => m.organization.id === project.organization_id)
    : undefined;

  // Opening a programme selects its organization; choosing another
  // organization afterwards goes back to the list of programmes.
  const shownOrganization = useRef<string | null>(null);
  useEffect(() => {
    if (!membership || !active) return;
    if (shownOrganization.current === null) {
      shownOrganization.current = membership.organization.id;
      if (active.organization.id !== membership.organization.id)
        setActiveId(membership.organization.id);
    } else if (active.organization.id !== shownOrganization.current) {
      void navigate({ to: "/app" });
    }
  }, [membership, active, setActiveId, navigate]);

  if (loading || query.isPending) {
    return (
      <Container className="pt-5">
        <div aria-busy="true" aria-label="Chargement du programme">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-5 h-9 w-72 max-w-full" />
          <Skeleton className="mt-8 h-10 w-full" />
          <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
        </div>
      </Container>
    );
  }

  if (query.isError || !project || !membership) {
    return (
      <Container className="pt-6">
        <EmptyState
          title={query.isError ? "Impossible de charger ce programme" : "Programme introuvable"}
          text={
            query.isError
              ? "Vérifiez votre connexion internet puis rechargez la page."
              : "Ce programme n'existe pas, a été supprimé, ou appartient à une organisation dont vous n'êtes pas membre."
          }
        >
          <Button asChild variant="outline" className="h-11 w-full">
            <Link to="/app">Retour à vos programmes</Link>
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <ProjectProvider value={{ project, role: membership.role }}>
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-6 md:px-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        {/* The programme and its sections: a column on a computer, a rail on a phone. */}
        <aside className="border-b border-border/70 pt-4 lg:sticky lg:top-16 lg:max-h-[calc(100svh-4rem)] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:pb-8 lg:pt-6">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Vos programmes
          </Link>
          <h1 className="mt-3 min-w-0 break-words font-display text-xl font-medium leading-tight tracking-tight">
            {project.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={project.status} />
            {project.city ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden />
                {project.city}
              </p>
            ) : null}
          </div>

          <nav
            ref={rail}
            aria-label="Sections du programme"
            className="-mx-5 mt-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:mx-0 lg:mt-6 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex min-w-max items-center gap-1 lg:block lg:min-w-0">
              {GROUPS.map((group, g) => (
                <div key={group.label} className="flex items-center gap-1 lg:block">
                  {g > 0 ? (
                    <span aria-hidden className="mx-2 h-5 w-px shrink-0 bg-border lg:hidden" />
                  ) : null}
                  <p
                    id={`sections-${g}`}
                    className={cn(
                      "hidden px-2 pb-2 text-xs text-muted-foreground lg:block",
                      g > 0 && "lg:pt-6",
                    )}
                  >
                    {group.label}
                  </p>
                  <ul
                    aria-labelledby={`sections-${g}`}
                    className="flex gap-1 lg:block lg:space-y-0.5"
                  >
                    {group.tabs.map((tab) => (
                      <li key={tab.label}>
                        <Link
                          to={tab.to}
                          params={{ id }}
                          className="flex h-11 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:h-9 lg:px-2"
                          activeProps={{
                            className: "bg-foreground/[0.08] text-foreground",
                            "aria-current": "page",
                          }}
                        >
                          <tab.icon className="size-4 shrink-0" aria-hidden />
                          <span className="lg:flex-1">{tab.label}</span>
                          {tab.label === "Demandes" && fresh > 0 ? (
                            <span
                              className="text-xs font-medium tabular-nums text-primary"
                              aria-label={`${fresh} nouvelle${fresh > 1 ? "s" : ""}`}
                            >
                              {fresh}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </aside>

        <div className="min-w-0 pt-5 lg:border-l lg:border-border/70 lg:pl-10 lg:pt-6">
          <Outlet />
        </div>
      </div>
    </ProjectProvider>
  );
}
