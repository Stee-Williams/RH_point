import { useState } from 'react';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { PointageWidget } from '../../components/PointageWidget';
import { PointageHistoryTable } from '../../components/PointageHistoryTable';
import { usePointagesList } from '../../hooks/usePointage';
export function PointagePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = usePointagesList({ page, limit: 10 });
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
              Pointage & Présence
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enregistrez votre prise de poste et consultez l'historique complet de vos pointages.
          </p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        <PointageWidget />
      </div>
      {/* History Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 brand-title">
                Historique de mes pointages
              </h2>
              <p className="text-xs text-slate-500">
                {data ? `${data.meta.total} pointage(s) enregistré(s)` : 'Chargement...'}
              </p>
            </div>
          </div>
        </div>

        {isError ? (
          <div role="alert" className="flex flex-col gap-3 border-y border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-rose-900">Impossible de charger l’historique des pointages.</p>
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
          <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
            <span className="font-medium">
              Page {data.meta.page} sur {data.meta.totalPages}
              {isFetching && <span className="text-blue-600 ml-1.5 animate-pulse">· mise à jour...</span>}
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
