import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { MaskReveal, Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";
import { Conviction } from "@/components/Conviction";
import { IrisBackdrop } from "@/components/IrisBackdrop";
import { FloatingPlatforms } from "@/components/FloatingPlatforms";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { LOOP, MOTION, EASE_RESPOND } from "@/config/motion";
import { GrowthBackdrop } from "@/components/GrowthBackdrop";
import { ExpertiseList } from "@/components/ExpertiseList";
import { MethodRail } from "@/components/MethodRail";
import { VideoShowcase } from "@/components/work/VideoShowcase";
import { AREA_SERVED, CONTACT, hasWhatsapp, whatsappUrl } from "@/config/contact";
import { useState } from "react";

/**
 * ULTRA VISION — page d'accueil.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/routes/index.tsx
 * ============================================================
 *
 * CE QUI CHANGE PAR RAPPORT A LA VERSION PRECEDENTE
 *
 * 1. La section <VideoShowcase /> est ajoutee juste apres le Hero,
 *    avant le bandeau de logos clients. Le visiteur voit une vraie
 *    realisation des le premier scroll.
 *
 * 2. La section <Projects /> a ete supprimee. C'etait une liste de
 *    texte citant Nordhaus, Meridian, Atelier Vaste et Kairos
 *    Capital, qui n'existent pas, avec des resultats chiffres tout
 *    aussi imaginaires. VideoShowcase la remplace avec de vrais
 *    projets.
 *
 * 3. Les statistiques sont passees en marqueurs STAT_01 a STAT_04.
 *    Les chiffres precedents (+214 %, 47 marques, 12 M€, 4,9/5)
 *    etaient inventes. Remplace-les par tes vrais chiffres quand tu
 *    les auras, et le compteur anime se remettra en route.
 *
 * 4. La section <Testimonials /> est desactivee. Les trois
 *    temoignages signes Claire Aubert, Marc Delvaux et Sofia
 *    Bennani etaient fictifs. Publier de faux temoignages clients
 *    est une pratique commerciale trompeuse. Le code est conserve
 *    plus bas : il suffira de le reactiver avec de vrais retours.
 *
 * 5. L'adresse e-mail des donnees structurees passe de
 *    studio@ultravision.fr (inventee) a contact@ultravisionagency.com.
 *    Le telephone +33600000000 a ete retire plutot qu'invente.
 */

/*
  L'adresse vient desormais de src/config/site.ts.
  Le jour du basculement vers ultravisionagency.com, une seule ligne
  change la-bas et les dix pages suivent — y compris toutes les
  adresses canoniques et toutes les donnees structurees.
*/
const URL = SITE_URL;

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      /*
        Le titre et la description annoncaient « branding, sites web et
        applications, intelligence artificielle, automatisation ». C'est
        l'ancien positionnement, et il n'a plus rien a voir avec ce que
        la page raconte : production de videos publicitaires et
        acquisition.

        C'est le texte que Google affiche dans ses resultats. Un visiteur
        qui clique sur « branding et applications » et tombe sur des
        videos publicitaires repart aussitot — et ce depart compte comme
        un signal negatif.
      */
      { title: "ULTRA VISION — Vidéos publicitaires & acquisition" },
      {
        name: "description",
        content:
          "Production de vidéos publicitaires et pilotage de vos campagnes Meta, Google et TikTok. Première vidéo livrée en 7 jours, diffusion comprise, à partir de 490 €.",
      },
      { property: "og:title", content: "ULTRA VISION — Vidéos publicitaires & acquisition" },
      {
        property: "og:description",
        content:
          "Nous transformons vos vues en ventes. Vidéos publicitaires pensées, tournées et montées par des humains, diffusées et optimisées par nos soins.",
      },
      { property: "og:url", content: `${URL}/` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "ULTRA VISION",
          description:
            "Agence de production de vidéos publicitaires et d'acquisition. Écriture, tournage, montage et diffusion sur Meta, Google et TikTok.",
          url: URL,
          email: CONTACT.email,
          /*
            L'ADRESSE ANNONCAIT « Paris, FR ». C'ETAIT FAUX.

            C'est le dernier mensonge du site, et le plus discret : il
            n'apparaissait nulle part a l'ecran, uniquement dans les
            donnees que Google lit. Google s'en sert pourtant pour
            decider dans quelles recherches locales faire apparaitre
            l'entreprise.

            La zone d'intervention vient maintenant de
            src/config/contact.ts : le Maroc et les cinq villes. Elle
            est identique sur toutes les pages du site — declarer une
            zone differente d'une page a l'autre est l'erreur la plus
            couteuse en referencement local, parce que Google cesse
            alors de situer l'entreprise et ne l'affiche plus nulle part.
          */
          areaServed: AREA_SERVED,
          address: { "@type": "PostalAddress", addressCountry: CONTACT.country },
          knowsLanguage: ["fr", "ar", "en"],
        }),
      },
    ],
  }),
});

