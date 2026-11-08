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
    <aside aria-label="Contact téléphonique direct" className="fixed bottom-20 md:bottom-6 right-3 md:right-5 z-40 flex items-center group">
      <a
        href={`tel:${phoneNumber}`}
        className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/90"
        title="Appeler directement"
        aria-label={`Appeler le service client au ${displayPhone}`}
      >
        {/* Effet de vibration et d'onde derrière */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-60 animate-ping -z-10" />
        <span className="absolute -inset-2 rounded-full bg-emerald-400 opacity-30 animate-pulse -z-10" />

        <div className="bg-white text-emerald-600 p-1.5 rounded-full flex items-center justify-center shrink-0 shadow-sm">
          <PhoneCall size={13} className="animate-bounce" />
        </div>

        <div className="flex flex-col text-left pr-0.5">
          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-100 leading-none mb-0.5">
            Appel direct
          </span>
          <span className="text-xs font-black tracking-wide leading-none">
            {displayPhone}
          </span>
        </div>
      </a>
    </aside>
  );
}
