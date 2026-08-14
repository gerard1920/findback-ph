"use client";

import { useEffect, useRef } from "react";

export function useReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
        ...options,
      }
    );

    const revealEls = el.querySelectorAll(".reveal");
    revealEls.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [options]);

  return ref;
}
