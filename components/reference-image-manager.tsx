"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { Product, ProductReferenceImage } from "@/lib/supabase/types";

interface Props {
  products: Product[];
}

export function ReferenceImageManager({ products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refImages, setRefImages] = useState<ProductReferenceImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchRefImages = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reference-images`);
      if (res.ok) {
        const data = await res.json();
        setRefImages(data.referenceImages || []);
      }
    } catch {
      setRefImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchRefImages(selectedProduct.id);
    }
  }, [selectedProduct, fetchRefImages]);

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setError("");
    setUrlInput("");
  }

  async function addRefImage(imageUrl: string) {
    if (!selectedProduct || !imageUrl) return;
    setAdding(true);
    setError("");

    try {
      const res = await fetch(
        `/api/products/${selectedProduct.id}/reference-images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add image");
      }
      setUrlInput("");
      await fetchRefImages(selectedProduct.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setAdding(false);
    }
  }

  async function removeRefImage(refImageId: string) {
    if (!selectedProduct) return;
    setError("");

    try {
      await fetch(
        `/api/products/${selectedProduct.id}/reference-images?refId=${refImageId}`,
        { method: "DELETE" }
      );
      await fetchRefImages(selectedProduct.id);
    } catch {
      setError("Failed to remove image");
    }
  }

  const isAlreadyRef = (url: string) =>
    refImages.some((r) => r.image_url === url);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Product grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Select a product to manage its reference images
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => selectProduct(product)}
              className={`
                border rounded-lg overflow-hidden bg-white cursor-pointer
                hover:shadow-md transition-all select-none
                ${selectedProduct?.id === product.id ? "ring-2 ring-blue-500 border-blue-500" : ""}
              `}
            >
              <div className="aspect-square bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {product.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No products yet. Import or add products first.
          </p>
        )}
      </div>

      {/* Selected product detail */}
      {selectedProduct && (
        <div className="border rounded-xl bg-white p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {selectedProduct.name}
            </h3>
            <p className="text-sm text-slate-500">
              Select up to 3 images to send to the AI. Front + back views work
              best.
            </p>
          </div>

          {/* Current reference images */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Reference images ({refImages.length}/3)
            </h4>
            {loading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : refImages.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-slate-400">
                No reference images selected. The default product image will be
                used.
              </div>
            ) : (
              <div className="flex gap-3">
                {refImages.map((ref, i) => (
                  <div
                    key={ref.id}
                    className="relative group border rounded-lg overflow-hidden bg-slate-50"
                    style={{ width: 140 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ref.image_url}
                      alt={`Reference ${i + 1}`}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{i + 1}
                    </div>
                    <button
                      onClick={() => removeRefImage(ref.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-add from product's existing image */}
          {!isAlreadyRef(selectedProduct.image_url) &&
            refImages.length < 3 && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProduct.image_url}
                  alt="Product"
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    Default product image
                  </p>
                  <p className="text-xs text-slate-400">
                    Quick-add the existing catalog image
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addRefImage(selectedProduct.image_url)}
                  disabled={adding}
                >
                  Add
                </Button>
              </div>
            )}

          {/* Add by URL */}
          {refImages.length < 3 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                Add image by URL
              </h4>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://cdn.shopify.com/.../product-back.jpg"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={() => addRefImage(urlInput)}
                  disabled={adding || !urlInput}
                >
                  {adding ? "Adding..." : "Add"}
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Paste a public URL to a product image (e.g. flat lay, back view,
                detail shot)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
