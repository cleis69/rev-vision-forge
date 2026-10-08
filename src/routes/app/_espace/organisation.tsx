import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeading, SettingsSection } from "@/components/app/Blocks";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { OrganizationForm } from "@/components/app/OrganizationForms";
import { useOrganizations, type Membership } from "@/components/app/Organizations";
import { Container } from "@/components/rev/ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteOrganization, useUpdateOrganization } from "@/lib/app/organizations";
import { useProjects } from "@/lib/app/projects";

export const Route = createFileRoute("/app/_espace/organisation")({
  head: () => ({ meta: [{ title: "Organisation — Espace promoteur REV" }] }),
  component: OrganizationPage,
});

function OrganizationPage() {
  const { active, loading } = useOrganizations();

  if (loading) {
    return (
      <Container className="pt-8 sm:pt-10">
        <div aria-busy="true" aria-label="Chargement">
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="mt-8 h-64 max-w-3xl rounded-2xl" />
        </div>
      </Container>
    );
  }

  if (!active) {
    return (
      <Container className="pt-10">
        <EmptyState
          title="Aucune organisation"
          text="Créez d'abord votre organisation depuis la liste de vos programmes."
        >
          <Button asChild variant="outline" className="h-11 w-full">
            <Link to="/app">Vos programmes</Link>
          </Button>
        </EmptyState>
      </Container>
    );
  }

  const isOwner = active.role === "owner";
  return (
    <Container className="pt-8 sm:pt-10">
      <PageHeading eyebrow="Organisation" title={active.organization.name} />
      <div className="mt-8 max-w-3xl space-y-6">
        <SettingsSection
          title="Informations"
          description={
            isOwner
              ? undefined
              : "Seul un propriétaire de l'organisation peut modifier ces informations."
          }
        >
          {/* Keyed by organization: switching organizations starts from its own values. */}
          <EditOrganization key={active.organization.id} membership={active} readOnly={!isOwner} />
        </SettingsSection>
        {isOwner ? <DeleteOrganizationSection membership={active} /> : null}
      </div>
    </Container>
  );
}

function EditOrganization({ membership, readOnly }: { membership: Membership; readOnly: boolean }) {
  const { id, name, slug } = membership.organization;
  const update = useUpdateOrganization(id);
  return (
    <OrganizationForm
      mode="edit"
      readOnly={readOnly}
      defaultValues={{ name, slug }}
      onSubmit={async (values) => {
        await update.mutateAsync(values);
        toast.success("Modifications enregistrées");
      }}
    />
  );
}

function DeleteOrganizationSection({ membership }: { membership: Membership }) {
  const { id, name } = membership.organization;
  const remove = useDeleteOrganization();
  const projects = useProjects(id);
  const navigate = useNavigate();
  const count = projects.data?.length ?? 0;
  const what =
    count === 0
      ? "Elle n'a aucun programme."
      : count === 1
        ? "Son programme, avec ses lots et ses demandes de visite, sera effacé."
        : `Ses ${count} programmes, avec leurs lots et leurs demandes de visite, seront effacés.`;

  return (
    <SettingsSection
      title="Supprimer l'organisation"
      description="L'organisation, ses programmes, leurs lots et leurs demandes de visite sont supprimés définitivement."
      danger
    >
      <ConfirmDelete
        title={`Supprimer « ${name} » ?`}
        description={`Cette action est définitive. ${what}`}
        confirmText={name}
        actionLabel="Supprimer l'organisation"
        onConfirm={async () => {
          await remove.mutateAsync(id);
          await navigate({ to: "/app", replace: true });
          toast.success(`Organisation « ${name} » supprimée`);
        }}
      >
        <Button
          variant="outline"
          className="h-11 border-destructive/50 text-red-300 hover:bg-destructive/10 hover:text-red-200"
        >
          <Trash2 aria-hidden />
          Supprimer l'organisation
        </Button>
      </ConfirmDelete>
    </SettingsSection>
  );
}
