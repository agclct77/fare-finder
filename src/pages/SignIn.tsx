import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentHead } from "@/lib/document-head";

export default function SignIn() {
  useDocumentHead({
    title: "Sign in — Flight Price Notifier",
    description: "Sign in to Flight Price Notifier to track flight price drops.",
  });

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/app");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="fade-up w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sign in / 登入</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to track your flight price alerts.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in / 登入"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up / 註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
