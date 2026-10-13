import {
  User,
  Building2,
  Briefcase,
  Edit2,
  UserX,
  Mail,
} from 'lucide-react';
import type { Employe, EmployeStatut } from '../types/employe';
interface EmployeTableProps {
  employes: Employe[];
  isLoading: boolean;
  onEdit: (employe: Employe) => void;
  onDeactivate: (employe: Employe) => void;
}
const statutConfig: Record<
  EmployeStatut,
  { label: string; badgeClass: string; dotClass: string }
> = {
  actif: {
    label: 'Actif',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  inactif: {
    label: 'Inactif',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  suspendu: {
    label: 'Suspendu',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
};
export function EmployeTable({ employes, isLoading, onEdit, onDeactivate }: EmployeTableProps) {
  if (isLoading) {
    return (
      <div className="border-y border-slate-200 bg-white p-8 text-center" role="status" aria-live="polite">
        <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium text-slate-500">Chargement des collaborateurs...</p>
      </div>
    );
  }
  if (employes.length === 0) {
    return (
      <div className="border-y border-slate-200 bg-white p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Aucun employé trouvé</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Aucun collaborateur ne correspond à vos critères de recherche.
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
                Collaborateur
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Matricule
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Service & Poste
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employes.map((employe) => {
              const statut = statutConfig[employe.statut] ?? {
                label: employe.statut,
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                dotClass: 'bg-slate-400',
              };
              return (
                <tr key={employe.id} className="hover:bg-blue-50/30 transition-colors">
                  {/* Name and Avatar */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-brand text-white font-semibold text-xs flex items-center justify-center">
                        {employe.prenom[0]}
                        {employe.nom[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-none">
                          {employe.prenom} {employe.nom}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {employe.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Matricule */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                      {employe.matricule}
                    </span>
                  </td>
                  {/* Service & Poste */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-slate-800 text-xs flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        {employe.service?.nom ?? 'Sans service'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {employe.poste ?? 'Poste non précisé'}
                      </p>
                    </div>
                  </td>
                  {/* Statut Pill */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statut.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statut.dotClass}`} />
                      {statut.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(employe)}
                        title="Modifier la fiche employé"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {employe.statut !== 'inactif' && (
                        <button
                          onClick={() => onDeactivate(employe)}
                          title="Désactiver le compte"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
