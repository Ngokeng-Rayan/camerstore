"use client";

import { useState } from "react";
import { deleteUserAction } from "@/app/actions/user";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment révoquer cet accès ?")) return;
    
    setIsDeleting(true);
    const result = await deleteUserAction(userId);
    
    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-brand-red hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
    >
      {isDeleting ? "..." : "Révoquer"}
    </button>
  );
}
