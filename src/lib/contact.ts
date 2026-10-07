import type { Locale } from "./i18n";

export const SITE_URL = "https://realestatevision360.com";

export const CONTACT_EMAIL = "contact@realestatevision360.com";
export const CONTACT_PHONE = "+33 6 75 62 77 07";
export const CONTACT_PHONE_HREF = "tel:+33675627707";

export const WHATSAPP_NUMBER = "33675627707";

/** How the WhatsApp number is written in each language. */
export const WHATSAPP_DISPLAY: Record<Locale, string> = {
  fr: "06 75 62 77 07",
  en: "+33 6 75 62 77 07",
};

const WHATSAPP_MESSAGES: Record<Locale, string> = {
  fr: "Bonjour REV, je souhaite échanger sur la commercialisation d'un bien.",
  en: "Hello REV, I'd like to talk about marketing a property.",
};

export const whatsappLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const whatsappUrl = (locale: Locale) => whatsappLink(WHATSAPP_MESSAGES[locale]);

/** WhatsApp message asking for a demo of the AI agent. */
const AGENT_DEMO_MESSAGE: Record<Locale, string> = {
  fr: "Bonjour REV, je souhaite une démo de l'agent IA qui qualifie les leads sur WhatsApp.",
  en: "Hello REV, I'd like a demo of the AI agent that qualifies leads on WhatsApp.",
};

export const agentDemoUrl = (locale: Locale) => whatsappLink(AGENT_DEMO_MESSAGE[locale]);
