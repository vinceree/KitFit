"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EmbedCodeDisplay({
  apiKey,
  appUrl,
}: {
  apiKey: string;
  appUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const snippet = `<!-- KitFit Virtual Try-On Widget -->
<div
  data-kitfit
  data-kitfit-key="${apiKey}"
  data-kitfit-garment="YOUR_JERSEY_IMAGE_URL"
  data-kitfit-product="YOUR_PRODUCT_ID"
  data-kitfit-api="${appUrl}"
></div>
<script src="${appUrl}/widget/kitfit.js" defer></script>`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
        <code>{snippet}</code>
      </pre>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-2 right-2"
        onClick={handleCopy}
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
