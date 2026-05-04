"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImportProductsForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(
        `${data.imported} products imported${data.skipped ? `, ${data.skipped} already existed` : ""}`
      );
      setUrl("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleImport} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
          {result}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="store-url">Store URL</Label>
        <div className="flex gap-2">
          <Input
            id="store-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourbrand.com"
            className="flex-1"
            required
          />
          <Button type="submit" disabled={loading || !url}>
            {loading ? "Importing..." : "Import Products"}
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          We&apos;ll scan your store and import all products automatically.
        </p>
      </div>
    </form>
  );
}
