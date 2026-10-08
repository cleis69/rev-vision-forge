import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Play, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lot } from "@/lib/app/lot-fields";
import {
  CATEGORY_LABELS,
  mediaDocument,
  mediaImage,
  mediaVideo,
  type MediaCategory,
  type MediaItem,
  type MediaOwner,
} from "@/lib/app/media";
import { sameType } from "@/lib/lot-types";
import { formatDuration, formatSize } from "@/lib/video";

/* A media of the programme in the promoter space: its preview, its caption
   (saved a second after the last key), its owner (programme, type, lot),
   for a photo its category and whether it is a plan, its place and deletion. */

const PROGRAMME = "programme";
const NO_CATEGORY = "aucune";
const KIND_LABELS = { image: "Photo", plan: "Plan", video: "Vidéo", document: "PDF" } as const;

export const ownerKey = (owner: MediaOwner) =>
  !owner ? PROGRAMME : "lot_id" in owner ? `lot:${owner.lot_id}` : `type:${owner.lot_type}`;

export function ownerOfKey(key: string): MediaOwner {
  if (key.startsWith("lot:")) return { lot_id: key.slice(4) };
  if (key.startsWith("type:")) return { lot_type: key.slice(5) };
  return null;
}

/** Programme, each type, each lot: where a media (or a sending) goes. */
export function OwnerOptions({ lots, types }: { lots: Lot[]; types: string[] }) {
  return (
    <>
      <SelectItem value={PROGRAMME}>Programme (galerie)</SelectItem>
      {types.length > 0 ? <SelectSeparator /> : null}
      {types.map((t) => (
        <SelectItem key={t} value={`type:${t}`}>
          Type · {t}
        </SelectItem>
      ))}
      {lots.length > 0 ? <SelectSeparator /> : null}
      {lots.map((l) => (
        <SelectItem key={l.id} value={`lot:${l.id}`}>
          Lot {l.numero}
          {l.type ? ` · ${l.type}` : ""}
        </SelectItem>
      ))}
    </>
  );
}

export function ownerLabel(item: MediaItem, lots: Lot[], types: string[]) {
  if (item.lot_id) {
    const lot = lots.find((l) => l.id === item.lot_id);
    return lot ? `Lot ${lot.numero}` : "Lot";
  }
  if (item.lot_type) return types.find((t) => sameType(t, item.lot_type)) ?? item.lot_type;
  return "Programme";
}

