import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState =
  { status: "loading" } | { status: "authenticated"; user: User } | { status: "unauthenticated" };

// Client-side equivalent of the old `_authenticated` route's `beforeLoad`:
// check the current Supabase session before rendering, redirect to /signin
// when there isn't one.
export function RequireAuth({ children }: { children: (user: User) => ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setState(
        error || !data.user
          ? { status: "unauthenticated" }
          : { status: "authenticated", user: data.user },
      );
    });
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") return null;
  if (state.status === "unauthenticated") return <Navigate to="/signin" replace />;
  return <>{children(state.user)}</>;
}
