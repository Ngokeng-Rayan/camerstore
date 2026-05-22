"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Menu, X, MessageSquareHeart, Tags, Truck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSidebar({ role }: { role: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-brand-navy text-white p-2 rounded-lg shadow-md"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-brand-navy text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider flex items-center gap-2">
            <Package className="text-brand-green" />
            CAMER<span className="text-brand-green">STORE</span>
          </h1>
          <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="px-6 pb-4">
           <p className="text-xs text-slate-400 uppercase tracking-widest">Back-office</p>
           <div className="mt-1 inline-block px-2 py-1 bg-white/10 rounded text-[10px] font-bold tracking-wider text-brand-green">
             RÔLE: {role}
           </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          {/* L'ADMIN voit tout */}
          {role === "ADMIN" && (
            <Link onClick={() => setIsSidebarOpen(false)} href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
              <LayoutDashboard size={20} />
              Tableau de bord
            </Link>
          )}

          {/* Tout le monde (ADMIN et CLOSER) voit le CRM */}
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
            <ShoppingCart size={20} />
            Commandes (CRM)
          </Link>
          <Link onClick={() => setIsSidebarOpen(false)} href="/admin/deliveries" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
            <Truck size={20} />
            Livraisons
          </Link>

          {/* Seul l'ADMIN voit les produits et l'équipe */}
          {role === "ADMIN" && (
            <>
              <Link onClick={() => setIsSidebarOpen(false)} href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <Package size={20} />
                Produits
              </Link>
              <Link onClick={() => setIsSidebarOpen(false)} href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <Tags size={20} />
                Catégories
              </Link>
              <Link onClick={() => setIsSidebarOpen(false)} href="/admin/reviews" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <MessageSquareHeart size={20} />
                Avis Clients
              </Link>
              <Link onClick={() => setIsSidebarOpen(false)} href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <Users size={20} />
                Équipe
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-brand-red hover:text-white transition-colors text-slate-300"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
