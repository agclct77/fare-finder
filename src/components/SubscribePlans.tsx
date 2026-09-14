import { useState, useEffect, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env["VITE_FLIGHT_API_URL"];

type SubscriptionStatus = "pending_payment" | "active" | "cancelled" | "expired";

type Subscription = {
  email: string;
  route: string;
  plan_name: string;
  origin: string;
  destination: string;
  target_price: number;
  currency: string;
  subscription_status?: SubscriptionStatus;
  current_period_end_date?: string;
};

type Plan = {
  plan_name: "tokyo" | "seoul" | "london" | "osaka";
  label: string;
  route: string;
  hintPrice: number;
};

const PLANS: Plan[] = [
  { plan_name: "tokyo", label: "台北 ✈ 東京", route: "TPE-TYO", hintPrice: 7456 },
  { plan_name: "seoul", label: "台北 ✈ 首爾", route: "TPE-SEL", hintPrice: 5989 },
  { plan_name: "london", label: "台北 ✈ 倫敦", route: "TPE-LON", hintPrice: 20524 },
  { plan_name: "osaka", label: "台北 ✈ 大阪", route: "TPE-OSA", hintPrice: 6746 },
];

async function fetchSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_URL}/subscriptions?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to load subscriptions");
  const data = await res.json();
  return data.subscriptions ?? [];
}

// /subscribe returns either an ECPay auto-submit checkout form (text/html — a
// new or lapsed subscriber must pay) or a plain JSON ack (an in-place update
// for an already-paid subscriber changing their target price — no re-payment).
async function postSubscribe(body: { email: string; plan_name: string; target_price: number }) {
  const res = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Subscribe failed");
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    return { type: "checkout" as const, html: await res.text() };
  }
  return { type: "updated" as const, data: await res.json() };
}

async function postCancel(body: { email: string; route: string }) {
  const res = await fetch(`${API_URL}/cancel`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Cancel failed");
  return res.json();
}

function PlanCard({ plan, subscription, email }: { plan: Plan; subscription?: Subscription; email: string }) {
  const queryClient = useQueryClient();
  const [targetPrice, setTargetPrice] = useState(
    subscription ? String(subscription.target_price) : String(plan.hintPrice),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscription) setTargetPrice(String(subscription.target_price));
  }, [subscription]);

  const status = subscription?.subscription_status;

  const subscribeMutation = useMutation({
    mutationFn: postSubscribe,
    onSuccess: (result) => {
      setError(null);
      if (result.type === "checkout") {
        // Hand the browser to ECPay's cashier via the returned auto-submit form.
        document.open();
        document.write(result.html);
        document.close();
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
    },
    onError: () => setError("訂閱失敗，請稍後再試"),
  });

  const cancelMutation = useMutation({
    mutationFn: postCancel,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
    },
    onError: () => setError("取消失敗，請稍後再試"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const price = Number(targetPrice);
    if (!price || price <= 0) {
      setError("請輸入有效的目標價");
      return;
    }
    subscribeMutation.mutate({ email, plan_name: plan.plan_name, target_price: price });
  }

  function handleCancel() {
    cancelMutation.mutate({ email, route: plan.route });
  }

  const badge = (() => {
    switch (status) {
      case "active":
        return { text: "已訂閱", className: "bg-primary/15 text-primary" };
      case "pending_payment":
        return { text: "未完成付款", className: "bg-destructive/15 text-destructive" };
      case "cancelled":
        return { text: `已取消 · 有效至 ${subscription?.current_period_end_date ?? ""}`, className: "bg-secondary text-secondary-foreground" };
      case "expired":
        return { text: "已結束", className: "bg-muted text-muted-foreground" };
      default:
        return null;
    }
  })();

  const submitLabel = (() => {
    if (subscribeMutation.isPending) return "處理中…";
    if (status === "active" || status === "cancelled") return "更新目標價";
    if (status === "pending_payment") return "完成付款 / Pay";
    if (status === "expired") return "重新訂閱";
    return "開始追蹤";
  })();

  return (
    <div className="fade-up rounded-2xl border border-border bg-card p-6 text-left">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{plan.label}</h3>
        {badge && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>{badge.text}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">目前最低約 NT${plan.hintPrice.toLocaleString()}</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">目標價（TWD）</label>
          <input
            type="number"
            min={1}
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={subscribeMutation.isPending}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {status === "active" && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70 disabled:opacity-50"
          >
            {cancelMutation.isPending ? "取消中…" : "取消訂閱"}
          </button>
        )}
      </form>
    </div>
  );
}

export function SubscribePlans({ email }: { email: string }) {
  const { data: subscriptions } = useQuery({
    queryKey: ["subscriptions", email],
    queryFn: () => fetchSubscriptions(email),
    enabled: Boolean(email),
  });

  const byRoute = new Map((subscriptions ?? []).map((s) => [s.route, s]));

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan) => (
        <PlanCard key={plan.plan_name} plan={plan} subscription={byRoute.get(plan.route)} email={email} />
      ))}
    </div>
  );
}
