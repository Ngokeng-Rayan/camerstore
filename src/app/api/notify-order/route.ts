import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendNewOrderNotification } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });
    
    if (order) {
      await sendNewOrderNotification(order, order.product.title);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API notification:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
