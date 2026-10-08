interface ImportMetaEnv {
  /** Where ad media are served from; unset means the production domain. */
  readonly VITE_MEDIA_BASE?: string;
  /** Supabase project of the plan de vente (SaaS). */
  readonly VITE_SUPABASE_URL?: string;
  /** Public (publishable) key of that project; access is controlled by RLS. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
