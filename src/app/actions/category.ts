"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { success: false, error: "Nom requis" };

  try {
    await prisma.category.create({ data: { name } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur ou catégorie existante" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
