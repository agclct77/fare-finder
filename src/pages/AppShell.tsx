import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentHead } from "@/lib/document-head";

export default function AppShell({ user }: { user: User }) {
  useDocumentHead({
    title: "Dashboard — Flight Price Notifier",
    robots: "noindex",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-display text-lg font-semibold tracking-tight">Flight Price Notifier</span>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            Sign out / 登出
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <h1 className="fade-up font-display text-3xl font-bold tracking-tight sm:text-4xl">Hi {user.email}</h1>
        <p
          className="fade-up mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
          style={{ "--fade-delay": "120ms" } as React.CSSProperties}
        >
          你的航線追蹤儀表板即將上線 — 下一個里程碑會加上訂閱航線的功能。
        </p>
        <p
          className="fade-up mt-3 max-w-lg text-sm text-muted-foreground/70"
          style={{ "--fade-delay": "200ms" } as React.CSSProperties}
        >
          Your dashboard is coming soon. Route-subscription will be added in the next milestone.
        </p>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        © 2026 Flight Price Notifier
      </footer>
    </div>
  );
}
