"use client";

import { usePathname } from "next/navigation";
import { PhoneCall } from "lucide-react";

export function FloatingCallButton() {
  const pathname = usePathname();

  // Ne pas afficher sur les pages d'administration ou de connexion
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
    return null;
  }

  const phoneNumber = "+237687527629";
  const displayPhone = "687 52 76 29";

  return (
    <aside aria-label="Contact téléphonique direct" className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center group">
      <a
        href={`tel:${phoneNumber}`}
        className="relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/80"
        title="Appeler directement"
        aria-label={`Appeler le service client au ${displayPhone}`}
      >
        {/* Effet d'ondulation / pulsation d'appel */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 animate-ping -z-10" />

        <div className="bg-white text-emerald-600 p-2 rounded-full flex items-center justify-center shrink-0 shadow-inner">
          <PhoneCall size={18} className="animate-bounce" />
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 leading-tight">
            Appelez-nous
          </span>
          <span className="text-sm font-extrabold tracking-wide leading-tight">
            {displayPhone}
          </span>
        </div>
      </a>
    </aside>
  );
}
