import { useEffect } from "react";

type HeadMeta = {
  title: string;
  description?: string;
  robots?: string;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Lightweight per-page <head> updates (title + description + og tags + robots).
// Replaces the TanStack Start route-level `head()` config now that routing is
// plain client-side React Router with a static index.html.
export function useDocumentHead({ title, description, robots }: HeadMeta) {
  useEffect(() => {
    document.title = title;
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:title", title);
      upsertMeta("property", "og:description", description);
    }
    if (robots) {
      upsertMeta("name", "robots", robots);
    }
  }, [title, description, robots]);
}
