"use client";

import { useState } from "react";
import { updateProductAction, deleteProductAction } from "@/app/actions/productEdit";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProductEditForm({ product, categories }: { product: any, categories: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProductAction(product.id, formData);
    
    if (result.success) {
      router.push("/admin/products");
    } else {
      alert(result.error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.")) return;
    setIsDeleting(true);
    const result = await deleteProductAction(product.id);
    if (result.success) {
      router.push("/admin/products");
    } else {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-700" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Modifier le produit</h1>
        </div>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-red-200"
        >
          <Trash2 size={16} />
          {isDeleting ? "..." : "Supprimer"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Titre du produit</label>
            <input type="text" name="title" defaultValue={product.title} required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Catégorie</label>
            <select name="categoryId" defaultValue={product.categoryId || ""} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-white">
              <option value="">-- Aucune catégorie --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea name="description" defaultValue={product.description} required rows={5} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prix d'Achat (Secret) - FCFA</label>
            <input type="number" name="costPrice" defaultValue={product.costPrice} required min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prix de Vente - FCFA</label>
            <input type="number" name="sellingPrice" defaultValue={product.sellingPrice} required min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prix Barré (Promo) - FCFA</label>
            <input type="number" name="comparePrice" defaultValue={product.comparePrice || ""} min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Stock</label>
            <input type="number" name="stock" defaultValue={product.stock} required min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Changer les images (Sélectionnez plusieurs si besoin)</label>
            <input type="file" name="imageFiles" accept="image/*" multiple className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-white" />
            <p className="text-xs text-slate-400 mt-1">Laissez vide si vous souhaitez conserver les images actuelles. Si vous ajoutez des images, elles remplaceront les anciennes.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Changer les médias de la description (GIFs, Vidéos courtes, Images)</label>
            <input type="file" name="descriptionMediaFiles" accept="image/*,video/mp4" multiple className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-white" />
            <p className="text-xs text-slate-400 mt-1">Laissez vide pour conserver les médias actuels.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-brand-navy hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-md"
          >
            <Save size={20} />
            {isLoading ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </div>
      </form>
    </div>
  );
}
