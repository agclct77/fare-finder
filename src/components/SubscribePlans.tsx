import { useState, useEffect, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env["VITE_FLIGHT_API_URL"];

type Subscription = {
  email: string;
  route: string;
  plan_name: string;
  origin: string;
  destination: string;
  target_price: number;
  currency: string;
};

type Plan = {
  plan_name: "tokyo" | "seoul" | "london";
  label: string;
  route: string;
  hintPrice: number;
};

const PLANS: Plan[] = [
  { plan_name: "tokyo", label: "台北 ✈ 東京", route: "TPE-TYO", hintPrice: 9325 },
  { plan_name: "seoul", label: "台北 ✈ 首爾", route: "TPE-SEL", hintPrice: 5989 },
  { plan_name: "london", label: "台北 ✈ 倫敦", route: "TPE-LON", hintPrice: 20524 },
];

async function fetchSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_URL}/subscriptions?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to load subscriptions");
  const data = await res.json();
  return data.subscriptions ?? [];
}

async function postSubscribe(body: { email: string; plan_name: string; target_price: number }) {
  const res = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Subscribe failed");
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

  const mutation = useMutation({
    mutationFn: postSubscribe,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
    },
    onError: () => setError("訂閱失敗，請稍後再試"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const price = Number(targetPrice);
    if (!price || price <= 0) {
      setError("請輸入有效的目標價");
      return;
    }
    mutation.mutate({ email, plan_name: plan.plan_name, target_price: price });
  }

  return (
    <div className="fade-up rounded-2xl border border-border bg-card p-6 text-left">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{plan.label}</h3>
        {subscription && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            已訂閱
          </span>
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
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {mutation.isPending ? "處理中…" : subscription ? "更新目標價" : "開始追蹤"}
        </button>
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
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <PlanCard key={plan.plan_name} plan={plan} subscription={byRoute.get(plan.route)} email={email} />
      ))}
    </div>
  );
}
