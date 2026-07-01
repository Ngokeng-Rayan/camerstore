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
  // Une commande "CONFIRMED" sans date de livraison retourne dans "À planifier"
  const toPlan = orders.filter(o => o.status === "NEW_LEAD" || (o.status === "CONFIRMED" && !o.deliveryDate));
  // Elle passe dans "Planifiées" si elle a une date, ou si elle est en cours de livraison
  const planned = orders.filter(o => (o.status === "CONFIRMED" && o.deliveryDate) || o.status === "OUT_FOR_DELIVERY");

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-8">Gestion des Livraisons</h1>
      <DeliveriesTableClient toPlan={toPlan} planned={planned} />
    </div>
  );
}
