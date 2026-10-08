import { useState, type FormEvent } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { AuthCard, FormMessage } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase/client";
import { authErrorMessage, currentSession, safeRedirect } from "@/lib/supabase/auth";

export const Route = createFileRoute("/app/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: safeRedirect(search["redirect"]),
  }),
  beforeLoad: async ({ search }) => {
    if (await currentSession()) throw redirect({ href: search.redirect ?? "/app" });
  },
  head: () => ({ meta: [{ title: "Connexion — Espace promoteur REV" }] }),
  component: LoginPage,
});

type Notice = { tone: "error" | "info"; text: string } | null;

function LoginPage() {
  const { redirect: next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"password" | "link" | "reset" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  // Links in e-mails come back to /app/confirmer, which opens the session.
  const confirmUrl = () => `${window.location.origin}/app/confirmer`;

  const signIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending("password");
    setNotice(null);
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    setPending(null);
    if (error) {
      setNotice({ tone: "error", text: authErrorMessage(error) });
      return;
    }
    await navigate({ href: next ?? "/app" });
  };

  const needEmail = () => {
    if (email.trim()) return false;
    setNotice({ tone: "error", text: "Saisissez d'abord votre adresse e-mail." });
    return true;
  };

  // Same answer whether or not the address has an account (no account probing).
  const sendLink = async () => {
    if (needEmail()) return;
    setPending("link");
    setNotice(null);
    const { error } = await getSupabase().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: confirmUrl() },
    });
    setPending(null);
    const limited = error && "code" in error && String(error.code).startsWith("over_");
    setNotice(
      limited
        ? { tone: "error", text: authErrorMessage(error) }
        : { tone: "info", text: `Si un compte existe pour ${email.trim()}, un lien de connexion vient d'être envoyé.` },
    );
  };

  const resetPassword = async () => {
    if (needEmail()) return;
    setPending("reset");
    setNotice(null);
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: confirmUrl() });
    setPending(null);
    const limited = error && "code" in error && String(error.code).startsWith("over_");
    setNotice(
      limited
        ? { tone: "error", text: authErrorMessage(error) }
        : {
            tone: "info",
            text: `Si un compte existe pour ${email.trim()}, un lien pour choisir un nouveau mot de passe vient d'être envoyé.`,
          },
    );
  };

  return (
    <AuthCard title="Connexion" description="Gérez vos programmes, vos lots et vos demandes de visite.">
      <form className="space-y-4" onSubmit={signIn} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <button
              type="button"
              onClick={resetPassword}
              disabled={pending !== null}
              className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
          />
        </div>

        {notice ? <FormMessage tone={notice.tone}>{notice.text}</FormMessage> : null}

        <Button type="submit" className="h-11 w-full" disabled={pending !== null || !email || !password}>
          {pending === "password" ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" className="h-11 w-full" onClick={sendLink} disabled={pending !== null}>
        {pending === "link" ? "Envoi…" : "Recevoir un lien de connexion"}
      </Button>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        Pas encore de compte ? Les accès sont créés par REV.
      </p>
    </AuthCard>
  );
}
