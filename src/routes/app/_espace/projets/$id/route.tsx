import { useEffect, useRef } from "react";
import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, StatusBadge } from "@/components/app/Blocks";
import { useOrganizations } from "@/components/app/Organizations";
import { ProjectProvider } from "@/components/app/ProjectContext";
import { Container } from "@/components/rev/ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads, useLiveLeads } from "@/lib/app/leads";
import { useProject } from "@/lib/app/projects";

export const Route = createFileRoute("/app/_espace/projets/$id")({
  component: ProjectLayout,
});

// Tabs of the spec; each development step enables the next one.
const TABS = [
  { label: "Plan", to: "/app/projets/$id/plan" },
  { label: "Lots", to: "/app/projets/$id/lots" },
  { label: "Médias", to: "/app/projets/$id/medias" },
  { label: "Marque", to: "/app/projets/$id/marque" },
  { label: "Demandes", to: "/app/projets/$id/demandes" },
  { label: "Statistiques" },
  { label: "Partage", to: "/app/projets/$id/partage" },
  { label: "Réglages", to: "/app/projets/$id/reglages" },
] as const;

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
      <Container className="pt-8">
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
      <Container className="pt-10">
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
      <div className="border-b border-border/70">
        <Container className="pt-6 sm:pt-8">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Vos programmes
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 break-words font-display text-2xl font-medium tracking-tight sm:text-3xl">
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          {project.city ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              {project.city}
            </p>
          ) : null}

          <nav aria-label="Sections du programme" className="-mb-px mt-6 overflow-x-auto">
            <ul className="flex min-w-max gap-1">
              {TABS.map((tab) => (
                <li key={tab.label}>
                  {"to" in tab ? (
                    <Link
                      to={tab.to}
                      params={{ id }}
                      className="relative inline-flex h-11 items-center rounded-t px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      activeProps={{
                        className:
                          "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
                        "aria-current": "page",
                      }}
                    >
                      {tab.label}
                      {tab.label === "Demandes" && fresh > 0 ? (
                        <span
                          className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground"
                          aria-label={`${fresh} nouvelle${fresh > 1 ? "s" : ""}`}
                        >
                          {fresh}
                        </span>
                      ) : null}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      title="Disponible prochainement"
                      className="inline-flex h-11 cursor-not-allowed items-center gap-1.5 px-3 text-sm text-muted-foreground/50"
                    >
                      {tab.label}
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                        Bientôt
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
      <Container className="pt-8">
        <Outlet />
      </Container>
    </ProjectProvider>
  );
}
