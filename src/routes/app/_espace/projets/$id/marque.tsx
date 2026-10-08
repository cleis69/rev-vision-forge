import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ImageUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SettingsSection } from "@/components/app/Blocks";
import { useOrganizations, type Membership } from "@/components/app/Organizations";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { StatusChip } from "@/components/public/LotDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRemoveLogo, useUpdateBrand, useUploadLogo } from "@/lib/app/brand";
import { dbErrorMessage } from "@/lib/app/errors";
import { publicUrl } from "@/lib/app/storage";
import {
  BRAND_FONTS,
  DEFAULT_BRAND,
  brandFont,
  brandVars,
  colorHint,
  normalizeHex,
  textOn,
} from "@/lib/brand";
import { loadAllBrandFonts } from "@/lib/brand-fonts";
import { ImageError, PLAN_TYPES } from "@/lib/image";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/marque")({
  component: BrandPage,
});

// Light tones: the public pages are dark.
const PRESETS = [
  { color: "#c9a35b", label: "Or" },
  { color: "#e3cfa4", label: "Champagne" },
  { color: "#d4805a", label: "Terracotta" },
  { color: "#8fb39a", label: "Sauge" },
  { color: "#6fa8dc", label: "Azur" },
  { color: "#ece6da", label: "Ivoire" },
];

function BrandPage() {
  const { project, role } = useCurrentProject();
  const { memberships } = useOrganizations();
  const membership = memberships.find((m) => m.organization.id === project.organization_id);
  // Every font is shown in its own type.
  useEffect(() => loadAllBrandFonts(), []);
  if (!membership) return null;
  return (
    <BrandEditor
      // Saved values change the starting point; another organization starts afresh.
      key={membership.organization.id}
      organization={membership.organization}
      canEdit={role === "owner"}
      sample={{ name: project.name, city: project.city }}
    />
  );
}

