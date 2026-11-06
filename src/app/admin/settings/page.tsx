import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResetDataClient from "./ResetDataClient";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();

  // Seul l'ADMIN peut accéder à cette page
  if (!session || session.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={28} className="text-brand-navy" />
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Paramètres</h1>
          <p className="text-slate-500 text-sm">Gestion avancée de votre boutique</p>
        </div>
      </div>

      <ResetDataClient />
    </div>
  );
}
