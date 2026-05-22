"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPurchaseEvent } from "@/lib/facebookCapi";

export async function scheduleDeliveryAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const deliveryDateStr = formData.get("deliveryDate") as string;
  const deliveryTimeSlot = formData.get("deliveryTimeSlot") as string;
  const deliveryNotes = formData.get("deliveryNotes") as string;
  const status = formData.get("status") as string;

  if (!orderId) return { success: false, error: "ID Commande manquant" };

  try {
    // Récupérer la commande avant modification pour le CAPI
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!existingOrder) return { success: false, error: "Commande non trouvée" };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryDate: deliveryDateStr ? new Date(deliveryDateStr) : null,
        deliveryTimeSlot,
        deliveryNotes,
        status: status || undefined,
      }
    });

    // Déclencher le CAPI si le statut passe en CONFIRMED
    if (status === "CONFIRMED" && existingOrder.status !== "CONFIRMED" && existingOrder.product) {
      await sendPurchaseEvent(
        {
          customerName: existingOrder.customerName,
          customerPhone: existingOrder.customerPhone,
          customerCity: existingOrder.customerCity,
          totalPrice: existingOrder.totalPrice,
          quantity: existingOrder.quantity,
          clientIp: existingOrder.clientIp,
          userAgent: existingOrder.userAgent,
          fbp: existingOrder.fbp,
          fbc: existingOrder.fbc,
          eventId: existingOrder.eventId,
        },
        { id: existingOrder.product.id, title: existingOrder.product.title }
      );
    }

    revalidatePath("/admin/deliveries");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la planification" };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    // Récupérer la commande avant modification pour le CAPI
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!existingOrder) return { success: false, error: "Commande non trouvée" };

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    // Déclencher le CAPI si le statut passe en CONFIRMED
    if (status === "CONFIRMED" && existingOrder.status !== "CONFIRMED" && existingOrder.product) {
      await sendPurchaseEvent(
        {
          customerName: existingOrder.customerName,
          customerPhone: existingOrder.customerPhone,
          customerCity: existingOrder.customerCity,
          totalPrice: existingOrder.totalPrice,
          quantity: existingOrder.quantity,
          clientIp: existingOrder.clientIp,
          userAgent: existingOrder.userAgent,
          fbp: existingOrder.fbp,
          fbc: existingOrder.fbc,
          eventId: existingOrder.eventId,
        },
        { id: existingOrder.product.id, title: existingOrder.product.title }
      );
    }

    revalidatePath("/admin/deliveries");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}
