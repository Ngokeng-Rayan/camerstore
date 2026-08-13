"use client";

import { useState, useMemo } from "react";
import { format, isToday, isTomorrow, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { scheduleDeliveryAction, updateOrderStatusAction, deleteOrderAction } from "@/app/actions/delivery";
import { CheckCircle, X, Truck, Calendar as CalendarIcon, Clock, Package, Phone, Edit, Trash2 } from "lucide-react";

export default function DeliveriesTableClient({ toPlan, planned }: { toPlan: any[], planned: any[] }) {
  const [filterDay, setFilterDay] = useState<string>("all");
  const [planningOrderId, setPlanningOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate days of the current week for filters
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lundi
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Filter planned orders based on selected day
  const filteredPlanned = useMemo(() => {
    if (filterDay === "all") return planned;
    if (filterDay === "today") return planned.filter(o => o.deliveryDate && isToday(new Date(o.deliveryDate)));
    if (filterDay === "tomorrow") return planned.filter(o => o.deliveryDate && isTomorrow(new Date(o.deliveryDate)));
    
    // Day of week match
    return planned.filter(o => {
      if (!o.deliveryDate) return false;
      const orderDate = new Date(o.deliveryDate);
      return orderDate.getDay() === parseInt(filterDay);
    });
  }, [planned, filterDay]);

  const handleSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("orderId", planningOrderId!);
    formData.append("status", "CONFIRMED");
    
    const res = await scheduleDeliveryAction(formData);
    if (res.success) {
      setPlanningOrderId(null);
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleMarkDelivered = async (id: string) => {
    if (!confirm("Confirmer la livraison de cette commande ?")) return;
    const res = await updateOrderStatusAction(id, "DELIVERED");
    if (!res.success) alert(res.error);
  };

  const handleMarkCancelled = async (id: string) => {
    if (!confirm("Annuler cette commande ?")) return;
    const res = await updateOrderStatusAction(id, "CANCELLED");
    if (!res.success) alert(res.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette commande définitivement ?")) return;
    const res = await deleteOrderAction(id);
    if (!res.success) alert(res.error);
  };

  return (
    <div className="space-y-12">
      {/* 1. TABLEAU : COMMANDES À PLANIFIER */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-400"></span>
          Commandes non planifiées (À appeler)
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Mobile View */}
          <div className="block md:hidden divide-y divide-slate-100">
            {toPlan.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Aucune commande à planifier.</div>
            ) : (
              toPlan.map(order => (
                <div key={order.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-brand-navy">{order.customerName}</div>
                      <div className="text-sm text-slate-500">{order.customerPhone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-green">{order.totalPrice.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">📍 {order.customerCity}</div>
                  <div className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <Package size={14} /> <span className="font-bold text-brand-green">{order.quantity}x</span> {order.product.title}
                  </div>
                  <div className="pt-2">
                    {planningOrderId === order.id ? (
                      <div className="bg-white p-4 border border-brand-green rounded-lg shadow-xl text-left">
                        <h4 className="font-bold text-brand-navy mb-3">Planifier</h4>
                        <form onSubmit={handleSchedule} className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                            <input type="date" name="deliveryDate" required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Créneau</label>
                            <select name="deliveryTimeSlot" required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none">
                              <option value="">Sélectionner...</option>
                              <option value="Matin (8h - 12h)">Matin (8h - 12h)</option>
                              <option value="Après-midi (12h - 16h)">Après-midi (12h - 16h)</option>
                              <option value="Soir (16h - 19h)">Soir (16h - 19h)</option>
                              <option value="À préciser">À préciser</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Indications</label>
                            <textarea name="deliveryNotes" rows={2} placeholder="Ex: Derrière la station..." className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none"></textarea>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button type="button" onClick={() => setPlanningOrderId(null)} className="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Annuler</button>
                            <button type="submit" disabled={isSubmitting} className="px-3 py-1 text-xs font-bold bg-brand-green text-brand-navy rounded hover:bg-lime-500">Valider</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setPlanningOrderId(order.id)}
                          className="bg-brand-navy flex-1 justify-center text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2"
                        >
                          <CalendarIcon size={16} /> Planifier
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          title="Supprimer la commande"
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors border border-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500">
                  <th className="p-4 font-semibold">Client & Contact</th>
                  <th className="p-4 font-semibold">Ville / Quartier</th>
                  <th className="p-4 font-semibold">Produit</th>
                  <th className="p-4 font-semibold">Montant</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {toPlan.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Aucune commande à planifier.</td>
                  </tr>
                ) : (
                  toPlan.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold text-brand-navy">{order.customerName}</div>
                        <div className="text-sm text-slate-500">{order.customerPhone}</div>
                      </td>
                      <td className="p-4 text-slate-600">{order.customerCity}</td>
                      <td className="p-4 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-1"><Package size={14} /> <span className="font-bold text-brand-green">{order.quantity}x</span> {order.product.title}</div>
                      </td>
                      <td className="p-4 font-bold text-brand-green">{order.totalPrice.toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-4 text-right">
                        {planningOrderId === order.id ? (
                          <div className="bg-white p-4 border border-brand-green rounded-lg shadow-xl text-left absolute z-10 w-80 right-8 -mt-4">
                            <h4 className="font-bold text-brand-navy mb-3">Planifier la livraison</h4>
                            <form onSubmit={handleSchedule} className="space-y-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                                <input type="date" name="deliveryDate" required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Créneau</label>
                                <select name="deliveryTimeSlot" required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none">
                                  <option value="">Sélectionner...</option>
                                  <option value="Matin (8h - 12h)">Matin (8h - 12h)</option>
                                  <option value="Après-midi (12h - 16h)">Après-midi (12h - 16h)</option>
                                  <option value="Soir (16h - 19h)">Soir (16h - 19h)</option>
                                  <option value="À préciser">À préciser</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Indications livreur</label>
                                <textarea name="deliveryNotes" rows={2} placeholder="Ex: Derrière la station..." className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none"></textarea>
                              </div>
                              <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setPlanningOrderId(null)} className="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Annuler</button>
                                <button type="submit" disabled={isSubmitting} className="px-3 py-1 text-xs font-bold bg-brand-green text-brand-navy rounded hover:bg-lime-500">Valider</button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => setPlanningOrderId(order.id)}
                              className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2"
                            >
                              <CalendarIcon size={16} /> Planifier
                            </button>
                            <button 
                              onClick={() => handleDelete(order.id)}
                              title="Supprimer la commande"
                              className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors border border-red-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2. TABLEAU : LIVRAISONS PLANIFIÉES */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-green"></span>
            Livraisons Planifiées
          </h2>
          
          {/* Filtres de jours */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterDay("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filterDay === "all" ? "bg-brand-navy text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilterDay("today")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filterDay === "today" ? "bg-brand-navy text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
            >
              Aujourd'hui
            </button>
            <button 
              onClick={() => setFilterDay("tomorrow")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filterDay === "tomorrow" ? "bg-brand-navy text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
            >
              Demain
            </button>
            
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            
            {/* Lundi à Dimanche */}
            {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
              const dayName = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][dayNum];
              return (
                <button 
                  key={dayNum}
                  onClick={() => setFilterDay(dayNum.toString())}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filterDay === dayNum.toString() ? "bg-brand-green text-brand-navy" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {dayName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-green/30 overflow-hidden">
          {/* Mobile View */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredPlanned.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Aucune livraison pour ce filtre.</div>
            ) : (
              filteredPlanned.map(order => (
                <div key={order.id} className={`p-4 flex flex-col gap-3 ${isToday(new Date(order.deliveryDate!)) ? 'bg-green-50/30' : ''}`}>
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-bold text-brand-navy">
                        {order.deliveryDate ? format(new Date(order.deliveryDate), "EEEE d MMM yyyy", { locale: fr }) : "Non défini"}
                      </div>
                      <div className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {order.deliveryTimeSlot || "Non précisé"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-green">{order.totalPrice.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{order.customerName}</div>
                    <div className="text-sm text-slate-600 flex items-center gap-1 mt-1"><Phone size={12}/> {order.customerPhone}</div>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">📍 {order.customerCity}</div>
                  {order.deliveryNotes && (
                    <div className="text-xs text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-100">
                      {order.deliveryNotes}
                    </div>
                  )}
                  <div className="text-sm font-medium text-slate-700 flex items-center gap-1 mt-1">
                    <Package size={14} /> <span className="font-bold text-brand-green">{order.quantity}x</span> {order.product.title}
                  </div>
                  {planningOrderId === order.id ? (
                    <div className="bg-white p-4 border border-brand-green rounded-lg shadow-sm mt-2">
                      <h4 className="font-bold text-brand-navy mb-3">Modifier la planification</h4>
                      <form onSubmit={handleSchedule} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                          <input type="date" name="deliveryDate" defaultValue={order.deliveryDate ? format(new Date(order.deliveryDate), 'yyyy-MM-dd') : ""} required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Créneau</label>
                          <select name="deliveryTimeSlot" defaultValue={order.deliveryTimeSlot || ""} required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none">
                            <option value="">Sélectionner...</option>
                            <option value="Matin (8h - 12h)">Matin (8h - 12h)</option>
                            <option value="Après-midi (12h - 16h)">Après-midi (12h - 16h)</option>
                            <option value="Soir (16h - 19h)">Soir (16h - 19h)</option>
                            <option value="À préciser">À préciser</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Indications</label>
                          <textarea name="deliveryNotes" defaultValue={order.deliveryNotes || ""} rows={2} placeholder="Ex: Derrière la station..." className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none"></textarea>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button type="button" onClick={() => setPlanningOrderId(null)} className="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Annuler</button>
                          <button type="submit" disabled={isSubmitting} className="px-3 py-1 text-xs font-bold bg-brand-green text-brand-navy rounded hover:bg-lime-500">Valider</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => setPlanningOrderId(order.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded font-bold text-sm flex items-center justify-center transition-colors"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleMarkDelivered(order.id)}
                        className="flex-1 bg-brand-green/20 hover:bg-brand-green text-brand-navy px-3 py-2 rounded font-bold text-sm flex justify-center items-center gap-1 transition-colors"
                      >
                        <CheckCircle size={16} /> Livré
                      </button>
                      <button 
                        onClick={() => handleMarkCancelled(order.id)}
                        className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 px-3 py-2 rounded font-bold text-sm flex justify-center items-center gap-1 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-brand-green/20 text-sm uppercase text-slate-500">
                  <th className="p-4 font-semibold">Date & Créneau</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Ville & Indications</th>
                  <th className="p-4 font-semibold">Produit & Prix</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlanned.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Aucune livraison pour ce filtre.</td>
                  </tr>
                ) : (
                  filteredPlanned.map((order) => (
                    <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${isToday(new Date(order.deliveryDate!)) ? 'bg-green-50/30' : ''}`}>
                      <td className="p-4">
                        <div className="font-bold text-brand-navy">
                          {order.deliveryDate ? format(new Date(order.deliveryDate), "EEEE d MMM yyyy", { locale: fr }) : "Non défini"}
                        </div>
                        <div className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                          <Clock size={12} /> {order.deliveryTimeSlot || "Non précisé"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{order.customerName}</div>
                        <div className="text-sm text-slate-600 flex items-center gap-1 mt-1"><Phone size={12}/> {order.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{order.customerCity}</div>
                        {order.deliveryNotes && (
                          <div className="text-xs text-slate-500 italic mt-1 bg-slate-100 p-1.5 rounded line-clamp-2 max-w-xs">
                            {order.deliveryNotes}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 text-sm"><span className="font-bold text-brand-green mr-1">{order.quantity}x</span>{order.product.title}</div>
                        <div className="font-bold text-brand-green">{order.totalPrice.toLocaleString('fr-FR')} FCFA</div>
                      </td>
                      <td className="p-4 text-right">
                        {planningOrderId === order.id ? (
                          <div className="bg-white p-4 border border-brand-green rounded-lg shadow-xl text-left absolute z-10 w-80 right-8 -mt-4">
                            <h4 className="font-bold text-brand-navy mb-3">Modifier la planification</h4>
                            <form onSubmit={handleSchedule} className="space-y-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                                <input type="date" name="deliveryDate" defaultValue={order.deliveryDate ? format(new Date(order.deliveryDate), 'yyyy-MM-dd') : ""} required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Créneau</label>
                                <select name="deliveryTimeSlot" defaultValue={order.deliveryTimeSlot || ""} required className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none">
                                  <option value="">Sélectionner...</option>
                                  <option value="Matin (8h - 12h)">Matin (8h - 12h)</option>
                                  <option value="Après-midi (12h - 16h)">Après-midi (12h - 16h)</option>
                                  <option value="Soir (16h - 19h)">Soir (16h - 19h)</option>
                                  <option value="À préciser">À préciser</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Indications livreur</label>
                                <textarea name="deliveryNotes" defaultValue={order.deliveryNotes || ""} rows={2} placeholder="Ex: Derrière la station..." className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 outline-none"></textarea>
                              </div>
                              <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setPlanningOrderId(null)} className="px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Annuler</button>
                                <button type="submit" disabled={isSubmitting} className="px-3 py-1 text-xs font-bold bg-brand-green text-brand-navy rounded hover:bg-lime-500">Valider</button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setPlanningOrderId(order.id)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1.5 rounded flex items-center justify-center transition-colors"
                              title="Modifier la planification"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleMarkDelivered(order.id)}
                              className="bg-brand-green/20 hover:bg-brand-green text-brand-navy px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle size={14} /> Livré
                            </button>
                            <button 
                              onClick={() => handleMarkCancelled(order.id)}
                              className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 transition-colors"
                            >
                              <X size={14} /> Échec
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
