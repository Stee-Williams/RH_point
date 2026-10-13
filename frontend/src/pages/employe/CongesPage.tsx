import { useState } from 'react';
import {
  Send,
  History,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CongeRequestForm } from '../../components/CongeRequestForm';
import { CongeList } from '../../components/CongeList';
import { useCongesList } from '../../hooks/useConges';
export function CongesPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const { data, isLoading, isError, refetch, isFetching } = useCongesList({ page: 1, limit: 20 });
  const totalDemandes = data?.meta?.total ?? 0;
  const enAttente = data?.items?.filter((c) => c.statut === 'en_attente').length ?? 0;
  const approuvees = data?.items?.filter((c) => c.statut === 'approuvee').length ?? 0;
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
              Congés & Absences
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Consultez vos compteurs de droits, posez vos congés et suivez les validations.
          </p>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('new')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white text-emerald-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Nouvelle demande
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-emerald-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Mes demandes ({totalDemandes})
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Demandes enregistrées</p>
          <p className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {isLoading || isError ? '—' : totalDemandes}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">En attente · 20 plus récentes</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-xl font-semibold text-amber-700 tabular-nums">
            <Clock className="h-4 w-4" /> {isLoading || isError ? '—' : enAttente}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Approuvées · 20 plus récentes</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-xl font-semibold text-emerald-800 tabular-nums">
            <CheckCircle2 className="h-4 w-4" /> {isLoading || isError ? '—' : approuvees}
          </p>
        </div>
      </section>

      {/* Tab content */}
      {activeTab === 'new' ? (
        <div className="space-y-6">
          <CongeRequestForm />
        </div>
      ) : isError ? (
        <div role="alert" className="flex flex-col gap-3 border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-900">Impossible de charger vos demandes</p>
            <p className="mt-0.5 text-xs text-rose-800">
              Vérifiez votre connexion puis réessayez. Les demandes ne sont pas affichées comme une liste vide.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="shrink-0 rounded border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
          >
            {isFetching ? 'Chargement…' : 'Réessayer'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 brand-title">
              Historique de vos demandes
            </h2>
          </div>
          <CongeList conges={data?.items ?? []} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
