import { useState } from 'react';
import { History, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { PointageWidget } from '../../components/PointageWidget';
import { PointageHistoryTable } from '../../components/PointageHistoryTable';
import { usePointagesList } from '../../hooks/usePointage';

export function PointagePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = usePointagesList({ page, limit: 10 });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <Clock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Pointage & Présence
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Temps réel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enregistrez vos prises de poste quotidiennes et consultez l'historique complet de votre assiduité.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <PointageWidget />
      </div>

      {/* History Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 brand-title">
                Historique de mes pointages
              </h2>
              <p className="text-[11px] text-slate-400">
                {data ? `${data.meta.total} enregistrement(s)` : 'Chargement...'}
              </p>
            </div>
          </div>
        </div>

        {isError ? (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <p className="text-sm font-semibold text-rose-900">Impossible de charger l’historique des pointages.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="btn-secondary shrink-0 disabled:opacity-50"
            >
              {isFetching ? 'Chargement…' : 'Réessayer'}
            </button>
          </div>
        ) : (
          <PointageHistoryTable pointages={data?.items ?? []} isLoading={isLoading} />
        )}

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 px-1 text-xs text-slate-500">
            <span className="font-medium">
              Page <strong className="text-slate-800">{data.meta.page}</strong> sur <strong className="text-slate-800">{data.meta.totalPages}</strong>
              {isFetching && <span className="text-emerald-700 ml-1.5 animate-pulse">· actualisation...</span>}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Précédent
              </button>
              <button
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary disabled:opacity-40"
              >
                Suivant
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
