import prisma from "@/lib/prisma";
import DeliveriesTableClient from "./DeliveriesTableClient";

export default async function AdminDeliveries() {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        notIn: ["DELIVERED", "CANCELLED"]
      }
    },
    include: {
      product: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Séparer les commandes à planifier et celles déjà planifiées
  const toPlan = orders.filter(o => o.status === "NEW_LEAD");
  const planned = orders.filter(o => o.status === "CONFIRMED" || o.status === "OUT_FOR_DELIVERY");

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-8">Gestion des Livraisons</h1>
      <DeliveriesTableClient toPlan={toPlan} planned={planned} />
    </div>
  );
}
