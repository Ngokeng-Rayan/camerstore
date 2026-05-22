import Link from 'next/link';
import { PackageX } from 'lucide-react';
import { FrontNavbar } from '@/components/FrontNavbar';
import { FrontFooter } from '@/components/FrontFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <FrontNavbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full flex flex-col items-center">
          <div className="w-24 h-24 bg-red-50 text-brand-red rounded-full flex items-center justify-center mb-6">
            <PackageX size={48} />
          </div>
          <h1 className="text-4xl font-black text-brand-navy mb-4">404</h1>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Page introuvable</h2>
          <p className="text-slate-500 mb-8">
            Désolé, la page ou le produit que vous recherchez n'existe pas ou a été déplacé.
          </p>
          <Link 
            href="/"
            className="bg-brand-green hover:bg-lime-500 text-brand-navy font-bold text-lg px-8 py-4 rounded-xl transition-transform transform hover:-translate-y-1 shadow-lg w-full md:w-auto"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
      <FrontFooter />
    </div>
  );
}
