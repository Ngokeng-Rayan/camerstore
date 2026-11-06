"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Supprime TOUTES les commandes (et donc toutes les livraisons associées,
 * puisque les données de livraison sont des champs sur le modèle Order).
 * Les produits, catégories, avis clients et utilisateurs sont conservés.
 */
export async function resetOrdersAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.order.deleteMany({});
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/deliveries");
    return { success: true };
  } catch (error) {
    console.error("[resetOrdersAction] Erreur:", error);
    return { success: false, error: "Impossible de réinitialiser les commandes. Réessayez." };
  }
}
