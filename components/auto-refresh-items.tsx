"use client";

import { useEffect, useRef, useState } from "react";

export function AutoRefreshItems({ 
  onNewItems, 
  interval = 30000 
}: { 
  onNewItems: (count: number) => void; 
  interval?: number;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousCountRef = useRef<number>(0);

  useEffect(() => {
    // Intersection Observer to pause when tab is not visible
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector('[data-auto-refresh]');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll for new items
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/items/count");
        if (response.ok) {
          const data = await response.json();
          const currentCount = data.count || 0;

          // Check if there are new items
          if (previousCountRef.current > 0 && currentCount > previousCountRef.current) {
            onNewItems(currentCount - previousCountRef.current);
          }

          previousCountRef.current = currentCount;
        }
      } catch (error) {
        console.error("Failed to check for new items:", error);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, interval, onNewItems]);

  return null;
}
