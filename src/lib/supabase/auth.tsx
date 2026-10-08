import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthError, Session } from "@supabase/supabase-js";

import { getSupabase } from "./client";

/* Session of the promoter space (/app). The browser keeps it (localStorage);
   access to data is decided by RLS in the database, not here. */

type AuthState = { session: Session | null; ready: boolean };

const AuthContext = createContext<AuthState>({ session: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, ready: false });

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, ready: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, ready: true });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/** Supabase Auth errors, in French. */
export function authErrorMessage(error: AuthError | Error | null | undefined): string {
  if (!error) return "";
  const code = "code" in error ? error.code : undefined;
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Cette adresse n'est pas encore confirmée. Ouvrez le lien reçu par e-mail.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de tentatives. Réessayez dans quelques minutes.";
    case "otp_expired":
      return "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.";
    case "weak_password":
      return "Mot de passe trop faible : 8 caractères au minimum.";
    case "same_password":
      return "Choisissez un mot de passe différent de l'ancien.";
    case "user_banned":
      return "Ce compte est désactivé. Contactez REV.";
    default:
      return "Une erreur est survenue. Réessayez dans un instant.";
  }
}
