import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
const schema = z
  .object({
    ancienMotDePasse: z.string().min(1, "L'ancien mot de passe est obligatoire"),
    nouveauMotDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmation: z.string().min(1, 'Veuillez confirmer le nouveau mot de passe'),
  })
  .refine((data) => data.nouveauMotDePasse === data.confirmation, {
    message: 'Les deux mots de passe ne correspondent pas.',
    path: ['confirmation'],
  });
type FormValues = z.infer<typeof schema>;
export function ChangePasswordPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const nouveauMotDePasse = watch('nouveauMotDePasse') || '';
  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const updatedUser = await authService.changerMotDePasse({
        ancienMotDePasse: values.ancienMotDePasse,
        nouveauMotDePasse: values.nouveauMotDePasse,
      });
      updateUser(updatedUser);
      navigate('/');
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe.'
      );
    }
  };
  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header accent */}
        <div className="bg-brand px-6 sm:px-8 py-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white brand-title">
              Sécurité du compte
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              Mise à jour de vos identifiants d'accès
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          {user?.doitChangerMotDePasse && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">Changement requis</p>
                <p className="mt-0.5 text-amber-800">
                  Votre compte a été initialisé avec un mot de passe temporaire. Vous devez le
                  remplacer pour sécuriser vos accès.
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Current password */}
            <div>
              <label
                htmlFor="ancienMotDePasse"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Mot de passe actuel (ou temporaire)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="ancienMotDePasse"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  {...register('ancienMotDePasse')}
                />
              </div>
              {errors.ancienMotDePasse && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {errors.ancienMotDePasse.message}
                </p>
              )}
            </div>
            {/* New password */}
            <div>
              <label
                htmlFor="nouveauMotDePasse"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="nouveauMotDePasse"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  {...register('nouveauMotDePasse')}
                />
              </div>
              {errors.nouveauMotDePasse && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {errors.nouveauMotDePasse.message}
                </p>
              )}
              {/* Password strength checklist */}
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span
                  className={`flex items-center gap-1 font-medium ${
                    nouveauMotDePasse.length >= 8 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Au moins 8 caractères
                </span>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label
                htmlFor="confirmation"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  {...register('confirmation')}
                />
              </div>
              {errors.confirmation && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {errors.confirmation.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="font-medium">{serverError}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              {!user?.doitChangerMotDePasse && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary ml-auto disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement...' : 'Valider le mot de passe'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