export function MediaCard({
  item,
  lots,
  types,
  first,
  last,
  onMove,
  onOwner,
  onCaption,
  onCategory,
  onPlan,
  onDelete,
}: {
  item: MediaItem;
  lots: Lot[];
  types: string[];
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
  onOwner: (owner: MediaOwner) => void;
  onCaption: (caption: string) => void;
  onCategory: (category: MediaCategory | null) => void;
  onPlan: (plan: boolean) => void;
  onDelete: () => void;
}) {
  const initial = item.meta.caption ?? "";
  const [caption, setCaption] = useState(initial);
  // Saved a second after the last key, or when the field loses focus.
  const saved = useRef(initial);
  const commit = (value: string) => {
    const text = value.trim();
    if (text === saved.current) return;
    saved.current = text;
    onCaption(text);
  };
  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(() => {
    const timer = window.setTimeout(() => commitRef.current(caption), 1000);
    return () => window.clearTimeout(timer);
  }, [caption]);
  const latest = useRef(caption);
  latest.current = caption;
  // Leaving the page before the delay: the caption typed so far is kept.
  useEffect(() => () => commitRef.current(latest.current), []);

  const owner = ownerLabel(item, lots, types);
  const label =
    initial || `${KIND_LABELS[item.kind as keyof typeof KIND_LABELS] ?? "Média"} · ${owner}`;
  // A type that no lot has any more stays selectable, so the select shows it.
  const ownerTypes =
    item.lot_type && !types.some((t) => sameType(t, item.lot_type))
      ? [...types, item.lot_type]
      : types;
  const isImage = item.kind === "image" || item.kind === "plan";

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Preview item={item} label={label} />
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-medium">
            {KIND_LABELS[item.kind as keyof typeof KIND_LABELS] ?? item.kind}
          </span>
          <span className="truncate rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            {owner}
          </span>
          {item.kind === "document" && item.meta.size ? (
            <span className="shrink-0 text-muted-foreground">{formatSize(item.meta.size)}</span>
          ) : null}
          <span className="ml-auto flex shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={first}
              onClick={() => onMove(-1)}
              aria-label={`Avancer, ${label}`}
            >
              <ArrowLeft aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={last}
              onClick={() => onMove(1)}
              aria-label={`Reculer, ${label}`}
            >
              <ArrowRight aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-red-300 hover:bg-destructive/10 hover:text-red-200"
              onClick={onDelete}
              aria-label={`Supprimer, ${label}`}
            >
              <Trash2 aria-hidden />
            </Button>
          </span>
        </div>
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 200))}
          onBlur={() => commit(caption)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder={
            item.kind === "document" ? "Titre du bouton (ex. Brochure)" : "Légende (facultatif)"
          }
          aria-label={`Légende, ${label}`}
          className="h-9"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Select
            value={ownerKey(
              item.lot_id
                ? { lot_id: item.lot_id }
                : item.lot_type
                  ? { lot_type: item.lot_type }
                  : null,
            )}
            onValueChange={(v) => onOwner(ownerOfKey(v))}
          >
            <SelectTrigger
              className={isImage ? "h-9" : "h-9 sm:col-span-2"}
              aria-label={`Rattachement, ${label}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <OwnerOptions lots={lots} types={ownerTypes} />
            </SelectContent>
          </Select>
          {isImage ? (
            <Select
              value={item.kind === "plan" ? "plan" : (item.meta.category ?? NO_CATEGORY)}
              onValueChange={(v) => {
                if (v === "plan") onPlan(true);
                else {
                  if (item.kind === "plan") onPlan(false);
                  onCategory(v === NO_CATEGORY ? null : (v as MediaCategory));
                }
              }}
            >
              <SelectTrigger className="h-9" aria-label={`Nature, ${label}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Photo</SelectItem>
                {(Object.keys(CATEGORY_LABELS) as MediaCategory[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
                <SelectItem value="plan">Plan</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function Preview({ item, label }: { item: MediaItem; label: string }) {
  if (item.kind === "document") {
    const doc = mediaDocument(item);
    return (
      <a
        href={doc.url}
        target="_blank"
        rel="noopener"
        className="flex aspect-[16/10] flex-col items-center justify-center gap-3 bg-muted px-4 text-center transition-colors hover:bg-muted/70"
      >
        <FileText className="size-8 text-primary" aria-hidden />
        <span className="line-clamp-2 break-all text-xs text-muted-foreground">{doc.name}</span>
      </a>
    );
  }
  if (item.kind === "video") {
    const video = mediaVideo(item);
    return (
      <div className="relative aspect-[16/10] bg-muted">
        {video.poster ? (
          <img
            src={video.poster}
            alt={label}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-12 place-items-center rounded-full bg-black/60 text-white">
            <Play className="ml-0.5 size-5 fill-current" aria-hidden />
          </span>
        </span>
        {video.duration ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] tabular-nums text-white">
            {formatDuration(video.duration)}
          </span>
        ) : null}
      </div>
    );
  }
  const image = mediaImage(item);
  return (
    <div
      className={
        item.kind === "plan"
          ? "relative aspect-[16/10] bg-white"
          : "relative aspect-[16/10] bg-muted"
      }
    >
      <img
        src={image.thumb}
        alt={label}
        loading="lazy"
        className={
          item.kind === "plan"
            ? "absolute inset-0 h-full w-full object-contain p-2"
            : "absolute inset-0 h-full w-full object-cover"
        }
      />
    </div>
  );
}
