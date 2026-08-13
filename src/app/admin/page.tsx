import { DollarSign, ShoppingCart, TrendingUp, Users, PlusCircle, Package, Truck, ArrowRight, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { DashboardCharts } from "./DashboardCharts";
import { DashboardFilter } from "./DashboardFilter";
import { format, subDays, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const period = typeof resolvedParams.period === 'string' ? resolvedParams.period : 'all';
  const productIdFilter = typeof resolvedParams.productId === 'string' ? resolvedParams.productId : 'all';

  let dateFilter = {};
  const today = new Date();

  if (period === 'week') {
    dateFilter = { gte: startOfWeek(today, { weekStartsOn: 1 }) };
  } else if (period === 'month') {
    dateFilter = { gte: startOfMonth(today) };
  } else if (period === 'year') {
    dateFilter = { gte: startOfYear(today) };
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    // Si la période est une date exacte (ex: 2026-05-21)
    const specificDate = new Date(period);
    dateFilter = { 
      gte: startOfDay(specificDate),
      lte: new Date(specificDate.setHours(23, 59, 59, 999))
    };
  }

  // 0. Tous les produits (pour le filtre dropdown)
  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  });

  // 1. Récupérer les commandes filtrées pour les KPIs
  const filteredOrders = await prisma.order.findMany({
    where: {
      ...(period !== 'all' ? { createdAt: dateFilter } : {}),
      ...(productIdFilter !== 'all' ? { productId: productIdFilter } : {})
    },
    orderBy: { createdAt: 'asc' },
    include: { product: true }
  });

  // Pour le graphe des 7 derniers jours (indépendant du filtre de période pour rester cohérent, ou on peut le filtrer, mais on le garde sur 7 jours)
  const last7DaysOrders = period === 'all' || period === 'week' || period === 'month' || period === 'year' 
    ? filteredOrders 
    : await prisma.order.findMany({
        where: { createdAt: { gte: subDays(startOfDay(today), 6) } },
        orderBy: { createdAt: 'asc' }
      });

  // Récupérer les 5 dernières commandes (Récentes)
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  });

  let totalRevenue = 0;
  let totalNetProfit = 0;
  let deliveredOrdersCount = 0;
  let newLeadsCount = 0;

  filteredOrders.forEach(order => {
    if (order.status === "DELIVERED") {
      totalRevenue += order.totalPrice;
      deliveredOrdersCount++;
      
      let productCost = (order.product?.costPrice || 0) * order.quantity;
      let deliveryCost = 0;
      let adCost = 0;
      
      try {
        if (order.deliveryNotes && order.deliveryNotes.trim().startsWith("{")) {
          const parsed = JSON.parse(order.deliveryNotes);
          if (parsed.expenses) {
            deliveryCost = parsed.expenses.deliveryCost || 0;
            adCost = parsed.expenses.adCost || 0;
          }
        }
      } catch(e) {}
      
      totalNetProfit += (order.totalPrice - productCost - deliveryCost - adCost);
    }
    if (order.status === "NEW_LEAD") {
      newLeadsCount++;
    }
  });

  // Performance par produit (toutes les commandes livrées de la période groupées par produit)
  const productStatsMap: Record<string, {
    title: string;
    revenue: number;
    netProfit: number;
    count: number;
  }> = {};

  filteredOrders.forEach(order => {
    if (order.status === "DELIVERED") {
      const pid = order.productId;
      if (!productStatsMap[pid]) {
        productStatsMap[pid] = { title: order.product.title, revenue: 0, netProfit: 0, count: 0 };
      }
      productStatsMap[pid].revenue += order.totalPrice;
      productStatsMap[pid].count += 1;

      const productCost = (order.product?.costPrice || 0) * order.quantity;
      let deliveryCost = 0;
      let adCost = 0;
      try {
        if (order.deliveryNotes && order.deliveryNotes.trim().startsWith("{")) {
          const parsed = JSON.parse(order.deliveryNotes);
          if (parsed.expenses) {
            deliveryCost = parsed.expenses.deliveryCost || 0;
            adCost = parsed.expenses.adCost || 0;
          }
        }
      } catch(e) {}
      productStatsMap[pid].netProfit += (order.totalPrice - productCost - deliveryCost - adCost);
    }
  });

  const productStats = Object.values(productStatsMap).sort((a, b) => b.revenue - a.revenue);

  // 2. Préparation des données pour le graphe des ventes (7 derniers jours)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, 6 - i);
    return {
      date: format(d, 'dd MMM', { locale: fr }),
      rawDate: format(d, 'yyyy-MM-dd'),
      ventes: 0
    };
  });

  last7DaysOrders.forEach(order => {
    if (order.status === "DELIVERED" || order.status === "CONFIRMED") {
      const orderDate = format(order.createdAt, 'yyyy-MM-dd');
      const day = last7Days.find(d => d.rawDate === orderDate);
      if (day) {
        day.ventes += order.totalPrice;
      }
    }
  });

  // 3. Préparation des données pour le graphe circulaire des statuts (sur la période)
  const statusCounts: Record<string, number> = {};
  filteredOrders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const STATUS_COLORS: Record<string, string> = {
    NEW_LEAD: "#facc15", 
    REFUSED_CALL: "#fb923c", 
    CALL_BACK_LATER: "#14b8a6",
    CONFIRMED: "#3b82f6", 
    OUT_FOR_DELIVERY: "#a855f7", 
    DELIVERED: "#22c55e", 
    CANCELLED: "#ef4444", 
  };

  const statusLabels: Record<string, string> = {
    NEW_LEAD: "Nouveau Lead",
    REFUSED_CALL: "Refusé au tél.",
    CALL_BACK_LATER: "À rappeler plus tard",
    CONFIRMED: "Confirmé au tél.",
    OUT_FOR_DELIVERY: "En route",
    DELIVERED: "Livré & Encaissé",
    CANCELLED: "Annulé",
  };

  const pieData = Object.keys(statusCounts).map(status => ({
    name: statusLabels[status] || status,
    value: statusCounts[status],
    color: STATUS_COLORS[status] || "#94a3b8"
  }));

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-brand-navy">Tableau de bord</h1>
        <DashboardFilter products={allProducts} />
      </div>

      {/* Actions Rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/products/new" className="bg-white border border-slate-200 hover:border-brand-green hover:shadow-md transition-all p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-brand-navy font-bold">
          <PlusCircle className="text-brand-green" size={24} />
          <span className="text-sm text-center">Nouveau Produit</span>
        </Link>
        <Link href="/admin/orders" className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-brand-navy font-bold">
          <ShoppingCart className="text-blue-500" size={24} />
          <span className="text-sm text-center">Gérer Commandes</span>
        </Link>
        <Link href="/admin/deliveries" className="bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-brand-navy font-bold">
          <Truck className="text-purple-500" size={24} />
          <span className="text-sm text-center">Livraisons</span>
        </Link>
        <Link href="/admin/products" className="bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-brand-navy font-bold">
          <Package className="text-orange-500" size={24} />
          <span className="text-sm text-center">Inventaire</span>
        </Link>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard 
          title="Chiffre d'Affaires" 
          value={`${totalRevenue.toLocaleString('fr-FR')} FCFA`} 
          icon={<DollarSign className="text-brand-green" size={24} />} 
          trend={period !== 'all' ? "Sur la période" : "Global"} 
        />
        <KpiCard 
          title="Bénéfice Net" 
          value={`${totalNetProfit.toLocaleString('fr-FR')} FCFA`} 
          icon={<TrendingUp className="text-brand-navy" size={24} />} 
          trend={period !== 'all' ? "Sur la période" : "Global"} 
        />
        <KpiCard 
          title="Commandes Livrées" 
          value={deliveredOrdersCount.toString()} 
          icon={<ShoppingCart className="text-brand-green" size={24} />} 
          trend={period !== 'all' ? "Sur la période" : "Global"} 
        />
        <KpiCard 
          title="Nouveaux Leads" 
          value={newLeadsCount.toString()} 
          icon={<Users className="text-brand-green" size={24} />} 
          trend={period !== 'all' ? "Sur la période" : "Global"} 
        />
        <KpiCard 
          title="Total Commandes" 
          value={filteredOrders.length.toString()} 
          icon={<TrendingUp className="text-brand-green" size={24} />} 
          trend={period !== 'all' ? "Sur la période" : "Global"} 
        />
      </div>

      {/* Graphiques Réels (Recharts) */}
      <DashboardCharts salesData={last7Days} statusData={pieData} />

      {/* Performance par Produit */}
      {productStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2 mb-4">
            <Package className="text-brand-green" size={20} />
            Performance par Produit
            {productIdFilter !== 'all' && (
              <span className="text-sm text-slate-400 font-normal ml-1">(filtre actif)</span>
            )}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="p-3 font-semibold">Produit</th>
                  <th className="p-3 font-semibold text-center">Commandes Livrées</th>
                  <th className="p-3 font-semibold text-right">CA (FCFA)</th>
                  <th className="p-3 font-semibold text-right">Bénéfice Net (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productStats.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-semibold text-brand-navy text-sm line-clamp-1">{p.title}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2 py-1 rounded-full">{p.count}</span>
                    </td>
                    <td className="p-3 text-right font-bold text-brand-green text-sm">
                      {p.revenue.toLocaleString('fr-FR')}
                    </td>
                    <td className="p-3 text-right font-bold text-sm">
                      <span className={p.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {p.netProfit >= 0 ? '+' : ''}{p.netProfit.toLocaleString('fr-FR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commandes Récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
            <Clock className="text-brand-green" size={20} />
            Commandes Récentes
          </h2>
          <Link href="/admin/orders" className="text-sm font-bold text-brand-green hover:text-lime-600 flex items-center gap-1 transition-colors">
            Voir tout <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="p-3 font-semibold">Client</th>
                <th className="p-3 font-semibold">Produit</th>
                <th className="p-3 font-semibold">Montant</th>
                <th className="p-3 font-semibold">Statut</th>
                <th className="p-3 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-bold text-brand-navy text-sm">{order.customerName}</div>
                    <div className="text-xs text-slate-500">{order.customerPhone}</div>
                  </td>
                  <td className="p-3 text-sm text-slate-700 truncate max-w-[200px]">
                    <span className="font-bold text-brand-green mr-1">{order.quantity}x</span>
                    {order.product.title}
                  </td>
                  <td className="p-3 font-bold text-brand-green text-sm">
                    {order.totalPrice.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{
                      backgroundColor: `${STATUS_COLORS[order.status]}20`,
                      color: STATUS_COLORS[order.status]
                    }}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="p-3 text-right text-xs text-slate-500">
                    {format(order.createdAt, 'dd/MM/yyyy HH:mm')}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">Aucune commande récente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function KpiCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <span className="text-2xl font-bold text-brand-navy">{value}</span>
        <span className="text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-1 rounded-md">{trend}</span>
      </div>
    </div>
  );
}
