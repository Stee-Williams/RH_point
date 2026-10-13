import { useMemo, useState } from 'react';
import {
  UserCog,
  UserPlus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useCreateEmploye, useDeactivateEmploye, useEmployesList, useUpdateEmploye } from '../../hooks/useEmployes';
import { useServiceOptions } from '../../hooks/useReferenceData';
import { EmployeTable } from '../../components/EmployeTable';
import { EmployeFormModal, type EmployeFormValues } from '../../components/EmployeFormModal';
import type { Employe, EmployeCreatePayload, EmployeStatut, EmployeUpdatePayload } from '../../types/employe';
function toOptionalNumber(value?: string): number | undefined {
  return value ? Number(value) : undefined;
}
function toOptionalString(value?: string): string | undefined {
  return value && value.trim() !== '' ? value : undefined;
}
export function EmployesPage() {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState<EmployeStatut | ''>('');
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; employe: Employe | null } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<{ matricule: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingDeactivation, setPendingDeactivation] = useState<Employe | null>(null);
  const listParams = useMemo(
    () => ({
      q: search || undefined,
      serviceId: serviceFilter ? Number(serviceFilter) : undefined,
      statut: statutFilter,
      page,
      limit: 15,
    }),
    [search, serviceFilter, statutFilter, page]
  );
  const { data, isLoading, isFetching, isError, refetch } = useEmployesList(listParams);
  const { data: services } = useServiceOptions();
  const createMutation = useCreateEmploye();
  const updateMutation = useUpdateEmploye();
  const deactivateMutation = useDeactivateEmploye();
  const closeModal = () => {
    setModalState(null);
    setFormError(null);
  };
  const handleSubmit = async (values: EmployeFormValues) => {
    setFormError(null);
    try {
      if (modalState?.mode === 'create') {
        const payload: EmployeCreatePayload = {
          matricule: values.matricule,
          email: values.email,
          nom: values.nom,
          prenom: values.prenom,
          telephone: toOptionalString(values.telephone),
          dateNaissance: toOptionalString(values.dateNaissance),
          dateEmbauche: values.dateEmbauche,
          poste: toOptionalString(values.poste),
          serviceId: toOptionalNumber(values.serviceId),
          horaireId: toOptionalNumber(values.horaireId),
        };
        const result = await createMutation.mutateAsync(payload);
        setTemporaryPassword({ matricule: result.employe.matricule, password: result.motDePasseTemporaire });
      } else if (modalState?.employe) {
        const payload: EmployeUpdatePayload = {
          nom: values.nom,
          prenom: values.prenom,
          telephone: toOptionalString(values.telephone),
          dateNaissance: toOptionalString(values.dateNaissance),
          dateEmbauche: values.dateEmbauche,
          poste: toOptionalString(values.poste),
          serviceId: toOptionalNumber(values.serviceId),
          horaireId: toOptionalNumber(values.horaireId),
          statut: values.statut ?? 'actif',
        };
        await updateMutation.mutateAsync({ id: modalState.employe.id, payload });
      }
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Une erreur est survenue.');
    }
  };
  const confirmDeactivation = async () => {
    if (!pendingDeactivation) return;
    await deactivateMutation.mutateAsync(pendingDeactivation.id);
    setPendingDeactivation(null);
  };
  const copyPassword = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const hasActiveFilters = Boolean(search || serviceFilter || statutFilter);
  const resetFilters = () => {
    setSearch('');
    setServiceFilter('');
    setStatutFilter('');
    setPage(1);
  };
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
              Gestion du Personnel
            </h1>
            <p className="text-sm text-slate-500">
              Administrez les fiches collaborateurs, affectations et comptes d'accès.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalState({ mode: 'create', employe: null })}
          className="btn-primary self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Nouveau collaborateur
        </button>
      </div>
      {/* Filter and Search Bar */}
      <div className="filter-strip py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Recherche & Filtres
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search keyword */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, matricule..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
          {/* Service filter */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value="">Tous les services</option>
              {services?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>
          {/* Statut filter */}
          <div>
            <select
              value={statutFilter}
              onChange={(e) => {
                setStatutFilter(e.target.value as EmployeStatut | '');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
        </div>
      </div>
      {/* Table */}
      {isError ? (
        <div role="alert" className="flex flex-col gap-3 border-y border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-900">Impossible de charger les collaborateurs</p>
            <p className="mt-0.5 text-xs text-rose-800">Vérifiez votre connexion puis relancez le chargement.</p>
          </div>
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
        <EmployeTable
          employes={data?.items ?? []}
          isLoading={isLoading}
          onEdit={(employe) => setModalState({ mode: 'edit', employe })}
          onDeactivate={(employe) => setPendingDeactivation(employe)}
        />
      )}
      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
          <span className="font-medium">
            Page {data.meta.page} sur {data.meta.totalPages} ({data.meta.total} collaborateurs)
            {isFetching && <span className="text-blue-600 ml-1.5 animate-pulse">· actualisation...</span>}
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
      {/* Modal Form */}
      {modalState && (
        <EmployeFormModal
          mode={modalState.mode}
          initialEmploye={modalState.employe}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          serverError={formError}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
      {/* Temporary Password Reveal Modal */}
      {temporaryPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 brand-title">
                  Compte créé avec succès
                </h2>
                <p className="text-xs text-slate-500">
                  Matricule : <strong className="text-slate-800">{temporaryPassword.matricule}</strong>
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-500 font-medium">Mot de passe temporaire généré :</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-lg font-bold text-slate-900 tracking-wider bg-white px-3 py-1 rounded-lg border border-slate-200">
                  {temporaryPassword.password}
                </span>
                <button
                  type="button"
                  onClick={copyPassword}
                  title="Copier le mot de passe"
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                Ce mot de passe ne sera <strong>plus jamais réaffiché</strong>. Transmettez-le au
                collaborateur qui devra obligatoirement le modifier dès sa première connexion.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTemporaryPassword(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                J'ai bien noté le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Deactivation Confirmation Modal */}
      {pendingDeactivation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 brand-title">
                Désactiver ce collaborateur ?
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>{pendingDeactivation.prenom} {pendingDeactivation.nom}</strong> ne pourra plus
                se connecter ni pointer. L'historique complet des pointages et congés reste conservé
                dans la base de données.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPendingDeactivation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeactivation}
                disabled={deactivateMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {deactivateMutation.isPending ? 'Désactivation...' : 'Désactiver le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
