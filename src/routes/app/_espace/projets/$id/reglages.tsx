import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AmenitiesSettings } from "@/components/app/AmenitiesSettings";
import { FormMessage as Notice } from "@/components/app/AuthCard";
import { SettingsSection } from "@/components/app/Blocks";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { PROJECT_SLUG_MAX, PROJECT_SLUG_TAKEN, publicUrl } from "@/components/app/NewProjectDialog";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { SituationSettings } from "@/components/app/SituationSettings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { dbErrorMessage, isTaken } from "@/lib/app/errors";
import {
  CURRENCIES,
  forgetProject,
  useDeleteProject,
  useUpdateProject,
  type Project,
} from "@/lib/app/projects";
import { slugSchema } from "@/lib/slug";

export const Route = createFileRoute("/app/_espace/projets/$id/reglages")({
  component: ProjectSettingsPage,
});

// Built when the form is used, not when the route is declared: a top-level
// call would keep zod and the forms in the main bundle, loaded by every page
// of the site.
const settingsSchema = () =>
  z.object({
    name: z.string().trim().min(1, "Indiquez un nom.").max(160, "160 caractères au maximum."),
    slug: slugSchema(PROJECT_SLUG_MAX),
    city: z.string().trim().max(120, "120 caractères au maximum."),
    description: z.string().trim().max(4000, "4 000 caractères au maximum."),
    currency: z.enum(["EUR", "MAD", "USD"]),
    show_prices: z.boolean(),
    price_from: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || parseAmount(v) !== null,
        "Indiquez un montant, par ex. 8 000 000.",
      ),
    contact_phone: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || PHONE.test(v),
        "Numéro invalide : chiffres, espaces et « + » (par ex. +212 661 82 53 59).",
      ),
  });
type Values = z.infer<ReturnType<typeof settingsSchema>>;

// Same rule as the database.
const PHONE = /^\+?[0-9][0-9 ().-]{5,29}$/;

/** "8 000 000", "8.000.000", "1 250 000,50" → a number, or null. */
function parseAmount(input: string): number | null {
  const text = input
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(/[.,](?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) && n < 1e12 ? n : null;
}

const amount = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

const toValues = (p: Project): Values => ({
  name: p.name,
  slug: p.slug,
  city: p.city ?? "",
  description: p.description ?? "",
  currency: CURRENCIES.some((c) => c.code === p.currency)
    ? (p.currency as Values["currency"])
    : "EUR",
  show_prices: p.show_prices,
  price_from: p.price_from === null ? "" : amount.format(p.price_from),
  contact_phone: p.contact_phone ?? "",
});

function ProjectSettingsPage() {
  const { project, role } = useCurrentProject();
  return (
    <div className="max-w-3xl space-y-4">
      {/* Keyed by programme: switching programmes starts from its own values. */}
      <ProjectSettingsForm key={project.id} project={project} />
      <SituationSettings key={`situation-${project.id}`} project={project} />
      <AmenitiesSettings key={`prestations-${project.id}`} project={project} />
      {role === "owner" ? (
        <DeleteProjectSection project={project} />
      ) : (
        <SettingsSection title="Supprimer le programme" danger>
          <p className="text-sm text-muted-foreground">
            Seul un propriétaire de l'organisation peut supprimer un programme.
          </p>
        </SettingsSection>
      )}
    </div>
  );
}

function ProjectSettingsForm({ project }: { project: Project }) {
  const update = useUpdateProject(project.id);
  const [schema] = useState(settingsSchema);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(project) });
  const [notice, setNotice] = useState<string | null>(null);
  const { isSubmitting, isDirty } = form.formState;
  const slug = form.watch("slug");

  const submit = form.handleSubmit(
    async ({ city, description, price_from, contact_phone, ...rest }) => {
      setNotice(null);
      try {
        const saved = await update.mutateAsync({
          ...rest,
          city: city || null,
          description: description || null,
          price_from: price_from ? parseAmount(price_from) : null,
          contact_phone: contact_phone || null,
        });
        form.reset(toValues(saved));
        toast.success("Modifications enregistrées");
      } catch (error) {
        if (isTaken(error))
          form.setError("slug", { message: PROJECT_SLUG_TAKEN }, { shouldFocus: true });
        else setNotice(dbErrorMessage(error));
      }
    },
  );

  return (
    <SettingsSection
      title="Informations du programme"
      description="Elles apparaîtront sur la page publique du programme."
    >
      <Form {...form}>
        <form onSubmit={submit} noValidate>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du programme</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ville <span className="font-normal text-muted-foreground">(facultatif)</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="address-level2" className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse publique</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      spellCheck={false}
                      className="h-11 font-mono text-[13px]"
                    />
                  </FormControl>
                  <FormDescription className="break-all">
                    {publicUrl(slug)}
                    {slug !== project.slug
                      ? " · Les liens déjà partagés avec l'ancienne adresse ne fonctionneront plus."
                      : null}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="font-normal text-muted-foreground">(facultatif)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Ex. : 14 villas R+1 avec ascenseur, piscine privée, à 15 minutes de la médina."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devise des prix</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_prices"
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 sm:mt-[1.375rem]">
                    <div className="space-y-1">
                      <FormLabel>Afficher les prix</FormLabel>
                      <FormDescription>
                        Sinon, la page publique indique « Prix sur demande ».
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Prix « à partir de »{" "}
                      <span className="font-normal text-muted-foreground">(facultatif)</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="decimal" autoComplete="off" className="h-11" />
                    </FormControl>
                    <FormDescription>
                      En haut de la page publique, à la place du prix le plus bas des lots.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Téléphone commercial{" "}
                      <span className="font-normal text-muted-foreground">(facultatif)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        placeholder="+212 661 82 53 59"
                        className="h-11"
                      />
                    </FormControl>
                    <FormDescription>
                      Boutons « Appeler » et « WhatsApp » de la page publique.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {notice ? <Notice tone="error">{notice}</Notice> : null}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button type="submit" className="h-11" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
              </Button>
              {isDirty && !isSubmitting ? (
                <Button type="button" variant="ghost" className="h-11" onClick={() => form.reset()}>
                  Annuler les modifications
                </Button>
              ) : null}
            </div>
          </fieldset>
        </form>
      </Form>
    </SettingsSection>
  );
}

function DeleteProjectSection({ project }: { project: Project }) {
  const remove = useDeleteProject();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <SettingsSection
      title="Supprimer le programme"
      description="Le programme, ses lots, son plan et ses demandes de visite sont supprimés définitivement."
      danger
    >
      <ConfirmDelete
        title={`Supprimer « ${project.name} » ?`}
        description="Cette action est définitive : les lots, le plan et les demandes de visite de ce programme seront effacés."
        confirmText={project.name}
        actionLabel="Supprimer le programme"
        onConfirm={async () => {
          await remove.mutateAsync(project);
          await navigate({ to: "/app", replace: true });
          forgetProject(queryClient, project.id);
          toast.success(`Programme « ${project.name} » supprimé`);
        }}
      >
        <Button
          variant="outline"
          className="h-11 border-destructive/50 text-red-300 hover:bg-destructive/10 hover:text-red-200"
        >
          <Trash2 aria-hidden />
          Supprimer le programme
        </Button>
      </ConfirmDelete>
    </SettingsSection>
  );
}
