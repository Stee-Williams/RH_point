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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {mode === 'create' ? <UserPlus className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 brand-title">
                {mode === 'create' ? 'Nouveau collaborateur' : "Modifier la fiche collaborateur"}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'create'
                  ? 'Générez un compte et un mot de passe temporaire'
                  : `Modification du compte #${initialEmploye?.matricule}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto flex-1" noValidate>
          {/* Identité */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              État Civil & Identité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Nom *</label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="Dupont"
                  {...register('nom')}
                />
                {errors.nom && <p className="text-xs text-rose-600 mt-1">{errors.nom.message}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Prénom *</label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="Jean"
                  {...register('prenom')}
                />
                {errors.prenom && <p className="text-xs text-rose-600 mt-1">{errors.prenom.message}</p>}
              </div>
            </div>
          </div>

          {/* Account credentials if create */}
          {mode === 'create' && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Compte & Connexion
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Matricule *</label>
                  <input
                    placeholder="Ex: EMP-042"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    {...register('matricule')}
                  />
                  {errors.matricule && <p className="text-xs text-rose-600 mt-1">{errors.matricule.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Email professionnel *</label>
                  <input
                    type="email"
                    placeholder="jean.dupont@entreprise.com"
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Coordonnées & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Téléphone</label>
              <input
                placeholder="+33 6 12 34 56 78"
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                {...register('telephone')}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Date de naissance</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                {...register('dateNaissance')}
              />
            </div>
          </div>

          {/* Emploi & Affectation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Affectation Professionnelle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Date d'embauche *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  {...register('dateEmbauche')}
                />
                {errors.dateEmbauche && <p className="text-xs text-rose-600 mt-1">{errors.dateEmbauche.message}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Poste / Intitulé</label>
                <input
                  placeholder="Ex: Développeur Senior"
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  {...register('poste')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Service de rattachement</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  {...register('serviceId')}
                >
                  <option value="">Sélectionner un service...</option>
                  {services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Horaire théorique</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  {...register('horaireId')}
                >
                  <option value="">Sélectionner un horaire...</option>
                  {horaires?.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nom} ({h.heureDebut}–{h.heureFin})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Statut du collaborateur</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                {...register('statut')}
              >
                <option value="actif">Actif (autorisé à pointer)</option>
                <option value="inactif">Inactif (accès désactivé)</option>
                <option value="suspendu">Suspendu temporairement</option>
              </select>
            </div>
          )}

          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{serverError}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting
                ? 'Traitement en cours...'
                : mode === 'create'
                ? 'Créer le collaborateur'
                : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
