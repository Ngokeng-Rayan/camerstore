import prisma from "@/lib/prisma";
import Link from "next/link";
import { Star, MessageSquareHeart, Trash2 } from "lucide-react";
import Image from "next/image";
import { ReviewDeleteButton } from "./ReviewDeleteButton";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy flex items-center gap-2">
          <MessageSquareHeart className="text-brand-green" size={28} />
          Avis Clients (Témoignages)
        </h1>
        <Link 
          href="/admin/reviews/new"
          className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-green-600 transition-colors"
        >
          + Ajouter un Avis
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Aucun avis client pour le moment. Ajoutez-en un pour booster vos conversions !
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800">{review.customerName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-bold text-brand-navy bg-slate-100 px-2 py-1 rounded">
                      Produit: {review.product.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-300" : ""} />
                    ))}
                  </div>
                  <p className="text-slate-600 italic">"{review.content}"</p>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-4">
                  {review.images.length > 0 && (
                    <div className="flex gap-2">
                      {review.images.map((img, index) => (
                        <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                          <Image src={img} alt="Avis" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <ReviewDeleteButton id={review.id} productId={review.productId} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
