"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BillingActionsProps {
  action: "checkout" | "portal";
  plan?: string;
  currentPlan: string;
}

export function BillingActions({ action, plan, currentPlan }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      if (action === "portal") {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: currentPlan }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else if (plan) {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }

  if (action === "portal") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Loading..." : "Manage Subscription"}
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Loading..." : `Upgrade to ${plan}`}
    </Button>
  );
}
