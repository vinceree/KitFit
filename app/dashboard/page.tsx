import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { getMonthlyLimit } from "@/lib/rate-limit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanTier } from "@/lib/supabase/types";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = createServiceClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!brand) redirect("/auth/login");

  // Get monthly usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: monthlyUsage } = await supabase
    .from("try_ons")
    .select("*", { count: "exact", head: true })
    .eq("brand_id", user.id)
    .gte("created_at", startOfMonth.toISOString());

  // Get total products
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("brand_id", user.id);

  // Get recent try-ons
  const { data: recentTryOns } = await supabase
    .from("try_ons")
    .select("*, products(name)")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const limit = getMonthlyLimit(brand.plan_tier as PlanTier);
  const usage = monthlyUsage ?? 0;
  const usagePercent = Math.min(Math.round((usage / limit) * 100), 100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Monthly Try-Ons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {usage.toLocaleString()}
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {usage.toLocaleString()} / {limit.toLocaleString()} ({usagePercent}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Jerseys / kits in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold capitalize">
                {brand.plan_tier}
              </span>
              <Badge variant="secondary" className="capitalize">
                {brand.plan_tier}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {limit.toLocaleString()} try-ons/month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentTryOns || recentTryOns.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              No try-ons yet. Embed the widget on your site to get started.
            </p>
          ) : (
            <div className="divide-y">
              {recentTryOns.map((tryon) => (
                <div
                  key={tryon.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {(tryon as Record<string, unknown>).products
                        ? ((tryon as Record<string, unknown>).products as { name: string }).name
                        : "Unknown product"}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs capitalize">
                      {tryon.scene_preset}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(tryon.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
