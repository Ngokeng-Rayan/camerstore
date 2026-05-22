import prisma from "@/lib/prisma";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DeleteProductBtn from "./DeleteProductBtn";

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const searchFilter = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;

  const whereClause = searchFilter ? {
    title: { contains: searchFilter, mode: 'insensitive' as const }
  } : {};

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Gestion des Produits</h1>
        <Link href="/admin/products/new" className="bg-brand-green hover:bg-lime-500 text-brand-navy font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} />
          Ajouter un produit
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        <form className="flex-1 flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            name="search" 
            defaultValue={searchFilter || ""}
            placeholder="Rechercher un produit par nom..." 
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none text-sm"
          />
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
            Rechercher
          </button>
          {searchFilter && (
            <Link href="/admin/products" className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center">
              Réinitialiser
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
        {/* Mobile View (Cards) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {products.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Aucun produit trouvé.</div>
          ) : (
            products.map(product => {
              const marge = product.sellingPrice - product.costPrice;
              return (
                <div key={product.id} className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex shrink-0 items-center justify-center overflow-hidden relative">
                      {product.images && product.images[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                      ) : (
                        <Package size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-brand-navy line-clamp-1">{product.title}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500">Prix d'Achat</div>
                      <div className="font-medium text-slate-700">{product.costPrice.toLocaleString()} F</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Prix de Vente</div>
                      <div className="font-bold text-brand-navy">{product.sellingPrice.toLocaleString()} F</div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                      <div className="text-xs text-slate-500">Marge Brute</div>
                      <div className="font-black text-brand-green">{marge.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Link href={`/product/${product.id}`} className="text-blue-500 hover:text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg flex-1 text-center" target="_blank">Voir</Link>
                    <Link href={`/admin/products/${product.id}/edit`} className="text-brand-navy font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg flex-1 text-center">Modifier</Link>
                    <div className="flex-1 flex justify-center"><DeleteProductBtn id={product.id} /></div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500">
                <th className="p-4 font-semibold whitespace-nowrap">Produit</th>
                <th className="p-4 font-semibold whitespace-nowrap">Prix d'Achat (Secret)</th>
                <th className="p-4 font-semibold whitespace-nowrap">Prix de Vente</th>
                <th className="p-4 font-semibold whitespace-nowrap text-brand-green">Marge Brut</th>
                <th className="p-4 font-semibold whitespace-nowrap">Stock</th>
                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const marge = product.sellingPrice - product.costPrice;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex shrink-0 items-center justify-center overflow-hidden relative">
                            {product.images && product.images[0] ? (
                              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                            ) : (
                              <Package size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-navy">{product.title}</p>
                            <Link href={`/product/${product.id}`} className="text-xs text-blue-500 hover:underline" target="_blank">
                              Voir sur la boutique
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {product.costPrice.toLocaleString()} FCFA
                      </td>
                      <td className="p-4 font-bold text-brand-navy">
                        {product.sellingPrice.toLocaleString()} FCFA
                      </td>
                      <td className="p-4 font-black text-brand-green">
                        {marge.toLocaleString()} FCFA
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <Link href={`/product/${product.id}`} className="text-blue-500 hover:text-blue-700 font-medium text-sm transition-colors" target="_blank">Voir</Link>
                          <Link href={`/admin/products/${product.id}/edit`} className="text-slate-400 hover:text-brand-navy font-medium text-sm transition-colors">Modifier</Link>
                          <DeleteProductBtn id={product.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
