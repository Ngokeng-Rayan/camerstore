"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
  // Vérification de sécurité côté serveur : ADMIN uniquement
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  try {
    await prisma.order.delete({ where: { id: orderId } });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression commande:", error);
    return { success: false, error: "Impossible de supprimer cette commande." };
  }
}
