import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { FormMessage as Notice } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dbErrorMessage, isTaken } from "@/lib/app/errors";
import { CURRENCIES, useCreateProject } from "@/lib/app/projects";
import { slugSchema, slugify } from "@/lib/slug";

export const PROJECT_SLUG_MAX = 80;
export const PROJECT_SLUG_TAKEN =
  "Cette adresse est déjà utilisée par un autre programme. Choisissez-en une autre.";

const schema = z.object({
  name: z.string().trim().min(1, "Indiquez un nom.").max(160, "160 caractères au maximum."),
  city: z.string().trim().max(120, "120 caractères au maximum."),
  slug: slugSchema(PROJECT_SLUG_MAX),
  currency: z.enum(["EUR", "MAD", "USD"]),
});
type Values = z.infer<typeof schema>;

/** Public address of a programme, shown under the address fields. */
export const publicUrl = (slug: string) =>
  `${typeof window === "undefined" ? "" : window.location.origin}/p/${slug || "…"}`;

export function NewProjectDialog({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10">
          <Plus aria-hidden />
          Nouveau programme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau programme</DialogTitle>
          <DialogDescription>
            Vous pourrez ensuite ajouter le plan, les lots et les médias. Le programme reste en
            brouillon tant que vous ne le publiez pas.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <NewProjectForm organizationId={organizationId} onDone={() => setOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function NewProjectForm({
  organizationId,
  onDone,
}: {
  organizationId: string;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const create = useCreateProject();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", city: "", slug: "", currency: "EUR" },
  });
  const slugEdited = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { isSubmitting, isSubmitted } = form.formState;
  const slug = form.watch("slug");

  const submit = form.handleSubmit(async ({ name, city, slug, currency }) => {
    setNotice(null);
    try {
      const project = await create.mutateAsync({
        organization_id: organizationId,
        name,
        slug,
        city: city || null,
        currency,
      });
      toast.success(`Programme « ${project.name} » créé`);
      onDone();
      await navigate({ to: "/app/projets/$id", params: { id: project.id } });
    } catch (error) {
      if (isTaken(error))
        form.setError("slug", { message: PROJECT_SLUG_TAKEN }, { shouldFocus: true });
      else setNotice(dbErrorMessage(error));
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du programme</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    placeholder="Ex. : Les Villas de la Palmeraie"
                    className="h-11"
                    onChange={(e) => {
                      field.onChange(e);
                      if (!slugEdited.current) {
                        form.setValue("slug", slugify(e.target.value, PROJECT_SLUG_MAX), {
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ville <span className="font-normal text-muted-foreground">(facultatif)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="address-level2"
                    placeholder="Ex. : Marrakech"
                    className="h-11"
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
                <FormLabel>Adresse publique</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="les-villas-de-la-palmeraie"
                    className="h-11 font-mono text-[13px]"
                    onChange={(e) => {
                      slugEdited.current = true;
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription className="break-all">{publicUrl(slug)}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Devise des prix</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
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
          {notice ? <Notice tone="error">{notice}</Notice> : null}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" className="h-11" onClick={onDone}>
              Annuler
            </Button>
            <Button type="submit" className="h-11">
              {isSubmitting ? "Création…" : "Créer le programme"}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
