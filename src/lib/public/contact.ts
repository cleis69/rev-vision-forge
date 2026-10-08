/* Links to the sales team's phone: a call, or a WhatsApp conversation with a
   first message already written. */

const digits = (phone: string) => phone.replace(/[^\d+]/g, "");

export const telHref = (phone: string) => `tel:${digits(phone)}`;

/** wa.me wants the number without "+", spaces or leading zeros. */
export const whatsappHref = (phone: string, text: string) =>
  `https://wa.me/${digits(phone).replace(/^\+/, "").replace(/^00/, "")}?text=${encodeURIComponent(text)}`;

/** "+212 661 825 359" as typed by the promoter, tidied. */
export const phoneLabel = (phone: string) => phone.trim().replace(/\s+/g, " ");
