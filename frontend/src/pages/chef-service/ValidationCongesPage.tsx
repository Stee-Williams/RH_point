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
      setSuccessMessage('La demande a été approuvée et le collaborateur a été notifié.');
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
      setSuccessMessage('La demande a été refusée et le collaborateur en a été informé.');
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
    <div className="max-w-5xl mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
            <CheckSquare className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Validation des Congés
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Supervision
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Examinez, approuvez ou refusez les demandes d'absence et de congés de vos équipes.
            </p>
          </div>
        </div>

        {/* Tab Filter Pills */}
        <div className="inline-flex items-center bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-xs self-start sm:self-auto flex-wrap gap-1">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = statutFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatutFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
                  isSelected
                    ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-emerald-700" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-enter">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successMessage && (
        <div role="status" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 shadow-xs animate-enter">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main List */}
      {isListError ? (
        <div role="alert" className="card-modern rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-rose-950">Impossible de charger les demandes</p>
            <p className="mt-0.5 text-xs text-rose-700">
              Veuillez vérifier votre connexion avec l'API puis réessayez.
            </p>
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
        <CongeList
          conges={data?.items ?? []}
          isLoading={isLoading}
          showEmploye
          onApprove={handleOpenApproveModal}
          onReject={handleOpenRejectModal}
          actionsPending={approveMutation.isPending || rejectMutation.isPending}
        />
      )}

      {/* Approval Confirmation Modal */}
      {approvingConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-enter">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-conge-title"
            className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs">
                <Check className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h2 id="approve-conge-title" className="text-base font-bold text-slate-900 brand-title">
                  Confirmer l’approbation
                </h2>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Approuver la demande de congé de{' '}
                  <strong className="text-slate-900">{approvingConge.employe.prenom} {approvingConge.employe.nom}</strong> ?
                  La décision sera enregistrée et l'employé recevra une notification automatique.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setApprovingConge(null)}
                disabled={approveMutation.isPending}
                className="btn-secondary py-2 px-4 rounded-xl text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmApprove()}
                disabled={approveMutation.isPending}
                className="btn-primary py-2 px-4 rounded-xl text-xs font-bold shadow-xs"
              >
                {approveMutation.isPending ? 'Enregistrement…' : 'Approuver la demande'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Rejection Modal with Comment Reason */}
      {rejectingConge && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-enter">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 brand-title">
                  Refuser la demande de congé
                </h3>
              </div>
              <button
                onClick={() => setRejectingConge(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Vous êtes sur le point de refuser la demande de <strong className="text-slate-900">{rejectingConge.employe.prenom} {rejectingConge.employe.nom}</strong> (du {rejectingConge.dateDebut} au {rejectingConge.dateFin}).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Motif du refus (recommandé)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explication ou contrainte organisationnelle..."
                className="w-full p-3 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingConge(null)}
                className="btn-secondary py-2 px-4 rounded-xl text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending}
                className="btn-danger py-2 px-4 rounded-xl text-xs font-bold shadow-xs"
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
