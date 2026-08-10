import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const city = searchParams.get("city")?.trim();
    const category = searchParams.get("category")?.trim();

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
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(category ? { category: { name: category } } : {}),
    };

    const [items, cats] = await Promise.all([
      db.item.findMany({
        where,
        include: { 
          images: { take: 1 }, 
          category: true 
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      db.category.findMany(),
    ]);

    // Transform to match CardItem type
    const transformedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      description: item.description,
      city: item.city,
      province: item.province,
      dateOccurred: item.dateOccurred,
      images: item.images,
      category: item.category,
    }));

    return NextResponse.json({ items: transformedItems, cats });
  } catch (error) {
    console.error("Failed to fetch lost items:", error);
    return NextResponse.json({ items: [], cats: [] }, { status: 500 });
  }
}
