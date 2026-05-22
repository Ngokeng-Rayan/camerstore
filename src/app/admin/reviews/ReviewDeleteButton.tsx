"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteReview } from "@/app/actions/review";

export function ReviewDeleteButton({ id, productId }: { id: string, productId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Voulez-vous vraiment supprimer cet avis ?")) {
      startTransition(async () => {
        await deleteReview(id, productId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Supprimer l'avis"
    >
      <Trash2 size={20} />
    </button>
  );
}
