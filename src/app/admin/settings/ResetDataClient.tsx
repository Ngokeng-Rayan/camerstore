"use client";

import { useState, useTransition } from "react";
import { resetOrdersAction } from "@/app/actions/settings";
import { Trash2, AlertTriangle, CheckCircle, Loader2, ShieldAlert } from "lucide-react";

export default function ResetDataClient() {
  const [step, setStep] = useState<"idle" | "confirm1" | "confirm2" | "done">("idle");
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const REQUIRED_TEXT = "REINITIALISER";

  const handleFinalReset = () => {
    if (confirmText !== REQUIRED_TEXT) {
      setError(`Veuillez saisir exactement : ${REQUIRED_TEXT}`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await resetOrdersAction();
      if (result.success) {
        setStep("done");
        setConfirmText("");
      } else {
        setError(result.error || "Une erreur est survenue.");
        setStep("idle");
      }
    });
  };

  if (step === "done") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-10">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-extrabold text-green-800 mb-2">Réinitialisation effectuée !</h3>
        <p className="text-green-700 text-sm">
          Toutes les commandes et données de livraison ont été supprimées. 
          Vos produits, catégories, avis clients et équipe sont toujours intacts.
        </p>
        <button
          onClick={() => setStep("idle")}
          className="mt-6 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-6">
      {/* Carte principale */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-red-600 p-5 flex items-center gap-3">
          <ShieldAlert size={28} className="text-white shrink-0" />
          <div>
            <h2 className="text-white font-extrabold text-lg">Zone dangereuse</h2>
            <p className="text-red-200 text-xs">Ces actions sont irréversibles</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Ce que cette action va supprimer :</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                <li>✅ Toutes les <strong>commandes</strong></li>
                <li>✅ Toutes les données de <strong>livraison</strong></li>
              </ul>
              <p className="font-bold mt-2 mb-1">Ce qui sera <span className="text-green-700">conservé</span> :</p>
              <ul className="list-disc list-inside space-y-0.5 text-green-700">
                <li>🛍️ Vos <strong>produits</strong></li>
                <li>🏷️ Vos <strong>catégories</strong></li>
                <li>⭐ Vos <strong>avis clients</strong></li>
                <li>👥 Votre <strong>équipe</strong> (comptes utilisateurs)</li>
              </ul>
            </div>
          </div>

          {step === "idle" && (
            <button
              onClick={() => setStep("confirm1")}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl transition shadow-sm"
            >
              <Trash2 size={18} />
              Réinitialiser les commandes
            </button>
          )}

          {step === "confirm1" && (
            <div className="space-y-4">
              <p className="text-slate-700 font-semibold text-center text-sm">
                Êtes-vous vraiment sûr ? Cette action est <strong className="text-red-600">irréversible</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("idle")}
                  className="flex-1 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setStep("confirm2")}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm"
                >
                  Oui, continuer
                </button>
              </div>
            </div>
          )}

          {step === "confirm2" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 font-medium">
                Pour confirmer, tapez exactement <code className="bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono font-bold">{REQUIRED_TEXT}</code> ci-dessous :
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={REQUIRED_TEXT}
                className="w-full px-4 py-2 border-2 border-red-300 rounded-xl focus:outline-none focus:border-red-500 font-mono text-center tracking-widest text-red-700 placeholder:text-red-200"
              />
              {error && <p className="text-red-600 text-xs text-center">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("idle"); setConfirmText(""); setError(null); }}
                  disabled={isPending}
                  className="flex-1 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition text-sm disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleFinalReset}
                  disabled={isPending || confirmText !== REQUIRED_TEXT}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
                >
                  {isPending ? <><Loader2 size={16} className="animate-spin" /> Suppression...</> : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
