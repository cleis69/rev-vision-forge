import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

import { Container, Cta, PageHero, Section } from "@/components/rev/ui";
import { Reveal } from "@/components/rev/Reveal";
import { FinalCta } from "@/components/rev/FinalCta";
import { WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";
import { href, useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { photo } from "@/lib/images";

const architecture = photo("work-architecture");

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

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  imageAlt: string;
  groupLabel: string;
  featured: string;
  quote: string;
  customTitle: string;
  customBody: string;
  customCta: string;
  segments: [Segment, ...Segment[]];
};

const COPY: Record<Locale, Copy> = {
  fr: {
    eyebrow: "Tarifs",
    title: "Des offres calibrées par métier.",
    description:
      "Un promoteur, une agence et un hôte Airbnb n'achètent pas la même chose. Choisissez votre profil : vous ne voyez que la grille qui vous concerne.",
    imageAlt: "Façade en béton aux lignes géométriques dans l'ombre",
    groupLabel: "Choisir un profil",
    featured: "Le plus demandé",
    quote: "Demander un devis",
    customTitle: "Votre projet ne rentre pas dans une case ?",
    customBody:
      "Ces montants couvrent la très grande majorité des demandes. Un programme atypique, un parc important ou un accompagnement sur mesure se chiffrent après un échange de trente minutes. Les frais de déplacement au-delà de 30 km, les livraisons en urgence et le home staging virtuel font l'objet d'un devis complémentaire.",
    customCta: "Planifier un appel",
    segments: [
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
            features: ["15 vues HDR retouchées", "Formats portails et réseaux", "Livraison sous 24 heures"],
          },
          {
            name: "Pack Photo + Vidéo",
            price: "590 €",
            unit: "/ bien",
            featured: true,
            features: ["Tout le Pack Photo, plus :", "Vidéo verticale 30 s", "Montage et étalonnage"],
          },
          {
            name: "Pack Complet",
            price: "790 €",
            unit: "/ bien",
            features: ["Tout le Pack Photo + Vidéo, plus :", "Visite virtuelle 3D", "Plan 2D interactif"],
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
            features: ["Reportage photo premium", "Vidéo verticale 30 s", "Livraison sous 24 heures"],
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
            name: "Personal branding — 4 vidéos",
            prefix: "à partir de",
            price: "1 800 €",
            unit: "/ mois",
            features: [
              "4 vidéos stratégiques par mois",
              "Scripts, hooks et direction créative",
              "Stratégie de contenu et calendrier de publication",
              "Jusqu'à 2 lieux de tournage par mois",
              "Engagement 3 mois",
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
        intro: "Hôtes indépendants et propriétaires vendeurs. Simple, rapide, livré sous 24 heures.",
        offers: [
          {
            name: "Photos",
            price: "190 €",
            features: ["15 photos HDR retouchées", "Livrées sous 24 heures", "Formats Airbnb et Booking"],
          },
          {
            name: "Photos + Vidéo",
            price: "340 €",
            featured: true,
            features: ["25 photos retouchées", "Vidéo verticale 20 s", "Rédaction de l'annonce"],
          },
          {
            name: "Photos + Vidéo + 3D",
            price: "490 €",
            features: ["Tout le pack précédent", "Visite virtuelle 3D", "Conseils de mise en scène"],
          },
        ],
      },
    ],
  },
  en: {
    eyebrow: "Pricing",
    title: "Offers tailored to each profession.",
    description:
      "A developer, an agency and an Airbnb host don't buy the same thing. Choose your profile: you'll only see the price list that applies to you.",
    imageAlt: "Concrete façade with geometric lines in shadow",
    groupLabel: "Choose a profile",
    featured: "Most popular",
    quote: "Request a quote",
    customTitle: "Your project doesn't fit in a box?",
    customBody:
      "These prices cover the vast majority of requests. An unusual development, a large portfolio or bespoke support is quoted after a thirty-minute call. Travel beyond 30 km, rush deliveries and virtual home staging are quoted separately.",
    customCta: "Schedule a call",
    segments: [
      {
        id: "promoteurs",
        label: "Developers",
        intro:
          "New developments — three tiers, from launch production to full support throughout the sales campaign.",
        offers: [
          {
            name: "Launch Package",
            prefix: "from",
            price: "€4,900",
            features: [
              "Full photo shoot of the development",
              "Drone photo and video",
              "60-second launch film",
              "One virtual tour of a typical unit",
              "Delivered within 7 days",
            ],
          },
          {
            name: "Development Package",
            prefix: "from",
            price: "€9,900",
            featured: true,
            features: [
              "Everything in the Launch Package, plus:",
              "5 architectural 3D views",
              "12 short formats for social media",
              "Conversion landing page",
              "Dedicated art direction",
            ],
          },
          {
            name: "360 Partnership",
            prefix: "from",
            price: "€3,900",
            unit: "/ month",
            features: [
              "Everything in the Development Package, plus:",
              "Ongoing monthly production",
              "Managed Meta and Google Ads",
              "HubSpot CRM and automation",
              "Weekly reporting — 6-month commitment",
            ],
          },
        ],
      },
      {
        id: "agences",
        label: "Agencies",
        intro:
          "Two ways in: per assignment for a specific property, or a monthly volume plan once the pace becomes regular.",
        offers: [
          {
            name: "Photo Package",
            price: "€290",
            unit: "/ property",
            features: ["15 edited HDR shots", "Portal and social media formats", "Delivered within 24 hours"],
          },
          {
            name: "Photo + Video Package",
            price: "€590",
            unit: "/ property",
            featured: true,
            features: ["Everything in the Photo Package, plus:", "30-second vertical video", "Editing and colour grading"],
          },
          {
            name: "Complete Package",
            price: "€790",
            unit: "/ property",
            features: ["Everything in the Photo + Video Package, plus:", "3D virtual tour", "Interactive 2D floor plan"],
          },
        ],
        volume: {
          title: "Monthly plan — the unit price drops with volume",
          rows: [
            { label: "5 properties per month", price: "€1,190", note: "€238 per property" },
            { label: "10 properties per month", price: "€2,190", note: "€219 per property" },
            { label: "15 properties per month", price: "€2,990", note: "€199 per property" },
          ],
        },
      },
      {
        id: "agents",
        label: "Agents",
        intro:
          "For the independent agent who wants to stop relying on the portals. The property on one side, the personal brand on the other.",
        offers: [
          {
            name: "The property",
            price: "€390",
            features: ["Premium photo shoot", "30-second vertical video", "Delivered within 24 hours"],
          },
          {
            name: "The property — Signature",
            price: "€690",
            featured: true,
            features: [
              "Everything in The property, plus:",
              "Matterport 3D tour",
              "Filmed and edited room tour",
              "Drone if the property lends itself to it",
            ],
          },
          {
            name: "Personal branding — 4 videos",
            prefix: "from",
            price: "€1,800",
            unit: "/ month",
            features: [
              "4 strategic videos per month",
              "Scripts, hooks and creative direction",
              "Content strategy and posting calendar",
              "Up to 2 filming locations per month",
              "3-month commitment",
            ],
          },
        ],
      },
      {
        id: "conciergeries",
        label: "Short-let managers",
        intro:
          "Short-term rental portfolios. Volume, speed and one shared art direction across the whole portfolio.",
        offers: [
          {
            name: "Single property",
            prefix: "from",
            price: "€240",
            features: [
              "Studio or 1-bedroom — €240",
              "2 bedrooms and more — €320",
              "Optional virtual tour — €180",
              "Airbnb and Booking formats",
            ],
          },
          {
            name: "Portfolio package",
            prefix: "from",
            price: "€990",
            featured: true,
            features: [
              "5 properties — €990",
              "10 properties — €1,790",
              "That's €179 per property",
              "Shared art direction",
            ],
          },
          {
            name: "Direct booking",
            price: "€890",
            unit: "/ month",
            features: [
              "Direct booking website",
              "Acquisition campaigns",
              "WhatsApp automation",
              "Lower platform commissions",
            ],
          },
        ],
      },
      {
        id: "particuliers",
        label: "Private owners",
        intro: "Independent hosts and owners selling their home. Simple, fast, delivered within 24 hours.",
        offers: [
          {
            name: "Photos",
            price: "€190",
            features: ["15 edited HDR photos", "Delivered within 24 hours", "Airbnb and Booking formats"],
          },
          {
            name: "Photos + Video",
            price: "€340",
            featured: true,
            features: ["25 edited photos", "20-second vertical video", "Listing copywriting"],
          },
          {
            name: "Photos + Video + 3D",
            price: "€490",
            features: ["Everything in the previous package", "3D virtual tour", "Staging advice"],
          },
        ],
      },
    ],
  },
};

function OfferCard({ offer, delay, copy, locale }: { offer: Offer; delay: number; copy: Copy; locale: Locale }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article
        className={cn(
          "relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-colors duration-300 sm:p-6",
          offer.featured ? "border-primary" : "border-border hover:border-foreground/25",
        )}
      >
        {offer.featured ? (
          <span className="absolute -top-3 right-6 rounded-lg bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-primary-foreground">
            {copy.featured}
          </span>
        ) : null}

        <h3 className="font-display text-lg font-medium tracking-tight">{offer.name}</h3>

        {offer.prefix ? <p className="mt-3 text-xs text-muted-foreground">{offer.prefix}</p> : null}

        <p className={cn("flex items-baseline gap-2", offer.prefix ? "mt-1" : "mt-4")}>
          <span className="font-display text-[2rem] font-medium leading-none tracking-[-0.03em] text-primary">
            {offer.price}
          </span>
          {offer.unit ? <span className="text-sm text-muted-foreground">{offer.unit}</span> : null}
        </p>

        <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
          {offer.features.map((feature, index) => (
            <li key={feature} className="flex gap-3 text-sm leading-relaxed">
              <Check size={15} className="mt-1 shrink-0 text-primary" />
              <span className={index === 0 ? "text-foreground" : "text-muted-foreground"}>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <Cta href={href("contact", locale)} variant="ghost" className="h-11 w-full text-[13px]">
            {copy.quote}
            <ArrowUpRight size={15} />
          </Cta>
        </div>
      </article>
    </Reveal>
  );
}

export function PricingPage() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [active, setActive] = useState(0);
  const segment = copy.segments[active] ?? copy.segments[0];

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        image={architecture}
        imageAlt={copy.imageAlt}
      />

      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container>
          <Reveal>
            <div
              role="group"
              aria-label={copy.groupLabel}
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {copy.segments.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all duration-300 active:scale-[0.98]",
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
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
              {segment.intro}
            </p>
          </Reveal>

          <div key={segment.id} className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {segment.offers.map((offer, index) => (
              <OfferCard key={offer.name} offer={offer} delay={index * 90} copy={copy} locale={locale} />
            ))}
          </div>

          {segment.volume ? (
            <div className="mt-10">
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
            <div className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-display text-xl font-medium tracking-tight">{copy.customTitle}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.customBody}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Cta href={href("contact", locale)}>
                  {copy.customCta}
                  <ArrowUpRight size={16} />
                </Cta>
                <Cta href={whatsappUrl(locale)} variant="ghost">
                  WhatsApp · {WHATSAPP_DISPLAY[locale]}
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
