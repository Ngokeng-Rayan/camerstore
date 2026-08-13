"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orderStatus";

const STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-yellow-100 text-yellow-800 border-yellow-200",
  REFUSED_CALL: "bg-orange-100 text-orange-800 border-orange-200",
  CALL_BACK_LATER: "bg-teal-100 text-teal-800 border-teal-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  return (
    <div className="relative">
      <select 
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-navy ${STATUS_COLORS[currentStatus] || "bg-slate-100 text-slate-800"}`}
      >
        <option value="NEW_LEAD">🟡 Nouveau Lead</option>
        <option value="REFUSED_CALL">🟠 Refusé au tél.</option>
        <option value="CALL_BACK_LATER">🕒 À rappeler plus tard</option>
        <option value="CONFIRMED">🔵 Confirmé au tél.</option>
        <option value="OUT_FOR_DELIVERY">🟣 En cours de livraison</option>
        <option value="DELIVERED">🟢 Livré</option>
        <option value="CANCELLED">🔴 Annulé / Faux Numéro</option>
      </select>
      {/* Custom arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}
