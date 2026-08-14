import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { CONTACT, hasPhone, hasWhatsapp, phoneDisplay, telUrl, whatsappUrl } from "@/config/contact";

/**
 * ULTRA VISION — pied de page.
 *
 * ============================================================
 *  CE FICHIER REMPLACE src/components/SiteFooter.tsx
 * ============================================================
 *
 * CE QUI CHANGE
 *
 * 1. studio@ultravision.fr, qui n'existe pas, devient
 *    contact@ultravisionagency.com.
 * 2. Le faux numero +33 6 00 00 00 00 et le faux lien WhatsApp
 *    disparaissent tant qu'un vrai numero n'est pas renseigne dans
 *    src/config/contact.ts.
 * 3. Les villes affichees viennent aussi de ce fichier de
 *    configuration. « Paris — Dubaï — Casablanca » etait ecrit en
 *    dur : annoncer trois implantations quand on n'en a qu'une se
 *    verifie en trois clics et coute cher en credibilite.
 *
 * Le reste du pied de page est inchange.
 */

export function SiteFooter() {
  return (
    <footer className="rule bg-background">
      <div className="shell py-20">
        <div className="grid gap-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="min-w-0">
            <Logo className="h-8" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Agence créative, technologique et média. Nous construisons des marques et des systèmes
              d&apos;acquisition pour les entreprises ambitieuses.
            </p>
            {hasWhatsapp ? (
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-6 inline-block text-sm font-medium"
              >
                Écrire sur WhatsApp
              </a>
            ) : (
              <a
                href={`mailto:${CONTACT.email}`}
                className="link-underline mt-6 inline-block text-sm font-medium"
              >
                Nous écrire
              </a>
            )}
          </div>

          <FooterCol
            title="Agence"
            links={[
              { to: "/services", label: "Services" },
              { to: "/realisations", label: "Réalisations" },
              { to: "/tarifs", label: "Tarifs" },
              { to: "/methode", label: "Notre méthode" },
              { to: "/a-propos", label: "À propos" },
              { to: "/blog", label: "Blog" },
            ]}
          />

          <div>
            <p className="eyebrow">Expertises</p>
            {/*
              Aligne sur les quatre poles de la page d'accueil, ou
              Branding et Creation de contenu sont desormais reunis sous
              « Marque & Contenu ». Un pied de page qui annonce un
              decoupage different de celui de la page donne le sentiment
              de deux sites cousus ensemble.
            */}
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>Marque &amp; identité</li>
              <li>Photo, vidéo &amp; motion</li>
              <li>Sites &amp; applications</li>
              <li>IA &amp; automatisation</li>
              <li>Meta, Google &amp; TikTok Ads</li>
              <li>CRM &amp; lead generation</li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">Contact</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="link-underline">
                  {CONTACT.email}
                </a>
              </li>
              {hasPhone && (
                <li>
                  <a href={telUrl} className="link-underline">
                    {phoneDisplay()}
                  </a>
                </li>
              )}
              <li>{CONTACT.locations}</li>
              <li>
                <Link to="/contact" className="link-underline text-foreground">
                  Demander un devis
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="rule mt-16 flex flex-col gap-4 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ULTRA VISION. Tous droits réservés.</p>
          <p className="tracking-[0.18em] uppercase">Creative growth agency</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="link-underline transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
