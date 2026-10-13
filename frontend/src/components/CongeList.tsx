import {
  Calendar,
  Clock,
  FileText,
  SunMedium,
  MessageSquare,
  Check,
  X,
} from 'lucide-react';
import type { Conge, CongeStatut, CongeType } from '../types/conge';
const typeConfig: Record<
  CongeType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  conge_annuel: { label: 'Congé annuel', icon: SunMedium },
  permission: { label: 'Permission', icon: Clock },
  absence_justifiee: { label: 'Absence justifiée', icon: FileText },
};
const statutConfig: Record<
  CongeStatut,
  { label: string; badgeClass: string; dotClass: string }
> = {
  en_attente: {
    label: 'En attente de validation',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  approuvee: {
    label: 'Approuvée',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  refusee: {
    label: 'Refusée',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
};
function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR');
}
interface CongeListProps {
  conges: Conge[];
  isLoading: boolean;
  showEmploye?: boolean;
  onApprove?: (conge: Conge) => void;
  onReject?: (conge: Conge) => void;
  actionsPending?: boolean;
}
export function CongeList({
  conges,
  isLoading,
  showEmploye = false,
  onApprove,
  onReject,
  actionsPending,
}: CongeListProps) {
  if (isLoading) {
    return (
      <div className="border-y border-slate-200 bg-white p-8 text-center" role="status" aria-live="polite">
        <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium text-slate-500">Chargement des demandes...</p>
      </div>
    );
  }
  if (conges.length === 0) {
    return (
      <div className="border-y border-slate-200 bg-white p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Aucune demande enregistrée</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Les demandes de congés ou de permissions apparaîtront ici avec leur statut de validation.
        </p>
      </div>
    );
  }
  if (showEmploye) {
    return (
      <div className="card-modern overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Collaborateur
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Demande
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Période
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Motif
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Statut
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conges.map((conge) => {
                const typeInfo = typeConfig[conge.typeConge] ?? {
                  label: conge.typeConge,
                  icon: Calendar,
                };
                const statutInfo = statutConfig[conge.statut] ?? {
                  label: conge.statut,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                  dotClass: 'bg-slate-400',
                };
                const periode = `${formatDate(conge.dateDebut)} – ${formatDate(conge.dateFin)}`;

                return (
                  <tr key={conge.id} className="align-middle hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className="block font-medium text-slate-900">
                        {conge.employe.prenom} {conge.employe.nom}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Demande du {formatDate(conge.dateDemande)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{typeInfo.label}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-700">
                      {periode}
                    </td>
                    <td className="max-w-56 px-3 py-2 text-xs text-slate-600">
                      <span className="block truncate" title={conge.motif ?? ''}>
                        {conge.motif || conge.commentaireValidation || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statutInfo.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statutInfo.dotClass}`} />
                        {statutInfo.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {conge.statut === 'en_attente' && (
                        <div className="inline-flex items-center gap-1">
                          {onReject && (
                            <button
                              type="button"
                              onClick={() => onReject(conge)}
                              disabled={actionsPending}
                              className="btn-secondary border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            >
                              Refuser
                            </button>
                          )}
                          {onApprove && (
                            <button
                              type="button"
                              onClick={() => onApprove(conge)}
                              disabled={actionsPending}
                              className="btn-primary disabled:opacity-50"
                            >
                              Approuver
                            </button>
                          )}
                        </div>
                      )}
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

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {conges.map((conge) => {
        const typeInfo = typeConfig[conge.typeConge] ?? {
          label: conge.typeConge,
          icon: Calendar,
        };
        const TypeIcon = typeInfo.icon;

        const statutInfo = statutConfig[conge.statut] ?? {
          label: conge.statut,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          dotClass: 'bg-slate-400',
        };

        // Duration calculation
        let durationDays = 1;
        if (conge.dateDebut && conge.dateFin) {
          const start = new Date(conge.dateDebut).getTime();
          const end = new Date(conge.dateFin).getTime();
          durationDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)) + 1);
        }

        return (
          <div
            key={conge.id}
            className="px-4 py-4 space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Employee + Type */}
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {showEmploye && (
                      <span className="font-bold text-sm text-slate-900">
                        {conge.employe.prenom} {conge.employe.nom}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-slate-800">
                      {typeInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Du <strong>{conge.dateDebut}</strong> au <strong>{conge.dateFin}</strong>
                    <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                      {durationDays} j
                    </span>
                  </p>
                </div>
              </div>

              {/* Right: Status Pill */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statutInfo.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statutInfo.dotClass}`} />
                  {statutInfo.label}
                </span>
              </div>
            </div>

            {/* Motif if present */}
            {conge.motif && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-0.5">Motif renseigné :</span>
                {conge.motif}
              </div>
            )}

            {/* Comment if present */}
            {conge.commentaireValidation && (
              <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-blue-950">Avis de validation : </span>
                  <span>{conge.commentaireValidation}</span>
                </div>
              </div>
            )}

            {/* Actions for supervisors/RH if in pending state */}
            {conge.statut === 'en_attente' && (onApprove || onReject) && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                {onReject && (
                  <button
                    onClick={() => onReject(conge)}
                    disabled={actionsPending}
                    className="btn-secondary border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Refuser
                  </button>
                )}
                {onApprove && (
                  <button
                    onClick={() => onApprove(conge)}
                    disabled={actionsPending}
                    className="btn-primary disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approuver la demande
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
