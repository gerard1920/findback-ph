import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <AdminNav />
      <main className="container-page py-8">{children}</main>
    </>
  );
}
