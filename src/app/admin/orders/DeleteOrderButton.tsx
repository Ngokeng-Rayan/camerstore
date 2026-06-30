"use client";

import { useState } from "react";
import { deleteOrder } from "@/app/actions/deleteOrder";
import { Trash2, AlertTriangle, X } from "lucide-react";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteOrder(orderId);
    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
      setIsOpen(false);
    }
    // Si succès, la page se revalide automatiquement et la commande disparaît
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Supprimer la commande"
        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        <Trash2 size={15} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Supprimer cette commande ?</h3>
              <p className="text-sm text-slate-500">
                Cette action est <strong>irréversible</strong>. La commande sera définitivement effacée de la base de données.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Trash2 size={15} />
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
