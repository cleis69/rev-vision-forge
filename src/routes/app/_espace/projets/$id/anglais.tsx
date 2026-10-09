import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/Blocks";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { dbErrorMessage } from "@/lib/app/errors";
import { useLots } from "@/lib/app/lots";
import { useMedia } from "@/lib/app/media";
import { useViews } from "@/lib/app/plan";
import { useUpdateProject } from "@/lib/app/projects";
import { usePanoramas } from "@/lib/app/tours";
import {
  GROUP_LABELS,
  MAX_TRANSLATION,
  parseTranslations,
  sourceTexts,
  withTranslation,
  type SourceText,
  type TextGroup,
  type TranslationMap,
} from "@/lib/translations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_espace/projets/$id/anglais")({
  component: EnglishPage,
});

/* Anglais tab: the English version of the promoter's own texts, shown on the
   English page of the programme (/en/p/$slug). The interface of the page is
   already translated; a text without its English version stays in French. */

type Filter = "todo" | "all";

function EnglishPage() {
  const { project } = useCurrentProject();
  const lots = useLots(project.id);
  const media = useMedia(project.id);
  const views = useViews(project.id);
  const rooms = usePanoramas(project.id);
  const update = useUpdateProject(project.id);
  const [filter, setFilter] = useState<Filter>("todo");

  // The latest translations, ahead of the server: two quick edits never undo each other.
  const latest = useRef<TranslationMap>(parseTranslations(project.translations));
  const [map, setMap] = useState<TranslationMap>(latest.current);
  useEffect(() => {
    if (!update.isPending) {
      latest.current = parseTranslations(project.translations);
      setMap(latest.current);
    }
    // Only when the programme comes back from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.translations]);

  const loading = [lots, media, views, rooms].some((q) => q.isPending);
  const texts = useMemo(
    () =>
      loading
        ? []
        : sourceTexts({
            project,
            lots: lots.data ?? [],
            media: media.data ?? [],
            views: views.data ?? [],
            rooms: rooms.data ?? [],
          }),
    [loading, project, lots.data, media.data, views.data, rooms.data],
  );
  // The list stays put while typing: a text translated just now does not vanish.
  const [todoKeys, setTodoKeys] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (!loading) setTodoKeys(new Set(texts.filter((t) => !map[t.text]).map((t) => t.text)));
    // Recomputed when the list of texts or the filter changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, texts, filter]);

  const done = texts.filter((t) => map[t.text]).length;
  const shown = filter === "all" || !todoKeys ? texts : texts.filter((t) => todoKeys.has(t.text));
  const groups = (Object.keys(GROUP_LABELS) as TextGroup[])
    .map((group) => ({ group, items: shown.filter((t) => t.group === group) }))
    .filter((g) => g.items.length > 0);

  const save = (source: string, target: string) => {
    const next = withTranslation(latest.current, source, target);
    if ((latest.current[source] ?? "") === (next.en[source] ?? "")) return;
    latest.current = next.en;
    setMap(next.en);
    update.mutate(
      { translations: next },
      { onError: (error) => toast.error(dbErrorMessage(error)) },
    );
  };

  const englishUrl = `${window.location.origin}/en/p/${project.slug}`;

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-80">
          <p className="text-sm leading-relaxed text-muted-foreground">
            La page du programme existe aussi en anglais. Son interface est déjà traduite : écrivez
            ici la version anglaise de vos propres textes (présentation, prestations, typologies,
            pièces de la visite, légendes). Un texte sans traduction s'affiche en français.
          </p>
          {!loading && texts.length > 0 ? (
            <p className="mt-2 text-sm">
              <span className="font-medium tabular-nums">
                {done} / {texts.length}
              </span>{" "}
              <span className="text-muted-foreground">
                texte{texts.length > 1 ? "s" : ""} traduit{done > 1 ? "s" : ""}
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Textes affichés" className="flex gap-1.5">
            {(
              [
                ["todo", "À traduire"],
                ["all", "Tous"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  filter === value
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button asChild variant="outline" className="h-9">
            <a href={englishUrl} target="_blank" rel="noopener">
              <ExternalLink aria-hidden />
              Page en anglais
            </a>
          </Button>
        </div>
      </div>

      {loading ? (
        <div aria-busy="true" aria-label="Chargement des textes" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : texts.length === 0 ? (
        <EmptyState
          title="Aucun texte à traduire"
          text="Ajoutez une présentation, des prestations ou des légendes : elles apparaîtront ici avec leur version anglaise."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="Tout est traduit"
          text="La page en anglais affiche tous vos textes en anglais. Choisissez « Tous » pour les relire."
        />
      ) : (
        groups.map(({ group, items }) => (
          <section key={group} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h2 className="font-display text-lg font-medium tracking-tight">
              {GROUP_LABELS[group]}
            </h2>
            <ul className="mt-3 divide-y divide-border">
              {items.map((item) => (
                <TextRow
                  key={item.text}
                  item={item}
                  value={map[item.text] ?? ""}
                  onSave={(target) => save(item.text, target)}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function TextRow({
  item,
  value,
  onSave,
}: {
  item: SourceText;
  value: string;
  onSave: (target: string) => void;
}) {
  const [text, setText] = useState(value);
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) setText(value);
  }, [value]);
  // Saved a second after the last key, or when the field loses focus.
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  useEffect(() => {
    if (!editing.current) return;
    const timer = window.setTimeout(() => saveRef.current(text), 1000);
    return () => window.clearTimeout(timer);
  }, [text]);
  const long = item.text.length > 90;

  return (
    <li className="grid gap-2 py-3 md:grid-cols-2 md:gap-4">
      <p
        lang="fr"
        className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:pt-2"
      >
        {item.text}
      </p>
      <div className="relative">
        <Textarea
          lang="en"
          value={text}
          rows={long ? Math.min(8, Math.ceil(item.text.length / 70)) : 1}
          onFocus={() => {
            editing.current = true;
          }}
          onChange={(e) => setText(e.target.value.slice(0, MAX_TRANSLATION))}
          onBlur={() => {
            editing.current = false;
            onSave(text);
          }}
          placeholder="Version anglaise"
          aria-label={`Version anglaise de « ${item.text.slice(0, 80)} »`}
          className={cn("min-h-9 resize-y pr-8 text-sm", !long && "py-2")}
        />
        {value ? (
          <Check
            className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-emerald-400"
            aria-label="Traduit"
          />
        ) : null}
      </div>
    </li>
  );
}
