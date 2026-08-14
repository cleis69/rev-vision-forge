import { useState } from "react";
import { EASE_RESPOND, MOTION } from "@/config/motion";

/**
 * ULTRA VISION — portrait d'un membre de l'equipe.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/components/TeamAvatar.tsx
 * ============================================================
 *
 * POURQUOI DES AVATARS DESSINES ET NON DES PHOTOS GENEREES
 *
 * Deux personnes de l'equipe n'ont pas encore fourni de photo. La
 * tentation serait d'utiliser un portrait generique — banque d'images
 * ou visage fabrique. C'est exclu, pour une raison qui n'est pas
 * esthetique : afficher le visage d'une personne qui n'existe pas sur
 * une page « L'equipe » est une tromperie, et c'est le genre de detail
 * qu'un prospect finit toujours par decouvrir.
 *
 * A la place, un avatar construit : le symbole de la marque, decline
 * dans une teinte propre a chaque personne, avec ses initiales. Il ne
 * pretend rien. Il tient sa place jusqu'a la vraie photo, et il reste
 * beau si la photo n'arrive jamais.
 *
 * LE JOUR OU LA PHOTO ARRIVE
 *
 * Renseigner `photo` suffit. L'avatar devient automatiquement le repli
 * en cas de fichier introuvable : la page ne casse jamais, meme si un
 * nom de fichier est mal orthographie.
 *
 * LA CONSTRUCTION DE L'AVATAR
 *
 * Trois couches, comme sur le reste du site :
 *   1. un fond bleu nuit, jamais noir ;
 *   2. l'iris de la marque, en tres grand, coupe par le cadre et
 *      tourne d'un angle different pour chaque personne — deux avatars
 *      cote a cote ne doivent pas se ressembler ;
 *   3. les initiales, et une lueur qui les detache.
 *
 * L'angle et la teinte sont derives du nom lui-meme. Deux personnes
 * n'auront donc jamais le meme avatar, et ajouter un membre ne demande
 * aucun reglage.
 */

export type Member = {
  name: string;
  role: string;
  /** Deux ou trois lignes maximum. */
  bio: string;
  /** Points saillants du parcours. Trois au plus. */
  facts?: string[];
  /**
   * Chemin de la photo, par exemple '/brand/team/cleis.jpg'.
   * Laisse vide tant que la photo n'existe pas : l'avatar prend le relais.
   */
  photo?: string;
};

/** Somme stable des caracteres : sert a tirer la teinte et l'angle. */
function seed(s: string) {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 100000;
  return n;
}

/** Initiales : premiere lettre des deux premiers mots. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/*
  Quatre teintes, toutes issues de la famille bleue de la charte, plus
  un violet et un cyan tres proches. Assez distinctes pour differencier
  quatre portraits cote a cote, assez voisines pour que la rangee reste
  une seule image et non un nuancier.
*/
const TINTS = [
  { a: "#60A5FA", b: "#1D4ED8" },
  { a: "#818CF8", b: "#3730A3" },
  { a: "#38BDF8", b: "#0369A1" },
  { a: "#93C5FD", b: "#2563EB" },
];

export function TeamAvatar({
  member,
  className = "",
}: {
  member: Member;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const s = seed(member.name);
  const tint = TINTS[s % TINTS.length]!;
  const angle = s % 360;
  const id = `uvav-${s}`;

  if (member.photo && !failed) {
    return (
      <img
        src={member.photo}
        alt={`${member.name}, ${member.role}`}
        width={640}
        height={800}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 400 500"
      role="img"
      aria-label={`${member.name}, ${member.role}`}
      className={`h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B1020" />
          <stop offset="1" stopColor="#070A14" />
        </linearGradient>

        <radialGradient id={`${id}-glow`} cx="50%" cy="40%" r="62%">
          <stop offset="0" stopColor={tint.a} stopOpacity="0.42" />
          <stop offset="0.55" stopColor={tint.b} stopOpacity="0.18" />
          <stop offset="1" stopColor={tint.b} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint.a} stopOpacity="0.9" />
          <stop offset="1" stopColor={tint.b} stopOpacity="0.15" />
        </linearGradient>

        {/*
          Une pointe d'iris. Le meme profil que le logo : effilee vers
          l'exterieur, arrondie a la base. Elle est repetee par rotation.
        */}
        <path id={`${id}-spike`} d="M-3 0 C-2 -60 -1 -140 0 -196 C1 -140 2 -60 3 0 Z" />
      </defs>

      <rect width="400" height="500" fill={`url(#${id}-bg)`} />

      {/* L'iris, decentre et coupe par le cadre. */}
      <g transform={`translate(200 300) rotate(${angle})`} opacity="0.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <use
            key={i}
            href={`#${id}-spike`}
            transform={`rotate(${i * 15})`}
            fill={`url(#${id}-ray)`}
          />
        ))}
      </g>

      <rect width="400" height="500" fill={`url(#${id}-glow)`} />

      {/* Les initiales. */}
      <text
        x="200"
        y="270"
        textAnchor="middle"
        fontFamily='"General Sans","Inter",system-ui,sans-serif'
        fontWeight="500"
        fontSize="128"
        letterSpacing="-4"
        fill="#F5F5F3"
        opacity="0.94"
      >
        {initials(member.name)}
      </text>

      {/* Filet bas : rappelle la barre de progression du site. */}
      <rect x="0" y="496" width="400" height="4" fill={tint.a} opacity="0.6" />
    </svg>
  );
}

/* ==========================================================================
 *  LA CARTE COMPLETE
 * ========================================================================== */

export function TeamCard({ member }: { member: Member }) {
  return (
    <article
      tabIndex={0}
      className="group h-full overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        backgroundColor: "#0B1020",
        border: "1px solid #16203a",
        transition: `border-color ${MOTION.respond}ms ${EASE_RESPOND}, transform ${MOTION.respond}ms ${EASE_RESPOND}, box-shadow ${MOTION.respond}ms ${EASE_RESPOND}`,
      }}
    >
      {/*
        Le portrait est en 4/5 et non carre. Un cadre legerement
        vertical est le format du portrait depuis la peinture : il laisse
        de l'air au-dessus de la tete, la ou un carre coupe au ras du
        crane.
      */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <div
          className="h-full w-full"
          style={{ transition: `transform 800ms ${EASE_RESPOND}` }}
        >
          <TeamAvatar member={member} />
        </div>

        {/* Voile bas : le nom reste lisible meme sur une vraie photo. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(11,16,32,.96) 2%, rgba(11,16,32,.35) 34%, transparent 62%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="display text-[1.35rem] text-foreground">{member.name}</h3>
          <p className="mt-1 text-[0.72rem] font-medium tracking-[0.14em] uppercase text-accent-hover">
            {member.role}
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-relaxed text-[#8792ad]">{member.bio}</p>

        {member.facts && member.facts.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {member.facts.map((f) => (
              <li
                key={f}
                className="rounded-full px-2.5 py-1 text-[0.68rem] text-[#93C5FD]"
                style={{
                  backgroundColor: "rgba(59,130,246,.1)",
                  border: "1px solid rgba(96,165,250,.24)",
                }}
              >
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
