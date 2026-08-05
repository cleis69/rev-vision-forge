import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

export const FAQ_ITEMS = [
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
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="border-t border-border/70">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading eyebrow="FAQ" title="Questions fréquentes." />

          <Reveal>
            <ul className="border-t border-border">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = open === i;
                return (
                  <li key={item.q} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-6 text-left transition-colors duration-300 hover:text-primary"
                    >
                      <span className="font-display text-base font-medium tracking-tight md:text-lg">
                        {item.q}
                      </span>
                      <Plus
                        size={18}
                        className={cn(
                          "shrink-0 text-muted-foreground transition-transform duration-500",
                          isOpen && "rotate-45 text-primary",
                        )}
                      />
                    </button>
                    <div
                      className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pb-7 text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
