"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, AlertCircle, Package, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result.success) {
      // Redirection intelligente en fonction du rôle
      if (result.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/admin/orders");
      }
    } else {
      setError(result.error || "Erreur de connexion");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-100 p-3 rounded-full mb-4">
            <Package className="text-brand-green" size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-brand-navy uppercase flex items-center gap-1">
            Camer<span className="text-brand-green">Store</span>
          </h1>
          <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Connexion Sécurisée</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                name="email"
                type="email" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                name="password"
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-green hover:bg-lime-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-brand-navy font-bold py-3 rounded-xl transition-colors shadow-md mt-4 mb-2"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
          
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-green font-medium text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Retour à la boutique
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
