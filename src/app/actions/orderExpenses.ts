"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderExpenses(
  orderId: string,
  expenses: { deliveryCost: number; adCost: number }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return { success: false, error: "Commande introuvable" };
    }

    let currentNotes = order.deliveryNotes || "";
    let parsedNotes: any = {};

    // Try to parse existing notes as JSON
    try {
      if (currentNotes.trim().startsWith("{")) {
        parsedNotes = JSON.parse(currentNotes);
      } else {
        // If it's not JSON but there is text, save it in a "note" property
        parsedNotes = { note: currentNotes };
      }
    } catch (e) {
      parsedNotes = { note: currentNotes };
    }

    // Update with expenses
    parsedNotes.expenses = {
      deliveryCost: expenses.deliveryCost || 0,
      adCost: expenses.adCost || 0
    };

    // Save as JSON string
    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryNotes: JSON.stringify(parsedNotes)
      }
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des dépenses:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}
