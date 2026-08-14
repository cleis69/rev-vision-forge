/**
 * ULTRA VISION — infographies d'article.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/components/Figure.tsx
 * ============================================================
 *
 * POURQUOI DES SCHEMAS DESSINES EN CODE, ET NON DES IMAGES
 *
 * Quatre raisons, dans l'ordre d'importance.
 *
 * 1. ILS SONT LISIBLES PAR LES MOTEURS. Un schema exporte en PNG est
 *    un mur pour Google comme pour un assistant conversationnel : le
 *    texte qu'il contient n'existe pas. Ici, chaque libelle est du
 *    vrai texte, indexable et citable.
 *
 * 2. ILS PESENT QUELQUES CENTAINES D'OCTETS. Une infographie exportee
 *    en image pese entre 200 Ko et 1 Mo, et un article qui en contient
 *    trois devient plus lourd que la page d'accueil.
 *
 * 3. ILS RESTENT NETS partout, et suivent la charte : changer le bleu
 *    dans le code les change tous, sans reexporter quoi que ce soit.
 *
 * 4. ILS SONT ACCESSIBLES. Chaque schema porte un titre et une
 *    description lus par les lecteurs d'ecran, ce qu'une image
 *    exportee ne fait qu'a travers un texte alternatif toujours trop
 *    court.
 *
 * QUATRE TYPES, PAS DAVANTAGE
 *
 * `funnel`, `steps`, `bars` et `split`. La contrainte est volontaire :
 * un jeu de schemas limite produit des articles qui se ressemblent, et
 * des articles qui se ressemblent forment une collection. Vingt types
 * differents produisent vingt mises en page etrangeres les unes aux
 * autres.
 */

export type FigureData =
  /** Entonnoir a trois etages. Pour tout ce qui decrit un tunnel. */
  | {
      type: "funnel";
      caption: string;
      levels: { label: string; sub: string; value: string; note?: string }[];
    }
  /** Suite d'etapes datees, sur une ligne. */
  | {
      type: "steps";
      caption: string;
      steps: { label: string; sub: string }[];
    }
  /** Barres comparatives horizontales. La plus grande vaut 100 %. */
  | {
      type: "bars";
      caption: string;
      unit?: string;
      bars: { label: string; value: number; display: string; highlight?: boolean }[];
    }
  /** Deux colonnes opposees : ce qui marche, ce qui ne marche pas. */
  | {
      type: "split";
      caption: string;
      left: { title: string; items: string[] };
      right: { title: string; items: string[] };
    };

const BLUE = { light: "#93C5FD", mid: "#3B82F6", deep: "#1D4ED8", pale: "#60A5FA" };

export function Figure({ data }: { data: FigureData }) {
  return (
    <figure className="my-10">
      <div
        className="overflow-hidden rounded-2xl p-5 sm:p-7"
        style={{ backgroundColor: "#0B1020", border: "1px solid #16203a" }}
      >
        {data.type === "funnel" && <Funnel data={data} />}
        {data.type === "steps" && <Steps data={data} />}
        {data.type === "bars" && <Bars data={data} />}
        {data.type === "split" && <Split data={data} />}
      </div>
      <figcaption className="mt-3 text-[0.78rem] leading-relaxed text-[#6d7a99]">
        {data.caption}
      </figcaption>
    </figure>
  );
}

/* ==========================================================================
 *  ENTONNOIR
 * ========================================================================== */

