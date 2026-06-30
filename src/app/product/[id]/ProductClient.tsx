"use client";

import { useState, useEffect, useId } from "react";
import { Star, Truck, ShieldCheck, Clock, ChevronRight, ChevronLeft, User, Phone, MapPin, Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
import { createOrder } from "@/app/actions/order";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FrontNavbar } from "@/components/FrontNavbar";
import { FrontFooter } from "@/components/FrontFooter";
import { fbEvent, getFbc } from "@/components/FacebookPixel";

export default function ProductClient({ product, reviews }: { product: any, reviews: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [eventId] = useState(() => crypto.randomUUID());
  const [hasOrdered, setHasOrdered] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);
  
  // Fake urgency state (Shopify apps cost $25/mo for this)
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [hasClickedSticky, setHasClickedSticky] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupCity, setPopupCity] = useState("Douala");
  const [popupTime, setPopupTime] = useState("À l'instant");
  const [popupType, setPopupType] = useState<"city" | "review">("city");

  // Réductions par quantité
  const getDiscount = (qty: number) => {
    if (qty >= 3) return 0.35; // -35%
    if (qty >= 2) return 0.20; // -20%
    return 0;
  };
  const discount = getDiscount(quantity);
  const unitPrice = Math.round(product.sellingPrice * (1 - discount));
  const totalPrice = unitPrice * quantity;
  const totalWithoutDiscount = product.sellingPrice * quantity;
  const savings = totalWithoutDiscount - totalPrice;
  const [popupReview, setPopupReview] = useState<{ customerName: string; content: string; rating: number } | null>(null);

  useEffect(() => {
    // Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Fake sales popups — Séquence orchestrée
    const POPUP_DISPLAY_DURATION = 4000; // Durée d'affichage de chaque popup
    const allTimers: NodeJS.Timeout[] = [];

    const showCityPopup = (city: string, time: string) => {
      setPopupType("city");
      setPopupCity(city);
      setPopupTime(time);
      setShowPopup(true);
      const hideTimer = setTimeout(() => setShowPopup(false), POPUP_DISPLAY_DURATION);
      allTimers.push(hideTimer);
    };

    const showReviewPopup = (review: { customerName: string; content: string; rating: number }) => {
      setPopupType("review");
      setPopupReview(review);
      setShowPopup(true);
      const hideTimer = setTimeout(() => setShowPopup(false), POPUP_DISPLAY_DURATION);
      allTimers.push(hideTimer);
    };

    // Étape 1 : Popup Douala après 3 secondes
    const step1Timer = setTimeout(() => {
      showCityPopup("Douala", "À l'instant");

      // Étape 2 : Popups avis clients (5s d'intervalle chacun) après Douala
      if (reviews.length > 0) {
        reviews.forEach((review, index) => {
          const reviewDelay = POPUP_DISPLAY_DURATION + 1000 + (index * 5000); // 1s pause après Douala, puis 5s entre chaque
          const reviewTimer = setTimeout(() => {
            showReviewPopup({ customerName: review.customerName, content: review.content, rating: review.rating });
          }, reviewDelay);
          allTimers.push(reviewTimer);
        });

        // Étape 3 : Popups villes aléatoires toutes les 60s, après tous les avis
        const afterAllReviewsDelay = POPUP_DISPLAY_DURATION + 1000 + (reviews.length * 5000) + 1000;
        const startCityLoopTimer = setTimeout(() => {
          const cities = ["Yaoundé", "Bafoussam", "Garoua", "Kribi", "Maroua", "Ngaoundéré", "Bamenda", "Limbe", "Edéa", "Bertoua", "Ebolowa"];
          const times = ["À l'instant", "Il y a 2 minutes", "Il y a 4 minutes", "Il y a 7 minutes", "Il y a 12 minutes"];
          const cityInterval = setInterval(() => {
            showCityPopup(
              cities[Math.floor(Math.random() * cities.length)],
              times[Math.floor(Math.random() * times.length)]
            );
          }, 60000);
          allTimers.push(cityInterval as unknown as NodeJS.Timeout);
        }, afterAllReviewsDelay);
        allTimers.push(startCityLoopTimer);
      } else {
        // Pas d'avis → passer directement aux popups villes après 60s
        const startCityLoopTimer = setTimeout(() => {
          const cities = ["Yaoundé", "Bafoussam", "Garoua", "Kribi", "Maroua", "Ngaoundéré", "Bamenda", "Limbe", "Edéa", "Bertoua", "Ebolowa"];
          const times = ["À l'instant", "Il y a 2 minutes", "Il y a 4 minutes", "Il y a 7 minutes", "Il y a 12 minutes"];
          const cityInterval = setInterval(() => {
            showCityPopup(
              cities[Math.floor(Math.random() * cities.length)],
              times[Math.floor(Math.random() * times.length)]
            );
          }, 60000);
          allTimers.push(cityInterval as unknown as NodeJS.Timeout);
        }, POPUP_DISPLAY_DURATION + 60000); // 60s après Douala
        allTimers.push(startCityLoopTimer);
      }
    }, 3000); // Premier popup après 3 secondes
    allTimers.push(step1Timer);

    // Stocker le _fbc si fbclid est dans l'URL
    getFbc();

    // Tracker l'événement ViewContent Facebook
    fbEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      value: product.sellingPrice,
      currency: "XAF"
    });

    // Exit-intent : détecter quand l'utilisateur veut quitter
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitPopupShown && !hasOrdered) {
        setShowExitPopup(true);
        setExitPopupShown(true);
      }
    };
    // Mobile : détecter le bouton retour via l'événement popstate
    const handleBackButton = () => {
      if (!exitPopupShown && !hasOrdered) {
        setShowExitPopup(true);
        setExitPopupShown(true);
        // Empêcher la navigation immédiate
        window.history.pushState(null, '', window.location.href);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      clearInterval(timer);
      allTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [product, exitPopupShown, hasOrdered]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("productId", product.id);
    formData.append("eventId", eventId);
    formData.append("quantity", quantity.toString()); // Optionnel: tu pourras l'ajouter à ta DB plus tard

    const result = await createOrder(formData);

    if (result.success) {
      if (result.isBot) {
        // Si c'est un bot bloqué par le honeypot, on fait semblant que tout s'est bien passé
        // mais on n'envoie PAS d'événements Pixel et on réinitialise juste le formulaire.
        setIsSubmitting(false);
        setHasOrdered(true);
        return;
      }

      setHasOrdered(true);
      // Le client a rempli le formulaire COD mais n'a pas encore payé/confirmé au téléphone.
      // On envoie 'InitiateCheckout' au lieu de 'Purchase' pour ne pas fausser l'algorithme de Meta.
      fbEvent("InitiateCheckout", {
        content_ids: [product.id],
        content_name: product.title,
        content_type: "product",
        value: totalPrice,
        currency: "XAF"
      });
      fbEvent("Lead", {
        content_name: product.title,
        currency: "XAF",
        value: totalPrice
      });
      
      // Déclenche l'envoi de l'email en arrière-plan sans bloquer
      fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: result.orderId })
      }).catch(console.error);

      // Redirection immédiate pour éviter tout blocage (remplace router.push par un changement de location direct)
      window.location.href = `/product/${product.id}/upsell?orderId=${result.orderId}`;
    } else {
      alert(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* Fake Sales / Review Popup */}
      <div className={`fixed top-24 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white p-4 rounded-xl shadow-2xl border border-brand-green/30 z-[100] transition-all duration-500 flex items-center gap-4 ${showPopup ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        {popupType === "city" ? (
          <>
            <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden relative">
              {product.images?.[0] && <Image src={product.images[0]} alt="Produit" fill className="object-cover" />}
            </div>
            <div>
              <p className="text-sm text-slate-600">Quelqu&apos;un de <strong className="text-brand-navy">{popupCity}</strong> vient d&apos;acheter</p>
              <p className="font-bold text-brand-navy text-sm line-clamp-1">{product.title}</p>
              <p className="text-xs text-slate-400">{popupTime}</p>
            </div>
          </>
        ) : popupReview ? (
          <>
            <div className="w-12 h-12 bg-brand-green/20 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-brand-navy font-bold text-lg">{popupReview.customerName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="font-bold text-brand-navy text-sm">{popupReview.customerName}</span>
                <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              </div>
              <div className="flex mb-1">
                {[...Array(popupReview.rating)].map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-xs text-slate-600 italic line-clamp-2">&quot;{popupReview.content}&quot;</p>
            </div>
          </>
        ) : null}
      </div>

      {/* Top Banner Warning */}
      <div className="bg-brand-red text-white text-center py-2 text-xs md:text-sm font-bold tracking-wide">
        NE COMMANDEZ PAS SI VOUS N'ÊTES PAS PRÊT POUR ACHETER 🎈
      </div>

      <FrontNavbar />

      <main className="max-w-xl md:max-w-md mx-auto mt-6 bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        {/* Product Image Carousel */}
        <div className="bg-white aspect-[4/3] md:aspect-video w-full relative flex items-center justify-center overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <>
              <Image src={product.images[currentImageIndex]} alt={product.title} fill className="object-contain" />
              
              {/* Flèches de navigation si plus d'une image */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md text-slate-800 hover:bg-white transition-colors z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md text-slate-800 hover:bg-white transition-colors z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                  {/* Points de pagination */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {product.images.map((_: any, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-brand-green w-4' : 'bg-white/70'}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
             <p className="text-slate-400 font-medium">Image du Produit</p>
          )}
          {product.comparePrice && (
            <div className="absolute top-4 left-4 bg-brand-red text-white font-bold px-3 py-1 rounded-full text-sm z-20 shadow-md">
              Promo
            </div>
          )}
        </div>

        {/* Scarcity Box (N°1) */}
        <div className="mx-4 mt-4 border-2 border-brand-red text-brand-red p-2 text-center font-bold text-xs md:text-sm tracking-wider bg-white rounded-lg">
          LE N°1 EN AFRIQUE FRANCOPHONE | SEULEMENT 5 DISPONIBLES |
        </div>

        <div className="p-4 md:p-6">
          {/* Social Proof (Stars) */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-600 ml-1">({reviews.length > 0 ? reviews.length + 1520 : 6432} Clients satisfaits)</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 leading-tight">
            {product.title}
          </h2>
          
          <div className="flex items-end gap-3 mb-2 mt-4">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{product.sellingPrice.toLocaleString('fr-FR')} FCFA</span>
            {product.comparePrice && (
              <span className="text-base text-red-500 line-through mb-1">{product.comparePrice.toLocaleString('fr-FR')} FCFA</span>
            )}
          </div>
          
          {product.comparePrice && (
            <div className="bg-brand-green text-brand-navy inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold mb-6 shadow-sm">
              🏷️ ECONOMISEZ {Math.round((1 - product.sellingPrice / product.comparePrice) * 100)}%
            </div>
          )}

          <div className="mt-2" id="order-form">
            {/* Nouveau Formulaire Haute Conversion COD */}
            <div className="border-2 border-brand-green shadow-xl rounded-3xl p-4 md:p-6 bg-white relative">
              <div className="text-center text-sm md:text-base font-bold text-brand-red leading-relaxed mb-6 bg-red-50 p-3 rounded-xl border border-brand-red/20">
                <span className="text-xl">🚨</span> Par respect pour notre équipe <span className="text-xl">🙏</span>, merci de ne pas commander si vous êtes en voyage <span className="text-xl">🧳</span>, indisponible <span className="text-xl">🚫</span> ou pas prêt(e) financièrement pour acheter <span className="text-xl">💸 ‼️</span>
              </div>
              
              {/* Résumé du Panier */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  {product.images?.[0] && <Image src={product.images[0]} alt="Produit" fill className="object-cover" />}
                  <span className="absolute -top-2 -right-2 bg-slate-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">{quantity}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-brand-navy text-sm md:text-base line-clamp-2">{product.title}</h4>
                </div>
                <div className="font-bold text-brand-navy shrink-0">
                  {product.sellingPrice.toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              {/* Offres par Quantité */}
              <div className="flex flex-col gap-3 mb-6 mt-2">
                {[
                  { qty: 1, discountStr: null, discountPct: 0, label: "Achetez 1 article" },
                  { qty: 2, discountStr: "20%", discountPct: 0.20, label: "Achetez 2 articles", badge: "Populaire 🔥", badgeColor: "bg-orange-500" },
                  { qty: 3, discountStr: "35%", discountPct: 0.35, label: "Achetez 3 articles", badge: "Meilleur Deal 💰", badgeColor: "bg-brand-red" }
                ].map((option) => {
                  const isSelected = quantity === option.qty || (option.qty === 3 && quantity >= 3);
                  const itemTotalPrice = Math.round(product.sellingPrice * option.qty * (1 - option.discountPct));
                  const originalPrice = product.sellingPrice * option.qty;
                  
                  return (
                    <button
                      key={option.qty}
                      type="button"
                      onClick={() => setQuantity(option.qty)}
                      className={`p-3 rounded-xl border-2 text-left transition-all relative flex items-center justify-between ${isSelected ? 'border-brand-green bg-brand-green/5 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      {option.badge && (
                        <div className={`absolute -top-2 left-4 ${option.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                          {option.badge}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 md:gap-3">
                        {/* Radio icon */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-green' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-brand-green rounded-full" />}
                        </div>
                        
                        {/* Text content */}
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-brand-navy text-xs md:text-[13px] leading-tight">{option.label}</span>
                          {option.discountStr ? (
                            <span className="bg-brand-green text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded w-fit inline-block">
                              de réduction {option.discountStr}
                            </span>
                          ) : (
                            <span className="bg-slate-300 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded w-fit inline-block">
                              de réduction 0%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: Prices and Image */}
                      <div className="flex items-center gap-2 md:gap-3 text-right">
                        <div className="flex flex-col items-end justify-center">
                           {option.discountPct > 0 && (
                             <span className="text-[10px] text-red-500 line-through font-semibold">FCFA {originalPrice.toLocaleString('fr-FR')}</span>
                           )}
                           <span className="font-extrabold text-slate-900 text-xs md:text-[13px]">FCFA {itemTotalPrice.toLocaleString('fr-FR')}</span>
                        </div>
                        
                        {/* Thumbnail */}
                        {product.images?.[0] && (
                          <div className="w-10 h-10 rounded border border-slate-200 relative overflow-hidden shrink-0 bg-slate-50 hidden sm:block">
                            <Image src={product.images[0]} alt="Miniature" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sélecteur de Quantité fin */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-bold text-brand-navy min-w-[40px] text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Badge de réduction si applicable */}
              {discount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
                  <p className="text-green-700 font-bold text-sm">🎉 Réduction de {Math.round(discount * 100)}% appliquée ! Vous économisez {savings.toLocaleString('fr-FR')} FCFA</p>
                </div>
              )}

              {/* Totaux */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-2 text-sm md:text-base">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total ({quantity}x)</span>
                  {discount > 0 ? (
                    <div className="text-right">
                      <span className="text-slate-400 line-through text-xs mr-2">{totalWithoutDiscount.toLocaleString('fr-FR')} FCFA</span>
                      <span className="font-bold text-brand-navy">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ) : (
                    <span className="font-bold text-brand-navy">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                  )}
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Livraison</span>
                  <span className="font-bold text-brand-navy">Gratuit</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 mt-2 text-lg">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="font-bold text-brand-navy">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Option Livraison */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl mb-6 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-brand-navy bg-white"></div>
                  <span className="text-sm font-medium text-slate-700">Livraison gratuite</span>
                </div>
                <span className="font-bold text-brand-navy text-sm">Gratuit</span>
              </div>

              {/* Formulaire Champs */}
              <form id="order-inputs" onSubmit={handleSubmit} onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} className="space-y-4 scroll-mt-32">
                <div>
                  <label className="block text-sm font-bold text-brand-navy mb-1">Nom et Prenom<span className="text-red-500">*</span></label>
                  <div className="flex items-stretch border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-green focus-within:border-brand-green transition-all bg-white">
                    <div className="bg-slate-100 px-4 flex items-center justify-center border-r border-slate-300 text-slate-500">
                      <User size={18} />
                    </div>
                    <input name="customerName" required type="text" placeholder="Nom complet" className="w-full px-4 py-3 outline-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-brand-navy mb-1">Numéro<span className="text-red-500">*</span></label>
                  <div className="flex items-stretch border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-green focus-within:border-brand-green transition-all bg-white">
                    <div className="bg-slate-100 px-4 flex items-center justify-center border-r border-slate-300 text-slate-500">
                      <Phone size={18} />
                    </div>
                    <input name="customerPhone" required type="tel" placeholder="WhatsApp de préférence" className="w-full px-4 py-3 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-navy mb-1">Ville, Quartier<span className="text-red-500">*</span></label>
                  <div className="flex items-stretch border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-green focus-within:border-brand-green transition-all bg-white">
                    <div className="bg-slate-100 px-4 flex items-center justify-center border-r border-slate-300 text-slate-500">
                      <MapPin size={18} />
                    </div>
                    <input name="customerCity" required type="text" placeholder="Exp: Douala, Akwa" className="w-full px-4 py-3 outline-none" />
                  </div>
                  {/* Note: Pour la db, on mappe customerCity à city et on ignore address, ou on garde un input combiné. Dans l'action "createOrder", on gère customerCity et customerAddress. Je vais ajouter un champ caché pour éviter que ça ne crash */}
                  <input type="hidden" name="customerAddress" value="Fourni dans le champ ville/quartier" />
                  {/* Honeypot anti-bot : ce champ est caché, un humain ne le remplit jamais */}
                  <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                </div>
                <div className="mt-6"></div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-green hover:bg-lime-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-brand-navy font-extrabold text-sm md:text-base py-4 rounded-xl flex items-center justify-center gap-3 transition-all mt-6 shadow-xl animate-heartbeat"
                >
                  <ShoppingBag size={20} />
                  {isSubmitting ? "EN COURS..." : `COMMANDEZ MAINTENANT`}
                </button>

                {/* Countdown Box */}
                <div className="bg-red-50 border border-brand-red/30 p-3 rounded-lg text-center mt-4">
                  <div className="text-brand-red font-bold text-sm flex items-center justify-center gap-2">
                    <Clock size={16} />
                    L'offre spéciale se termine dans
                  </div>
                  <div className="text-brand-red font-extrabold text-xl mt-1">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <p className="text-center text-brand-red font-bold text-xs uppercase mt-4">
                  COMMANDEZ UNIQUEMENT SI VOUS ETES PRET POUR ACHETER
                </p>
              </form>
            </div>
          </div>

          {/* Description en bas du formulaire */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-brand-navy mb-4">Description détaillée</h3>
            <div className="text-slate-600 text-sm md:text-base leading-relaxed space-y-4">
              <p className="whitespace-pre-line">{product.description}</p>
              
              {/* Médias de description */}
              {product.descriptionMedia && product.descriptionMedia.length > 0 && (
                <div className="flex flex-col gap-4 mt-6">
                  {product.descriptionMedia.map((mediaUrl: string, idx: number) => {
                    const isVideo = mediaUrl.toLowerCase().endsWith('.mp4');
                    return (
                      <div key={idx} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
                        {isVideo ? (
                          <video 
                            src={mediaUrl} 
                            controls 
                            muted
                            className="w-full h-auto max-h-[60vh] object-contain"
                            preload="metadata"
                          />
                        ) : (
                          <div className="relative w-full aspect-square md:aspect-[4/3]">
                            <Image src={mediaUrl} alt={`Description média ${idx+1}`} fill className="object-contain" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real Reviews Section */}
        {reviews.length > 0 && (
          <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-brand-navy mb-4">Avis Clients ({reviews.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reviews.map((review) => {
                const hasAvatar = review.images && review.images.length > 0;
                const avatarUrl = hasAvatar ? review.images[0] : null;
                const initial = review.customerName ? review.customerName.charAt(0).toUpperCase() : "C";

                return (
                  <div key={review.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Avatar */}
                      {avatarUrl ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                          <Image src={avatarUrl} alt={review.customerName} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-navy flex items-center justify-center font-bold text-sm shrink-0">
                          {initial}
                        </div>
                      )}
                      
                      {/* Name & Badge */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-brand-navy text-[11px] md:text-sm truncate">{review.customerName}</span>
                          <svg className="w-3 h-3 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        </div>
                        <div className="flex">
                           {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <p className="text-[11px] md:text-xs text-slate-600 italic">"{review.content}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <div className="mt-20">
        <FrontFooter />
      </div>

      {/* Sticky Bottom Button */}
      <div className={`fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-50 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] justify-center md:hidden transition-transform duration-300 ${isInputFocused ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 flex'}`}>
        <button 
          onClick={() => {
            fbEvent("AddToCart", {
              content_ids: [product.id],
              content_name: product.title,
              content_type: "product",
              value: product.sellingPrice,
              currency: "XAF"
            });
            if (!hasClickedSticky) {
              setHasClickedSticky(true);
              document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              document.getElementById('order-inputs')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full max-w-xl bg-brand-green hover:bg-lime-500 text-brand-navy font-extrabold text-base py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg animate-heartbeat"
        >
          <ShoppingBag size={24} />
          COMMANDER MAINTENANT
        </button>
      </div>

      {/* Exit-Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-2xl animate-scaleIn">
            {/* Bouton fermer */}
            <button 
              onClick={() => setShowExitPopup(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
            >
              ✕
            </button>

            {/* Contenu */}
            <div className="text-center">
              <div className="text-4xl mb-3">😱</div>
              <h3 className="text-xl font-extrabold text-brand-navy mb-2">Attendez ! Ne partez pas...</h3>
              <p className="text-slate-600 text-sm mb-4">
                Vous allez manquer une offre exceptionnelle ! Ce produit est très demandé et le stock est <strong className="text-brand-red">très limité</strong>.
              </p>

              {/* Mini récap produit */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl mb-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  {product.images?.[0] && <Image src={product.images[0]} alt="Produit" fill className="object-cover" />}
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-brand-navy text-sm line-clamp-2">{product.title}</p>
                  <p className="text-brand-red font-extrabold">{product.sellingPrice.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>

              {/* Offre spéciale */}
              <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-3 mb-4">
                <p className="text-brand-navy font-bold text-sm">🎁 Achetez 2 et bénéficiez de <span className="text-brand-red">-20%</span> immédiatement !</p>
              </div>

              {/* CTA */}
              <button 
                onClick={() => {
                  setShowExitPopup(false);
                  document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-brand-green hover:bg-lime-500 text-brand-navy font-extrabold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg animate-heartbeat"
              >
                <ShoppingBag size={20} />
                OUI, JE VEUX EN PROFITER !
              </button>

              <button 
                onClick={() => setShowExitPopup(false)}
                className="mt-3 text-slate-400 text-xs hover:text-slate-600 transition-colors"
              >
                Non merci, je préfère rater cette offre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
