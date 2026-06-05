import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductList } from "@/components/product-list";
import { AddProductForm } from "@/components/add-product-form";
import { ImportProductsForm } from "@/components/import-products-form";
import { SeedTestProducts } from "@/components/seed-test-products";

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
        <div className="flex gap-4">
          <Link
            href="/dashboard/products/reference-images"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Reference Images &rarr;
          </Link>
          <Link
            href="/dashboard/products/pairings"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Manage Pairings &rarr;
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Import Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SeedTestProducts />
          <div className="border-t pt-4">
            <p className="text-xs text-slate-500 mb-2">Or import from any store URL:</p>
            <ImportProductsForm />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Product Manually</CardTitle>
        </CardHeader>
        <CardContent>
          <AddProductForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Products ({(products || []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList products={products || []} />
        </CardContent>
      </Card>
    </div>
  );
}
