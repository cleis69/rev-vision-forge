import { AGENCY_NAME, AGENCY_URL } from "@/components/rev/AgencyCredit";
import { CONTACT_EMAIL, SITE_URL } from "./contact";
import { AGENT_FAQ, FAQ_ITEMS } from "./faq";
import { faqJsonLd, isPublic, pageHead, type Locale } from "./i18n";

/*
 * <head> of every page, in both languages. Kept apart from the page
 * components so each page's code is only downloaded when it is visited.
 */

const ABOUT = {
  fr: {
    title: "À propos de REV — Agence de croissance immobilière",
    description:
      "Vision, mission, valeurs, équipe, matériel et technologies : découvrez comment REV combine production visuelle premium et infrastructure d'acquisition pour l'immobilier.",
  },
  en: {
    title: "About REV — Real estate growth agency",
    description:
      "Vision, mission, values, team, equipment and technology: discover how REV combines premium visual production with an acquisition infrastructure for real estate.",
  },
} as const;

const CASES = {
  fr: {
    title: "Études de cas REV — Résultats mesurés en contrats signés",
    description:
      "Programmes neufs, agences et agents : objectifs, stratégie, production, campagnes, automatisation et KPIs détaillés de missions menées par REV.",
  },
  en: {
    title: "REV case studies — Results measured in signed deals",
    description:
      "New developments, agencies and agents: objectives, strategy, production, campaigns, automation and detailed KPIs from REV engagements.",
  },
} as const;

const CONTACT = {
  fr: {
    title: "Contact REV — Planifier un appel stratégique",
    description:
      "Parlons de votre programme, de votre agence ou de votre portefeuille. Formulaire, WhatsApp, Calendly et coordonnées de l'agence REV.",
  },
  en: {
    title: "Contact REV — Book a strategy call",
    description:
      "Let's talk about your development, your agency or your portfolio. Form, WhatsApp, Calendly and REV's contact details.",
  },
} as const;

const INSIGHTS = {
  fr: {
    title: "Insights REV — Marketing, immobilier, Matterport, Ads & HubSpot",
    description:
      "Analyses et méthodes REV : marketing immobilier, visites Matterport, Meta Ads, architecture, HubSpot et SEO pour vendre plus vite et mieux.",
  },
  en: {
    title: "REV insights — Marketing, real estate, Matterport, Ads & HubSpot",
    description:
      "REV analyses and methods: real estate marketing, Matterport tours, Meta Ads, architecture, HubSpot and SEO to sell faster and better.",
  },
} as const;

const PORTFOLIO = {
  fr: {
    title: "Portfolio REV — Ads immobilières, room tours et personal branding",
    description:
      "Les ads verticales produites par REV pour des promoteurs, des agences, des agents et des conciergeries : programmes neufs, room tours, personal branding et contenu éducatif.",
  },
  en: {
    title: "REV portfolio — Real estate ads, room tours and personal branding",
    description:
      "The vertical ads REV produced for developers, agencies, agents and short-let managers: new developments, room tours, personal branding and educational content.",
  },
} as const;

const PRICING = {
  fr: {
    title: "Tarifs REV — Production visuelle et croissance immobilière",
    description:
      "Grilles tarifaires REV par métier : promoteurs, agences immobilières, agents, conciergeries et particuliers. Packs à la mission ou abonnements mensuels.",
  },
  en: {
    title: "REV pricing — Visual production and real estate growth",
    description:
      "REV pricing by profession: developers, real estate agencies, agents, short-let managers and private owners. One-off packages or monthly plans.",
  },
} as const;

const SERVICES = {
  fr: {
    title: "Expertises REV — Production visuelle, acquisition & automatisation",
    description:
      "Photographie, vidéo, drone, Matterport, 3D, personal branding, Meta & Google Ads, landing pages, HubSpot CRM et automatisation : l'écosystème complet REV pour vendre plus vite.",
  },
  en: {
    title: "REV services — Visual production, acquisition & automation",
    description:
      "Photography, video, drone, Matterport, 3D, personal branding, Meta & Google Ads, landing pages, HubSpot CRM and automation: REV's complete ecosystem to sell faster.",
  },
} as const;

const HOME = {
  fr: {
    title: "REV — Marketing visuel & croissance immobilière",
    description:
      "REV accompagne promoteurs, agences et agents immobiliers : production visuelle premium, contenu stratégique, génération de leads et automatisation CRM pour vendre plus vite.",
  },
  en: {
    title: "REV — Visual marketing & real estate growth",
    description:
      "REV works with property developers, agencies and agents: premium visual production, strategic content, lead generation and CRM automation to sell faster.",
  },
} as const;

const AGENT = {
  fr: {
    title: "Agent IA immobilier — Qualification des leads sur WhatsApp | REV",
    description:
      "L'agent IA de REV écrit à chaque lead sur WhatsApp en quelques secondes, le qualifie sur vos critères (budget, financement, délai) et réserve le rendez-vous dans votre agenda.",
  },
  en: {
    title: "Real estate AI agent — Lead qualification on WhatsApp | REV",
    description:
      "REV's AI agent messages every lead on WhatsApp within seconds, qualifies them against your criteria (budget, financing, timeline) and books the appointment in your calendar.",
  },
} as const;

export const aboutHead = (locale: Locale) => pageHead("about", locale, ABOUT[locale]);
export const caseStudiesHead = (locale: Locale) => pageHead("cases", locale, CASES[locale]);
export const contactHead = (locale: Locale) => pageHead("contact", locale, CONTACT[locale]);
export const insightsHead = (locale: Locale) => pageHead("insights", locale, INSIGHTS[locale]);
export const portfolioHead = (locale: Locale) => pageHead("portfolio", locale, PORTFOLIO[locale]);
export const pricingHead = (locale: Locale) => pageHead("pricing", locale, PRICING[locale]);
export const servicesHead = (locale: Locale) => pageHead("services", locale, SERVICES[locale]);

export const agentHead = (locale: Locale) => {
  const head = pageHead("agent", locale, AGENT[locale]);
  return {
    ...head,
    meta: isPublic("agent") ? head.meta : [...head.meta, { name: "robots", content: "noindex, nofollow" }],
    scripts: [faqJsonLd(AGENT_FAQ[locale])],
  };
};

export const homeHead = (locale: Locale) => {
  // The first still in the phone (the LCP image) is preloaded by React itself,
  // from its fetchPriority="high" <img>.
  const head = pageHead("home", locale, HOME[locale]);
  return {
    ...head,
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "REV — Real Estate Vision",
          url: SITE_URL,
          description: HOME[locale].description,
          areaServed: "FR",
          availableLanguage: ["fr", "en"],
          email: CONTACT_EMAIL,
          telephone: "+33675627707",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: SITE_URL,
          name: "REV — Real Estate Vision",
          inLanguage: ["fr-FR", "en-GB"],
          creator: { "@type": "Organization", name: AGENCY_NAME, url: AGENCY_URL },
        }),
      },
      faqJsonLd(FAQ_ITEMS[locale]),
    ],
  };
};
