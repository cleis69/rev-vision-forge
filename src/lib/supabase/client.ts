import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Browser client of the plan de vente (SaaS). It only knows the public
 * (publishable) key: every access rule is enforced by RLS in the database.
 * The service role key never reaches the browser.
 * Created on first use, so the showcase site builds without these variables.
 */
let client: SupabaseClient<Database> | undefined;

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis (voir .env.example).");
    }
    client = createClient<Database>(url, key);
  }
  return client;
}

export type { Database, Enums, Tables, TablesInsert, TablesUpdate } from "./database.types";
