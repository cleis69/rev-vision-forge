import { useEffect, useState } from "react";
import { hasWhatsapp, whatsappUrl } from "@/config/contact";
import { EASE_PAGE } from "@/config/motion";

/**
 * ULTRA VISION — appel WhatsApp permanent, sur le bord droit.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/components/WhatsAppRail.tsx
 *  A monter une seule fois, dans src/routes/__root.tsx.
 * ============================================================
 *
 * POURQUOI UN APPEL PERMANENT
 *
 * Les deux boutons WhatsApp du site sont en haut de page et tout en
 * bas. Entre les deux, il y a plusieurs milliers de pixels sans aucun
 * moyen de nous ecrire. Or l'envie de contacter ne nait pas au debut
 * de la lecture : elle nait au moment ou une realisation convainc,
 * c'est-a-dire au milieu. Un visiteur convaincu au milieu devait
 * jusqu'ici defiler jusqu'en bas — et beaucoup ne le font pas.
 *
 * POURQUOI SUR LE BORD DROIT ET NON EN BAS
 *
 * Le coin inferieur droit est l'emplacement des bulles de chat
 * automatiques. Les visiteurs les ignorent par reflexe, exactement
 * comme ils ignorent les bannieres publicitaires. Le bord droit, a
 * mi-hauteur, echappe a ce reflexe tout en restant a portee du pouce
 * comme du curseur.
 *
 * POURQUOI IL N'APPARAIT PAS TOUT DE SUITE
 *
 * Il attend que le visiteur ait defile la hauteur d'un ecran. Proposer
 * un contact avant d'avoir rien montre, c'est demander avant d'avoir
 * donne. Il s'efface aussi a l'approche du bas de page, ou le vrai
 * bloc d'appel a l'action prend le relais : deux invitations
 * simultanees s'annulent.
 *
 * LA COULEUR
 *
 * Le fond reste sombre, conforme a la charte. Le vert n'apparait que
 * dans le logo officiel, ou il est obligatoire pour que la
 * plateforme soit reconnue instantanement. Un bouton entierement vert
 * jurerait avec la palette et ressemblerait a un module ajoute par un
 * greffon.
 *
 * SUR TELEPHONE
 *
 * Le rail vertical devient un bouton rond en bas a droite, au-dessus
 * de la zone du pouce. Un texte vertical sur un ecran de 380 px prend
 * une place qu'il ne merite pas.
 */

const WHATSAPP_GREEN = "#25D366";

export function WhatsAppRail() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasWhatsapp) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;

      // Apparait apres un ecran de defilement.
      const started = y > window.innerHeight * 0.9;
      // Disparait dans les 900 derniers pixels : le bloc d'appel final
      // occupe deja cette zone.
      const nearEnd = max > 0 && max - y < 900;

      setVisible(started && !nearEnd);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Pas de numero renseigne : on n'affiche rien plutot qu'un lien mort.
  if (!hasWhatsapp) return null;

  return (
    <>
      <style>{`
        .uv-wa { transition: transform 420ms ${EASE_PAGE}, opacity 320ms ease-out, box-shadow 220ms ${EASE_PAGE}; }
        .uv-wa:hover { box-shadow: 0 0 0 1px rgba(96,165,250,.5), 0 22px 48px -14px rgba(0,0,0,.9), 0 0 60px -14px rgba(59,130,246,.55) !important; }
        @media (prefers-reduced-motion: reduce) { .uv-wa { transition: opacity 200ms linear; } }
      `}</style>

      {/* ---------- Grand ecran : rail vertical ---------- */}
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous écrire sur WhatsApp"
        className="uv-wa fixed top-1/2 right-0 z-[70] hidden -translate-y-1/2 items-center gap-3 rounded-l-2xl border border-r-0 px-3 py-6 outline-none focus-visible:ring-2 focus-visible:ring-accent lg:flex"
        style={{
          flexDirection: "column",
          backgroundColor: "rgba(13,13,16,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderColor: "#262a35",
          boxShadow: "0 0 0 1px rgba(255,255,255,.04), 0 18px 40px -14px rgba(0,0,0,.85)",
          // Range hors de l'ecran tant qu'il n'a pas lieu d'etre.
          transform: visible
            ? "translate(0, -50%)"
            : "translate(calc(100% + 8px), -50%)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <img
          src="/brand/platforms/whatsapp.svg"
          alt=""
          aria-hidden="true"
          width={22}
          height={22}
          style={{ height: 22, width: "auto" }}
          draggable={false}
        />

        {/*
          Le texte tourne d'un quart de tour, lu de bas en haut.
          `mixed` ferait pivoter chaque lettre individuellement et
          rendrait le mot illisible.
        */}
        <span
          className="text-[0.68rem] font-medium tracking-[0.16em] uppercase text-[#C8C8C6]"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Parler sur WhatsApp
        </span>

        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: WHATSAPP_GREEN, boxShadow: `0 0 10px ${WHATSAPP_GREEN}` }}
        />
      </a>

      {/* ---------- Telephone : bouton rond ---------- */}
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous écrire sur WhatsApp"
        className="uv-wa fixed right-4 bottom-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        style={{
          backgroundColor: "rgba(13,13,16,0.94)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderColor: "#262a35",
          boxShadow: "0 10px 30px -8px rgba(0,0,0,.9)",
          transform: visible ? "scale(1)" : "scale(.6)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <img
          src="/brand/platforms/whatsapp.svg"
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          style={{ height: 24, width: "auto" }}
          draggable={false}
        />
      </a>
    </>
  );
}