function Funnel({ data }: { data: Extract<FigureData, { type: "funnel" }> }) {
  /*
    Les largeurs decroissent de 100 % a 52 %. On ne descend pas plus
    bas : en dessous de la moitie, le dernier etage devient trop etroit
    pour porter son texte, et il faut alors le sortir du bloc — ce qui
    detruit la lecture d'entonnoir.
  */
  const widths = [100, 74, 52];

  return (
    <div className="space-y-2.5">
      {data.levels.map((l, i) => (
        <div key={l.label} className="flex flex-col items-center">
          <div
            className="relative w-full rounded-xl px-4 py-4 sm:px-6"
            style={{
              width: `${widths[i] ?? 52}%`,
              minWidth: 200,
              background: `linear-gradient(135deg, ${
                i === 0 ? "rgba(96,165,250,.22)" : i === 1 ? "rgba(59,130,246,.22)" : "rgba(29,78,216,.28)"
              }, rgba(11,16,32,.4))`,
              border: `1px solid ${i === 0 ? BLUE.pale : i === 1 ? BLUE.mid : BLUE.deep}`,
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-[0.78rem] font-medium tracking-[0.12em] uppercase text-[#cddafc]">
                {l.label}
              </span>
              <span className="display text-[1.1rem] text-foreground">{l.value}</span>
            </div>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-[#8fa3c8]">{l.sub}</p>
            {l.note && (
              <p className="mt-2 text-[0.72rem] text-[#6d7a99]">{l.note}</p>
            )}
          </div>

          {i < data.levels.length - 1 && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
              className="my-1 shrink-0"
            >
              <path d="M7 12 L2 5 h10 Z" fill={BLUE.mid} opacity=".55" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
 *  ETAPES
 * ========================================================================== */

function Steps({ data }: { data: Extract<FigureData, { type: "steps" }> }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {data.steps.map((s, i) => (
        <li key={s.label} className="relative">
          {/* Le trait de liaison, masque sur la derniere etape et sur mobile. */}
          {i < data.steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-[13px] -right-3 hidden h-px w-3 lg:block"
              style={{ backgroundColor: "#1c2946" }}
            />
          )}
          <div
            className="h-full rounded-xl p-4"
            style={{ backgroundColor: "rgba(59,130,246,.07)", border: "1px solid #1c2946" }}
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.68rem] font-medium"
              style={{ backgroundColor: BLUE.deep, color: "#fff" }}
            >
              {i + 1}
            </span>
            <p className="mt-3 text-[0.88rem] font-medium text-[#cddafc]">{s.label}</p>
            <p className="mt-1 text-[0.76rem] leading-relaxed text-[#8fa3c8]">{s.sub}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ==========================================================================
 *  BARRES
 * ========================================================================== */

function Bars({ data }: { data: Extract<FigureData, { type: "bars" }> }) {
  const max = Math.max(...data.bars.map((b) => b.value), 1);

  return (
    <div className="space-y-4">
      {data.bars.map((b) => {
        const pct = Math.round((b.value / max) * 100);
        return (
          <div key={b.label}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[0.82rem] text-[#c2c6d2]">{b.label}</span>
              <span
                className="display text-[0.98rem]"
                style={{ color: b.highlight ? BLUE.light : "#c2c6d2" }}
              >
                {b.display}
              </span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "#111827" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: b.highlight
                    ? `linear-gradient(90deg, ${BLUE.deep}, ${BLUE.pale})`
                    : "#243352",
                }}
              />
            </div>
          </div>
        );
      })}
      {data.unit && (
        <p className="pt-1 text-[0.72rem] text-[#6d7a99]">{data.unit}</p>
      )}
    </div>
  );
}

/* ==========================================================================
 *  DEUX COLONNES OPPOSEES
 * ========================================================================== */

function Split({ data }: { data: Extract<FigureData, { type: "split" }> }) {
  const col = (
    side: { title: string; items: string[] },
    tone: "no" | "yes",
  ) => (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: tone === "yes" ? "rgba(59,130,246,.09)" : "rgba(148,163,184,.05)",
        border: `1px solid ${tone === "yes" ? "#1c3a6e" : "#242a35"}`,
      }}
    >
      <p
        className="text-[0.7rem] font-medium tracking-[0.14em] uppercase"
        style={{ color: tone === "yes" ? BLUE.light : "#8b93a3" }}
      >
        {side.title}
      </p>
      <ul className="mt-3 space-y-2.5">
        {side.items.map((it) => (
          <li
            key={it}
            className="flex gap-2.5 text-[0.84rem] leading-relaxed"
            style={{ color: tone === "yes" ? "#cddafc" : "#9aa1ad" }}
          >
            <span aria-hidden="true" className="mt-[2px] shrink-0">
              {tone === "yes" ? (
                <svg width="13" height="13" viewBox="0 0 13 13">
                  <path
                    d="M2.5 7 L5 9.5 L10.5 3.5"
                    fill="none"
                    stroke={BLUE.pale}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13">
                  <path
                    d="M3.5 3.5 L9.5 9.5 M9.5 3.5 L3.5 9.5"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {col(data.left, "no")}
      {col(data.right, "yes")}
    </div>
  );
}
