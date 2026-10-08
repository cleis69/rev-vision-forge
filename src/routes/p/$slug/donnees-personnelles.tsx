import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACT_EMAIL } from "@/lib/contact";
import { usePublicProgramme } from "@/lib/public/programme";

// Personal data notice of a programme, over its page (/p/$slug/donnees-personnelles).
// Template text, to be checked by the promoter's legal adviser.
export const Route = createFileRoute("/p/$slug/donnees-personnelles")({
  component: PrivacyNotice,
});

function PrivacyNotice() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data } = usePublicProgramme(slug);
  if (!data) return null;
  const owner = data.programme.organization.name || "le promoteur du programme";
  const name = data.programme.name;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open)
          void navigate({
            to: "/p/$slug",
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
            Données personnelles
          </DialogTitle>
          <DialogDescription className="text-white/55">
            Demandes de visite du programme {name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm leading-relaxed text-white/75 [&_h3]:mb-1.5 [&_h3]:font-medium [&_h3]:text-white">
          <section>
            <h3>Qui reçoit vos données</h3>
            <p>
              Le responsable du traitement est {owner}, qui commercialise ce programme. La
              plateforme REV (Real Estate Vision) héberge cette page et le formulaire pour son
              compte, en tant que sous-traitant technique.
            </p>
          </section>
          <section>
            <h3>Ce qui est collecté, et pourquoi</h3>
            <p>
              Votre nom, votre téléphone, et si vous les indiquez votre e-mail et votre message,
              avec le lot concerné et la date de la demande. Ils servent uniquement à vous
              recontacter au sujet de votre visite et de ce programme, à votre demande. Ils ne sont
              ni vendus ni utilisés pour d'autres programmes sans votre accord.
            </p>
            <p className="mt-2">
              La page mesure aussi sa fréquentation de façon anonyme (pages et lots consultés), sans
              cookie et sans publicité.
            </p>
          </section>
          <section>
            <h3>Où, et combien de temps</h3>
            <p>
              Les données sont hébergées dans l'Union européenne (Supabase, région Paris). Elles
              sont conservées trois ans au plus après votre dernier échange avec l'équipe
              commerciale, puis supprimées.
            </p>
          </section>
          <section>
            <h3>Vos droits</h3>
            <p>
              Vous pouvez demander à consulter, corriger ou effacer vos données, ou vous opposer à
              leur utilisation, en contactant {owner}, ou REV à{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-white underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              , qui transmettra. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
