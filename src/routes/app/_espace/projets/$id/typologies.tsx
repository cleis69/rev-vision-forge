import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, FileText, ImagePlus, LayoutTemplate, Play, Video } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/Blocks";
import { useCurrentProject } from "@/components/app/ProjectContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { dbErrorMessage } from "@/lib/app/errors";
import type { Lot } from "@/lib/app/lot-fields";
import { useLots } from "@/lib/app/lots";
import { mediaImage, mediaVideo, useMedia, useUploadMedia, type MediaItem } from "@/lib/app/media";
import { useUpdateProject, type Project } from "@/lib/app/projects";
import { PLAN_TYPES } from "@/lib/image";
import {
  MAX_TYPE_DESCRIPTION,
  lotTypeNames,
  noteOf,
  orderNotes,
  parseLotTypes,
  sameType,
  withNote,
  type LotTypeNote,
} from "@/lib/lot-types";
import { rangeLabel } from "@/lib/public/typologies";
import { DOCUMENT_TYPES, VIDEO_TYPES } from "@/lib/video";

export const Route = createFileRoute("/app/_espace/projets/$id/typologies")({
  component: TypologiesPage,
});

/* Typologies tab: one card per type of lot (taken from the lots), its text,
   its place in the Typologies section of the public page, and its photos,
   plans, videos and brochure sent straight to the type. */

