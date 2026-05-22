import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Upload, Star } from "lucide-react";
import { createReview } from "@/app/actions/review";

export default async function NewReviewPage() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true }
  });

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/reviews" className="flex items-center gap-2 text-slate-500 hover:text-brand-navy mb-6 transition-colors">
        <ArrowLeft size={20} />
        Retour aux avis
      </Link>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-brand-navy mb-6">Ajouter un Faux Avis (Preuve Sociale)</h1>
        
        <form action={createReview} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Produit concerné</label>
            <select 
              name="productId" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-slate-50"
            >
              <option value="">Sélectionnez un produit...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nom du Client</label>
            <input 
              type="text" 
              name="customerName" 
              required
              placeholder="Ex: Jean-Paul, Yaoundé"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Note (Étoiles)</label>
            <select 
              name="rating" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-slate-50 text-yellow-500 font-bold"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Commentaire</label>
            <textarea 
              name="content" 
              required
              rows={4}
              placeholder="Ex: Livraison super rapide ! Le produit est exactement comme sur la vidéo, je recommande fortement."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none bg-slate-50"
            ></textarea>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 border-dashed">
            <label className="block text-sm font-bold text-slate-700 mb-2">Photo du client (Optionnel)</label>
            <p className="text-xs text-slate-500 mb-3">Importer une image de preuve pour augmenter la confiance. (Ex: une photo du colis reçu ou du client avec le produit).</p>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Cliquez pour importer</span></p>
                  <p className="text-xs text-slate-500">JPG, PNG (Max 5Mo)</p>
                </div>
                <input type="file" name="files" className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="bg-brand-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
            >
              Publier l'Avis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
