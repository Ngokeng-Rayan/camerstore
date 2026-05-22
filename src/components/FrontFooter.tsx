import { Package } from "lucide-react";

export function FrontFooter() {
  return (
    <footer className="bg-brand-navy text-slate-400 py-12 border-t border-white/10" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-6">
          <Package className="text-brand-green" size={24} />
          <span className="text-xl font-bold tracking-widest text-white uppercase">
            Camer<span className="text-brand-green">Store</span>
          </span>
        </div>
        <p className="mb-6">Le choix de la qualité. Livraison rapide partout au Cameroun.</p>
        <p className="text-sm">© 2026 CamerStore. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
