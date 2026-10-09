import { useNavigate } from "@tanstack/react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACT_EMAIL } from "@/lib/contact";
import { useCopy } from "@/lib/i18n";
import { usePublicRoutes } from "@/lib/public/i18n";
import { usePublicProgramme } from "@/lib/public/programme";

const COPY = {
  fr: {
    defaultOwner: "le promoteur du programme",
    title: "Données personnelles",
    description: (name: string) => `Demandes de visite du programme ${name}`,
    whoTitle: "Qui reçoit vos données",
    who: (owner: string) =>
      `Le responsable du traitement est ${owner}, qui commercialise ce programme. La plateforme REV (Real Estate Vision) héberge cette page et le formulaire pour son compte, en tant que sous-traitant technique.`,
    whatTitle: "Ce qui est collecté, et pourquoi",
    what: "Votre nom, votre téléphone, et si vous les indiquez votre e-mail et votre message, avec le lot concerné et la date de la demande. Ils servent uniquement à vous recontacter au sujet de votre visite et de ce programme, à votre demande. Ils ne sont ni vendus ni utilisés pour d'autres programmes sans votre accord.",
    audience:
      "La page mesure aussi sa fréquentation de façon anonyme (pages et lots consultés), sans cookie et sans publicité.",
    whereTitle: "Où, et combien de temps",
    where:
      "Les données sont hébergées dans l'Union européenne (Supabase, région Paris). Elles sont conservées trois ans au plus après votre dernier échange avec l'équipe commerciale, puis supprimées.",
    measureTitle: "Mesure d'audience et carte",
    measure:
      "La page compte les visites et les lots consultés sans cookie, avec un identifiant tiré au hasard pour chaque onglet, que le navigateur oublie à sa fermeture. La carte de la rubrique Situation est fournie par OpenFreeMap (données OpenStreetMap), sans cookie : votre navigateur la télécharge directement depuis leurs serveurs.",
    rightsTitle: "Vos droits",
    // Before and after REV's address.
    rights: (owner: string) =>
      `Vous pouvez demander à consulter, corriger ou effacer vos données, ou vous opposer à leur utilisation, en contactant ${owner}, ou REV à`,
    rightsEnd: ", qui transmettra. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).",
  },
  en: {
    defaultOwner: "the developer of the programme",
    title: "Personal data",
    description: (name: string) => `Visit requests for the ${name} programme`,
    whoTitle: "Who receives your data",
    who: (owner: string) =>
      `The data controller is ${owner}, which markets this programme. The REV (Real Estate Vision) platform hosts this page and the form on its behalf, as a technical processor.`,
    whatTitle: "What is collected, and why",
    what: "Your name and phone number and, if you provide them, your email address and your message, together with the lot concerned and the date of the request. They are used solely to contact you about your visit and this programme, at your request. They are neither sold nor used for other programmes without your consent.",
    audience:
      "The page also measures its traffic anonymously (pages and lots viewed), without cookies and without advertising.",
    whereTitle: "Where, and for how long",
    where:
      "The data is hosted in the European Union (Supabase, Paris region). It is kept for no more than three years after your last exchange with the sales team, and then deleted.",
    measureTitle: "Audience measurement and map",
    measure:
      "The page counts visits and lots viewed without cookies, using an identifier drawn at random for each tab, which the browser forgets when the tab is closed. The map in the Location section is provided by OpenFreeMap (OpenStreetMap data), without cookies: your browser downloads it directly from their servers.",
    rightsTitle: "Your rights",
    rights: (owner: string) =>
      `You can exercise your rights of access, rectification and erasure of your data, or object to its use, by contacting ${owner}, or REV at`,
    rightsEnd:
      ", which will pass your request on. You can also lodge a complaint with the CNIL, the French data protection authority (cnil.fr).",
  },
};

// Personal data notice of a programme, over its page (/p/$slug/donnees-personnelles,
// /en/p/$slug/privacy). Template text, to be checked by the promoter's legal adviser.
export function PrivacyNotice({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const routes = usePublicRoutes();
  const copy = useCopy(COPY);
  const { data } = usePublicProgramme(slug);
  if (!data) return null;
  const owner = data.programme.organization.name || copy.defaultOwner;
  const name = data.programme.name;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open)
          void navigate({
            to: routes.programme,
            params: { slug },
            search: true,
            replace: true,
            resetScroll: false,
          });
      }}
    >
      <DialogContent className="max-h-[90svh] max-w-2xl overflow-y-auto border-white/10 bg-[#0d0d0d] p-6 text-white sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-brand text-2xl font-medium tracking-tight">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-white/55">{copy.description(name)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm leading-relaxed text-white/75 [&_h3]:mb-1.5 [&_h3]:font-medium [&_h3]:text-white">
          <section>
            <h3>{copy.whoTitle}</h3>
            <p>{copy.who(owner)}</p>
          </section>
          <section>
            <h3>{copy.whatTitle}</h3>
            <p>{copy.what}</p>
            <p className="mt-2">{copy.audience}</p>
          </section>
          <section>
            <h3>{copy.whereTitle}</h3>
            <p>{copy.where}</p>
          </section>
          <section>
            <h3>{copy.measureTitle}</h3>
            <p>{copy.measure}</p>
          </section>
          <section>
            <h3>{copy.rightsTitle}</h3>
            <p>
              {copy.rights(owner)}{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-white underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              {copy.rightsEnd}
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
