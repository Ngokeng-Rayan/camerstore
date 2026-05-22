"use client";

import { useState } from "react";
import { createCategoryAction } from "@/app/actions/category";
import { Plus } from "lucide-react";

export default function CategoryForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createCategoryAction(formData);
    
    if (result.success) {
      (e.target as HTMLFormElement).reset();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 max-w-md">
      <input 
        type="text" 
        name="name" 
        placeholder="Nom de la catégorie" 
        required 
        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none" 
      />
      <button 
        type="submit" 
        disabled={isLoading}
        className="bg-brand-green hover:bg-lime-500 text-brand-navy font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
      >
        <Plus size={18} />
        Ajouter
      </button>
    </form>
  );
}
