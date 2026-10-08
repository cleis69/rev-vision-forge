import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { AlertTriangle, Images, Layers, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dbErrorMessage } from "@/lib/app/errors";
import type { Lot } from "@/lib/app/lot-fields";
import { compareNumeros } from "@/lib/app/lot-fields";
import {
  frameUrls,
  useDeleteOrbit,
  useLinkColor,
  useOrbit,
  useUploadOrbit,
  type Orbit,
} from "@/lib/app/orbit";
import type { Project } from "@/lib/app/projects";
import { publicUrl } from "@/lib/app/storage";
import { ImageError } from "@/lib/image";
import { loadMask, type MaskData } from "@/lib/orbit-loader";
import { nearestLoaded, useOrbitFrames } from "@/lib/use-orbit-frames";
import {
  ORBIT_MAX,
  ORBIT_MIN,
  checkSequence,
  colorAt,
  hexOf,
  rgbOf,
  sortByName,
  tintOf,
  tintPixels,
} from "@/lib/orbit-mask";
import { cn } from "@/lib/utils";

const percent = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const lotLabel = (lot: Lot) => `Lot ${lot.numero}${lot.type ? ` · ${lot.type}` : ""}`;

/** Orbital view of the programme (Médias tab): the sequence, then which colour is which lot. */
export function OrbitSection({ project, lots }: { project: Project; lots: Lot[] }) {
  const orbit = useOrbit(project.id);
  const remove = useDeleteOrbit(project);
  const [replacing, setReplacing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const has = (orbit.data?.frames.length ?? 0) > 0;

  return (
    <section
      aria-labelledby="orbit-title"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="orbit-title" className="font-display text-lg font-medium tracking-tight">
            Vue orbitale
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Une séquence d'images tout autour du programme, que le visiteur fait tourner du doigt,
            et les mêmes vues en masques pour savoir quel lot il touche.
          </p>
        </div>
        {has && !replacing ? (
          <div className="flex gap-2">
            <Button variant="outline" className="h-10" onClick={() => setReplacing(true)}>
              <RefreshCw aria-hidden />
              Remplacer la séquence
            </Button>
            <Button
              variant="ghost"
              className="h-10 text-muted-foreground"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 aria-hidden />
              Supprimer
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {orbit.isPending ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : orbit.isError ? (
          <p className="text-sm text-muted-foreground">
            Impossible de charger la vue orbitale. Rechargez la page.
          </p>
        ) : !has || replacing ? (
          <OrbitUpload
            project={project}
            replacing={has}
            onDone={() => setReplacing(false)}
            onCancel={has ? () => setReplacing(false) : undefined}
          />
        ) : (
          <OrbitColors orbit={orbit.data} lots={lots} projectId={project.id} />
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer la vue orbitale ?"
        description="Les images, les masques et les couleurs associées aux lots sont effacés. La page publique ne propose plus que le plan."
        actionLabel="Supprimer la vue orbitale"
        onConfirm={async () => {
          await remove.mutateAsync();
          toast.success("Vue orbitale supprimée");
        }}
      />
    </section>
  );
}

function OrbitUpload({
  project,
  replacing,
  onDone,
  onCancel,
}: {
  project: Project;
  replacing: boolean;
  onDone: () => void;
  onCancel: (() => void) | undefined;
}) {
  const [frames, setFrames] = useState<File[]>([]);
  const [masks, setMasks] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const upload = useUploadOrbit(project, (done, total) => setProgress({ done, total }));
  const frameInput = useRef<HTMLInputElement>(null);
  const maskInput = useRef<HTMLInputElement>(null);
  const problem = frames.length || masks.length ? checkSequence(frames, masks) : null;

  const send = () =>
    upload.mutate(
      { frames, masks },
      {
        onSuccess: (report) => {
          toast.success(
            `Séquence de ${report.frames} vues enregistrée · ${report.colors.length} couleur${report.colors.length > 1 ? "s" : ""} trouvée${report.colors.length > 1 ? "s" : ""}`,
          );
          if (report.noise > 0.01)
            toast.warning(
              "Des bords de lots sont lissés dans les masques : la détection reste bonne, mais exportez-les sans anticrénelage si possible.",
            );
          setProgress(null);
          onDone();
        },
        onError: (error) => {
          setProgress(null);
          toast.error(error instanceof ImageError ? error.message : dbErrorMessage(error));
        },
      },
    );

  const picked = (files: File[]) => {
    const sorted = sortByName(files);
    return sorted.length === 0
      ? "Aucun fichier"
      : `${sorted.length} fichier${sorted.length > 1 ? "s" : ""} · ${sorted[0]?.name}${sorted.length > 1 ? ` … ${sorted.at(-1)?.name}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>
          · Rendez la même caméra en {ORBIT_MIN} à {ORBIT_MAX} vues régulières autour du programme
          (36 à 72 conseillées), toutes au même format.
        </li>
        <li>
          · Rendez les mêmes vues en masques PNG : chaque lot dans une couleur unie différente, le
          reste en noir, sans anticrénelage.
        </li>
        <li>
          · Les fichiers sont pris dans l'ordre de leur nom (vue-01, vue-02… et masque-01,
          masque-02…).
        </li>
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <FilePick
          icon={<Images className="size-4" aria-hidden />}
          label="Images de la séquence"
          detail={picked(frames)}
          onPick={() => frameInput.current?.click()}
          disabled={upload.isPending}
        />
        <FilePick
          icon={<Layers className="size-4" aria-hidden />}
          label="Masques (PNG)"
          detail={picked(masks)}
          onPick={() => maskInput.current?.click()}
          disabled={upload.isPending}
        />
      </div>
      <input
        ref={frameInput}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Images de la séquence"
        onChange={(e) => setFrames([...(e.target.files ?? [])])}
      />
      <input
        ref={maskInput}
        type="file"
        multiple
        accept="image/png"
        className="hidden"
        aria-label="Masques de la séquence"
        onChange={(e) => setMasks([...(e.target.files ?? [])])}
      />

      {problem ? (
        <p className="flex gap-2 text-sm text-amber-200" role="status">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {problem}
        </p>
      ) : null}

      {progress ? (
        <div role="status" aria-live="polite" className="space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Préparation et envoi des vues : {progress.done} / {progress.total}. Gardez cette page
            ouverte.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          className="h-11"
          onClick={send}
          disabled={upload.isPending || frames.length === 0 || Boolean(problem)}
        >
          <Upload aria-hidden />
          {upload.isPending
            ? "Envoi…"
            : replacing
              ? "Remplacer la séquence"
              : "Téléverser la séquence"}
        </Button>
        {onCancel && !upload.isPending ? (
          <Button variant="ghost" className="h-11" onClick={onCancel}>
            Annuler
          </Button>
        ) : null}
      </div>
      {replacing ? (
        <p className="text-xs text-muted-foreground">
          Les couleurs déjà associées à un lot le restent si elles sont dans la nouvelle séquence.
        </p>
      ) : null}
    </div>
  );
}

function FilePick({
  icon,
  label,
  detail,
  onPick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  detail: string;
  onPick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4 text-left transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}

/** Preview of the sequence and the list of colours, each linked to a lot. */
function OrbitColors({ orbit, lots, projectId }: { orbit: Orbit; lots: Lot[]; projectId: string }) {
  const link = useLinkColor(projectId);
  const [selected, setSelected] = useState<string | null>(orbit.colors[0]?.hex ?? null);
  const [hover, setHover] = useState<string | null>(null);
  const rows = useRef(new Map<string, HTMLSelectElement>());

  const sortedLots = useMemo(
    () => [...lots].sort((a, b) => compareNumeros(a.numero, b.numero)),
    [lots],
  );
  const lotOf = useMemo(() => new Map(lots.map((l) => [l.id, l])), [lots]);
  const colorOfLot = new Map(
    orbit.colors.filter((c) => c.lot_id).map((c) => [c.lot_id as string, c.hex]),
  );
  const unlinked = sortedLots.filter((l) => !colorOfLot.has(l.id));
  const linked = orbit.colors.filter((c) => c.lot_id && lotOf.has(c.lot_id)).length;

  const pick = (hex: string) => {
    setSelected(hex);
    rows.current.get(hex)?.focus({ preventScroll: false });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div>
        <OrbitPreview
          orbit={orbit}
          highlight={hover ?? selected}
          onHover={setHover}
          onPick={pick}
          labelOf={(hex) => {
            const c = orbit.colors.find((x) => x.hex === hex);
            const lot = c?.lot_id ? lotOf.get(c.lot_id) : undefined;
            return lot ? lotLabel(lot) : "Couleur sans lot";
          }}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Faites tourner la vue en glissant, survolez ou cliquez un lot pour trouver sa couleur dans
          la liste.
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-sm">
          <span className="font-medium tabular-nums">
            {linked} / {lots.length}
          </span>{" "}
          <span className="text-muted-foreground">lots associés à une couleur</span>
        </p>
        {unlinked.length > 0 && lots.length > 0 ? (
          <p className="mt-1 text-xs text-amber-200">
            Sans couleur : {unlinked.map((l) => l.numero).join(", ")} (absents de la vue orbitale).
          </p>
        ) : null}
        <ul className="mt-4 max-h-[460px] space-y-1.5 overflow-y-auto pr-1">
          {orbit.colors.map((c) => {
            const lot = c.lot_id ? lotOf.get(c.lot_id) : undefined;
            const active = (hover ?? selected) === c.hex;
            return (
              <li
                key={c.id}
                onMouseEnter={() => setHover(c.hex)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2",
                  active ? "border-primary/60 bg-primary/[0.06]" : "border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelected(c.hex)}
                  aria-label={`Montrer la couleur ${c.hex} sur la vue`}
                  className="size-6 shrink-0 rounded border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ background: c.hex }}
                />
                <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
                  {c.hex}
                  <span className="block font-sans tabular-nums">
                    {percent.format(c.share * 100)} %
                  </span>
                </span>
                <select
                  ref={(el) => {
                    if (el) rows.current.set(c.hex, el);
                    else rows.current.delete(c.hex);
                  }}
                  value={lot ? lot.id : ""}
                  onFocus={() => setSelected(c.hex)}
                  onChange={(e) =>
                    link.mutate(
                      { id: c.id, lotId: e.target.value || null },
                      { onError: (error) => toast.error(dbErrorMessage(error)) },
                    )
                  }
                  aria-label={`Lot de la couleur ${c.hex}`}
                  className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">— Aucun lot —</option>
                  {sortedLots.map((l) => {
                    const taken = colorOfLot.get(l.id);
                    return (
                      <option key={l.id} value={l.id}>
                        {lotLabel(l)}
                        {taken && taken !== c.hex ? " (déjà associé)" : ""}
                      </option>
                    );
                  })}
                </select>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** The sequence turned by dragging, with the colour under the pointer lit up. */
function OrbitPreview({
  orbit,
  highlight,
  onHover,
  onPick,
  labelOf,
}: {
  orbit: Orbit;
  highlight: string | null;
  onHover: (hex: string | null) => void;
  onPick: (hex: string) => void;
  labelOf: (hex: string) => string;
}) {
  const count = orbit.frames.length;
  const urls = useMemo(() => orbit.frames.map((f) => frameUrls(f).small), [orbit.frames]);
  const { images, ready } = useOrbitFrames(urls);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [mask, setMask] = useState<MaskData | null>(null);
  const [tip, setTip] = useState<{ hex: string; x: number; y: number } | null>(null);
  const view = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; index: number; moved: boolean } | null>(null);
  const frame = orbit.frames[index];
  const maskView = orbit.masks[index];

  // The view is drawn from the image decoded in advance: no wait, no flash.
  useEffect(() => {
    const canvas = view.current;
    const shown = nearestLoaded(images.current, index);
    const img = shown >= 0 ? images.current[shown] : null;
    if (!canvas || !img) return;
    if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
    if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
  }, [index, ready, images]);

  // The mask of the view is read once the rotation stops.
  useEffect(() => {
    let live = true;
    setMask(null);
    if (!maskView || dragging) return;
    loadMask(publicUrl(maskView.path)).then(
      (m) => live && setMask(m),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [maskView, dragging]);

  useEffect(() => {
    const canvas = overlay.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!mask || !highlight || !context) {
      context?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    canvas.width = mask.width;
    canvas.height = mask.height;
    const pixels = tintPixels(mask, new Map([[rgbOf(highlight), tintOf("#ffffff", 0.55)]]));
    context.putImageData(new ImageData(pixels, mask.width, mask.height), 0, 0);
  }, [mask, highlight]);

  const hexAt = (e: PointerEvent<HTMLDivElement>) => {
    if (!mask) return null;
    const rect = e.currentTarget.getBoundingClientRect();
    const rgb = colorAt(
      mask,
      ((e.clientX - rect.left) / rect.width) * mask.width,
      ((e.clientY - rect.top) / rect.height) * mask.height,
    );
    const hex = rgb === null ? null : hexOf(rgb);
    return hex && orbit.colors.some((c) => c.hex === hex) ? hex : null;
  };

  if (!frame) return null;

  return (
    <div>
      <div
        className={cn(
          "relative touch-none select-none overflow-hidden rounded-xl border border-border bg-black",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, index, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) {
            if (!d.moved && Math.abs(e.clientX - d.x) > 4) {
              d.moved = true;
              setDragging(true);
              onHover(null);
              setTip(null);
            }
            if (d.moved) {
              // One view every 1/60 of the width: a full turn for a long swipe.
              const step = e.currentTarget.clientWidth / 60;
              const steps = Math.round((e.clientX - d.x) / step);
              setIndex((((d.index - steps) % count) + count) % count);
            }
            return;
          }
          const hex = hexAt(e);
          onHover(hex);
          const rect = e.currentTarget.getBoundingClientRect();
          setTip(hex ? { hex, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          setDragging(false);
          if (d && !d.moved) {
            const hex = hexAt(e);
            if (hex) onPick(hex);
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerLeave={() => {
          if (drag.current) return;
          onHover(null);
          setTip(null);
        }}
      >
        <canvas
          ref={view}
          role="img"
          aria-label={`Vue ${index + 1} sur ${count}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <canvas
          ref={overlay}
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full",
            dragging && "opacity-0",
          )}
        />
        {ready < count ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[11px] tabular-nums text-white/80">
            Chargement des vues : {ready} / {count}
          </span>
        ) : null}
        {tip ? (
          <span
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg bg-black/85 px-2.5 py-1 text-xs text-white"
            style={{ left: tip.x, top: tip.y }}
          >
            {labelOf(tip.hex)}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={count - 1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          aria-label="Vue de la séquence"
          className="flex-1 accent-[var(--primary)]"
        />
        <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
          {index + 1} / {count}
        </span>
      </div>
    </div>
  );
}
