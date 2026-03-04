import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductList } from "@/components/product-list";
import { AddProductForm } from "@/components/add-product-form";

export default async function ProductsPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const supabase = createServiceClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Product Catalog
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent>
          <AddProductForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList products={products || []} />
        </CardContent>
      </Card>
    </div>
  );
}
