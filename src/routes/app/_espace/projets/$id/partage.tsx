import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Code2, Copy, ExternalLink, Globe, Lock, MonitorSmartphone, X } from "lucide-react";
import { toast } from "sonner";

import { SettingsSection, StatusBadge } from "@/components/app/Blocks";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import { dbErrorMessage } from "@/lib/app/errors";
import { useLots } from "@/lib/app/lots";
import { useMedia } from "@/lib/app/media";
import { useOrbits } from "@/lib/app/orbit";
import { pageChecks } from "@/lib/app/overview";
import { useViews } from "@/lib/app/plan";
import { useUpdateProject } from "@/lib/app/projects";
import { usePanoramas } from "@/lib/app/tours";
import { useViewMarkers } from "@/lib/app/view-panorama";
import { embedCode } from "@/lib/public/embed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/partage")({
  component: SharePage,
});

function SharePage() {
  const { project } = useCurrentProject();
  const lots = useLots(project.id);
  const orbits = useOrbits(project.id);
  const views = useViews(project.id);
  const markers = useViewMarkers(project.id);
  const media = useMedia(project.id);
  const rooms = usePanoramas(project.id);
  const update = useUpdateProject(project.id);
  const origin = window.location.origin;
  // Links and code in French or in English (/en/p/…, /en/embed/…).
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const url = `${origin}${lang === "en" ? "/en" : ""}/p/${project.slug}`;
  const presentationUrl = `${url}?mode=presentation`;
  const code = embedCode(origin, project.slug, project.name, lang);
  const published = project.status === "published";

  // The essentials, and the photos (optional): the full list is in the Aperçu tab.
  const checks = pageChecks({
    project,
    lots: lots.data ?? [],
    orbits: [...(orbits.data?.values() ?? [])],
    views: views.data ?? [],
    markers: markers.data ?? [],
    media: media.data ?? [],
    rooms: rooms.data?.length ?? 0,
  })
    .filter((c) => c.essential || c.key === "photos")
    .map((c) => ({ ...c, optional: !c.essential }));
  const ready = checks.every((c) => c.ok || c.optional);

  const copy = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(done);
    } catch {
      toast.error("Copie impossible : sélectionnez le texte et copiez-le.");
    }
  };

  const setStatus = (status: "draft" | "published") =>
    update.mutate(
      { status },
      {
        onSuccess: () =>
          toast.success(status === "published" ? "Programme publié" : "Programme dépublié"),
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Langue des liens et du code" className="flex gap-1.5">
          {(
            [
              ["fr", "Français"],
              ["en", "Anglais"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={lang === value}
              onClick={() => setLang(value)}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                lang === value
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === "fr"
            ? "Liens et code de la page en français."
            : "Liens et code de la page en anglais : vos textes s'y affichent dans leur version anglaise (onglet Anglais)."}
        </p>
      </div>
      <SettingsSection
        title="Page publique"
        description="La page du programme, à partager par WhatsApp, e-mail ou sur votre site. Elle n'est pas référencée par Google."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={project.status} />
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {published ? (
              <Globe className="size-4" aria-hidden />
            ) : (
              <Lock className="size-4" aria-hidden />
            )}
            {published
              ? "Visible par toute personne qui a le lien"
              : "Visible seulement par les membres de votre organisation"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Lien de la page publique"
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 font-mono text-[13px] text-foreground"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="h-11" onClick={() => void copy(url, "Lien copié")}>
              <Copy aria-hidden />
              Copier
            </Button>
            <Button asChild variant="outline" className="h-11">
              <a href={url} target="_blank" rel="noopener">
                <ExternalLink aria-hidden />
                {published ? "Ouvrir" : "Aperçu"}
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {published ? (
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setStatus("draft")}
              disabled={update.isPending}
            >
              Dépublier
            </Button>
          ) : (
            <Button
              className="h-11"
              onClick={() => setStatus("published")}
              disabled={update.isPending}
            >
              <Globe aria-hidden />
              Publier le programme
            </Button>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">
            {published
              ? "Dépublier rend la page inaccessible aux visiteurs ; le lien fonctionnera de nouveau dès la prochaine publication."
              : ready
                ? "Tout est prêt."
                : "Vous pouvez publier dès maintenant, mais la page sera plus complète une fois la liste ci-dessous cochée."}
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Avant de publier">
        <ul className="space-y-2.5">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full",
                  c.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-muted text-muted-foreground",
                )}
              >
                {c.ok ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <X className="size-3.5" aria-hidden />
                )}
              </span>
              <span className={c.ok ? "" : "text-muted-foreground"}>
                {c.label}
                {c.optional ? " (facultatif)" : ""}
              </span>
              <span className="sr-only">{c.ok ? "fait" : "à faire"}</span>
            </li>
          ))}
        </ul>
      </SettingsSection>

      <SettingsSection
        title="Sur votre site"
        description="Le plan de vente seul, à intégrer dans une page de votre site : les visiteurs ouvrent les lots et demandent une visite sans le quitter."
      >
        <textarea
          readOnly
          value={code}
          rows={5}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Code d'intégration"
          spellCheck={false}
          className="w-full resize-none rounded-md border border-input bg-transparent p-3 font-mono text-[12px] leading-relaxed text-foreground"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-11"
            onClick={() => void copy(code, "Code d'intégration copié")}
          >
            <Code2 aria-hidden />
            Copier le code
          </Button>
          <Button asChild variant="outline" className="h-11">
            <a href={`${origin}/embed/${project.slug}`} target="_blank" rel="noopener">
              <ExternalLink aria-hidden />
              Voir le plan intégré
            </a>
          </Button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          À coller dans un bloc « HTML » ou « code » de votre site (WordPress, Wix, Webflow…). Le
          plan prend toute la largeur et sa hauteur s'ajuste toute seule. Si votre site refuse les
          scripts, gardez seulement la ligne {"<iframe>"} : le plan aura une hauteur fixe de 720 px.
          Il n'apparaît qu'une fois le programme publié.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Mode présentation"
        description="Pour la tablette du bureau de vente : le plan en plein écran, de gros boutons, la fiche du lot en grand et un formulaire pour prendre les coordonnées des visiteurs."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={presentationUrl}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Lien du mode présentation"
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 font-mono text-[13px] text-foreground"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => void copy(presentationUrl, "Lien copié")}
            >
              <Copy aria-hidden />
              Copier
            </Button>
            <Button asChild variant="outline" className="h-11">
              <a href={presentationUrl} target="_blank" rel="noopener">
                <MonitorSmartphone aria-hidden />
                Ouvrir
              </a>
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Ouvrez ce lien sur la tablette puis touchez le bouton plein écran. L'écran reste allumé
          tant que la page est ouverte. Après 3 minutes sans contact, le plan revient à l'accueil et
          le formulaire est vidé pour le visiteur suivant. Les demandes arrivent dans l'onglet
          Demandes, avec la source « Bureau de vente ».
        </p>
      </SettingsSection>
    </div>
  );
}
