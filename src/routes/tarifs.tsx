import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";

import { Container, Cta, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import { WHATSAPP_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";
import architecture from "@/assets/work-architecture.jpg";

const TITLE = "Tarifs REV — Production visuelle et croissance immobilière";
const DESCRIPTION =
  "Grilles tarifaires REV par métier : promoteurs, agences immobilières, agents, conciergeries et particuliers. Packs à la mission ou abonnements mensuels.";

type Offer = {
  name: string;
  prefix?: string;
  price: string;
  unit?: string;
  features: string[];
  featured?: boolean;
};

type Segment = {
  id: string;
  label: string;
  intro: string;
  offers: Offer[];
  volume?: { title: string; rows: { label: string; price: string; note: string }[] };
};

const SEGMENTS: [Segment, ...Segment[]] = [
  {
    id: "promoteurs",
    label: "Promoteurs",
    intro:
      "Programmes neufs — trois paliers, de la production du lancement jusqu'à l'accompagnement complet de la commercialisation.",
    offers: [
      {
        name: "Pack Lancement",
        prefix: "à partir de",
        price: "4 900 €",
        features: [
          "Reportage photo complet du programme",
          "Drone photo et vidéo",
          "Film de lancement 60 s",
          "Une visite virtuelle type",
          "Livraison sous 7 jours",
        ],
      },
      {
        name: "Pack Programme",
        prefix: "à partir de",
        price: "9 900 €",
        featured: true,
        features: [
          "Tout le Pack Lancement, plus :",
          "5 vues 3D d'architecture",
          "12 formats courts pour les réseaux",
          "Landing page de conversion",
          "Direction artistique dédiée",
        ],
      },
      {
        name: "Accompagnement 360",
        prefix: "à partir de",
        price: "3 900 €",
        unit: "/ mois",
        features: [
          "Tout le Pack Programme, plus :",
          "Production mensuelle continue",
          "Meta et Google Ads pilotées",
          "HubSpot CRM et automatisation",
          "Reporting hebdomadaire — engagement 6 mois",
        ],
      },
    ],
  },
  {
    id: "agences",
    label: "Agences immo",
    intro:
      "Deux entrées possibles : à la mission pour un bien précis, ou au volume mensuel quand le rythme devient régulier.",
    offers: [
      {
        name: "Pack Photo",
        price: "290 €",
        unit: "/ bien",
        features: [
          "15 vues HDR retouchées",
          "Formats portails et réseaux",
          "Livraison sous 24 heures",
        ],
      },
      {
        name: "Pack Photo + Vidéo",
        price: "590 €",
        unit: "/ bien",
        featured: true,
        features: [
          "Tout le Pack Photo, plus :",
          "Vidéo verticale 30 s",
          "Montage et étalonnage",
        ],
      },
      {
        name: "Pack Complet",
        price: "790 €",
        unit: "/ bien",
        features: [
          "Tout le Pack Photo + Vidéo, plus :",
          "Visite virtuelle 3D",
          "Plan 2D interactif",
        ],
      },
    ],
    volume: {
      title: "Abonnement mensuel — le prix unitaire baisse avec le volume",
      rows: [
        { label: "5 biens par mois", price: "1 190 €", note: "238 € par bien" },
        { label: "10 biens par mois", price: "2 190 €", note: "219 € par bien" },
        { label: "15 biens par mois", price: "2 990 €", note: "199 € par bien" },
      ],
    },
  },
  {
    id: "agents",
    label: "Agents immo",
    intro:
      "L'agent indépendant qui veut cesser de dépendre des portails. Le bien d'un côté, la marque personnelle de l'autre.",
    offers: [
      {
        name: "Le bien",
        price: "390 €",
        features: [
          "Reportage photo premium",
          "Vidéo verticale 30 s",
          "Livraison sous 24 heures",
        ],
      },
      {
        name: "Le bien — Signature",
        price: "690 €",
        featured: true,
        features: [
          "Tout Le bien, plus :",
          "Visite 3D Matterport",
          "Room tour filmé et monté",
          "Drone si le bien s'y prête",
        ],
      },
      {
        name: "Personal branding",
        price: "890 €",
        unit: "/ mois",
        features: [
          "Une journée de tournage par mois",
          "8 formats courts montés",
          "Ligne éditoriale et scripts",
          "Publication et suivi des performances",
          "Sans engagement",
        ],
      },
    ],
  },
  {
    id: "conciergeries",
    label: "Conciergeries",
    intro:
      "Parcs de logements en location courte durée. Volume, rapidité, et une direction artistique commune sur tout le parc.",
    offers: [
      {
        name: "Logement à l'unité",
        prefix: "à partir de",
        price: "240 €",
        features: [
          "Studio ou T2 — 240 €",
          "T3 et plus — 320 €",
          "Visite virtuelle en option — 180 €",
          "Formats Airbnb et Booking",
        ],
      },
      {
        name: "Pack parc",
        prefix: "à partir de",
        price: "990 €",
        featured: true,
        features: [
          "5 logements — 990 €",
          "10 logements — 1 790 €",
          "Soit 179 € par logement",
          "Direction artistique commune",
        ],
      },
      {
        name: "Réservation directe",
        price: "890 €",
        unit: "/ mois",
        features: [
          "Site de réservation en direct",
          "Campagnes d'acquisition",
          "Automatisation WhatsApp",
          "Moins de commissions plateformes",
        ],
      },
    ],
  },
  {
    id: "particuliers",
    label: "Particuliers",
    intro:
      "Hôtes indépendants et propriétaires vendeurs. Simple, rapide, livré sous 24 heures.",
    offers: [
      {
        name: "Photos",
        price: "190 €",
        features: [
          "15 photos HDR retouchées",
          "Livrées sous 24 heures",
          "Formats Airbnb et Booking",
        ],
      },
      {
        name: "Photos + Vidéo",
        price: "340 €",
        featured: true,
        features: [
          "25 photos retouchées",
          "Vidéo verticale 20 s",
          "Rédaction de l'annonce",
        ],
      },
      {
        name: "Photos + Vidéo + 3D",
        price: "490 €",
        features: [
          "Tout le pack précédent",
          "Visite virtuelle 3D",
          "Conseils de mise en scène",
        ],
      },
    ],
  },
];

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TarifsPage,
});

