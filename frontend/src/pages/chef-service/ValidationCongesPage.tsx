import { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useApproveConge, useCongesList, useRejectConge } from '../../hooks/useConges';
import { CongeList } from '../../components/CongeList';
import type { Conge, CongeStatut } from '../../types/conge';
export function ValidationCongesPage() {
  const [statutFilter, setStatutFilter] = useState<CongeStatut | ''>('en_attente');
  const {
    data,
    isLoading,
    isError: isListError,
    isFetching,
    refetch,
  } = useCongesList({ statut: statutFilter, page: 1, limit: 50 });
  const approveMutation = useApproveConge();
  const rejectMutation = useRejectConge();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [approvingConge, setApprovingConge] = useState<Conge | null>(null);
  const [rejectingConge, setRejectingConge] = useState<Conge | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const handleOpenApproveModal = (conge: Conge) => {
    setApprovingConge(conge);
    setError(null);
    setSuccessMessage(null);
  };
  const handleConfirmApprove = async () => {
    if (!approvingConge) return;
    setError(null);
    try {
      await approveMutation.mutateAsync({ id: approvingConge.id });
      setApprovingConge(null);
      setSuccessMessage('La demande a été approuvée et l’employé en sera informé.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation.');
    }
  };
  const handleOpenRejectModal = (conge: Conge) => {
    setRejectingConge(conge);
    setRejectReason('');
    setError(null);
    setSuccessMessage(null);
  };
  const handleConfirmReject = async () => {
    if (!rejectingConge) return;
    setError(null);
    try {
      await rejectMutation.mutateAsync({
        id: rejectingConge.id,
        payload: {
          commentaireValidation: rejectReason.trim() || undefined,
        },
      });
      setRejectingConge(null);
      setSuccessMessage('La demande a été refusée et l’employé en sera informé.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du refus de la demande.');
    }
  };
  const filterTabs: Array<{ id: CongeStatut | ''; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'en_attente', label: 'En attente', icon: Clock },
    { id: 'approuvee', label: 'Approuvées', icon: CheckCircle2 },
    { id: 'refusee', label: 'Refusées', icon: XCircle },
    { id: '', label: 'Toutes', icon: CheckSquare },
  ];
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
              Validation des Congés
            </h1>
            <p className="text-sm text-slate-500">
              Traitez les demandes d'absence et de congés de vos équipes.
            </p>
          </div>
        </div>
        {/* Tab Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto flex-wrap gap-1">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = statutFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatutFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-emerald-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div role="alert" className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMessage && (
        <div role="status" className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Main List */}
      {isListError ? (
        <div role="alert" className="flex flex-col gap-3 border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-900">Impossible de charger les demandes</p>
            <p className="mt-0.5 text-xs text-rose-800">
              Les données n’ont pas été remplacées par une liste vide. Réessayez le chargement.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="shrink-0 rounded border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
          >
            {isFetching ? 'Chargement…' : 'Réessayer'}
          </button>
        </div>
      ) : (
        <CongeList
          conges={data?.items ?? []}
          isLoading={isLoading}
          showEmploye
          onApprove={handleOpenApproveModal}
          onReject={handleOpenRejectModal}
          actionsPending={approveMutation.isPending || rejectMutation.isPending}
        />
      )}

      {approvingConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-conge-title"
            className="w-full max-w-md rounded border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-800">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h2 id="approve-conge-title" className="text-base font-semibold text-slate-900">
                  Confirmer l’approbation
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Approuver la demande de{' '}
                  <strong>{approvingConge.employe.prenom} {approvingConge.employe.nom}</strong> ?
                  Cette décision sera enregistrée et l’employé sera notifié.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setApprovingConge(null)}
                disabled={approveMutation.isPending}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmApprove()}
                disabled={approveMutation.isPending}
                className="rounded bg-[#0f5c4d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b493e] disabled:opacity-50"
              >
                {approveMutation.isPending ? 'Enregistrement…' : 'Approuver la demande'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Rejection Modal with Comment Reason */}
      {rejectingConge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 brand-title">
                  Refuser la demande de congé
                </h3>
              </div>
              <button
                onClick={() => setRejectingConge(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Vous êtes sur le point de refuser la demande de <strong>{rejectingConge.employe.prenom} {rejectingConge.employe.nom}</strong> du {rejectingConge.dateDebut} au {rejectingConge.dateFin}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Motif du refus (optionnel mais recommandé)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explication ou contrainte de service..."
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingConge(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {rejectMutation.isPending ? 'Enregistrement...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