const CLIENTS = ["Africa Beauty", "Scultbody", "Ehab"];



const WHY = [
  {
    title: "Uniquement des seniors",
    text: "Aucun stagiaire sur votre projet. Les personnes qui vendent sont celles qui exécutent.",
  },
  {
    title: "Design et acquisition réunis",
    text: "La marque et la performance sont construites ensemble, jamais dans deux silos.",
  },
  {
    title: "Engagement sur les indicateurs",
    text: "Nous nous engageons sur des rendez-vous qualifiés, pas sur des impressions.",
  },
  {
    title: "Cadence tenue",
    text: "Livraisons hebdomadaires, un interlocuteur unique, des délais annoncés et respectés.",
  },
];

/**
 * Statistiques — chiffres reels, fournis le 14 aout 2026.
 *
 * L'ORDRE N'EST PAS CELUI QUI A ETE DONNE, ET C'EST VOLONTAIRE
 *
 * Il va du plus verifiable au plus declaratif :
 *
 *   10 000 leads   — sort d'un gestionnaire de publicites
 *   50 K€ de budget — sort d'une facture
 *   +15 marques     — se compte
 *   100 % satisfaits — repose sur la parole de l'agence
 *
 * Un chiffre invérifiable place en premier jette le doute sur les
 * trois suivants. Place en dernier, il est lu comme une conclusion,
 * apres que la credibilite a deja ete etablie.
 *
 * DEUX POINTS A VERIFIER DE TON COTE
 *
 * 1. La devise. J'ai mis des euros, par coherence avec la FAQ qui
 *    annonce des budgets en euros. Si tes campagnes sont pilotees en
 *    dirhams, remplace « 50 K€ » par « 500 K MAD » ou la valeur juste.
 *
 * 2. Le « 100 % de clients satisfaits ». C'est une allegation
 *    commerciale : en cas de contestation, c'est a l'annonceur de la
 *    prouver. Une enquete de satisfaction, meme sur quinze clients,
 *    avec les reponses conservees, suffit. Sans support, la formulation
 *    prudente serait « Aucun client perdu depuis la creation ».
 *
 * Toute valeur commencant par STAT_ s'affiche en grise avec la mention
 * « a completer » : le garde-fou reste en place pour les prochains.
 */
const STATS: { value: string; label: string }[] = [
  { value: "10 000", label: "Leads générés chaque mois" },
  { value: "50 K€", label: "Budget publicitaire piloté par mois" },
  { value: "+15", label: "Marques accompagnées" },
  { value: "100 %", label: "Clients satisfaits" },
];