function TypologiesPage() {
  const { project } = useCurrentProject();
  const lots = useLots(project.id);
  const media = useMedia(project.id);
  const update = useUpdateProject(project.id);

  // Saves one after the other, each with every change made so far.
  const notes = useRef<LotTypeNote[]>(parseLotTypes(project.lot_types));
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const saveNotes = (next: LotTypeNote[], message?: string) => {
    notes.current = next;
    queue.current = queue.current
      .then(() => update.mutateAsync({ lot_types: notes.current }))
      .then(
        () => message && toast.success(message),
        (error: unknown) => toast.error(dbErrorMessage(error)),
      );
  };

  const types = useMemo(
    () => lotTypeNames(lots.data ?? [], parseLotTypes(project.lot_types)),
    [lots.data, project.lot_types],
  );

  if (lots.isPending || media.isPending) {
    return (
      <div aria-busy="true" aria-label="Chargement des typologies" className="space-y-4">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (lots.isError || media.isError) {
    return (
      <EmptyState
        title="Impossible de charger les typologies"
        text="Vérifiez votre connexion internet puis rechargez la page."
      />
    );
  }
  if (types.length === 0) {
    return (
      <EmptyState
        title="Aucun type de lot pour l'instant"
        text="Indiquez le type de chaque lot (Villa A, Appartement T3…) dans l'onglet Lots : chaque type devient une typologie de la page publique, avec son texte, ses plans et sa brochure."
      >
        <Button asChild variant="outline" className="h-11 w-full">
          <Link to="/app/projets/$id/lots" params={{ id: project.id }}>
            Aller aux lots
          </Link>
        </Button>
      </EmptyState>
    );
  }

  const move = (index: number, step: -1 | 1) => {
    const order = [...types];
    const [type] = order.splice(index, 1);
    if (!type) return;
    order.splice(index + step, 0, type);
    saveNotes(orderNotes(notes.current, order), "Ordre enregistré");
  };

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Chaque type de lot forme une carte de la rubrique Typologies de la page publique, dans cet
        ordre : ses chiffres viennent des lots, son texte et ses médias d'ici. Les médias se
        retrouvent aussi dans l'onglet{" "}
        <Link
          to="/app/projets/$id/medias"
          params={{ id: project.id }}
          className="text-foreground underline underline-offset-4"
        >
          Médias
        </Link>
        .
      </p>
      <ul className="space-y-3">
        {types.map((type, index) => (
          <TypeCard
            key={type}
            project={project}
            type={type}
            lots={lots.data.filter((l) => sameType(l.type, type))}
            media={media.data.filter((m) => sameType(m.lot_type, type))}
            description={noteOf(parseLotTypes(project.lot_types), type)}
            first={index === 0}
            last={index === types.length - 1}
            onMove={(step) => move(index, step)}
            onDescription={(text) =>
              saveNotes(withNote(notes.current, type, text), "Texte enregistré")
            }
          />
        ))}
      </ul>
    </div>
  );
}

type Sending = { accept: string[]; asPlan: boolean };

function TypeCard({
  project,
  type,
  lots,
  media,
  description,
  first,
  last,
  onMove,
  onDescription,
}: {
  project: Project;
  type: string;
  lots: Lot[];
  media: MediaItem[];
  description: string;
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
  onDescription: (text: string) => void;
}) {
  const [text, setText] = useState(description);
  const saved = useRef(description);
  const commit = (value: string) => {
    if (value.trim() === saved.current.trim()) return;
    saved.current = value;
    onDescription(value);
  };
  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(() => {
    const timer = window.setTimeout(() => commitRef.current(text), 1200);
    return () => window.clearTimeout(timer);
  }, [text]);
  const latest = useRef(text);
  latest.current = text;
  useEffect(() => () => commitRef.current(latest.current), []);

  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const upload = useUploadMedia(project, (done, total) => setProgress({ done, total }));
  const input = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState<Sending>({ accept: PLAN_TYPES, asPlan: false });
  const pick = (next: Sending) => {
    setSending(next);
    // The input takes its new accept list before it opens.
    window.setTimeout(() => input.current?.click(), 0);
  };
  const send = async (files: File[]) => {
    if (files.length === 0 || upload.isPending) return;
    try {
      const report = await upload.mutateAsync({
        files,
        owner: { lot_type: type },
        asPlan: sending.asPlan,
      });
      if (report.added)
        toast.success(report.added === 1 ? "Fichier ajouté" : `${report.added} fichiers ajoutés`);
      for (const f of report.failed) toast.error(`${f.name} : ${f.reason}`);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  const free = lots.filter((l) => l.statut === "disponible").length;
  const surfaces = lots.flatMap((l) => (l.surface_habitable === null ? [] : [l.surface_habitable]));
  const counts = {
    image: media.filter((m) => m.kind === "image").length,
    plan: media.filter((m) => m.kind === "plan").length,
    video: media.filter((m) => m.kind === "video").length,
    document: media.filter((m) => m.kind === "document").length,
  };

  return (
    <li className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-medium tracking-tight">{type}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lots.length} {lots.length > 1 ? "lots" : "lot"} · {free} disponible
            {free > 1 ? "s" : ""}
            {surfaces.length
              ? ` · ${rangeLabel({ min: Math.min(...surfaces), max: Math.max(...surfaces) }, "m²")}`
              : ""}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            disabled={first}
            onClick={() => onMove(-1)}
            aria-label={`Monter, ${type}`}
          >
            <ArrowUp aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            disabled={last}
            onClick={() => onMove(1)}
            aria-label={`Descendre, ${type}`}
          >
            <ArrowDown aria-hidden />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <label htmlFor={`texte-${type}`} className="text-sm font-medium">
            Texte de la typologie{" "}
            <span className="font-normal text-muted-foreground">(facultatif)</span>
          </label>
          <Textarea
            id={`texte-${type}`}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TYPE_DESCRIPTION))}
            onBlur={() => commit(text)}
            rows={5}
            className="mt-2"
            placeholder="Ex. : villa R+1 de 5 chambres, piscine à débordement, jardin paysager et solarium."
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enregistré automatiquement · {text.length} / {MAX_TYPE_DESCRIPTION}
          </p>
        </div>

        <div className="space-y-4">
          {media.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label={`Médias du type ${type}`}>
              {media.slice(0, 11).map((m) => (
                <li key={m.id}>
                  <Thumb item={m} />
                </li>
              ))}
              {media.length > 11 ? (
                <li className="grid size-16 place-items-center rounded-lg bg-muted text-xs text-muted-foreground">
                  +{media.length - 11}
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun média propre à ce type : la page publique montre les photos de ses lots.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <SendButton
              icon={<ImagePlus aria-hidden />}
              label="Photos"
              count={counts.image}
              disabled={upload.isPending}
              onClick={() => pick({ accept: PLAN_TYPES, asPlan: false })}
            />
            <SendButton
              icon={<LayoutTemplate aria-hidden />}
              label="Plans"
              count={counts.plan}
              disabled={upload.isPending}
              onClick={() => pick({ accept: PLAN_TYPES, asPlan: true })}
            />
            <SendButton
              icon={<Video aria-hidden />}
              label="Vidéos"
              count={counts.video}
              disabled={upload.isPending}
              onClick={() => pick({ accept: VIDEO_TYPES, asPlan: false })}
            />
            <SendButton
              icon={<FileText aria-hidden />}
              label="Brochure PDF"
              count={counts.document}
              disabled={upload.isPending}
              onClick={() => pick({ accept: DOCUMENT_TYPES, asPlan: false })}
            />
          </div>
          {progress ? (
            <p className="text-xs text-muted-foreground" role="status">
              Envoi {Math.min(progress.done + 1, progress.total)} / {progress.total}…
            </p>
          ) : null}
          <input
            ref={input}
            type="file"
            multiple
            accept={sending.accept.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => void send([...(e.target.files ?? [])])}
          />
        </div>
      </div>
    </li>
  );
}

function SendButton({
  icon,
  label,
  count,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" className="h-10 justify-start" disabled={disabled} onClick={onClick}>
      {icon}
      <span className="truncate">{label}</span>
      {count ? <span className="ml-auto tabular-nums text-muted-foreground">{count}</span> : null}
    </Button>
  );
}

function Thumb({ item }: { item: MediaItem }) {
  if (item.kind === "document") {
    return (
      <span
        className="grid size-16 place-items-center rounded-lg bg-muted text-primary"
        title={item.meta.name}
      >
        <FileText className="size-6" aria-hidden />
      </span>
    );
  }
  const still = item.kind === "video" ? mediaVideo(item).poster : mediaImage(item).thumb;
  return (
    <span
      className={
        item.kind === "plan"
          ? "relative block size-16 overflow-hidden rounded-lg bg-white"
          : "relative block size-16 overflow-hidden rounded-lg bg-muted"
      }
    >
      {still ? (
        <img
          src={still}
          alt={item.meta.caption ?? ""}
          loading="lazy"
          className={
            item.kind === "plan"
              ? "absolute inset-0 h-full w-full object-contain"
              : "absolute inset-0 h-full w-full object-cover"
          }
        />
      ) : null}
      {item.kind === "video" ? (
        <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
          <Play className="size-4 fill-current" aria-hidden />
        </span>
      ) : null}
    </span>
  );
}
