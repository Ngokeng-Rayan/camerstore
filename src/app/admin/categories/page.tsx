import prisma from "@/lib/prisma";
import CategoryForm from "./CategoryForm";
import DeleteCategoryBtn from "./DeleteCategoryBtn";

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6">Gestion des Catégories</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Ajouter une catégorie</h2>
        <CategoryForm />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Mobile View (Cards) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Aucune catégorie trouvée.</div>
          ) : (
            categories.map(category => (
              <div key={category.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-brand-navy text-lg">{category.name}</div>
                  <div className="text-sm text-slate-500 mt-1">{category._count.products} produit(s)</div>
                </div>
                <div>
                  <DeleteCategoryBtn id={category.id} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500">
                <th className="p-4 font-semibold">Nom de la catégorie</th>
                <th className="p-4 font-semibold text-center">Nombre de produits</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">
                    Aucune catégorie trouvée.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-navy">
                      {category.name}
                    </td>
                    <td className="p-4 text-center text-slate-600">
                      {category._count.products}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end">
                        <DeleteCategoryBtn id={category.id} />
                      </div>
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
