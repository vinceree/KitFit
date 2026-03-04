import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingActions } from "@/components/billing-actions";

export default async function BillingPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = createServiceClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!brand) redirect("/auth/login");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "€199/mo",
      tryons: "500 try-ons/month",
    },
    {
      id: "growth",
      name: "Growth",
      price: "€499/mo",
      tryons: "2,000 try-ons/month",
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "€999/mo",
      tryons: "10,000 try-ons/month",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Billing</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold capitalize">
              {brand.plan_tier}
            </span>
            <Badge variant="secondary" className="capitalize">
              Active
            </Badge>
          </div>
          {brand.stripe_customer_id && (
            <BillingActions action="portal" currentPlan={brand.plan_tier} />
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.id === brand.plan_tier
                ? "ring-2 ring-blue-600"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.id === brand.plan_tier && (
                  <Badge>Current</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{plan.price}</div>
              <p className="text-sm text-slate-500 mb-4">{plan.tryons}</p>
              {plan.id !== brand.plan_tier && (
                <BillingActions action="checkout" plan={plan.id} currentPlan={brand.plan_tier} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
