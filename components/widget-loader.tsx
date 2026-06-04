"use client";

import { useEffect } from "react";

export function WidgetLoader() {
  useEffect(() => {
    if (document.querySelector('script[src="/widget/kitfit.js"]')) return;
    const script = document.createElement("script");
    script.src = "/widget/kitfit.js";
    document.head.appendChild(script);
  }, []);
  return null;
}
