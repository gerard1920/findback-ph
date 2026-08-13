"use client";
import { useEffect } from "react";

export function ConsoleBanner() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log(
      `%c[FindBack PH] %cApp console initialized.%c Any log/warn/error below this line is from the website.`,
      "color:#ffffff;background:#1e40af;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold;",
      "color:#1e40af;font-weight:bold;",
      "color:#475569;"
    );
  }, []);
  return null;
}
