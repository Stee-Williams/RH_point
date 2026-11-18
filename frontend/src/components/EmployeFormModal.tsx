import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  UserPlus,
  UserCog,
  X,
  Mail,
  Briefcase,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { Employe } from '../types/employe';
import { useHoraireOptions, useServiceOptions } from '../hooks/useReferenceData';

const employeSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est obligatoire').max(20),
  email: z.string().min(1, "L'email est obligatoire").email('Email invalide'),
  nom: z.string().min(1, 'Le nom est obligatoire').max(100),
  prenom: z.string().min(1, 'Le prénom est obligatoire').max(100),
  telephone: z.string().max(20).optional().or(z.literal('')),
  dateNaissance: z.string().optional().or(z.literal('')),
  dateEmbauche: z.string().min(1, "La date d'embauche est obligatoire"),
  poste: z.string().max(100).optional().or(z.literal('')),
  serviceId: z.string().optional().or(z.literal('')),
  horaireId: z.string().optional().or(z.literal('')),
  statut: z.enum(['actif', 'inactif', 'suspendu']).optional(),
});

export type EmployeFormValues = z.infer<typeof employeSchema>;

interface EmployeFormModalProps {
  mode: 'create' | 'edit';
  initialEmploye?: Employe | null;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (values: EmployeFormValues) => void;
  onClose: () => void;
}

export function EmployeFormModal({
  mode,
  initialEmploye,
  isSubmitting,
  serverError,
  onSubmit,
  onClose,
}: EmployeFormModalProps) {
  const { data: services } = useServiceOptions();
  const { data: horaires } = useHoraireOptions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeFormValues>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      matricule: '',
      email: '',
      nom: '',
      prenom: '',
      telephone: '',
      dateNaissance: '',
      dateEmbauche: '',
      poste: '',
      serviceId: '',
      horaireId: '',
      statut: 'actif',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && initialEmploye) {
      reset({
        matricule: initialEmploye.matricule,
        email: initialEmploye.email,
        nom: initialEmploye.nom,
        prenom: initialEmploye.prenom,
        telephone: initialEmploye.telephone ?? '',
        dateNaissance: initialEmploye.dateNaissance ?? '',
        dateEmbauche: initialEmploye.dateEmbauche,
        poste: initialEmploye.poste ?? '',
        serviceId: initialEmploye.service ? String(initialEmploye.service.id) : '',
        horaireId: initialEmploye.horaire ? String(initialEmploye.horaire.id) : '',
        statut: initialEmploye.statut,
      });
    }
  }, [mode, initialEmploye, reset]);

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-enter">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
              {mode === 'create' ? <UserPlus className="w-5 h-5 text-emerald-700" /> : <UserCog className="w-5 h-5 text-emerald-700" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 brand-title">
                {mode === 'create' ? 'Nouveau collaborateur' : 'Modifier la fiche collaborateur'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'create'
                  ? 'Génère un compte d’accès et un mot de passe temporaire'
                  : `Modification de la fiche #${initialEmploye?.matricule}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1" noValidate>
          {/* Identité */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              État Civil & Identité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom *</label>
                <input
                  className="w-full h-10 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                  placeholder="Dupont"
                  {...register('nom')}
                />
                {errors.nom && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.nom.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prénom *</label>
                <input
                  className="w-full h-10 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                  placeholder="Jean"
                  {...register('prenom')}
                />
                {errors.prenom && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.prenom.message}</p>}
              </div>
            </div>
          </div>

          {/* Account credentials if create */}
          {mode === 'create' && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Compte & Connexion
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Matricule *</label>
                  <input
                    className="w-full h-10 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                    placeholder="EMP-042"
                    {...register('matricule')}
                  />
                  {errors.matricule && (
                    <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.matricule.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email professionnel *</label>
                  <input
                    type="email"
                    className="w-full h-10 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                    placeholder="j.dupont@entreprise.tld"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Affectation & Contrat */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Affectation Professionnelle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Département / Service</label>
                <select
                  className="w-full h-10 px-3 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
                  {...register('serviceId')}
                >
                  <option value="">Sélectionner un service</option>
                  {services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Plage Horaire de travail</label>
                <select
                  className="w-full h-10 px-3 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
                  {...register('horaireId')}
                >
                  <option value="">Sélectionner un horaire</option>
                  {horaires?.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nom} ({h.heureDebut} – {h.heureFin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Poste / Fonction</label>
                <input
                  className="w-full h-10 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                  placeholder="Ex: Responsable Paie"
                  {...register('poste')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date d'embauche *</label>
                <input
                  type="date"
                  className="w-full h-10 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
                  {...register('dateEmbauche')}
                />
                {errors.dateEmbauche && (
                  <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.dateEmbauche.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Téléphone</label>
                <input
                  className="w-full h-10 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                  placeholder="+33 6 00 00 00 00"
                  {...register('telephone')}
                />
              </div>

              {mode === 'edit' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Statut du collaborateur</label>
                  <select
                    className="w-full h-10 px-3 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
                    {...register('statut')}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif (Désactivé)</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-enter">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="font-semibold">{serverError}</p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 rounded-xl text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2.5 px-5 rounded-xl text-xs font-bold shadow-xs"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>{isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer le collaborateur' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
