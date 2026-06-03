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

  const globalSnippet = `<!-- KitFit: Add this ONCE in your site-wide header/footer (enables notifications across all pages) -->
<script src="${appUrl}/widget/kitfit.js" defer></script>`;

  const snippet = `<!-- KitFit: Add this on each product page where you want the try-on button -->
<div
  data-kitfit
  data-kitfit-key="${apiKey}"
  data-kitfit-garment="YOUR_JERSEY_IMAGE_URL"
  data-kitfit-product="YOUR_PRODUCT_ID"
  data-kitfit-api="${appUrl}"
></div>`;

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">
          Step 1 — Add this to your site-wide header or footer:
        </p>
        <div className="relative">
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
            <code>{globalSnippet}</code>
          </pre>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={() => handleCopy(globalSnippet)}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">
          Step 2 — Add this on each product page:
        </p>
        <div className="relative">
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
            <code>{snippet}</code>
          </pre>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={() => handleCopy(snippet)}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
