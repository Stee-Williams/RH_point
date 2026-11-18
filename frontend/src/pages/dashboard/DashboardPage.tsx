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
  UserCheck,
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
    <div className="max-w-6xl mx-auto space-y-8 animate-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
            <LayoutDashboard className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Tableau de Bord RH
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Données consolidées
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi d'assiduité, présences en temps réel et indicateurs mensuels d'activité.
            </p>
          </div>
        </div>

        {/* Date Filter & Export */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
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
            className="btn-secondary py-1.5 px-3 rounded-xl shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Présents */}
        <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Présents ce jour
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-xs">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {isLoadingSummary ? '—' : summary?.nbPresents ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-700">en poste</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Taux de présence :</span>
            <strong className="text-slate-800 font-mono">{tauxPresence}%</strong>
          </div>
        </div>

        {/* Card 2: Retards */}
        <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Retards constatés
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {isLoadingSummary ? '—' : summary?.nbRetards ?? 0}
            </span>
            <span className="text-xs font-semibold text-amber-700">employé(s)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Impact horaire :</span>
            <strong className="text-amber-800 font-mono">Prioritaire</strong>
          </div>
        </div>

        {/* Card 3: Absents estimés */}
        <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Absences à vérifier
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/60 shadow-xs">
              <UserX className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {isLoadingSummary ? '—' : summary?.nbAbsentsEstimes ?? 0}
            </span>
            <span className="text-xs font-semibold text-rose-700">sans pointage</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Régularisation :</span>
            <Link to="/presences" className="text-xs font-semibold text-rose-800 hover:underline">
              Inspecter
            </Link>
          </div>
        </div>

        {/* Card 4: Demandes en attente */}
        <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Congés à valider
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/60 shadow-xs">
              <ClipboardCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {isLoadingConges ? '—' : pendingConges?.meta.total ?? 0}
            </span>
            <span className="text-xs font-semibold text-indigo-700">en attente</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Workflow :</span>
            <Link to="/validation-conges" className="text-xs font-semibold text-indigo-800 hover:underline">
              Traiter
            </Link>
          </div>
        </div>
      </div>

      {/* Action Items List Card */}
      <section className="card-modern overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-emerald-800" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 brand-title">À traiter en priorité</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 tabular-nums bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
            {isLoadingConges ? '…' : `${pendingConges?.meta.total ?? 0} demande(s) en attente`}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoadingSummary ? (
            <div className="px-6 py-4 text-xs font-medium text-slate-500">Chargement des alertes…</div>
          ) : isSummaryError ? (
            <div role="alert" className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-rose-50/50">
              <p className="text-sm text-rose-900 font-medium">
                Impossible de charger les alertes de présence.
              </p>
              <button
                type="button"
                onClick={() => void refetchSummary()}
                disabled={isFetchingSummary}
                className="btn-secondary text-xs"
              >
                {isFetchingSummary ? 'Chargement…' : 'Réessayer'}
              </button>
            </div>
          ) : summary ? (
            <>
              {summary.nbAbsentsEstimes > 0 && (
                <Link
                  to="/presences"
                  className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex items-center gap-3 text-sm text-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/60">
                      <UserX className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900">
                      {summary.nbAbsentsEstimes} absence(s) estimée(s) à vérifier dans l'équipe
                    </span>
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-rose-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspecter</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              )}

              {summary.nbRetards > 0 && (
                <Link
                  to="/presences"
                  className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex items-center gap-3 text-sm text-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900">
                      {summary.nbRetards} retard(s) enregistré(s) aujourd'hui
                    </span>
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-800 group-hover:translate-x-0.5 transition-transform">
                    <span>Voir la liste</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              )}

              {summary.nbAbsentsEstimes === 0 && summary.nbRetards === 0 && (
                <p className="px-6 py-3.5 text-xs font-medium text-slate-500">
                  Parfait : aucune anomalie ni absence non justifiée constatée pour l'instant.
                </p>
              )}
            </>
          ) : null}

          {isCongesError ? (
            <div role="alert" className="flex items-center justify-between gap-3 px-6 py-3.5 bg-rose-50/50">
              <p className="text-sm text-rose-800 font-medium">Impossible de charger les demandes de congé.</p>
              <button
                type="button"
                onClick={() => void refetchConges()}
                disabled={isFetchingConges}
                className="btn-secondary text-xs"
              >
                {isFetchingConges ? 'Chargement…' : 'Réessayer'}
              </button>
            </div>
          ) : isLoadingConges ? (
            <p className="px-6 py-3.5 text-xs text-slate-500">Chargement des demandes…</p>
          ) : pendingConges?.items.length ? (
            pendingConges.items.map((conge) => (
              <Link
                key={conge.id}
                to="/validation-conges"
                className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200/60">
                    {conge.employe.prenom[0]}
                    {conge.employe.nom[0]}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {conge.employe.prenom} {conge.employe.nom}
                      <span className="ml-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                        {conge.typeConge.replace(/_/g, ' ')}
                      </span>
                    </span>
                    <span className="block text-xs text-slate-500 font-medium mt-0.5">
                      Période : {formatDateRange(conge.dateDebut, conge.dateFin)}
                    </span>
                  </div>
                </div>
                <div className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
                  <span>Valider</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
                </div>
              </Link>
            ))
          ) : (
            <p className="px-6 py-3.5 text-xs font-medium text-slate-500">Toutes les demandes de congés ont été traitées.</p>
          )}
        </div>

        {summary && !isLoadingSummary && (
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-3 sm:flex-row sm:items-center sm:justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              Taux global d'assiduité du service
            </span>
            <span className="font-mono text-xs font-bold text-slate-900">
              {tauxPresence}% de présence active ({summary.nbPresents} présent(s))
            </span>
          </div>
        )}
      </section>

      {/* Monthly Statistics Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60">
              <Award className="w-4 h-4 text-emerald-700" />
            </div>
            <h2 className="text-base font-bold text-slate-900 brand-title">
              Statistiques mensuelles par collaborateur
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Vue consolidée en base de données
          </span>
        </div>

        {isLoadingStats ? (
          <div className="card-modern rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs" role="status" aria-live="polite">
            <div className="w-8 h-8 border-3 border-emerald-600/20 border-t-emerald-700 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Chargement des indicateurs mensuels...</p>
          </div>
        ) : isStatsError ? (
          <div role="alert" className="card-modern rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Impossible de charger les statistiques mensuelles
              </h3>
              <p className="mt-0.5 text-xs text-rose-700">
                Les autres sections restent consultables.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refetchStats()}
              disabled={isFetchingStats}
              className="btn-secondary text-xs"
            >
              {isFetchingStats ? 'Chargement…' : 'Réessayer'}
            </button>
          </div>
        ) : !stats || stats.length === 0 ? (
          <div className="card-modern rounded-2xl border border-slate-200/80 bg-white p-10 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200/60">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 brand-title">
              Statistiques mensuelles en attente de calcul
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              La vue matérialisée n'a pas encore été rafraîchie. Lancez la commande en console :
              <br />
              <code className="inline-block mt-2.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 font-mono text-[11px] border border-slate-200 shadow-xs">
                php bin/console app:dashboard:refresh-stats
              </code>
            </p>
          </div>
        ) : (
          <div className="card-modern overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead>
                  <tr className="bg-slate-50/70">
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Collaborateur
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Jours présents
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Retards
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Cumul retard
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Heures supplémentaires
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {stats.map((s) => (
                    <tr key={s.employeId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-800 to-teal-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {s.prenom[0]}
                            {s.nom[0]}
                          </div>
                          <span className="font-bold text-slate-900">
                            {s.prenom} {s.nom}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 font-mono">{s.joursPresents}</span>
                        <span className="text-xs text-slate-400 ml-1.5 font-medium">jours</span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {s.nbRetards > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            {s.nbRetards}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">0</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-700">
                        {s.totalMinutesRetard > 0 ? (
                          <span className="text-amber-700 font-bold">
                            {s.totalMinutesRetard} min
                          </span>
                        ) : (
                          <span className="text-slate-400">0 min</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap font-mono">
                        {s.totalMinutesHs > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80">
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
