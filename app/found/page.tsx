"use client";

import { useState, useEffect } from "react";
import { ItemCard } from "@/components/item-card";
import { AutoRefreshItems } from "@/components/auto-refresh-items";

interface Item {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  description: string;
  city: string;
  province: string;
  dateOccurred: string;
  status: string;
  createdAt: string;
  images?: { url: string }[];
  category?: { name: string };
}

export default function Found({ searchParams }: { searchParams: Promise<{ q?: string; city?: string }> }) {
  const [params, setParams] = useState<{ q?: string; city?: string }>({});
  const [items, setItems] = useState<Item[]>([]);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchParams.then(setParams);
  }, [searchParams]);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const p = await searchParams;
        const q = p.q?.trim();
        const city = p.city?.trim();

        const searchParamsObj = new URLSearchParams();
        if (q) searchParamsObj.set("q", q);
        if (city) searchParamsObj.set("city", city);

        const response = await fetch(`/api/items/found?${searchParamsObj.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [searchParams]);

  const handleNewItems = (count: number) => {
    setNewItemsCount(count);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const refreshItems = async () => {
    const q = params.q?.trim();
    const city = params.city?.trim();

    const searchParamsObj = new URLSearchParams();
    if (q) searchParamsObj.set("q", q);
    if (city) searchParamsObj.set("city", city);

    const response = await fetch(`/api/items/found?${searchParamsObj.toString()}`);
    if (response.ok) {
      const data = await response.json();
      setItems(data.items || []);
      setNewItemsCount(0);
      setShowNotification(false);
    }
  };

  return (
    <main className="container-page py-10" data-auto-refresh>
      <AutoRefreshItems onNewItems={handleNewItems} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Found Items</h1>
          <p className="mt-2 text-slate-600">Browse recently reported found belongings.</p>
        </div>
        {showNotification && (
          <button
            onClick={refreshItems}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 animate-pulse"
          >
            {newItemsCount} new item{newItemsCount !== 1 ? 's' : ''} - Click to refresh
          </button>
        )}
      </div>

      <form className="card mt-7 flex gap-3 p-4" action="/found" method="GET">
        <input name="q" defaultValue={params.q} placeholder="Search items" className="input" />
        <input name="city" defaultValue={params.city} placeholder="City" className="input sm:max-w-44" />
        <button className="btn-primary">Search</button>
      </form>

      {loading ? (
        <div className="mt-8 text-center text-slate-600">Loading...</div>
      ) : items.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(i => <ItemCard item={i as any} key={i.id} />)}
        </div>
      ) : (
        <div className="card mt-8 p-10 text-center">
          <p className="text-slate-600">No found items match your search.</p>
        </div>
      )}
    </main>
  );
}

