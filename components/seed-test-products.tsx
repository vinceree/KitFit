"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SeedTestProducts() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleSeed() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/products/seed-test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.message);
      router.refresh();
    } catch (err: unknown) {
      setResult(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={handleSeed} disabled={loading}>
        {loading ? "Loading..." : "Load Straede Test Products"}
      </Button>
      {result && (
        <span className="text-sm text-slate-600">{result}</span>
      )}
    </div>
  );
}
