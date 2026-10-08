import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";

import { EmptyState, PageHeading, StatusBadge } from "@/components/app/Blocks";
import { NewProjectDialog } from "@/components/app/NewProjectDialog";
import { CreateOrganizationForm } from "@/components/app/OrganizationForms";
import { useOrganizations } from "@/components/app/Organizations";
import { Container } from "@/components/rev/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/lib/app/projects";

export const Route = createFileRoute("/app/_espace/")({
  component: ProgrammesPage,
});

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function ProgrammesPage() {
  const { active, loading, error } = useOrganizations();
  const orgId = active?.organization.id;
  const projects = useProjects(orgId);

  return (
    <Container className="pt-5 sm:pt-7">
      <PageHeading eyebrow={active?.organization.name ?? "Espace promoteur"} title="Vos programmes">
        {orgId ? <NewProjectDialog organizationId={orgId} /> : null}
      </PageHeading>

      <div className="mt-5">
        {loading || (orgId && projects.isPending) ? (
          <div
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Chargement"
          >
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : error || projects.isError ? (
          <EmptyState
            title="Impossible de charger vos données"
            text="Vérifiez votre connexion internet puis rechargez la page."
          />
        ) : !active ? (
          <EmptyState
            title="Créez votre organisation"
            text="C'est le nom de votre société de promotion. Vous pourrez ensuite créer vos programmes."
          >
            <CreateOrganizationForm />
          </EmptyState>
        ) : projects.data && projects.data.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((p) => (
              <li key={p.id}>
                <Link
                  to="/app/projets/$id"
                  params={{ id: p.id }}
                  className="group block h-full rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 break-words font-display text-lg font-medium tracking-tight">
                      {p.name}
                    </h2>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.city ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden />
                      {p.city}
                    </p>
                  ) : null}
                  <p className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    Modifié le {dateFormat.format(new Date(p.updated_at))}
                    <ArrowUpRight
                      className="size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      aria-hidden
                    />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Aucun programme pour l'instant"
            text="Créez votre premier programme pour téléverser son plan, tracer ses lots et le publier."
          />
        )}
      </div>
    </Container>
  );
}
