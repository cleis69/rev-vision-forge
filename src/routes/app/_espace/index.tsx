import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Plus } from "lucide-react";

import { Container } from "@/components/rev/ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizations } from "@/components/app/Organizations";
import { getSupabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/app/_espace/")({
  component: ProgrammesPage,
});

const STATUS_LABELS = { draft: "Brouillon", published: "Publié" } as const;

function ProgrammesPage() {
  const { active, loading, error } = useOrganizations();
  const orgId = active?.organization.id;

  const projects = useQuery({
    queryKey: ["projects", orgId],
    enabled: Boolean(orgId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("projects")
        .select("id, name, slug, city, status, updated_at")
        .eq("organization_id", orgId ?? "")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Container className="pt-8 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            {active?.organization.name ?? "Espace promoteur"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">Vos programmes</h1>
        </div>
        <Button className="h-10" disabled={!active} title="Disponible prochainement">
          <Plus aria-hidden />
          Nouveau programme
        </Button>
      </div>

      <div className="mt-8">
        {loading || (orgId && projects.isPending) ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Chargement">
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
            title="Aucune organisation"
            text="Votre compte n'est encore rattaché à aucune organisation. Contactez REV pour activer votre espace."
          />
        ) : projects.data && projects.data.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((p) => (
              <li key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-medium tracking-tight">{p.name}</h2>
                  <span
                    className={
                      p.status === "published"
                        ? "rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary"
                        : "rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    }
                  >
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>
                {p.city ? (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden />
                    {p.city}
                  </p>
                ) : null}
                <p className="mt-4 text-xs text-muted-foreground">
                  Modifié le{" "}
                  {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
                    new Date(p.updated_at),
                  )}
                </p>
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

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Building2 className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-lg font-medium tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
