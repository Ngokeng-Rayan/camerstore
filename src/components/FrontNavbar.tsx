"use client";

import Link from "next/link";
import { Package, Menu, X } from "lucide-react";
import { useState } from "react";

export function FrontNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-brand-navy text-brand-green py-2 text-center text-xs sm:text-sm font-semibold tracking-wide border-b border-brand-green/20">
        Livraison gratuite à Douala et Yaoundé ! Paiement à la livraison.
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <Package className="text-brand-green" size={32} />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-widest text-brand-navy uppercase">
                  Camer<span className="text-brand-green">Store</span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase font-bold">
                  Le choix de la qualité
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
              <Link href="/" className="text-slate-600 hover:text-brand-green font-medium transition-colors">Accueil</Link>
              <Link href="/produits" className="text-slate-600 hover:text-brand-green font-medium transition-colors">Nos Produits</Link>
              <Link href="/contact" className="text-slate-600 hover:text-brand-green font-medium transition-colors">Contact</Link>
              <Link href="/login" className="bg-brand-navy hover:bg-slate-800 text-white px-5 py-2 rounded-full font-medium transition-colors text-sm">
                Connexion
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
            <div className="flex flex-col px-4 pt-2 pb-6 space-y-4">
              <Link onClick={() => setIsOpen(false)} href="/" className="text-slate-600 hover:text-brand-green font-bold transition-colors">Accueil</Link>
              <Link onClick={() => setIsOpen(false)} href="/produits" className="text-slate-600 hover:text-brand-green font-bold transition-colors">Nos Produits</Link>
              <Link onClick={() => setIsOpen(false)} href="/contact" className="text-slate-600 hover:text-brand-green font-bold transition-colors">Contact</Link>
              <Link onClick={() => setIsOpen(false)} href="/login" className="bg-brand-navy text-white text-center font-bold py-3 rounded-xl mt-2">Connexion</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
