import prisma from "@/lib/prisma";
import { UserPlus, Shield, CheckCircle, XCircle, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const roleFilter = typeof resolvedSearchParams.role === 'string' ? resolvedSearchParams.role : undefined;
  const searchFilter = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;

  const whereClause: any = {};
  if (roleFilter) whereClause.role = roleFilter;
  if (searchFilter) {
    whereClause.OR = [
      { name: { contains: searchFilter, mode: 'insensitive' } },
      { email: { contains: searchFilter, mode: 'insensitive' } }
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Équipe & Closers</h1>
        <Link href="/admin/users/new" className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <UserPlus size={20} />
          Ajouter un compte
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        <form className="flex-1 flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            name="search" 
            defaultValue={searchFilter || ""}
            placeholder="Rechercher par nom ou email..." 
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none text-sm"
          />
          <select 
            name="role" 
            defaultValue={roleFilter || ""}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="CLOSER">Closer</option>
          </select>
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
            Filtrer
          </button>
          {(roleFilter || searchFilter) && (
            <Link href="/admin/users" className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center">
              Réinitialiser
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-slate-100">
          {users.map(user => (
            <div key={user.id} className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-brand-navy flex items-center gap-2 flex-wrap">
                    {user.name || "Utilisateur"}
                    {user.isActive ? (
                      <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><CheckCircle size={10} className="mr-1"/> Actif</span>
                    ) : (
                      <span className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200"><XCircle size={10} className="mr-1"/> Inactif</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/users/${user.id}`} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={18} />
                  </Link>
                  <DeleteUserButton userId={user.id} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {user.role === 'ADMIN' && <Shield size={12} />}
                  {user.role}
                </span>
                <span className="text-xs text-slate-400">
                  Ajouté le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500">
                <th className="p-4 font-semibold whitespace-nowrap">Nom</th>
                <th className="p-4 font-semibold whitespace-nowrap">Email</th>
                <th className="p-4 font-semibold whitespace-nowrap">Rôle</th>
                <th className="p-4 font-semibold whitespace-nowrap">Date d'ajout</th>
                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-brand-navy">
                    <div className="flex items-center gap-2">
                      {user.name || "Utilisateur"}
                      {user.isActive ? (
                        <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><CheckCircle size={10} className="mr-1"/> Actif</span>
                      ) : (
                        <span className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200"><XCircle size={10} className="mr-1"/> Inactif</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    {user.email}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {user.role === 'ADMIN' && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2 items-center">
                    <Link href={`/admin/users/${user.id}`} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors inline-block">
                      <Edit size={18} />
                    </Link>
                    <DeleteUserButton userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