function OfferCard({ offer, delay }: { offer: Offer; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article
        className={cn(
          "relative flex h-full flex-col rounded-2xl border bg-card p-7 transition-colors duration-300",
          offer.featured ? "border-primary" : "border-border hover:border-foreground/25",
        )}
      >
        {offer.featured ? (
          <span className="absolute -top-3 right-6 rounded-lg bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-primary-foreground">
            Le plus demandé
          </span>
        ) : null}

        <h3 className="font-display text-lg font-medium tracking-tight">{offer.name}</h3>

        {offer.prefix ? (
          <p className="mt-3 text-xs text-muted-foreground">{offer.prefix}</p>
        ) : null}

        <p className={cn("flex items-baseline gap-2", offer.prefix ? "mt-1" : "mt-4")}>
          <span className="font-display text-[2rem] font-medium leading-none tracking-[-0.03em] text-primary">
            {offer.price}
          </span>
          {offer.unit ? (
            <span className="text-sm text-muted-foreground">{offer.unit}</span>
          ) : null}
        </p>

        <ul className="mt-7 space-y-3 border-t border-border pt-7">
          {offer.features.map((feature, index) => (
            <li key={feature} className="flex gap-3 text-sm leading-relaxed">
              <Check size={15} className="mt-1 shrink-0 text-primary" />
              <span className={index === 0 ? "text-foreground" : "text-muted-foreground"}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Cta href="/contact" variant="ghost" className="h-11 w-full text-[13px]">
            Demander un devis
            <ArrowUpRight size={15} />
          </Cta>
        </div>
      </article>
    </Reveal>
  );
}

function TarifsPage() {
  const [active, setActive] = useState(0);
  const segment = SEGMENTS[active] ?? SEGMENTS[0];

  return (
    <>
      <PageHero
        eyebrow="Tarifs"
        title="Des offres calibrées par métier."
        description="Un promoteur, une agence et un hôte Airbnb n'achètent pas la même chose. Choisissez votre profil : vous ne voyez que la grille qui vous concerne."
        image={architecture}
        imageAlt="Façade en béton aux lignes géométriques dans l'ombre"
      />

      <Section className="border-t border-border/70 pt-16 md:pt-20">
        <Container>
          <Reveal>
            <div
              role="group"
              aria-label="Choisir un profil"
              className="flex flex-wrap gap-2"
            >
              {SEGMENTS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  className={cn(
                    "rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all duration-300 active:scale-[0.98]",
                    index === active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {segment.intro}
            </p>
          </Reveal>

          <div key={segment.id} className="mt-12 grid gap-5 lg:grid-cols-3">
            {segment.offers.map((offer, index) => (
              <OfferCard key={offer.name} offer={offer} delay={index * 90} />
            ))}
          </div>

          {segment.volume ? (
            <div className="mt-14">
              <Reveal>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                  {segment.volume.title}
                </p>
              </Reveal>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {segment.volume.rows.map((row, index) => (
                  <Reveal key={row.label} delay={index * 80}>
                    <div className="rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/25">
                      <p className="text-sm text-foreground">{row.label}</p>
                      <p className="mt-3 flex items-baseline gap-3">
                        <span className="font-display text-2xl font-medium tracking-[-0.03em] text-primary">
                          {row.price}
                        </span>
                        <span className="text-xs text-muted-foreground">{row.note}</span>
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}

          <Reveal delay={120}>
            <div className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-10">
              <h2 className="font-display text-xl font-medium tracking-tight">
                Votre projet ne rentre pas dans une case ?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Ces montants couvrent la très grande majorité des demandes. Un programme
                atypique, un parc important ou un accompagnement sur mesure se chiffrent après
                un échange de trente minutes. Les frais de déplacement au-delà de 30 km, les
                livraisons en urgence et le home staging virtuel font l'objet d'un devis
                complémentaire.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Cta href="/contact">
                  Planifier un appel
                  <ArrowUpRight size={16} />
                </Cta>
                <Cta href={WHATSAPP_URL} variant="ghost">
                  WhatsApp · 06 75 62 77 07
                </Cta>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