const FAQ = [
  {
    /*
      Cette reponse annoncait 20 000 € de depart et 40 000 a 100 000 €
      par an. C'etait le dernier endroit du site qui contredisait
      encore la grille reelle, laquelle demarre a 490 €.
      Un ecart de ce rapport ne se lit pas comme une erreur : il se lit
      comme un prix qui change selon l'interlocuteur.
    */
    q: "Quel est le budget d'un accompagnement ?",
    a: "Une première vidéo publicitaire est à 490 €, diffusion comprise pendant 14 jours. Les accompagnements mensuels démarrent à 1 490 € par mois. Le détail complet, prestation par prestation, est publié sur la page tarifs.",
  },
  {
    q: "Quels sont les délais ?",
    a: "Une vidéo publicitaire est livrée en 7 jours. Une landing page en 5 jours, un site vitrine en 3 semaines. Les premières campagnes sont en ligne dès la validation des vidéos.",
  },
  {
    q: "Pourquoi vos prix sont-ils affichés en euros ?",
    a: "Parce que c'est la référence de nos clients, majoritairement francophones et habitués aux tarifs français. Le règlement se fait en dirhams au taux du jour, et l'équivalent indicatif figure sous chaque prix sur la page tarifs.",
  },
  {
    q: "Comment mesurez-vous les résultats ?",
    a: "Un tableau de bord unique relie dépense média, leads, rendez-vous et chiffre d'affaires signé. Revue mensuelle avec la direction.",
  },
  {
    /*
      Cette reponse citait « Paris, Dubai, Geneve et Casablanca ». Trois
      de ces quatre villes ne correspondaient a aucun client. La reponse
      exacte est plus simple, et plus rassurante pour un prospect
      francais : l'equipe est au Maroc, les clients sont en France, et
      le tournage se deplace.
    */
    q: "Où intervenez-vous, et pour qui ?",
    a: "Uniquement au Maroc : Casablanca, Rabat, Marrakech, Tanger et Agadir. Le tournage se déplace dans ces cinq villes sans frais supplémentaires. La grande majorité de nos clients sont des dirigeants francophones installés au Maroc — nous travaillons en français, avec les standards de production auxquels ils sont habitués.",
  },
];

function Home() {
  return (
    <>
      <Hero />
      {/* La preuve visuelle arrive des le premier scroll. */}
      <VideoShowcase />
      {/* La seule rupture claire de la page. Elle casse le tunnel noir. */}
      <Conviction />
      <Clients />
      <Poles />
      <Method />
      <Why />
      <Stats />
      {/* <Testimonials /> — réactiver avec de vrais témoignages clients. */}
      <Faq />
      <FinalCTA />
    </>
  );
}

/**
 * Le hero.
 *
 * CE QUI A CHANGE
 *
 * Le logo a disparu d'ici. Il est deja dans la navigation, trois cents
 * pixels plus haut. L'afficher deux fois ne renforcait pas la marque,
 * ca signalait juste que la page n'avait rien d'autre a montrer.
 *
 * A sa place, l'iris de la marque en tres grand, coupe par le bord
 * droit, en rotation lente. Le titre redevient le sujet.
 *
 * La ligne de villes en bas ancre l'agence dans le reel. C'est un
 * detail, mais c'est ce genre de detail qui separe un site d'agence
 * d'un gabarit.
 */
