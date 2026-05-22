"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "all";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/admin?period=${e.target.value}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
      <Filter size={16} className="text-slate-400" />
      <select 
        value={period}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const d = subDays(new Date(), i);
          const value = format(d, 'yyyy-MM-dd');
          let label = format(d, 'EEEE d MMMM', { locale: fr });
          // Capitalize first letter
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
  );
}
