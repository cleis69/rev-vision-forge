/* For the route guards of the promoter space, which run before the page loads
   and stay in the main bundle: the Supabase client (heavy) is fetched only
   when a guard runs, so the showcase site and the public pages never pay for
   it on their own. */

/** Current session (runs in the browser only). */
export async function currentSession() {
  const { getSupabase } = await import("./client");
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

/** Only internal /app paths are accepted as a destination after signing in. */
export function safeRedirect(value: unknown): string | undefined {
  return typeof value === "string" && /^\/app(\/|$|\?)/.test(value) && !value.startsWith("//")
    ? value
    : undefined;
}
