"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile || !name) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("product_url", productUrl);
      formData.append("image", imageFile);

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add product");
      }

      setName("");
      setProductUrl("");
      setImageFile(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alpine Pro Jersey"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-url">Product Page URL</Label>
          <Input
            id="product-url"
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://yourbrand.com/jersey"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="product-image">Product Image</Label>
        <Input
          id="product-image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      <Button type="submit" disabled={loading || !imageFile || !name}>
        {loading ? "Uploading..." : "Add Product"}
      </Button>
    </form>
  );
}
