import type { Locale } from "./i18n";

/* FAQ copy, kept apart from the components so page <head>s (FAQPage
   structured data) can use it without loading the page code. */

/** Home page FAQ. */
export const FAQ_ITEMS: Record<Locale, { q: string; a: string }[]> = {
  fr: [
    {
      q: "REV est-elle une agence de photographie immobilière ?",
      a: "Non. La production visuelle n'est qu'une brique de notre écosystème. Nous construisons la chaîne complète : contenu premium, stratégie, acquisition payante et organique, landing pages, CRM et automatisation.",
    },
    {
      q: "Avec quels types de clients travaillez-vous ?",
      a: "Promoteurs, agences immobilières, architectes et agents indépendants qui commercialisent des biens à forte valeur et veulent réduire leur délai de vente.",
    },
    {
      q: "Quels sont vos délais de livraison ?",
      a: "Les photographies retouchées sont livrées sous 24 heures. Les films cinématographiques et visites Matterport sont livrés sous 3 à 7 jours selon le volume.",
    },
    {
      q: "Gérez-vous aussi les campagnes publicitaires ?",
      a: "Oui. Meta Ads, Google Ads et TikTok Ads sont pilotés en interne, connectés à vos landing pages et à HubSpot pour un suivi complet du coût par lead qualifié.",
    },
    {
      q: "Comment fonctionne l'automatisation HubSpot ?",
      a: "Nous structurons votre CRM, mettons en place le scoring, le routage des leads et les séquences email et WhatsApp afin qu'aucune opportunité ne reste sans réponse.",
    },
    {
      q: "Travaillez-vous au projet ou en accompagnement continu ?",
      a: "Les deux. Un lancement de programme peut être traité au projet, mais les meilleurs résultats viennent d'un accompagnement mensuel où contenu et acquisition se renforcent.",
    },
  ],
  en: [
    {
      q: "Is REV a real estate photography agency?",
      a: "No. Visual production is just one building block of our ecosystem. We build the complete chain: premium content, strategy, paid and organic acquisition, landing pages, CRM and automation.",
    },
    {
      q: "What kind of clients do you work with?",
      a: "Developers, real estate agencies, architects and independent agents who market high-value properties and want to shorten their time to sale.",
    },
    {
      q: "What are your turnaround times?",
      a: "Edited photographs are delivered within 24 hours. Cinematic films and Matterport tours are delivered within 3 to 7 days, depending on volume.",
    },
    {
      q: "Do you also run the ad campaigns?",
      a: "Yes. Meta Ads, Google Ads and TikTok Ads are managed in-house, connected to your landing pages and to HubSpot for full tracking of the cost per qualified lead.",
    },
    {
      q: "How does the HubSpot automation work?",
      a: "We structure your CRM and set up lead scoring, lead routing and email and WhatsApp sequences so that no opportunity is left unanswered.",
    },
    {
      q: "Do you work per project or on an ongoing basis?",
      a: "Both. A development launch can be handled as a project, but the best results come from a monthly partnership where content and acquisition reinforce each other.",
    },
  ],
};

/** AI agent page FAQ. */
export const AGENT_FAQ: Record<Locale, { q: string; a: string }[]> = {
  fr: [
    {
      q: "Pourquoi WhatsApp plutôt qu'un appel ou un e-mail ?",
      a: "Parce que c'est là que vos prospects répondent. Un numéro inconnu au téléphone reste souvent sans réponse et un e-mail peut attendre des jours ; un message WhatsApp est lu dans la foulée, et on y répond naturellement, comme à un proche.",
    },
    {
      q: "Le prospect sait-il qu'il échange avec une IA ?",
      a: "Oui. L'agent se présente comme l'assistant IA de votre agence, c'est la règle en Europe. Mais il écrit avec votre ton et votre vocabulaire, reformule, relance au bon moment et passe la main à un conseiller dès que la conversation le demande.",
    },
    {
      q: "Comment l'agent sait-il quelles questions poser ?",
      a: "On construit le scénario avec vous avant le lancement : vos critères (budget, financement, délai, secteur, type de bien), l'ordre des questions, les réponses types et les cas particuliers. Il est ensuite ajusté au fil des conversations réelles.",
    },
    {
      q: "Avec quels outils fonctionne-t-il ?",
      a: "Meta Ads, les formulaires de votre site, Gmail ou Outlook, Google Agenda, Google Sheets et HubSpot. Vous utilisez un autre outil ? On regarde ensemble pendant l'appel.",
    },
    {
      q: "Combien de temps faut-il pour le mettre en place ?",
      a: "Quelques semaines en général : le temps de définir vos critères, de connecter vos outils et de tester l'agent sur de vrais scénarios avant le lancement. On fixe le planning ensemble dès le premier appel.",
    },
  ],
  en: [
    {
      q: "Why WhatsApp rather than a call or an email?",
      a: "Because that's where your prospects reply. A call from an unknown number often goes unanswered and an email can sit for days; a WhatsApp message gets read straight away, and people reply naturally, as they would to a friend.",
    },
    {
      q: "Does the prospect know they're talking to an AI?",
      a: "Yes. The agent introduces itself as your agency's AI assistant — that's the rule in Europe. But it writes in your tone and vocabulary, rephrases, follows up at the right moment and hands over to an adviser as soon as the conversation calls for it.",
    },
    {
      q: "How does the agent know which questions to ask?",
      a: "We build the script with you before launch: your criteria (budget, financing, timeline, area, property type), the order of the questions, standard answers and special cases. It is then fine-tuned as real conversations come in.",
    },
    {
      q: "Which tools does it work with?",
      a: "Meta Ads, your website forms, Gmail or Outlook, Google Calendar, Google Sheets and HubSpot. Using another tool? We'll look at it together on the call.",
    },
    {
      q: "How long does it take to set up?",
      a: "Usually a few weeks: enough time to define your criteria, connect your tools and test the agent on real scenarios before launch. We set the schedule together on the first call.",
    },
  ],
};
