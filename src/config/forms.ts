/**
 * ULTRA VISION — envoi du formulaire de contact.
 *
 * ============================================================
 *  NOUVEAU FICHIER : src/config/forms.ts
 *
 *  UNE SEULE LIGNE A REMPLIR : `accessKey`, ci-dessous.
 * ============================================================
 *
 * LE PROBLEME QUE CE FICHIER RESOUT
 *
 * Jusqu'ici, le formulaire de contact affichait « merci, nous
 * revenons vers vous sous 24 heures » et n'envoyait strictement rien.
 * C'est le pire scenario commercial possible : le prospect est perdu,
 * ET il croit vous avoir contacte. Il n'insistera pas.
 *
 * POURQUOI UN SERVICE EXTERNE PLUTOT QU'UN SERVEUR
 *
 * Envoyer un e-mail demande un serveur, une adresse d'expedition
 * authentifiee et une reputation d'envoi. Sans cela, les messages
 * partent en indesirables — ce qui revient au meme que de ne rien
 * envoyer, en pire, puisqu'on croit que ca marche.
 *
 * Un service de formulaire fait ce travail pour vous : vous envoyez
 * les champs, il vous envoie un e-mail depuis une infrastructure qui
 * a la reputation necessaire. C'est une ligne de code et zero serveur
 * a maintenir.
 *
 * ------------------------------------------------------------
 *  CE QUE TU DOIS FAIRE, UNE FOIS, EN DEUX MINUTES
 *
 *  1. Va sur https://web3forms.com
 *  2. Saisis ton adresse : contact@ultravisionagency.com
 *  3. Tu recois une cle d'acces par e-mail
 *  4. Colle-la ci-dessous a la place de la valeur vide
 *
 *  Aucun compte a creer, aucune carte bancaire. Le service est
 *  gratuit jusqu'a 250 messages par mois, ce qui est trois fois ce
 *  dont tu auras besoin la premiere annee.
 *
 *  TANT QUE LA CLE EST VIDE, le formulaire n'affiche plus de faux
 *  message de confirmation : il propose WhatsApp et l'e-mail, qui
 *  fonctionnent vraiment. Mieux vaut un formulaire honnetement
 *  desactive qu'un formulaire qui ment.
 * ------------------------------------------------------------
 *
 * LA CLE PEUT-ELLE ETRE PUBLIQUE ?
 *
 * Oui. Elle n'autorise qu'une chose : envoyer un message vers TON
 * adresse. Elle ne donne acces a rien, ne lit rien, et ne peut pas
 * servir a envoyer ailleurs. C'est pour cela qu'elle vit dans le code
 * du site et non dans un fichier secret.
 *
 * Le seul risque est l'envoi automatise de messages indesirables. Il
 * est traite plus bas par le champ « piege ».
 */

export const FORM = {
  /**
   * Colle ici la cle recue par e-mail. Exemple de format :
   * "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   */
  accessKey: "",

  /** Adresse d'envoi du service. A ne pas modifier. */
  endpoint: "https://api.web3forms.com/submit",

  /** Objet de l'e-mail que tu recevras. */
  subject: "Nouvelle demande depuis le site ULTRA VISION",

  /**
   * Nom du champ piege.
   *
   * C'est un champ invisible pour un humain et visible pour un
   * automate. Un humain ne le remplit jamais ; un robot remplit tout
   * ce qu'il trouve. Si ce champ arrive rempli, le message est jete.
   *
   * C'est plus efficace qu'un captcha, et surtout ca n'impose rien au
   * visiteur — un captcha sur un formulaire de devis fait perdre des
   * contacts reels.
   */
  honeypot: "botcheck",
} as const;

/** Vrai quand la cle est renseignee. Pilote l'affichage du formulaire. */
export const formReady = FORM.accessKey.trim().length > 0;

export type SendResult = { ok: boolean; message: string };

/**
 * Envoie le formulaire.
 *
 * Ne leve jamais d'exception : renvoie toujours un resultat lisible,
 * parce qu'une erreur reseau ne doit pas laisser le visiteur devant
 * une page figee sans explication.
 */
export async function sendForm(data: Record<string, string>): Promise<SendResult> {
  if (!formReady) {
    return {
      ok: false,
      message:
        "Le formulaire n'est pas encore relié. Écrivez-nous sur WhatsApp ou par e-mail, nous répondons dans la journée.",
    };
  }

  // Champ piege rempli : c'est un automate. On fait semblant d'accepter.
  if (data[FORM.honeypot]) {
    return { ok: true, message: "Merci, votre demande est bien enregistrée." };
  }

  try {
    const res = await fetch(FORM.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: FORM.accessKey,
        subject: FORM.subject,
        from_name: "Site ULTRA VISION",
        ...data,
      }),
    });

    const json = await res.json().catch(() => ({}) as { success?: boolean });

    if (res.ok && json?.success !== false) {
      return {
        ok: true,
        message:
          "Merci, votre demande est bien arrivée. Nous revenons vers vous sous 24 heures ouvrées.",
      };
    }

    return {
      ok: false,
      message:
        "L'envoi a échoué. Écrivez-nous sur WhatsApp ou par e-mail, nous répondons dans la journée.",
    };
  } catch {
    /*
      Panne reseau, coupure, blocage par une extension du navigateur.
      On ne perd pas le contact pour autant : on renvoie le visiteur
      vers un canal qui, lui, ne depend pas de notre code.
    */
    return {
      ok: false,
      message:
        "La connexion a échoué. Écrivez-nous sur WhatsApp ou par e-mail, nous répondons dans la journée.",
    };
  }
}
