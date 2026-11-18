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
    label: 'En attente',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dotClass: 'bg-amber-500',
  },
  approuvee: {
    label: 'Approuvée',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
  },
  refusee: {
    label: 'Refusée',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dotClass: 'bg-rose-500',
  },
};

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR');
}

function computeDays(startStr: string, endStr: string): number {
  try {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    return Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)) + 1);
  } catch {
    return 1;
  }
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
      <div className="card-modern rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs" role="status" aria-live="polite">
        <div className="w-8 h-8 border-3 border-emerald-600/20 border-t-emerald-700 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Chargement des demandes...</p>
      </div>
    );
  }

  if (conges.length === 0) {
    return (
      <div className="card-modern rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 brand-title">Aucune demande enregistrée</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Les demandes de congés ou d'absences apparaîtront ici avec leur suivi de validation.
        </p>
      </div>
    );
  }

  if (showEmploye) {
    return (
      <div className="card-modern overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Collaborateur
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Motif
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Période
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Précisions
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Statut
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Décision
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
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
                  <tr key={conge.id} className="align-middle hover:bg-slate-50/70 transition-colors">
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shadow-xs">
                          {conge.employe.prenom[0]}
                          {conge.employe.nom[0]}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900 leading-none">
                            {conge.employe.prenom} {conge.employe.nom}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Demande du {formatDate(conge.dateDemande)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-800 font-medium">
                      {typeInfo.label}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-slate-700">
                      {periode} ({computeDays(conge.dateDebut, conge.dateFin)} j)
                    </td>
                    <td className="max-w-56 px-5 py-3.5 text-xs text-slate-600">
                      <span className="block truncate" title={conge.motif ?? ''}>
                        {conge.motif || conge.commentaireValidation || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-xs ${statutInfo.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statutInfo.dotClass}`} />
                        {statutInfo.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      {conge.statut === 'en_attente' && (
                        <div className="inline-flex items-center gap-2">
                          {onReject && (
                            <button
                              type="button"
                              onClick={() => onReject(conge)}
                              disabled={actionsPending}
                              className="btn-secondary py-1 px-3 text-rose-700 border-rose-200 hover:bg-rose-50 text-xs rounded-lg"
                            >
                              Refuser
                            </button>
                          )}
                          {onApprove && (
                            <button
                              type="button"
                              onClick={() => onApprove(conge)}
                              disabled={actionsPending}
                              className="btn-primary py-1 px-3 text-xs rounded-lg"
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
    <div className="card-modern divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
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

        return (
          <div
            key={conge.id}
            className="p-5 sm:p-6 space-y-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Employee + Type */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-xs">
                  <TypeIcon className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {showEmploye && (
                      <span className="font-bold text-sm text-slate-900">
                        {conge.employe.prenom} {conge.employe.nom}
                      </span>
                    )}
                    <span className="text-sm font-bold text-slate-900">
                      {typeInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Du <strong className="text-slate-800">{conge.dateDebut}</strong> au <strong className="text-slate-800">{conge.dateFin}</strong>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold border border-slate-200/60">
                      {computeDays(conge.dateDebut, conge.dateFin)} j
                    </span>
                  </p>
                </div>
              </div>

              {/* Right: Status Pill */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${statutInfo.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statutInfo.dotClass}`} />
                  {statutInfo.label}
                </span>
              </div>
            </div>

            {/* Motif if present */}
            {conge.motif && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700 block mb-0.5">Motif renseigné :</span>
                {conge.motif}
              </div>
            )}

            {/* Comment if present */}
            {conge.commentaireValidation && (
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950">Avis du responsable : </span>
                  <span>{conge.commentaireValidation}</span>
                </div>
              </div>
            )}

            {/* Actions for supervisors/RH if in pending state */}
            {conge.statut === 'en_attente' && (onApprove || onReject) && (
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                {onReject && (
                  <button
                    onClick={() => onReject(conge)}
                    disabled={actionsPending}
                    className="btn-secondary py-1.5 px-3.5 text-rose-700 border-rose-200 hover:bg-rose-50 text-xs rounded-xl"
                  >
                    <X className="w-3.5 h-3.5" />
                    Refuser
                  </button>
                )}
                {onApprove && (
                  <button
                    onClick={() => onApprove(conge)}
                    disabled={actionsPending}
                    className="btn-primary py-1.5 px-4 text-xs rounded-xl shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
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
