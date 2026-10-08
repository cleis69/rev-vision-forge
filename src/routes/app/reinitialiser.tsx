import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthCard, FormMessage } from "@/components/app/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase/client";
import { authErrorMessage, useAuth } from "@/lib/supabase/auth";

const MIN_LENGTH = 8;

// Choose a new password: reached from a reset link or an invitation
// (/app/confirmer opens the session first).
export const Route = createFileRoute("/app/reinitialiser")({
  head: () => ({ meta: [{ title: "Nouveau mot de passe — Espace promoteur REV" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < MIN_LENGTH) return setError(`Le mot de passe doit faire au moins ${MIN_LENGTH} caractères.`);
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setPending(true);
    setError(null);
    const { error } = await getSupabase().auth.updateUser({ password });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    toast.success("Mot de passe enregistré.");
    return navigate({ to: "/app", replace: true });
  };

  if (!ready) {
    return (
      <AuthCard title="Nouveau mot de passe">
        <p className="text-sm text-muted-foreground" role="status">Chargement…</p>
      </AuthCard>
    );
  }

  if (!session) {
    return (
      <AuthCard title="Lien expiré" description="Ce lien n'est plus valable. Demandez-en un nouveau depuis la page de connexion.">
        <Button asChild className="h-11 w-full">
          <Link to="/app/login">Retour à la connexion</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nouveau mot de passe" description={`Compte : ${session.user.email ?? ""}`}>
      <form className="space-y-4" onSubmit={save} noValidate>
        <div className="space-y-2">
          <Label htmlFor="new-password">Nouveau mot de passe</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-hint"
            className="h-11"
          />
          <p id="password-hint" className="text-xs text-muted-foreground">
            {MIN_LENGTH} caractères au minimum.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11"
          />
        </div>
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        <Button type="submit" className="h-11 w-full" disabled={pending || !password || !confirm}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </AuthCard>
  );
}
