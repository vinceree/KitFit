"use client";

import { useState, useEffect, useCallback, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/supabase/types";

interface Pairing {
  id: string;
  is_default: boolean;
  product: Product;
  complement: Product;
}

export function PairingManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [primaryProduct, setPrimaryProduct] = useState<Product | null>(null);
  const [complementProduct, setComplementProduct] = useState<Product | null>(
    null
  );
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragTarget, setDragTarget] = useState<"primary" | "complement" | null>(
    null
  );

  const fetchPairings = useCallback(async () => {
    const res = await fetch("/api/products/pairings");
    if (res.ok) {
      const data = await res.json();
      setPairings(data.pairings || []);
    }
  }, []);

  useEffect(() => {
    fetchPairings();
  }, [fetchPairings]);

  function handleDragStart(e: DragEvent, product: Product) {
    e.dataTransfer.setData("application/json", JSON.stringify(product));
    e.dataTransfer.effectAllowed = "copy";
  }

  function handleDragOver(
    e: DragEvent,
    zone: "primary" | "complement"
  ) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragTarget(zone);
  }

  function handleDragLeave() {
    setDragTarget(null);
  }

  function handleDrop(
    e: DragEvent,
    zone: "primary" | "complement"
  ) {
    e.preventDefault();
    setDragTarget(null);

    try {
      const product = JSON.parse(
        e.dataTransfer.getData("application/json")
      ) as Product;
      if (zone === "primary") {
        setPrimaryProduct(product);
        if (complementProduct?.id === product.id) setComplementProduct(null);
      } else {
        setComplementProduct(product);
        if (primaryProduct?.id === product.id) setPrimaryProduct(null);
      }
    } catch {
      /* invalid drag data */
    }
  }

  async function handleSave() {
    if (!primaryProduct || !complementProduct) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/products/pairings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: primaryProduct.id,
          complementId: complementProduct.id,
          isDefault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save pairing");
      }

      setPrimaryProduct(null);
      setComplementProduct(null);
      setIsDefault(true);
      await fetchPairings();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pairingId: string) {
    await fetch(`/api/products/pairings?id=${pairingId}`, {
      method: "DELETE",
    });
    await fetchPairings();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Drop zones */}
      <div className="grid grid-cols-2 gap-4">
        <DropZone
          label="Primary Product"
          hint="e.g. Bib Shorts"
          product={primaryProduct}
          active={dragTarget === "primary"}
          onDragOver={(e) => handleDragOver(e, "primary")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "primary")}
          onClear={() => setPrimaryProduct(null)}
        />
        <DropZone
          label="Goes With"
          hint="e.g. Jersey"
          product={complementProduct}
          active={dragTarget === "complement"}
          onDragOver={(e) => handleDragOver(e, "complement")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "complement")}
          onClear={() => setComplementProduct(null)}
        />
      </div>

      {/* Save controls */}
      {primaryProduct && complementProduct && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded"
            />
            Default complement (auto-selected in widget)
          </label>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto"
          >
            {saving ? "Saving..." : "Save Pairing"}
          </Button>
        </div>
      )}

      {/* Product cards to drag */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Drag products into the zones above
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              draggable
              onDragStart={(e) => handleDragStart(e, product)}
              className="border rounded-lg overflow-hidden bg-white cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
            >
              <div className="aspect-square bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {product.name}
                </p>
                {product.category && (
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {product.category.replace("_", " ")}
                  </Badge>
                )}
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

      {/* Existing pairings */}
      {pairings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Saved Pairings
          </h3>
          <div className="space-y-2">
            {pairings.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 bg-white border rounded-lg"
              >
                <PairingThumb product={p.product} />
                <span className="text-slate-400 text-sm">+</span>
                <PairingThumb product={p.complement} />
                {p.is_default && (
                  <Badge className="text-[10px]">default</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                  onClick={() => handleDelete(p.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DropZone({
  label,
  hint,
  product,
  active,
  onDragOver,
  onDragLeave,
  onDrop,
  onClear,
}: {
  label: string;
  hint: string;
  product: Product | null;
  active: boolean;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onClear: () => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        border-2 border-dashed rounded-xl p-4 text-center transition-colors min-h-[180px]
        flex flex-col items-center justify-center gap-2
        ${active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"}
        ${product ? "border-solid border-green-500 bg-green-50" : ""}
      `}
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      {product ? (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <p className="text-sm font-medium text-slate-900 truncate max-w-full">
            {product.name}
          </p>
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function PairingThumb({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image_url}
        alt={product.name}
        className="w-10 h-10 object-cover rounded"
      />
      <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">
        {product.name}
      </span>
    </div>
  );
}
