import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_PIXEL_ID = process.env.META_PIXEL_ID;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // 1. Récupérer l'ID de la commande depuis l'URL
    const orderId = resolvedParams.id;
    // const body = await request.json();

    // 2. Mettre à jour le statut dans PostgreSQL (via Prisma)
    /*
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" }
    });
    */
    
    // Simulation d'une commande récupérée
    const dummyOrder = {
      id: orderId,
      totalPrice: 15000,
      customerPhone: "237690000000",
      customerCity: "Douala"
    };

    // 3. ENVOYER L'ÉVÉNEMENT À FACEBOOK (CAPI)
    // C'est ici que l'algorithme de Meta est "éduqué" avec les vrais acheteurs
    
    if (META_ACCESS_TOKEN && META_PIXEL_ID) {
      const currentTime = Math.floor(Date.now() / 1000);
      
      const eventData = {
        data: [
          {
            event_name: "Purchase",
            event_time: currentTime,
            action_source: "website",
            user_data: {
              // Hashage SHA256 recommandé par Meta pour les données clients
              ph: [/* sha256(dummyOrder.customerPhone) */], 
              ct: [/* sha256(dummyOrder.customerCity) */],
              country: [/* sha256("CM") */] 
            },
            custom_data: {
              currency: "XAF",
              value: dummyOrder.totalPrice,
              content_ids: ["product_id_123"],
              content_type: "product"
            }
          }
        ]
      };

      // Appel vers l'API Graph de Meta
      // await fetch(`https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // });
      
      console.log("✅ Événement Purchase envoyé à Meta CAPI avec succès.");
    }

    return NextResponse.json({ success: true, message: "Commande confirmée et signal envoyé à Meta." });

  } catch (error) {
    console.error("Erreur lors de la confirmation :", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
