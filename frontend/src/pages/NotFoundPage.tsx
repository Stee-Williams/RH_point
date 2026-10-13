import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getHomePath } from '../types/auth';
export function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();
  const destination = isAuthenticated && user ? getHomePath(user.role) : '/connexion';
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f6f3] px-4 text-slate-900">
      <section className="w-full max-w-md border border-[#e0e0da] bg-white p-6 sm:p-8">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-800">
          <FileQuestion className="h-5 w-5" />
        </div>
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-emerald-800">
          Erreur 404
        </p>
        <h1 className="mt-2 text-xl font-semibold">Cette page est introuvable</h1>
        <p className="mt-2 text-sm text-slate-600">
          L’adresse est peut-être incorrecte, ou la page a été déplacée.
        </p>
        <Link
          to={destination}
          className="mt-6 inline-flex items-center gap-2 rounded bg-[#0f5c4d] px-3 py-2 text-sm font-medium text-white hover:bg-[#0b493e]"
        >
          <ArrowLeft className="h-4 w-4" />
          {isAuthenticated ? 'Retour à mon espace' : 'Retour à la connexion'}
        </Link>
      </section>
    </main>
  );
}
