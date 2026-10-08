import { Suspense, lazy, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, MapPin, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { SettingsSection } from "@/components/app/Blocks";
import { useOrganizations } from "@/components/app/Organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { dbErrorMessage } from "@/lib/app/errors";
import { GeocodeError, searchAddress, type Found } from "@/lib/app/geocode";
import { useUpdateProject, type Project } from "@/lib/app/projects";
import { DEFAULT_BRAND } from "@/lib/brand";
import {
  ADDRESS_MAX,
  MAX_PLACES,
  checkPlace,
  isPosition,
  parsePlaces,
  type Place,
  type PlaceMode,
  type Position,
} from "@/lib/location";

const ProgrammeMap = lazy(() => import("@/components/map/ProgrammeMap"));

type Row = { key: number; name: string; minutes: string; mode: PlaceMode };

let nextKey = 1;
const toRow = (p: Place): Row => ({
  key: nextKey++,
  name: p.name,
  minutes: String(p.minutes),
  mode: p.mode,
});

const positionOf = (p: Project): Position | null =>
  isPosition(p.latitude, p.longitude)
    ? { lat: p.latitude as number, lng: p.longitude as number }
    : null;

/** Address, pin on the map and places nearby, shown in the Situation section of the public page. */
export function SituationSettings({ project }: { project: Project }) {
  const { memberships } = useOrganizations();
  const color =
    memberships.find((m) => m.organization.id === project.organization_id)?.organization
      .brand_color ?? DEFAULT_BRAND;
  const update = useUpdateProject(project.id);

  const [address, setAddress] = useState(project.address ?? "");
  const [position, setPosition] = useState<Position | null>(() => positionOf(project));
  const [rows, setRows] = useState<Row[]>(() => parsePlaces(project.places).map(toRow));
  const [focus, setFocus] = useState(0);
  const [found, setFound] = useState<Found[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const search = useRef<AbortController | null>(null);

  const saved = useMemo(
    () =>
      JSON.stringify({
        address: project.address ?? "",
        position: positionOf(project),
        places: parsePlaces(project.places),
      }),
    [project],
  );
  const places: Place[] = rows.map((r) => ({
    name: r.name.trim(),
    minutes: Number(r.minutes.replace(",", ".")),
    mode: r.mode,
  }));
  const dirty = JSON.stringify({ address: address.trim(), position, places }) !== saved;
  const rowErrors = rows.map((r) => checkPlace(r.name, r.minutes));

  const place = (p: Position) => {
    setPosition(p);
    setFocus((f) => f + 1);
  };

  const locate = async () => {
    const typed = address.trim();
    if (!typed) return;
    // The city of the programme helps when the address leaves it out.
    const city = project.city?.trim();
    const query =
      city && !typed.toLowerCase().includes(city.toLowerCase()) ? `${typed}, ${city}` : typed;
    search.current?.abort();
    const controller = new AbortController();
    search.current = controller;
    setSearching(true);
    setSearchError(null);
    setFound(null);
    try {
      const results = await searchAddress(query, controller.signal);
      if (results.length === 0) {
        setSearchError(
          "Adresse introuvable sur la carte. Cliquez à l'emplacement du programme pour y placer l'épingle.",
        );
      } else if (results.length === 1) {
        place((results[0] as Found).position);
      } else {
        setFound(results);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        setSearchError(error instanceof GeocodeError ? error.message : "Recherche impossible.");
    } finally {
      if (search.current === controller) setSearching(false);
    }
  };

  const setRow = (key: number, change: Partial<Row>) =>
    setRows((all) => all.map((r) => (r.key === key ? { ...r, ...change } : r)));
  const move = (index: number, by: -1 | 1) =>
    setRows((all) => {
      const next = [...all];
      const [row] = next.splice(index, 1);
      if (row) next.splice(index + by, 0, row);
      return next;
    });

  const save = () => {
    if (rowErrors.some(Boolean)) {
      setShowErrors(true);
      return;
    }
    update.mutate(
      {
        address: address.trim() || null,
        latitude: position?.lat ?? null,
        longitude: position?.lng ?? null,
        places,
      },
      {
        onSuccess: () => {
          setShowErrors(false);
          toast.success("Situation enregistrée");
        },
        onError: (error) => toast.error(dbErrorMessage(error)),
      },
    );
  };

  return (
    <SettingsSection
      title="Situation"
      description="Adresse, emplacement sur la carte et lieux proches, affichés dans la rubrique Situation de la page publique. Elle n'apparaît que si quelque chose est renseigné."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="situation-address" className="text-sm font-medium">
            Adresse
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="situation-address"
              value={address}
              maxLength={ADDRESS_MAX}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void locate();
                }
              }}
              placeholder="Route de l'Ourika, km 7"
              className="h-11"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0"
              onClick={() => void locate()}
              disabled={searching || !address.trim()}
            >
              <Search aria-hidden />
              {searching ? "Recherche…" : "Placer sur la carte"}
            </Button>
          </div>
          {searchError ? (
            <p className="text-sm text-amber-200" role="status">
              {searchError}
            </p>
          ) : null}
          {found ? (
            <div className="rounded-xl border border-border p-2" role="status">
              <p className="px-2 pb-2 pt-1 text-xs text-muted-foreground">
                Plusieurs lieux correspondent : choisissez le bon.
              </p>
              <ul>
                {found.map((f) => (
                  <li key={`${f.position.lat},${f.position.lng}`}>
                    <button
                      type="button"
                      onClick={() => {
                        place(f.position);
                        setFound(null);
                      }}
                      className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="rev-map relative h-80 overflow-hidden rounded-xl border border-border bg-[#111]">
            <Suspense fallback={<Skeleton className="absolute inset-0 rounded-none" />}>
              <ProgrammeMap
                position={position}
                color={color}
                editable
                focus={focus}
                onChange={setPosition}
                className="absolute inset-0"
              />
            </Suspense>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {position
                ? "Déplacez l'épingle, ou cliquez sur la carte, pour la placer exactement."
                : "Cliquez à l'emplacement du programme pour y placer l'épingle."}
            </span>
            {position ? (
              <button
                type="button"
                onClick={() => setPosition(null)}
                className="rounded text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Retirer l'épingle
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">À proximité</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Les lieux qui comptent pour vos acheteurs, avec le temps pour s'y rendre : aéroport,
              centre-ville, golf, écoles, plage…
            </p>
          </div>
          {rows.length > 0 ? (
            <ul className="space-y-2">
              {rows.map((row, i) => {
                const error = showErrors ? rowErrors[i] : null;
                return (
                  <li key={row.key}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={row.name}
                        onChange={(e) => setRow(row.key, { name: e.target.value })}
                        placeholder="Aéroport Marrakech-Ménara"
                        aria-label={`Lieu ${i + 1}`}
                        aria-invalid={error ? true : undefined}
                        className="h-10 min-w-0 flex-1 basis-56"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          value={row.minutes}
                          onChange={(e) => setRow(row.key, { minutes: e.target.value })}
                          inputMode="numeric"
                          aria-label={`Durée en minutes, lieu ${i + 1}`}
                          aria-invalid={error ? true : undefined}
                          className="h-10 w-20 text-right tabular-nums"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                        <select
                          value={row.mode}
                          onChange={(e) => setRow(row.key, { mode: e.target.value as PlaceMode })}
                          aria-label={`Mode, lieu ${i + 1}`}
                          className="h-10 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="voiture">en voiture</option>
                          <option value="pied">à pied</option>
                        </select>
                        <IconButton
                          label={`Monter le lieu ${i + 1}`}
                          disabled={i === 0}
                          onClick={() => move(i, -1)}
                        >
                          <ArrowUp className="size-4" aria-hidden />
                        </IconButton>
                        <IconButton
                          label={`Descendre le lieu ${i + 1}`}
                          disabled={i === rows.length - 1}
                          onClick={() => move(i, 1)}
                        >
                          <ArrowDown className="size-4" aria-hidden />
                        </IconButton>
                        <IconButton
                          label={`Retirer le lieu ${i + 1}`}
                          onClick={() => setRows((all) => all.filter((r) => r.key !== row.key))}
                        >
                          <X className="size-4" aria-hidden />
                        </IconButton>
                      </div>
                    </div>
                    {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={rows.length >= MAX_PLACES}
            onClick={() =>
              setRows((all) => [...all, { key: nextKey++, name: "", minutes: "", mode: "voiture" }])
            }
          >
            <Plus aria-hidden />
            Ajouter un lieu
          </Button>
          {rows.length >= MAX_PLACES ? (
            <p className="text-xs text-muted-foreground">{MAX_PLACES} lieux au maximum.</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Button className="h-11" onClick={save} disabled={!dirty || update.isPending}>
            {update.isPending ? "Enregistrement…" : "Enregistrer la situation"}
          </Button>
          {dirty ? (
            <span className="text-xs text-muted-foreground">Modifications non enregistrées</span>
          ) : null}
        </div>
      </div>
    </SettingsSection>
  );
}

function IconButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
