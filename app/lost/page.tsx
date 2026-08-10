"use client";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ItemCard } from "@/components/item-card";
import Link from "next/link";
import { AutoRefreshItems } from "@/components/auto-refresh-items";
import { useState, useEffect } from "react";

export default function Lost({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; category?: string }> }) {
  const [params, setParams] = useState<{ q?: string; city?: string; category?: string }>({});
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    searchParams.then(setParams);
  }, [searchParams]);

  useEffect(() => {
    async function loadItems() {
      const p = await searchParams;
      const q = p.q?.trim();
      const where: Prisma.ItemWhereInput = {
        type: "LOST",
        status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] },
        ...(q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
        ...(p.city ? { city: { contains: p.city, mode: "insensitive" } } : {}),
        ...(p.category ? { category: { name: p.category } } : {}),
      };

      const [itemsData, catsData] = await Promise.all([
        db.item.findMany({
          where,
          include: { images: { take: 1 }, category: true },
          orderBy: { createdAt: "desc" },
          take: 24,
        }),
        db.category.findMany(),
      ]);

      setItems(itemsData);
      setCats(catsData);
    }

    loadItems();
  }, [searchParams]);

  const handleNewItems = (count: number) => {
    setNewItemsCount(count);
    setShowNotification(true);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const refreshItems = async () => {
    const q = params.q?.trim();
    const where: Prisma.ItemWhereInput = {
      type: "LOST",
      status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] },
      ...(q ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
      ...(params.city ? { city: { contains: params.city, mode: "insensitive" } } : {}),
      ...(params.category ? { category: { name: params.category } } : {}),
    };

    const itemsData = await db.item.findMany({
      where,
      include: { images: { take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      take: 24,
    });

    setItems(itemsData);
    setNewItemsCount(0);
    setShowNotification(false);
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

      {items.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(i => <ItemCard item={i} key={i.id} />)}
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

