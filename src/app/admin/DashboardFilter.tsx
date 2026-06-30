"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Package } from "lucide-react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

type Product = { id: string; title: string };

export function DashboardFilter({ products = [] }: { products?: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "all";
  const productId = searchParams.get("productId") || "all";

  const navigate = (newPeriod: string, newProductId: string) => {
    const params = new URLSearchParams();
    if (newPeriod !== "all") params.set("period", newPeriod);
    if (newProductId !== "all") params.set("productId", newProductId);
    router.push(`/admin${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {/* Filtre par Période */}
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <Filter size={16} className="text-slate-400" />
        <select 
          value={period}
          onChange={(e) => navigate(e.target.value, productId)}
          className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(new Date(), i);
            const value = format(d, 'yyyy-MM-dd');
            let label = format(d, 'EEEE d MMMM', { locale: fr });
            label = label.charAt(0).toUpperCase() + label.slice(1);
            if (i === 0) label = `Aujourd'hui (${label})`;
            if (i === 1) label = `Hier (${label})`;
            return (
              <option key={value} value={value}>{label}</option>
            );
          })}
          <option disabled>──────────</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
          <option value="all">Historique global</option>
        </select>
      </div>

      {/* Filtre par Produit */}
      {products.length > 0 && (
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Package size={16} className="text-slate-400" />
          <select
            value={productId}
            onChange={(e) => navigate(period, e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer max-w-[180px]"
          >
            <option value="all">Tous les produits</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.title.length > 30 ? p.title.substring(0, 30) + '…' : p.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
