"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPurchaseEvent } from "@/lib/facebookCapi";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  // Récupérer la commande avant modification pour vérifier l'ancien statut
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true }
  });

  if (!existingOrder) return;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });

  // Si on passe la commande en CONFIRMED (et qu'elle ne l'était pas avant)
  // C'est ici qu'on confirme à Facebook que l'achat est réel
  if (newStatus === "CONFIRMED" && existingOrder.status !== "CONFIRMED") {
    if (existingOrder.product) {
      await sendPurchaseEvent(
        {
          customerName: updatedOrder.customerName,
          customerPhone: updatedOrder.customerPhone,
          customerCity: updatedOrder.customerCity,
          totalPrice: updatedOrder.totalPrice,
          quantity: updatedOrder.quantity,
          clientIp: updatedOrder.clientIp,
          userAgent: updatedOrder.userAgent,
          fbp: updatedOrder.fbp,
          fbc: updatedOrder.fbc,
          eventId: updatedOrder.eventId,
        },
        {
          id: existingOrder.product.id,
          title: existingOrder.product.title,
        }
      );
    }
  }

  // Recharger la page du CRM et du dashboard pour voir les changements
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/deliveries");
}
