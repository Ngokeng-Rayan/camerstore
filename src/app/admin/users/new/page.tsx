"use client";

import { useState } from "react";
import { createUserAction } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createUserAction(formData);
    
    if (result.success) {
      router.push("/admin/users");
    } else {
      alert(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users" className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Ajouter un Membre</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nom complet</label>
            <input type="text" name="name" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="Ex: Jean Dupont" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Adresse Email</label>
            <input type="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="jean@camerstore.com" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
            <input type="password" name="password" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Rôle</label>
            <select name="role" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none">
              <option value="CLOSER">Closer (Peut voir uniquement le CRM)</option>
              <option value="ADMIN">Administrateur (Accès total)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-brand-navy hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-md"
          >
            <Save size={20} />
            {isLoading ? "Création..." : "Ajouter le membre"}
          </button>
        </div>
      </form>
    </div>
  );
}
