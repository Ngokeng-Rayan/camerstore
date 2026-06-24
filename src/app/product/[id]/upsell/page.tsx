import { CheckCircle, Package, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { FrontNavbar } from "@/components/FrontNavbar";
import { FrontFooter } from "@/components/FrontFooter";

export default async function UpsellPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const originalProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true }
  });

  const categoryId = originalProduct?.categoryId;

  // Fetch related products in the same category
  const relatedProducts = categoryId ? await prisma.product.findMany({
    where: {
      categoryId: categoryId,
      id: { not: productId }
    },
    take: 8,
    orderBy: { createdAt: 'desc' }
  }) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <FrontNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Success Notification */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-brand-navy mb-3 sm:mb-4 px-2">
            Merci pour votre commande !
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm sm:text-lg px-2">
            Votre commande a été enregistrée avec succès. Notre équipe vous contactera très prochainement pour la livraison.
          </p>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-12">
            <div className="mb-6 sm:mb-10 text-center">
              <h2 className="text-xl sm:text-3xl font-black text-brand-navy mb-2 sm:mb-4 px-2">
                Complétez votre commande
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base px-2">
                Puisque vous avez aimé cet article, voici d'autres produits de la même catégorie qui pourraient vous intéresser avec livraison groupée !
              </p>
              <div className="w-24 h-1 bg-brand-green mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
              {relatedProducts.map((product) => (
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
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="fill-yellow-400 text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
                      ))}
                    </div>
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
            </div>
          </div>
        )}

      </main>

      <FrontFooter />
    </div>
  );
}
