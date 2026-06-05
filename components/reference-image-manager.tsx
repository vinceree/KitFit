"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product, ProductReferenceImage } from "@/lib/supabase/types";

interface Props {
  products: Product[];
}

interface ShopifyImage {
  src: string;
  alt: string | null;
}

export function ReferenceImageManager({ products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refImages, setRefImages] = useState<ProductReferenceImage[]>([]);
  const [storeImages, setStoreImages] = useState<ShopifyImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(false);
  const [error, setError] = useState("");

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

  const fetchStoreImages = useCallback(async (productId: string) => {
    setFetchingStore(true);
    setStoreImages([]);
    try {
      const res = await fetch(`/api/products/${productId}/store-images`);
      if (res.ok) {
        const data = await res.json();
        setStoreImages(data.images || []);
      }
    } catch {
      setStoreImages([]);
    } finally {
      setFetchingStore(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchRefImages(selectedProduct.id);
      fetchStoreImages(selectedProduct.id);
    }
  }, [selectedProduct, fetchRefImages, fetchStoreImages]);

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setError("");
  }

  const isSelected = (url: string) =>
    refImages.some((r) => r.image_url === url);

  async function toggleImage(imageUrl: string) {
    if (!selectedProduct) return;
    setError("");

    const existing = refImages.find((r) => r.image_url === imageUrl);
    if (existing) {
      try {
        await fetch(
          `/api/products/${selectedProduct.id}/reference-images?refId=${existing.id}`,
          { method: "DELETE" }
        );
        await fetchRefImages(selectedProduct.id);
      } catch {
        setError("Failed to remove image");
      }
    } else {
      if (refImages.length >= 3) {
        setError("Maximum 3 reference images. Deselect one first.");
        return;
      }
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
        await fetchRefImages(selectedProduct.id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to add");
      }
    }
  }

  const allImages: ShopifyImage[] =
    storeImages.length > 0
      ? storeImages
      : selectedProduct
        ? [{ src: selectedProduct.image_url, alt: selectedProduct.name }]
        : [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

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

      {selectedProduct && (
        <div className="border rounded-xl bg-white p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {selectedProduct.name}
            </h3>
            <p className="text-sm text-slate-500">
              Click images to select which ones the AI uses. Up to 3 — front +
              back works best.
            </p>
          </div>

          {loading || fetchingStore ? (
            <p className="text-sm text-slate-400 py-4">Loading images...</p>
          ) : allImages.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-slate-400">
              No product images found. Make sure the product has a store URL.
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Product images — click to select ({refImages.length}/3 selected)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {allImages.map((image, i) => {
                  const selected = isSelected(image.src);
                  const refIdx = refImages.findIndex(
                    (r) => r.image_url === image.src
                  );
                  return (
                    <div
                      key={i}
                      onClick={() => toggleImage(image.src)}
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                        ${selected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-400"}
                        ${!selected && refImages.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.src}
                        alt={image.alt || `Product image ${i + 1}`}
                        className="w-full aspect-[3/4] object-cover"
                      />
                      {selected && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                          <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            {refIdx + 1}
                          </div>
                          <svg
                            className="w-8 h-8 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