function BrandEditor({
  organization,
  canEdit,
  sample,
}: {
  organization: Membership["organization"];
  canEdit: boolean;
  sample: { name: string; city: string | null };
}) {
  const savedColor = normalizeHex(organization.brand_color ?? "") ?? DEFAULT_BRAND;
  const savedFont = brandFont(organization.brand_font).id;
  const [color, setColor] = useState(savedColor);
  const [hex, setHex] = useState(savedColor);
  const [font, setFont] = useState(savedFont);
  const update = useUpdateBrand(organization.id);
  const dirty = color !== savedColor || font !== savedFont;
  const hint = colorHint(color);

  const pick = (value: string) => {
    setColor(value);
    setHex(value);
  };

  const save = () =>
    update.mutate(
      { brand_color: color, brand_font: font },
      {
        onSuccess: () => toast.success("Marque enregistrée"),
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          La marque de l'organisation « {organization.name} » s'applique à toutes ses pages
          publiques : page des programmes, plan intégré à votre site et mode présentation.
          {canEdit ? "" : " Seul un propriétaire de l'organisation peut la modifier."}
        </p>

        <LogoSection organization={organization} canEdit={canEdit} />

        <SettingsSection
          title="Couleur principale"
          description="Lots disponibles sur le plan, boutons et liens des pages publiques."
        >
          <div role="group" aria-label="Couleurs suggérées" className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.color}
                type="button"
                disabled={!canEdit}
                onClick={() => pick(p.color)}
                aria-pressed={color === p.color}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
                  color === p.color
                    ? "border-foreground/70 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className="size-5 rounded-full border border-white/20"
                  style={{ background: p.color }}
                  aria-hidden
                />
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-input">
              <span className="sr-only">Choisir une couleur</span>
              <input
                type="color"
                value={color}
                disabled={!canEdit}
                onChange={(e) => pick(e.target.value)}
                className="absolute -inset-2 size-[calc(100%+1rem)] cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              />
            </label>
            <Input
              value={hex}
              disabled={!canEdit}
              aria-label="Code hexadécimal de la couleur"
              onChange={(e) => {
                setHex(e.target.value);
                const value = normalizeHex(e.target.value);
                if (value) setColor(value);
              }}
              onBlur={() => setHex(color)}
              spellCheck={false}
              className="h-11 w-32 font-mono uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Texte des boutons en {textOn(color) === "#ffffff" ? "blanc" : "noir"}, choisi
              automatiquement pour rester lisible.
            </p>
          </div>
          {hint ? (
            <p className="mt-4 flex gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {hint}
            </p>
          ) : null}
        </SettingsSection>

        <SettingsSection
          title="Police des titres"
          description="Nom du programme, titres et fiches des lots. Le texte courant reste en Inter, très lisible."
        >
          <fieldset disabled={!canEdit}>
            <legend className="sr-only">Police des titres</legend>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {BRAND_FONTS.map((f) => (
                <label
                  key={f.id}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-colors has-[:disabled]:cursor-not-allowed has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    font === f.id
                      ? "border-primary bg-primary/[0.06]"
                      : "border-border hover:border-foreground/30",
                  )}
                >
                  <input
                    type="radio"
                    name="brand-font"
                    value={f.id}
                    checked={font === f.id}
                    onChange={() => setFont(f.id)}
                    className="sr-only"
                  />
                  <span
                    className="block truncate text-2xl font-medium tracking-tight"
                    style={{ fontFamily: f.stack }}
                  >
                    {sample.name}
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <span className={font === f.id ? "text-foreground" : "text-muted-foreground"}>
                      {f.label}
                    </span>
                    <span className="text-muted-foreground">{f.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </SettingsSection>

        {canEdit ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button className="h-11" onClick={save} disabled={!dirty || update.isPending}>
              {update.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {dirty ? (
              <Button
                variant="ghost"
                className="h-11"
                onClick={() => {
                  pick(savedColor);
                  setFont(savedFont);
                }}
              >
                Annuler les modifications
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Preview organization={organization} color={color} font={font} sample={sample} />
      </div>
    </div>
  );
}

function LogoSection({
  organization,
  canEdit,
}: {
  organization: Membership["organization"];
  canEdit: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadLogo(organization.id);
  const remove = useRemoveLogo(organization.id);
  const logo = organization.logo_path;

  const onFile = (file: File | undefined) => {
    if (input.current) input.current.value = "";
    if (!file) return;
    upload.mutate(
      { file, previous: logo },
      {
        onSuccess: () => toast.success("Logo enregistré"),
        onError: (error) =>
          toast.error(error instanceof ImageError ? error.message : dbErrorMessage(error)),
      },
    );
  };

  return (
    <SettingsSection
      title="Logo"
      description="En haut des pages publiques. Sans logo, le nom de l'organisation est affiché."
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-20 w-52 place-items-center rounded-xl border border-border bg-[#080808] p-3">
          {logo ? (
            <img
              src={publicUrl(logo)}
              alt={`Logo de ${organization.name}`}
              className="max-h-14 w-auto max-w-full object-contain"
            />
          ) : (
            <span className="text-sm text-white/50">Aucun logo</span>
          )}
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => input.current?.click()}
              disabled={upload.isPending || remove.isPending}
            >
              <ImageUp aria-hidden />
              {upload.isPending ? "Envoi…" : logo ? "Remplacer" : "Téléverser un logo"}
            </Button>
            {logo ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11 text-muted-foreground"
                disabled={upload.isPending || remove.isPending}
                onClick={() =>
                  remove.mutate(logo, {
                    onSuccess: () => toast.success("Logo retiré"),
                    onError: (error) => toast.error(dbErrorMessage(error)),
                  })
                }
              >
                <Trash2 aria-hidden />
                Retirer
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        PNG, JPEG ou WebP. Préférez une version claire sur fond transparent : les pages sont
        sombres.
      </p>
      <input
        ref={input}
        type="file"
        accept={PLAN_TYPES.join(",")}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </SettingsSection>
  );
}

/** The top of a public page, with the colour and font being chosen. */
function Preview({
  organization,
  color,
  font,
  sample,
}: {
  organization: Membership["organization"];
  color: string;
  font: string;
  sample: { name: string; city: string | null };
}) {
  return (
    <section aria-label="Aperçu">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Aperçu</p>
      <div
        style={brandVars(color, font) as CSSProperties}
        className="overflow-hidden rounded-2xl border border-border bg-[#080808] text-white"
      >
        <div className="flex h-12 items-center gap-3 border-b border-white/10 px-4">
          {organization.logo_path ? (
            <img
              src={publicUrl(organization.logo_path)}
              alt=""
              className="h-6 w-auto max-w-[60%] object-contain"
            />
          ) : (
            <span className="truncate font-brand text-sm font-medium">{organization.name}</span>
          )}
          <span className="ml-auto shrink-0 rounded-full border border-white/20 px-3 py-1 text-[11px]">
            Planifier une visite
          </span>
        </div>
        <div className="p-5">
          {sample.city ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
              {sample.city}
            </p>
          ) : null}
          <p className="mt-2 font-brand text-3xl font-medium leading-tight tracking-tight">
            {sample.name}
          </p>
          <span className="mt-5 inline-flex h-10 items-center rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-[color:var(--brand-contrast)]">
            Voir le plan de vente
          </span>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusChip status="disponible" />
            <StatusChip status="reservee" />
            <StatusChip status="vendue" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden>
            <span
              className="h-12 rounded-md border"
              style={{
                background: "color-mix(in srgb, var(--brand) 36%, transparent)",
                borderColor: "var(--brand)",
              }}
            />
            <span
              className="h-12 rounded-md border border-amber-400/90"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(251,191,36,0.85) 0 2px, rgba(251,191,36,0.15) 2px 6px)",
              }}
            />
            <span className="h-12 rounded-md border border-zinc-400/70 bg-zinc-600/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
