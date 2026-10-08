import { useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormMessage as Notice } from "@/components/app/AuthCard";
import { useOrganizations } from "@/components/app/Organizations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { dbErrorMessage, isTaken } from "@/lib/app/errors";
import { useCreateOrganization } from "@/lib/app/organizations";
import { slugSchema, slugify } from "@/lib/slug";

const SLUG_MAX = 60;
const schema = z.object({
  name: z.string().trim().min(1, "Indiquez un nom.").max(120, "120 caractères au maximum."),
  slug: slugSchema(SLUG_MAX),
});
export type OrganizationValues = z.infer<typeof schema>;

const TAKEN = "Cet identifiant est déjà utilisé par une autre organisation.";

/** Name and short identifier of an organization. On creation the identifier follows the name until it is edited. */
export function OrganizationForm({
  mode,
  defaultValues = { name: "", slug: "" },
  readOnly = false,
  onSubmit,
  actions,
}: {
  mode: "create" | "edit";
  defaultValues?: OrganizationValues;
  readOnly?: boolean;
  onSubmit: (values: OrganizationValues) => Promise<void>;
  actions?: ReactNode;
}) {
  const form = useForm<OrganizationValues>({ resolver: zodResolver(schema), defaultValues });
  const slugEdited = useRef(mode === "edit");
  const [notice, setNotice] = useState<string | null>(null);
  const { isSubmitting, isDirty, isSubmitted } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    setNotice(null);
    try {
      await onSubmit(values);
      form.reset(values);
    } catch (error) {
      if (isTaken(error)) form.setError("slug", { message: TAKEN }, { shouldFocus: true });
      else setNotice(dbErrorMessage(error));
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={readOnly || isSubmitting} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'organisation</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="organization"
                    placeholder="Ex. : Atlas Promotion"
                    className="h-11"
                    onChange={(e) => {
                      field.onChange(e);
                      if (!slugEdited.current) {
                        form.setValue("slug", slugify(e.target.value, SLUG_MAX), {
                          shouldValidate: isSubmitted,
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifiant</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="atlas-promotion"
                    className="h-11 font-mono text-[13px]"
                    onChange={(e) => {
                      slugEdited.current = true;
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>Lettres minuscules, chiffres et tirets.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {notice ? <Notice tone="error">{notice}</Notice> : null}
          {readOnly ? null : (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                className="h-11"
                disabled={isSubmitting || (mode === "edit" && !isDirty)}
              >
                {isSubmitting
                  ? "Enregistrement…"
                  : mode === "create"
                    ? "Créer l'organisation"
                    : "Enregistrer"}
              </Button>
              {actions}
            </div>
          )}
        </fieldset>
      </form>
    </Form>
  );
}

/** Creates an organization, makes it the active one, then calls `onCreated`. */
export function CreateOrganizationForm({
  onCreated,
  actions,
}: {
  onCreated?: () => void;
  actions?: ReactNode;
}) {
  const create = useCreateOrganization();
  const { setActiveId } = useOrganizations();
  return (
    <OrganizationForm
      mode="create"
      actions={actions}
      onSubmit={async (values) => {
        const organization = await create.mutateAsync(values);
        setActiveId(organization.id);
        toast.success(`Organisation « ${organization.name} » créée`);
        onCreated?.();
      }}
    />
  );
}

export function NewOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle organisation</DialogTitle>
          <DialogDescription>
            Une organisation regroupe les programmes d'une société de promotion. Vous en serez
            propriétaire.
          </DialogDescription>
        </DialogHeader>
        {open ? <CreateOrganizationForm onCreated={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}
