import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferenceImageManager } from "@/components/reference-image-manager";

export default async function ReferenceImagesPage() {
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
        Reference Images
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Choose which product photos the AI uses for virtual try-on. Front + back
        views give the best results. Up to 3 images per product.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Manage Reference Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ReferenceImageManager products={products || []} />
        </CardContent>
      </Card>
    </div>
  );
}
