"use client";

import { useState } from "react";
import { updateOrderExpenses } from "@/app/actions/orderExpenses";
import { Calculator, X, Save } from "lucide-react";

export function OrderExpensesModal({ orderId, deliveryNotes }: { orderId: string, deliveryNotes: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Extraire les valeurs existantes si on a déjà sauvegardé en JSON
  let initialDelivery = 0;
  let initialAd = 0;
  try {
    if (deliveryNotes && deliveryNotes.trim().startsWith("{")) {
      const parsed = JSON.parse(deliveryNotes);
      if (parsed.expenses) {
        initialDelivery = parsed.expenses.deliveryCost || 0;
        initialAd = parsed.expenses.adCost || 0;
      }
    }
  } catch(e) {}

  const [deliveryCost, setDeliveryCost] = useState(initialDelivery);
  const [adCost, setAdCost] = useState(initialAd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await updateOrderExpenses(orderId, { deliveryCost, adCost });
    setIsLoading(false);
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1 px-3 rounded flex items-center gap-1 transition-colors border border-slate-200"
      >
        <Calculator size={12} />
        {(initialDelivery > 0 || initialAd > 0) ? "Modifier Dépenses" : "Ajouter Dépenses"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-brand-green" />
              Dépenses de Commande
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Frais de Livraison (FCFA)
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={deliveryCost === 0 ? "" : deliveryCost}
                  onChange={(e) => setDeliveryCost(Number(e.target.value) || 0)}
                  placeholder="Ex: 1500"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Frais Publicitaires (CPA estimé en FCFA)
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={adCost === 0 ? "" : adCost}
                  onChange={(e) => setAdCost(Number(e.target.value) || 0)}
                  placeholder="Ex: 2000"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
              
              <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm flex justify-between font-bold text-slate-800">
                <span>Total Dépenses :</span>
                <span className="text-red-500">{(deliveryCost + adCost).toLocaleString('fr-FR')} FCFA</span>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-navy hover:bg-slate-800 text-white font-bold py-2 rounded flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
