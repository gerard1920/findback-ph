import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const city = searchParams.get("city")?.trim();

    const items = await db.item.findMany({
      where: {
        type: "FOUND",
        status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] },
        ...(q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      },
      include: { 
        images: { take: 1 }, 
        category: true 
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    });

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

    return NextResponse.json({ items: transformedItems });
  } catch (error) {
    console.error("Failed to fetch found items:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
