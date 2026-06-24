import { FrontNavbar } from "@/components/FrontNavbar";
import { FrontFooter } from "@/components/FrontFooter";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Package, Star } from "lucide-react";

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const pageSize = 12; // 12 produits par page

  const totalProducts = await prisma.product.count();
  const totalPages = Math.ceil(totalProducts / pageSize);

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { reviews: true }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <FrontNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-brand-navy mb-4">Notre Catalogue</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Découvrez l'ensemble de nos produits soigneusement sélectionnés pour vous.
          </p>
          <div className="w-24 h-1 bg-brand-green mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
          {products.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 overflow-hidden group flex flex-col cursor-pointer">
              <div className="bg-slate-100 aspect-square relative flex items-center justify-center overflow-hidden">
                {product.images && product.images[0] ? (
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Package className="text-slate-300 w-8 h-8 sm:w-12 sm:h-12" />
                )}
                {product.comparePrice && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-brand-red text-white font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs z-10 shadow-sm">
                    Promo
                  </div>
                )}
                <div className="absolute inset-0 bg-brand-navy/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="p-3 sm:p-6 flex flex-col flex-1">
                {product.reviews && product.reviews.length > 0 && (() => {
                  const avgRating = Math.round(product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length);
                  return (
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < avgRating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                      <span className="text-[10px] sm:text-xs text-slate-500 ml-1">({product.reviews.length})</span>
                    </div>
                  );
                })()}
                <h3 className="font-bold text-slate-800 text-xs sm:text-lg mb-1 sm:mb-2 line-clamp-2 flex-1 leading-snug">{product.title}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-3 mb-3 sm:mb-6">
                  <span className="font-black text-sm sm:text-xl text-brand-navy">{product.sellingPrice.toLocaleString('fr-FR')} FCFA</span>
                  {product.comparePrice && (
                    <span className="text-[10px] sm:text-sm text-slate-400 line-through">{product.comparePrice.toLocaleString('fr-FR')} FCFA</span>
                  )}
                </div>
                
                <div 
                  className="block w-full bg-slate-900 group-hover:bg-brand-navy text-white text-center font-bold text-xs sm:text-base py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors border border-transparent group-hover:border-brand-green mt-auto"
                >
                  Commander
                </div>
              </div>
            </Link>
          ))}
          
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              Aucun produit disponible pour le moment.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            {page > 1 && (
              <Link 
                href={`/produits?page=${page - 1}`}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold transition-colors"
              >
                Précédent
              </Link>
            )}
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <Link 
                    key={p} 
                    href={`/produits?page=${p}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                      page === p 
                        ? 'bg-brand-green text-brand-navy' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>

            {page < totalPages && (
              <Link 
                href={`/produits?page=${page + 1}`}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold transition-colors"
              >
                Suivant
              </Link>
            )}
          </div>
        )}
      </main>

      <FrontFooter />
    </div>
  );
}
