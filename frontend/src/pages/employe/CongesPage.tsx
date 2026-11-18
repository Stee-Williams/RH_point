import { useState } from 'react';
import {
  Send,
  History,
  CheckCircle2,
  Clock,
  CalendarDays,
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
    <div className="max-w-5xl mx-auto space-y-8 animate-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
            <CalendarDays className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Congés & Absences
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Droits & Permissions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Posez vos congés, consultez l'historique et suivez l'avancement des validations de votre responsable.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('new')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nouvelle demande</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mes demandes ({totalDemandes})</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total demandes
          </span>
          <p className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
            {isLoading || isError ? '—' : totalDemandes}
          </p>
          <p className="text-xs text-slate-500 mt-1">historique complet</p>
        </div>

        <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/80 block mb-1">
            En attente de validation
          </span>
          <p className="flex items-center gap-2 font-mono text-3xl font-extrabold text-amber-700 tabular-nums">
            <Clock className="h-6 w-6 text-amber-600" />
            <span>{isLoading || isError ? '—' : enAttente}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">en cours de traitement</p>
        </div>

        <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80 block mb-1">
            Approuvées
          </span>
          <p className="flex items-center gap-2 font-mono text-3xl font-extrabold text-emerald-800 tabular-nums">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <span>{isLoading || isError ? '—' : approuvees}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">validées par la hiérarchie</p>
        </div>
      </section>

      {/* Tab content */}
      {activeTab === 'new' ? (
        <div className="space-y-6">
          <CongeRequestForm />
        </div>
      ) : isError ? (
        <div role="alert" className="card-modern rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-rose-950">Impossible de charger vos demandes</p>
            <p className="mt-0.5 text-xs text-rose-700">
              Vérifiez votre connexion puis réessayez.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs"
          >
            {isFetching ? 'Chargement…' : 'Réessayer'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <CongeList conges={data?.items ?? []} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
