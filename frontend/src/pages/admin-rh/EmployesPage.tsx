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
    <div className="max-w-6xl mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
            <UserCog className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Gestion des Collaborateurs
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Annuaire RH
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administrez les fiches des employés, affectations de service, horaires et comptes utilisateurs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalState({ mode: 'create', employe: null })}
          className="btn-primary self-start sm:self-auto py-2.5 px-4 rounded-xl shadow-xs"
        >
          <UserPlus className="w-4 h-4 text-emerald-200" />
          <span>Nouveau collaborateur</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            Recherche & Filtres rapides
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Search keyword */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, matricule..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-10 pr-3.5 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
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
              className="w-full h-10 px-3.5 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            >
              <option value="">Tous les départements & services</option>
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
              className="w-full h-10 px-3.5 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            >
              <option value="">Tous les statuts d'activité</option>
              <option value="actif">Actif uniquement</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div role="alert" className="card-modern rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-rose-950">Impossible de charger les collaborateurs</p>
            <p className="mt-0.5 text-xs text-rose-700">Vérifiez la connexion avec l'API puis réessayez.</p>
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
            Page <strong className="text-slate-800">{data.meta.page}</strong> sur <strong className="text-slate-800">{data.meta.totalPages}</strong> ({data.meta.total} collaborateurs)
            {isFetching && <span className="text-emerald-700 ml-1.5 animate-pulse">· mise à jour...</span>}
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-enter">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md p-7 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 brand-title">
                  Compte créé avec succès
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matricule : <strong className="text-slate-900 font-mono">{temporaryPassword.matricule}</strong>
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2.5">
              <p className="text-xs text-slate-500 font-medium">Mot de passe temporaire unique généré :</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl font-extrabold text-slate-900 tracking-wider bg-white px-4 py-1.5 rounded-xl border border-slate-200/90 shadow-xs">
                  {temporaryPassword.password}
                </span>
                <button
                  type="button"
                  onClick={copyPassword}
                  title="Copier le mot de passe"
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  {copied ? <Check className="w-4.5 h-4.5 text-emerald-600" /> : <Copy className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Ce mot de passe ne sera <strong>plus jamais réaffiché</strong>. Transmettez-le au collaborateur. Il sera invité à le changer dès son premier accès.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTemporaryPassword(null)}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl"
              >
                J'ai bien noté le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Confirmation Modal */}
      {pendingDeactivation && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-enter">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-sm p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 brand-title">
                Désactiver ce collaborateur ?
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>{pendingDeactivation.prenom} {pendingDeactivation.nom}</strong> ne pourra plus
                accéder à l'application ni pointer. L'historique complet est conservé en base.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPendingDeactivation(null)}
                className="btn-secondary py-2 px-3.5 rounded-xl text-xs"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeactivation}
                disabled={deactivateMutation.isPending}
                className="btn-danger py-2 px-4 rounded-xl text-xs shadow-xs"
              >
                {deactivateMutation.isPending ? 'Désactivation...' : 'Confirmer la désactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
