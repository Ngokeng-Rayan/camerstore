"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "PageView");
  }
};

// Fonction utilitaire pour traquer les événements spécifiques
export const fbEvent = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, options);
  }
};

// Fonction utilitaire pour les événements personnalisés
export const fbCustomEvent = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", name, options);
  }
};

// Utilitaire pour lire le cookie _fbp (Facebook Pixel Browser ID)
export function getFbp(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)_fbp=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Utilitaire pour lire ou créer le cookie _fbc (Facebook Click ID)
export function getFbc(): string | null {
  if (typeof document === "undefined" || typeof window === "undefined") return null;
  // Vérifier si _fbc existe déjà
  const match = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  // Sinon, le créer à partir du paramètre fbclid dans l'URL
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    document.cookie = `_fbc=${fbc}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
    return fbc;
  }
  return null;
}

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!FB_PIXEL_ID) return;
    
    // S'assurer que le Pixel a le temps de charger avant de tracker le premier PageView
    if (loaded) {
      pageview();
    }

    // Stocker le _fbc si fbclid est dans l'URL
    getFbc();
  }, [pathname, searchParams, loaded]);

  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
          `,
        }}
        onLoad={() => setLoaded(true)}
      />
      {/* Fallback noscript pour les navigateurs sans JavaScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
