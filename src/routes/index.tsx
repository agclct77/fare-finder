import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, BellRing, CalendarX2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight Price Notifier — 機票降價通知" },
      {
        name: "description",
        content:
          "設定航線與目標價，機票降價就通知你。Set a route and a target price — we email you when the fare drops.",
      },
      { property: "og:title", content: "Flight Price Notifier — 機票降價通知" },
      {
        property: "og:description",
        content:
          "設定航線與目標價，機票降價就通知你。Set a route and a target price — we email you when the fare drops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: Plane,
    title: "盯緊熱門航線",
    subtitle: "Always-on route watching",
    body: "持續監控台北出發的熱門航線（東京、首爾），自動抓最低票價。",
  },
  {
    icon: BellRing,
    title: "達標自動通知",
    subtitle: "Target-price email alerts",
    body: "低於你設定的目標價，就寄 email 提醒你，附上立即訂購連結。",
  },
  {
    icon: CalendarX2,
    title: "隨時取消",
    subtitle: "Cancel anytime",
    body: "月訂閱制，不想用隨時停，沒有綁約。",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">
            Flight Price Notifier
          </span>
          <Link
            to="/signin"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Sign in / 登入
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="glow-primary relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-24 pt-24 text-center sm:pt-32">
          <p
            className="fade-up mb-4 inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm text-primary"
            style={{ "--fade-delay": "0ms" } as React.CSSProperties}
          >
            機票降價通知
          </p>
          <h1
            className="fade-up text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
            style={{ "--fade-delay": "100ms" } as React.CSSProperties}
          >
            Flight Price Notifier
          </h1>
          <p
            className="fade-up mt-6 text-xl text-muted-foreground sm:text-2xl"
            style={{ "--fade-delay": "200ms" } as React.CSSProperties}
          >
            設定航線與目標價，機票降價就通知你
          </p>
          <p
            className="fade-up mt-3 max-w-xl text-base text-muted-foreground/80"
            style={{ "--fade-delay": "300ms" } as React.CSSProperties}
          >
            Set a route and a target price — we email you when the fare drops.
          </p>
          <Link
            to="/signin"
            className="fade-up mt-10 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/85 hover:shadow-primary/40"
            style={{ "--fade-delay": "400ms" } as React.CSSProperties}
          >
            Sign in / 登入
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="fade-up rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40"
              style={{ "--fade-delay": `${i * 120}ms` } as React.CSSProperties}
            >
              <div className="mb-5 inline-flex rounded-xl bg-primary/15 p-3 text-primary">
                <f.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm font-medium text-primary">
                {f.subtitle}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © 2026 Flight Price Notifier
      </footer>
    </div>
  );
}
