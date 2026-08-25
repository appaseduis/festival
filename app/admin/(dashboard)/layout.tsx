import { requireAdmin } from "@/lib/auth/requireAdmin";
import SidebarAdmin from "@/components/admin/SidebarAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex">
      <SidebarAdmin email={email} />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}