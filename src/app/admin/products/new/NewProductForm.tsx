"use client";

import { useState } from "react";
import { createProductAction } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewProductForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createProductAction(formData);
    
    if (result.success) {
      router.push("/admin/products");
    } else {
      alert(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Nouveau Produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Titre du produit</label>
            <input type="text" name="title" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="Ex: Montre Connectée X Pro" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Catégorie</label>
            <select name="categoryId" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-white">
              <option value="">-- Aucune catégorie --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Description argumentaire</label>
            <textarea name="description" required rows={5} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="Décrivez les bénéfices du produit..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prix d'Achat (Secret) - FCFA</label>
            <input type="number" name="costPrice" required min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="Ex: 5000" />
            <p className="text-xs text-slate-400 mt-1">Utilisé pour calculer votre bénéfice net.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prix de Vente - FCFA</label>
            <input type="number" name="sellingPrice" required min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="Ex: 15000" />
            <p className="text-xs text-slate-400 mt-1">Le prix que le client paiera à la livraison.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prix Barré (Psychologique) - FCFA</label>
            <input type="number" name="comparePrice" min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" placeholder="Ex: 30000" />
            <p className="text-xs text-slate-400 mt-1">Optionnel. Crée un sentiment de promotion massive.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Stock initial</label>
            <input type="number" name="stock" required min="0" defaultValue={10} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Images du produit (Sélectionnez plusieurs si besoin)</label>
            <input type="file" name="imageFiles" accept="image/*" multiple required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-white" />
            <p className="text-xs text-slate-400 mt-1">La première image sera l'image principale.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Médias pour la description (GIFs, Vidéos courtes, Images)</label>
            <input type="file" name="descriptionMediaFiles" accept="image/*,video/mp4" multiple className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-white" />
            <p className="text-xs text-slate-400 mt-1">Optionnel. Ces médias s'afficheront dans la description pour augmenter le taux de conversion.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-brand-navy hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-md"
          >
            <Save size={20} />
            {isLoading ? "Création..." : "Enregistrer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
}
