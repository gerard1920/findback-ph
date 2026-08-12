import { db } from "@/lib/db";

function norm(value: string | undefined | null): Set<string> {
  const raw = (value || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  return new Set(raw);
}

function similarity(a: string | undefined | null, b: string | undefined | null): number {
  const x = norm(a);
  const y = norm(b);
  if (!x.size || !y.size) return 0;
  let common = 0;
  x.forEach((v) => {
    if (y.has(v)) common++;
  });
  return common / Math.max(x.size, y.size);
}

export async function generateMatches(itemId: string): Promise<void> {
  const item = await db.item.findUnique({ where: { id: itemId } });
  if (!item) return;

  const opposite = item.type === "LOST" ? "FOUND" : "LOST";
  const candidates = await db.item.findMany({
    where: { type: opposite, status: "ACTIVE" },
    take: 100,
  });

  for (const other of candidates) {
    const category = item.categoryId === other.categoryId ? 30 : 0;
    const brand = similarity(item.brand, other.brand) * 20;
    const color = similarity(item.color, other.color) * 15;
    const location = (item.city === other.city ? 1 : item.province === other.province ? 0.6 : 0) * 20;
    const days = Math.abs(item.dateOccurred.getTime() - other.dateOccurred.getTime()) / 86400000;
    const date = days < 7 ? 10 : days < 30 ? 5 : 0;
    const description = similarity(`${item.title} ${item.description}`, `${other.title} ${other.description}`) * 5;
    const score = Math.round(category + brand + color + location + date + description);

    if (score >= Number(process.env.MATCH_THRESHOLD || 60)) {
      const [lostItemId, foundItemId] = item.type === "LOST" ? [item.id, other.id] : [other.id, item.id];
      await db.match.upsert({
        where: { lostItemId_foundItemId: { lostItemId, foundItemId } },
        create: { lostItemId, foundItemId, score },
        update: { score },
      });
      await db.notification.create({
        data: {
          userId: item.ownerId,
          title: "Possible match found",
          body: `A report may match ${item.title}.`,
          link: "/dashboard/matches",
        },
      });
    }
  }
}
