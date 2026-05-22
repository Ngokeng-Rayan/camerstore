import Link from "next/link";
import Image from "next/image";
import { Package, Truck, ShieldCheck, PhoneCall, ArrowRight, Star } from "lucide-react";

import prisma from "@/lib/prisma";

import { FrontNavbar } from "@/components/FrontNavbar";
import { FrontFooter } from "@/components/FrontFooter";

export const revalidate = 60;

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { reviews: true }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <FrontNavbar />

      {/* Hero Section */}
      <section className="relative bg-brand-navy text-white overflow-hidden py-24 sm:py-32">
        {/* Abstract shapes for background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
            Les Meilleurs Produits, <br />
            <span className="text-brand-green">Livrés Directement Chez Vous.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Découvrez notre sélection d'articles de haute qualité. Vous commandez, nous livrons, vous vérifiez, <strong className="text-white">vous payez à la livraison.</strong> Zéro risque.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/produits" 
              className="bg-brand-green hover:bg-lime-500 text-brand-navy font-bold text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-transform transform hover:-translate-y-1 shadow-lg hover:shadow-brand-green/30"
            >
              Découvrir nos offres
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="flex flex-col items-center p-4">
              <ShieldCheck className="text-brand-green mb-4" size={40} />
              <h3 className="text-lg font-bold text-brand-navy mb-2">Produits Authentiques</h3>
              <p className="text-slate-500 text-sm">Qualité rigoureusement contrôlée avant expédition.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Truck className="text-brand-green mb-4" size={40} />
              <h3 className="text-lg font-bold text-brand-navy mb-2">Livraison Express</h3>
              <p className="text-slate-500 text-sm">Expédition en 24h/48h dans les grandes villes.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <PhoneCall className="text-brand-green mb-4" size={40} />
              <h3 className="text-lg font-bold text-brand-navy mb-2">Service Client Dédié</h3>
              <p className="text-slate-500 text-sm">À votre écoute sur WhatsApp 7j/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="produits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy mb-4">Nos Meilleures Ventes</h2>
            <div className="w-24 h-1 bg-brand-green mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 overflow-hidden group flex flex-col">
                {/* Product Image Box */}
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
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-brand-navy/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                {/* Product Details */}
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
                  
                  <Link 
                    href={`/product/${product.id}`}
                    className="block w-full bg-slate-900 hover:bg-brand-navy text-white text-center font-bold text-xs sm:text-base py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors border border-transparent hover:border-brand-green mt-auto"
                  >
                    Commander
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FrontFooter />
    </div>
  );
}
