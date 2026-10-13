import { Clock, Calendar } from 'lucide-react';
import type { Pointage, PointageStatut } from '../types/pointage';
const statutConfig: Record<
  PointageStatut,
  { label: string; badgeClass: string; dotClass: string }
> = {
  present: {
    label: 'Présent',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  retard: {
    label: 'Retard',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  depart_anticipe: {
    label: 'Départ anticipé',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    dotClass: 'bg-orange-500',
  },
  absent: {
    label: 'Absent',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
};
interface PointageHistoryTableProps {
  pointages: Pointage[];
  isLoading: boolean;
  showEmploye?: boolean;
}
export function PointageHistoryTable({
  pointages,
  isLoading,
  showEmploye = false,
}: PointageHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="border-y border-slate-200 bg-white p-8 text-center" role="status" aria-live="polite">
        <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium text-slate-500">Chargement de l'historique...</p>
      </div>
    );
  }
  if (pointages.length === 0) {
    return (
      <div className="border-y border-slate-200 bg-white p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Aucun pointage enregistré</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Les enregistrements d'arrivée et de départ apparaîtront automatiquement ici au fur et à
          mesure des pointages.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden border-y border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              {showEmploye && (
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Employé
                </th>
              )}
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Arrivée
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Départ
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Retard
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Heures sup.
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pointages.map((p) => {
              const statut = statutConfig[p.statut] ?? {
                label: p.statut,
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                dotClass: 'bg-slate-400',
              };
              return (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  {/* Date */}
                  <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.datePointage}</span>
                    </div>
                  </td>
                  {/* Employe if shown */}
                  {showEmploye && (
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">
                          {p.employe.prenom[0]}
                          {p.employe.nom[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">
                            {p.employe.prenom} {p.employe.nom}
                          </p>
                        </div>
                      </div>
                    </td>
                  )}
                  {/* Arrivee */}
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-700">
                    {p.heureArrivee ? (
                      <span className="font-semibold text-slate-900">{p.heureArrivee}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  {/* Depart */}
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-700">
                    {p.heureDepart ? (
                      <span className="font-semibold text-slate-900">{p.heureDepart}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  {/* Retard */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {p.retardMinutes > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        +{p.retardMinutes} min
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">0 min</span>
                    )}
                  </td>
                  {/* Heures sup */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {p.heuresSupplementairesMinutes > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        +{p.heuresSupplementairesMinutes} min
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">0 min</span>
                    )}
                  </td>
                  {/* Statut pill */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statut.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statut.dotClass}`} />
                      {statut.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
