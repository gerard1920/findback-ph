import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditItemForm } from "@/components/edit-item-form";

export const dynamic = "force-dynamic";

export default async function EditItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect("/login");
  const [item, categories] = await Promise.all([
    db.item.findUnique({ where: { id }, include: { images: { orderBy: { createdAt: "asc" } } } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!item) notFound();
  if (item.ownerId !== user.id) redirect(`/items/${item.id}`);
  const d = new Date(item.dateOccurred);
  const dateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return (
    <main className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Edit report</h1>
      <p className="mt-2 text-slate-600">Update the details for your {item.type === "LOST" ? "lost" : "found"} item. Private fields are only shown to you.</p>
      <EditItemForm item={item} categories={categories} dateValue={dateValue} />
    </main>
  );
}