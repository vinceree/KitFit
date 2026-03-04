"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/supabase/types";

export function ProductList({ products }: { products: Product[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;

    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4 text-center">
        No products yet. Add your first jersey or kit above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg overflow-hidden bg-white"
        >
          <div className="aspect-square bg-slate-100 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm text-slate-900 truncate">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              ID: {product.id}
            </p>
            <div className="flex gap-2 mt-3">
              {product.product_url && (
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View page
                </a>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
