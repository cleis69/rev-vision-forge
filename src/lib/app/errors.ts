/** Errors raised by the promoter space, in French. */
export class AppError extends Error {}

export const NO_RIGHTS = "Vous n'avez pas les droits pour cette action.";

type DbError = { code?: string; message?: string } | null | undefined;

/** The address (slug) is already used by another row. */
export const isTaken = (error: unknown) => (error as DbError)?.code === "23505";

/** Message for a Supabase (PostgREST) error; `taken` is shown when an address is already used. */
export function dbErrorMessage(
  error: unknown,
  taken = "Cette adresse est déjà utilisée. Choisissez-en une autre.",
): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof TypeError) return "Connexion impossible. Vérifiez votre connexion internet.";
  const { code } = (error ?? {}) as NonNullable<DbError>;
  switch (code) {
    case "23505":
      return taken;
    case "23514":
    case "22001":
      return "Une valeur saisie n'est pas valide.";
    case "42501":
      return NO_RIGHTS;
    case "PGRST116":
      return "Cet élément n'existe plus, ou vous n'avez pas les droits pour le modifier.";
    default:
      return "Une erreur est survenue. Réessayez dans un instant.";
  }
}