function Hero() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      <IrisBackdrop />

      {/*
        Les trois plateformes, posees par-dessus l'iris et en dessous du
        texte. Elles derivent avec le curseur, chacune a son amplitude :
        c'est ce decalage qui cree la profondeur. Masquees en dessous de
        1024 px, ou elles chevaucheraient le titre.
      */}
      <FloatingPlatforms />

      <div className="shell relative z-[3] w-full pt-40 pb-20 lg:pt-44 lg:pb-24">
        {/*
          La pastille a quitte le hero : elle vit desormais dans la barre
          de navigation, centree au-dessus des liens. L'afficher aux deux
          endroits revenait a repeter la meme phrase a trois cents pixels
          d'intervalle.
        */}
        <Reveal>
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-accent">
            Creative growth agency
          </p>
        </Reveal>

        {/*
          Le titre est decoupe en quatre lignes ecrites a la main, et non
          laisse au navigateur.

          En laissant faire le retour automatique, on obtient des lignes
          qui se cassent n'importe ou : « marques » et « croissance » se
          retrouvaient seuls en fin de ligne. Un mot isole en bout de
          ligne casse le rythme de lecture et se voit immediatement sur
          un titre de cette taille.

          Chaque ligne est donc calibree pour tenir dans la largeur, et
          « systemes de croissance » occupe une ligne entiere en gris :
          la respiration tombe au bon endroit.
        */}
        {/*
          « systemes de croissance » passe du gris au bleu.

          En gris, cette ligne se lisait comme une mise en retrait — le
          gris dit « moins important ». Or c'est exactement l'inverse :
          c'est la promesse commerciale du titre. Le bleu la designe
          comme le mot sur lequel tout repose, et c'est le seul endroit
          du premier ecran ou la couleur de marque apparait en grand.

          Un seul segment coloré. Deux, et plus rien n'est designe.
        */}
        <h1 className="display mt-9 max-w-4xl text-[2.4rem] leading-[1] tracking-[-0.035em] sm:text-[3.6rem] lg:text-[4.4rem]">
          <MaskReveal delay={80}>Nous concevons</MaskReveal>
          <MaskReveal delay={165}>des marques et des</MaskReveal>
          <MaskReveal delay={250}>
            <span
              style={{
                background: "linear-gradient(96deg, #60A5FA 0%, #3B82F6 48%, #1D4ED8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              systèmes de croissance
            </span>
          </MaskReveal>
          <MaskReveal delay={335}>qui font la différence.</MaskReveal>
        </h1>

        {/*
          LE SOUS-TITRE

          Il disait « Branding, technologie, intelligence artificielle et
          acquisition ». Quatre categories abstraites : rien qu'un
          prospect puisse se representer.

          Il nomme maintenant le metier reel — production audiovisuelle
          et publicite — puis la maniere de le faire.

          « Pensé, tourné et monté par des humains » avant « décuplé par
          l'intelligence artificielle », et pas l'inverse. L'ordre est le
          message : sur un marche ou tout le monde annonce de l'IA, la
          rarete n'est plus l'IA, c'est la main humaine. Ce qui est mis
          en avant doit etre ce qui manque ailleurs.
        */}
        <Reveal delay={430}>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Production de contenu audiovisuel et publicité.{" "}
            <span className="text-foreground">
              Pensé, tourné et monté par des humains
            </span>
            , décuplé par l&apos;intelligence artificielle.
          </p>
        </Reveal>

        <Reveal delay={460}>
          <div className="mt-11 flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className="inline-flex h-12 items-center rounded-full bg-foreground px-7 text-xs font-medium tracking-[0.14em] uppercase text-background transition-colors duration-300 hover:bg-accent-hover"
            >
              Prendre rendez-vous
            </Link>
            {hasWhatsapp ? (
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center rounded-full border border-hairline px-7 text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-300 hover:border-accent hover:text-accent-hover"
              >
                Parler sur WhatsApp
              </a>
            ) : (
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex h-12 items-center rounded-full border border-hairline px-7 text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-300 hover:border-accent hover:text-accent-hover"
              >
                Nous écrire
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={560}>
          <div className="mt-20 flex flex-wrap gap-x-10 gap-y-2 border-t border-hairline pt-6 text-[0.68rem] tracking-[0.16em] uppercase text-[#5c5c5a]">
            {CONTACT.locations.split("—").map((v) => (
              <span key={v.trim()}>{v.trim()}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Clients() {
  return (
    <section className="rule overflow-hidden bg-background py-10">
      <div className="shell">
        <p className="eyebrow">Entreprises accompagnées</p>
      </div>
      <div className="mt-8 flex overflow-hidden">
        {/* 44 s au lieu de 38 : assez lent pour qu'on lise chaque nom. */}
        <div
          className="marquee flex shrink-0 items-center gap-16 pr-16"
          style={{ animationDuration: `${LOOP.marquee}s` }}
        >
          {[...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS].map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="display shrink-0 text-2xl text-muted-foreground sm:text-3xl"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Poles() {
  return (
    /*
      Le decor de croissance est pose ici, derriere les expertises.
      C'est la section ou vit le pole Acquisition : la courbe et les
      plateformes y illustrent exactement ce qui est ecrit au-dessus,
      au lieu de decorer un propos sans rapport.
    */
    <section className="rule relative overflow-hidden bg-surface">
      <GrowthBackdrop />
      <div className="shell relative py-24 lg:py-32">
        <ExpertiseList />
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className="rule bg-background">
      <div className="shell py-24 lg:py-32">
        <MethodRail />
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="rule bg-surface">
      <div className="shell grid gap-16 py-24 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <Reveal>
          <div>
            <p className="eyebrow">Pourquoi ULTRA VISION</p>
            <h2 className="display mt-6 text-4xl sm:text-5xl">
              Le niveau d&apos;exigence d&apos;une équipe interne, la vitesse d&apos;un studio.
            </h2>
          </div>
        </Reveal>
        {/*
          Surlignage au survol.

          Un bloc bleu profond glisse derriere l'argument survole. Ca
          transforme une liste passive en quelque chose qu'on parcourt,
          et ca ramene du bleu dans une section qui n'en avait aucun.

          Le bleu utilise est #1D4ED8, l'accent sombre de la charte :
          assez soutenu pour porter du texte blanc, assez sobre pour ne
          pas transformer la section en aplat colore.
        */}
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 70}>
              {/* Survol : 220 ms. Le bloc bleu doit etre la avant que la
                  main n'ait fini son geste, sinon il donne l'impression
                  de courir apres le curseur. */}
              <div
                tabIndex={0}
                className="group h-full rounded-2xl border border-transparent px-5 py-6 outline-none hover:border-[#1D4ED8] hover:bg-[#1D4ED8] focus-visible:border-[#1D4ED8] focus-visible:bg-[#1D4ED8]"
                style={{
                  borderTopColor: "#262626",
                  transition: `background-color ${MOTION.respond}ms ${EASE_RESPOND}, border-color ${MOTION.respond}ms ${EASE_RESPOND}`,
                }}
              >
                <h3
                  className="text-base font-medium group-hover:text-white group-focus-visible:text-white"
                  style={{ transition: `color ${MOTION.respond}ms ${EASE_RESPOND}` }}
                >
                  {w.title}
                </h3>
                <p
                  className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-[#D6E4FF] group-focus-visible:text-[#D6E4FF]"
                  style={{ transition: `color ${MOTION.respond}ms ${EASE_RESPOND}` }}
                >
                  {w.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="rule bg-background">
      <div className="shell py-24 lg:py-28">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => {
            const pending = s.value.startsWith("STAT_");
            return (
              <Reveal key={s.label} delay={i * 70}>
                <div>
                  <p
                    className={`display text-5xl lg:text-6xl ${pending ? "text-[#3a3a3a]" : ""}`}
                  >
                    {s.value}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">{s.label}</p>
                  {pending && (
                    <p className="mt-1 text-[0.65rem] tracking-[0.12em] uppercase text-[#5a5a5a]">
                      à compléter
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="rule bg-background">
      <div className="shell grid gap-14 py-24 lg:grid-cols-[1fr_1.4fr] lg:py-32">
        <Reveal>
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="display mt-6 text-4xl sm:text-5xl">Questions fréquentes</h2>
          </div>
        </Reveal>
        <div className="border-t border-hairline">
          {FAQ.map((f, i) => (
            <div key={f.q} className="border-b border-hairline">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span
                  className="text-base font-medium group-hover:text-accent-hover sm:text-lg"
                  style={{ transition: `color ${MOTION.respond}ms ${EASE_RESPOND}` }}
                >
                  {f.q}
                </span>
                {/* La croix pivote et passe au bleu : le seul point de
                    couleur de la section, et il indique l'etat ouvert. */}
                <span
                  className={`shrink-0 text-lg group-hover:text-accent-hover ${
                    open === i ? "rotate-45 text-accent" : "text-muted-foreground"
                  }`}
                  style={{ transition: `transform ${MOTION.faq}ms ${EASE_RESPOND}, color ${MOTION.respond}ms ${EASE_RESPOND}` }}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden ${open === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                style={{
                  transition: `max-height ${MOTION.faq}ms ${EASE_RESPOND}, opacity ${MOTION.faq}ms ${EASE_RESPOND}`,
                }}
              >
                <p className="pb-6 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
