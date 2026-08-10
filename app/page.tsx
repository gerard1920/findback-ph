"use client";

import Link from "next/link";
import { Search, Smartphone, Wallet, KeyRound, Backpack, FileText, Gem, CarFront, BookOpen, Package } from "lucide-react";
import { db } from "@/lib/db";
import { ItemCard } from "@/components/item-card";
import { AutoRefreshItems } from "@/components/auto-refresh-items";
import { useState, useEffect } from "react";

const cats: [string, typeof Smartphone][] = [
  ['Electronics', Smartphone],
  ['Wallets', Wallet],
  ['IDs & Documents', FileText],
  ['Bags', Backpack],
  ['Keys', KeyRound],
  ['Jewelry', Gem],
  ['Vehicle Items', CarFront],
  ['School Items', BookOpen],
  ['Other', Package],
];

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    async function loadItems() {
      const itemsData = await db.item.findMany({
        where: {
          status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] },
        },
        include: { images: { take: 1 }, category: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }).catch(() => []);

      setItems(itemsData);
    }

    loadItems();
  }, []);

  const handleNewItems = (count: number) => {
    setNewItemsCount(count);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const refreshItems = async () => {
    const itemsData = await db.item.findMany({
      where: {
        status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] },
      },
      include: { images: { take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }).catch(() => []);

    setItems(itemsData);
    setNewItemsCount(0);
    setShowNotification(false);
  };

  return (
    <main data-auto-refresh>
      <AutoRefreshItems onNewItems={handleNewItems} interval={15000} />
      
      <section className="border-b bg-white py-16 sm:py-24">
        <div className="container-page max-w-4xl text-center">
          <p className="mb-4 font-medium text-blue-700">Lost something? Found something? Help it find its way home.</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Lost something? Let&apos;s help you find it.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">Report lost and found items, discover possible matches, and reconnect belongings with their owners.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/report/lost" className="btn-primary">Report lost item</Link>
            <Link href="/report/found" className="btn-secondary">Report found item</Link>
          </div>
          <form action="/lost" className="card mx-auto mt-10 flex max-w-3xl flex-col gap-2 p-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search size={19} className="text-slate-400" />
              <input name="q" aria-label="What are you looking for?" className="border-0 p-1 focus:ring-0" placeholder="What are you looking for?" />
            </div>
            <input name="city" className="sm:max-w-44" placeholder="Near Quezon City" />
            <button className="btn-primary">Search</button>
          </form>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="text-xl font-bold">Browse by category</h2>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {cats.map(([name, Icon]) => {
            const I = Icon as typeof Smartphone;
            return (
              <Link href={`/lost?category=${encodeURIComponent(name)}`} className="card flex min-h-24 flex-col items-center justify-center gap-2 p-3 text-center text-sm hover:border-blue-300" key={name}>
                <I size={22} className="text-blue-700" />
                {name}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page py-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recently reported</h2>
            {showNotification && (
              <button
                onClick={refreshItems}
                className="mt-2 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 animate-pulse"
              >
                {newItemsCount} new item{newItemsCount !== 1 ? 's' : ''} - Click to refresh
              </button>
            )}
          </div>
          <Link href="/lost" className="text-sm font-semibold text-blue-700">Browse all</Link>
        </div>
        {items.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(i => <ItemCard item={i} key={i.id} />)}
          </div>
        ) : (
          <div className="card mt-6 p-10 text-center text-slate-600">No reports yet. Be the first to help an item find its way home.</div>
        )}
      </section>
    </main>
  );
}
