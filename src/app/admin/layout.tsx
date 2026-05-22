import { getSession } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  const role = session.role;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <AdminSidebar role={role} />
      <main className="flex-1 overflow-y-auto w-full md:w-auto mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}
