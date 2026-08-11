import { requireAdmin } from "@/lib/admin";
import { Navbar } from "@/components/navbar";
import { AdminNav } from "@/components/admin-nav";
import { currentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side gate: only authenticated admins reach here.
  // Non-admins / anonymous users are redirected away from the admin area.
  await requireAdmin();
  const user = await currentUser();
  const navbarUser = user
    ? {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: String(user.role),
        status: String(user.status),
      }
    : null;

  return (
    <>
      <Navbar user={navbarUser} />
      <AdminNav />
      <main className="container-page py-8">{children}</main>
    </>
  );
}
