"use client";

import { useState, useEffect } from "react";
import { ItemCard, parseCardItem, type CardItemInput } from "@/components/item-card";
import Link from "next/link";
import { AutoRefreshItems } from "@/components/auto-refresh-items";

interface Category {
  id: string;
  name: string;
}

export default function Lost({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; category?: string }> }) {
  const [params, setParams] = useState<{ q?: string; city?: string; category?: string }>({});
  const [items, setItems] = useState<CardItemInput[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
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
        const category = p.category?.trim();

        const searchParamsObj = new URLSearchParams();
        if (q) searchParamsObj.set("q", q);
        if (city) searchParamsObj.set("city", city);
        if (category) searchParamsObj.set("category", category);

        const response = await fetch(`/api/items/lost?${searchParamsObj.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
          setCats(data.cats || []);
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
    const category = params.category?.trim();

    const searchParamsObj = new URLSearchParams();
    if (q) searchParamsObj.set("q", q);
    if (city) searchParamsObj.set("city", city);
    if (category) searchParamsObj.set("category", category);

    const response = await fetch(`/api/items/lost?${searchParamsObj.toString()}`);
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
          <h1 className="text-3xl font-bold">Lost Items</h1>
          <p className="mt-2 text-slate-600">Browse recently reported lost belongings.</p>
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

      <form className="card mt-7 grid gap-3 p-4 md:grid-cols-4" action="/lost" method="GET">
        <input name="q" defaultValue={params.q} placeholder="Search items" className="input" />
        <input name="city" defaultValue={params.city} placeholder="City" className="input" />
        <select name="category" defaultValue={params.category} className="input">
          <option value="">All categories</option>
          {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <button className="btn-primary">Apply filters</button>
      </form>

      {loading ? (
        <div className="mt-8 text-center text-slate-600">Loading...</div>
      ) : items.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <ItemCard item={parseCardItem(i)} key={i.id} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-12 text-center">
          <h2 className="font-semibold">No lost items found</h2>
          <p className="mt-2 text-sm text-slate-600">Try another keyword, a different location, or remove filters.</p>
          <Link href="/report/lost" className="btn-primary mt-5">Report a lost item</Link>
        </div>
      )}
    </main>
  );
}

