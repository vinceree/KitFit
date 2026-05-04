import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PairingManager } from "@/components/pairing-manager";

export default async function PairingsPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = createServiceClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("brand_id", user.id)
    .order("name", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Product Pairings
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Set up complementary products — when a customer tries on bib shorts,
        which jersey should complete the look?
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Create Pairing</CardTitle>
        </CardHeader>
        <CardContent>
          <PairingManager products={products || []} />
        </CardContent>
      </Card>
    </div>
  );
}
