import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.item.findMany({
      where: {
        status: { in: ["ACTIVE", "MATCHED", "CLAIM_PENDING"] },
      },
      include: { 
        images: { take: 1 }, 
        category: true 
      },
      orderBy: { createdAt: "desc" },
      take: 6,
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
    console.error("Failed to fetch recent items:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
