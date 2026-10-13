import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  UserX,
  TrendingUp,
  Award,
  Info,
  Download,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';
import { useDashboardSummary, useStatistiquesMensuelles } from '../../hooks/useDashboard';
import { useCongesList } from '../../hooks/useConges';
function formatDateRange(start: string, end: string) {
  const formatDate = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };
  return start.slice(0, 10) === end.slice(0, 10)
    ? formatDate(start)
    : `${formatDate(start)} – ${formatDate(end)}`;
}

export function DashboardPage() {
  const [date, setDate] = useState('');
  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isSummaryError,
    refetch: refetchSummary,
    isFetching: isFetchingSummary,
  } = useDashboardSummary(date || undefined);
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useStatistiquesMensuelles();
  const {
    data: pendingConges,
    isLoading: isLoadingConges,
    isError: isCongesError,
    refetch: refetchConges,
    isFetching: isFetchingConges,
  } = useCongesList({ statut: 'en_attente', page: 1, limit: 5 });

  // Calculated attendance rate
  const totalActifs = (summary?.nbPresents ?? 0) + (summary?.nbAbsentsEstimes ?? 0);
  const tauxPresence = totalActifs > 0 ? Math.round(((summary?.nbPresents ?? 0) / totalActifs) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Tableau de Bord RH
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                Données en direct
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Indicateurs de performance, assiduité et données consolidées de présence.
            </p>
          </div>
        </div>

        {/* Date Filter & Export */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Date :</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs text-slate-900 border-none bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      <section className="overflow-hidden border-y border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-semibold text-slate-900">À traiter aujourd'hui</h2>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            {isLoadingConges ? '…' : `${pendingConges?.meta.total ?? 0} demande(s) en attente`}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoadingSummary ? (
            <div className="px-4 py-3 text-xs text-slate-500">Chargement des alertes…</div>
          ) : isSummaryError ? (
            <div role="alert" className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-rose-800">
                Impossible de charger les alertes de présence.
              </p>
              <button
                type="button"
                onClick={() => void refetchSummary()}
                disabled={isFetchingSummary}
                className="self-start rounded border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-50 disabled:opacity-50 sm:self-auto"
              >
                {isFetchingSummary ? 'Chargement…' : 'Réessayer'}
              </button>
            </div>
          ) : summary ? (
            <>
              {summary.nbAbsentsEstimes > 0 && (
                <Link
                  to="/presences"
                  className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2 text-sm text-slate-800">
                    <UserX className="w-4 h-4 text-rose-700" />
                    {summary.nbAbsentsEstimes} absence(s) estimée(s) à vérifier
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )}
              {summary.nbRetards > 0 && (
                <Link
                  to="/presences"
                  className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2 text-sm text-slate-800">
                    <Clock className="w-4 h-4 text-amber-700" />
                    {summary.nbRetards} retard(s) enregistré(s) aujourd'hui
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )}
              {summary.nbAbsentsEstimes === 0 && summary.nbRetards === 0 && (
                <p className="px-4 py-2.5 text-sm text-slate-500">Aucune alerte de présence pour le moment.</p>
              )}
            </>
          ) : null}

          {isCongesError ? (
            <div role="alert" className="flex items-center justify-between gap-3 px-4 py-2.5">
              <p className="text-sm text-rose-700">Impossible de charger les demandes de congé en attente.</p>
              <button
                type="button"
                onClick={() => void refetchConges()}
                disabled={isFetchingConges}
                className="btn-secondary shrink-0 disabled:opacity-50"
              >
                {isFetchingConges ? 'Chargement…' : 'Réessayer'}
              </button>
            </div>
          ) : isLoadingConges ? (
            <p className="px-4 py-2.5 text-sm text-slate-500">Chargement des demandes…</p>
          ) : pendingConges?.items.length ? (
            pendingConges.items.map((conge) => (
              <Link
                key={conge.id}
                to="/validation-conges"
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {conge.employe.prenom} {conge.employe.nom}
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      {conge.typeConge.replace(/_/g, ' ')}
                    </span>
                  </span>
                  <span className="block text-xs text-slate-500">
                    {formatDateRange(conge.dateDebut, conge.dateFin)}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-800">
                  À valider <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))
          ) : (
            <p className="px-4 py-2.5 text-sm text-slate-500">Aucune demande de congé en attente.</p>
          )}
        </div>

        {summary && !isLoadingSummary && (
          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              Présence aujourd'hui
            </span>
            <span className="font-mono text-xs font-semibold text-slate-800">
              {tauxPresence}% · {summary.nbPresents} présent(s)
            </span>
          </div>
        )}
      </section>

      {/* Monthly Statistics Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 brand-title">
              Statistiques mensuelles par collaborateur
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Vue matérialisée PostgreSQL consolidée
          </span>
        </div>

        {isLoadingStats ? (
          <div className="border-y border-slate-200 bg-white p-8 text-center" role="status" aria-live="polite">
            <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Chargement des statistiques...</p>
          </div>
        ) : isStatsError ? (
          <div role="alert" className="flex flex-col gap-3 border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-rose-900">
                Impossible de charger les statistiques mensuelles
              </h3>
              <p className="mt-1 text-xs text-rose-800">
                Réessayez dans quelques instants. Les autres éléments du tableau de bord restent disponibles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refetchStats()}
              disabled={isFetchingStats}
              className="shrink-0 rounded border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
            >
              {isFetchingStats ? 'Chargement…' : 'Réessayer'}
            </button>
          </div>
        ) : !stats || stats.length === 0 ? (
          <div className="border-y border-slate-200 bg-white p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              Statistiques mensuelles en attente de calcul
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              La vue matérialisée <code>mv_statistiques_mensuelles_employe</code> n'a pas encore été
              rafraîchie. Vous pouvez exécuter la commande Symfony :
              <br />
              <code className="inline-block mt-2 px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px] border border-slate-200">
                php bin/console app:dashboard:refresh-stats
              </code>
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border-y border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Collaborateur
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Jours présents
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Retards
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Total retard
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Heures supplémentaires
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.map((s) => (
                    <tr key={s.employeId} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-brand text-white font-semibold text-xs flex items-center justify-center">
                            {s.prenom[0]}
                            {s.nom[0]}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {s.prenom} {s.nom}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{s.joursPresents}</span>
                        <span className="text-xs text-slate-400 ml-1">jours</span>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        {s.nbRetards > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {s.nbRetards}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0</span>
                        )}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap font-mono text-slate-700">
                        {s.totalMinutesRetard > 0 ? (
                          <span className="text-amber-600 font-semibold">
                            {s.totalMinutesRetard} min
                          </span>
                        ) : (
                          <span className="text-slate-400">0 min</span>
                        )}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap font-mono">
                        {s.totalMinutesHs > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                            +{s.totalMinutesHs} min
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0 min</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
