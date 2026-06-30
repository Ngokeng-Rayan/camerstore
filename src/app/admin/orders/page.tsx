import prisma from "@/lib/prisma";
import { MessageCircle, ShoppingBag, PhoneCall, CheckCircle, Truck, PackageCheck, XCircle } from "lucide-react";
import { formatDistanceToNow, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { OrderExpensesModal } from "./OrderExpensesModal";

export default async function OrdersCRM({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined;
  const searchFilter = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const dateRange = typeof resolvedSearchParams.dateRange === 'string' ? resolvedSearchParams.dateRange : undefined;
  const productIdFilter = typeof resolvedSearchParams.productId === 'string' ? resolvedSearchParams.productId : undefined;

  const whereClause: any = {};
  if (statusFilter) whereClause.status = statusFilter;
  if (productIdFilter) whereClause.productId = productIdFilter;
  
  if (searchFilter) {
    whereClause.OR = [
      { customerName: { contains: searchFilter, mode: 'insensitive' } },
      { customerPhone: { contains: searchFilter } },
      { customerCity: { contains: searchFilter, mode: 'insensitive' } }
    ];
  }

  // Date filtering
  const now = new Date();
  if (dateRange === 'today') {
    whereClause.createdAt = { gte: startOfDay(now) };
  } else if (dateRange === 'week') {
    whereClause.createdAt = { gte: startOfWeek(now, { weekStartsOn: 1 }) };
  } else if (dateRange === 'month') {
    whereClause.createdAt = { gte: startOfMonth(now) };
  } else if (dateRange === 'year') {
    whereClause.createdAt = { gte: startOfYear(now) };
  }

  // Fetch orders
  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  });

  // Fetch products for the filter
  const products = await prisma.product.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate KPIs
  const kpis = {
    total: orders.length,
    new: orders.filter(o => o.status === 'NEW_LEAD').length,
    refused: orders.filter(o => o.status === 'REFUSED_CALL').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Gestion des Commandes (CRM)</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <ShoppingBag className="text-slate-400 mb-2" size={24} />
          <span className="text-2xl font-black text-slate-800">{kpis.total}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
        </div>
        <div className="bg-brand-green/10 p-4 rounded-xl shadow-sm border border-brand-green/20 flex flex-col items-center text-center">
          <div className="w-3 h-3 rounded-full bg-brand-green mb-3"></div>
          <span className="text-2xl font-black text-brand-navy">{kpis.new}</span>
          <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">Nouveaux</span>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-200 flex flex-col items-center text-center">
          <PhoneCall className="text-orange-500 mb-2" size={24} />
          <span className="text-2xl font-black text-orange-700">{kpis.refused}</span>
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Refusé (Tél)</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200 flex flex-col items-center text-center">
          <CheckCircle className="text-blue-500 mb-2" size={24} />
          <span className="text-2xl font-black text-blue-700">{kpis.confirmed}</span>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Confirmés</span>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200 flex flex-col items-center text-center">
          <PackageCheck className="text-emerald-500 mb-2" size={24} />
          <span className="text-2xl font-black text-emerald-700">{kpis.delivered}</span>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Livrés</span>
        </div>
        <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200 flex flex-col items-center text-center">
          <XCircle className="text-red-500 mb-2" size={24} />
          <span className="text-2xl font-black text-red-700">{kpis.cancelled}</span>
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Annulés</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">
        <form className="flex flex-col lg:flex-row gap-4 w-full">
          <input 
            type="text" 
            name="search" 
            defaultValue={searchFilter || ""}
            placeholder="Nom, téléphone, ville..." 
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none text-sm"
          />
          <select 
            name="dateRange" 
            defaultValue={dateRange || ""}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
          >
            <option value="">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <select 
            name="productId" 
            defaultValue={productIdFilter || ""}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white flex-1"
          >
            <option value="">Tous les produits</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <select 
            name="status" 
            defaultValue={statusFilter || ""}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="NEW_LEAD">Nouveau Lead</option>
            <option value="REFUSED_CALL">Refusé (Tél)</option>
            <option value="CONFIRMED">Confirmé au Tél.</option>
            <option value="DELIVERED">Livré</option>
            <option value="CANCELLED">Annulé</option>
          </select>
          <button type="submit" className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
            Appliquer
          </button>
          {(statusFilter || searchFilter || dateRange || productIdFilter) && (
            <Link href="/admin/orders" className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center">
              Réinitialiser
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
        {/* Mobile View (Cards) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Aucune commande ne correspond à ces critères.</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-brand-navy">{order.customerName}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MessageCircle size={12} /> {order.customerPhone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-brand-green font-bold text-sm">{order.totalPrice.toLocaleString('fr-FR')} FCFA</div>
                    <div className="text-xs text-slate-400 mt-1">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: fr })}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-800 line-clamp-1">{order.product.title}</div>
                <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">📍 {order.customerCity}, {order.customerAddress}</div>
                <div className="mt-2">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  {order.status === "DELIVERED" && (
                    <div className="mt-2">
                      <OrderExpensesModal orderId={order.id} deliveryNotes={order.deliveryNotes} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-1/4">Client</th>
                <th className="p-4 font-semibold">Produit</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Aucune commande ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-brand-navy">{order.customerName}</div>
                      <div className="text-sm text-slate-500 flex flex-col gap-1 mt-1">
                        <span className="flex items-center gap-1"><MessageCircle size={12}/> {order.customerPhone}</span>
                        <span>📍 {order.customerCity}, {order.customerAddress}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{order.product.title}</div>
                      <div className="text-brand-green font-bold text-sm mt-1">{order.totalPrice.toLocaleString('fr-FR')} FCFA</div>
                    </td>
                    <td className="p-4">
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                      {order.status === "DELIVERED" && (
                        <div className="mt-1">
                          <OrderExpensesModal orderId={order.id} deliveryNotes={order.deliveryNotes} />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm text-slate-500">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: fr })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
