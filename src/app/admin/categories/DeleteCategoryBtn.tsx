"use client";

import { useState } from "react";
import { deleteCategoryAction } from "@/app/actions/category";
import { Trash2 } from "lucide-react";

export default function DeleteCategoryBtn({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    setIsDeleting(true);
    const result = await deleteCategoryAction(id);
    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors flex items-center gap-1"
    >
      <Trash2 size={16} />
      {isDeleting ? "..." : "Supprimer"}
    </button>
  );
}
