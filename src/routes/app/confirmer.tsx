import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import type { EmailOtpType } from "@supabase/supabase-js";

import { AuthCard, FormMessage } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import { getSupabase, urlLinkType } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth";

const TYPES: EmailOtpType[] = ["email", "magiclink", "recovery", "invite", "signup", "email_change"];

// Landing page of the links sent by e-mail (sign-in link, new password,
// invitation): it opens the session, then sends the user on.
export const Route = createFileRoute("/app/confirmer")({
  validateSearch: (search: Record<string, unknown>): { token_hash?: string | undefined; type?: EmailOtpType | undefined } => ({
    token_hash: typeof search["token_hash"] === "string" ? search["token_hash"] : undefined,
    type: TYPES.find((t) => t === search["type"]),
  }),
  head: () => ({ meta: [{ title: "Connexion — Espace promoteur REV" }] }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { token_hash, type } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const supabase = getSupabase();
    // A new password is needed after a reset link or an invitation.
    const choosePassword = (t: string | null | undefined) => t === "recovery" || t === "invite";

    const run = async () => {
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (error) return setError(authErrorMessage(error));
        return navigate({ to: choosePassword(type) ? "/app/reinitialiser" : "/app", replace: true });
      }
      // Default Supabase e-mails carry the session in the URL fragment instead.
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setError("Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.");
      return navigate({ to: choosePassword(urlLinkType()) ? "/app/reinitialiser" : "/app", replace: true });
    };
    void run();
  }, [token_hash, type, navigate]);

  return (
    <AuthCard title={error ? "Lien invalide" : "Connexion en cours…"}>
      {error ? (
        <div className="space-y-4">
          <FormMessage tone="error">{error}</FormMessage>
          <Button asChild className="h-11 w-full">
            <Link to="/app/login">Retour à la connexion</Link>
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          Vérification du lien…
        </p>
      )}
    </AuthCard>
  );
}
