import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from '../../types/auth';
import { Link } from 'react-router-dom';
const loginSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est obligatoire'),
  motDePasse: z.string().min(1, 'Le mot de passe est obligatoire'),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      matricule: '',
      motDePasse: '',
    },
  });
  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(values);
      navigate(getHomePath(user.role));
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Identifiants invalides ou serveur indisponible'
      );
    }
  };
  return (
    <div className="min-h-screen flex bg-[#f6f6f3] text-slate-900 font-sans">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-[#0b493e] bg-[#0f5c4d] p-10 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-white/20 bg-white/10 flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight text-white brand-title">
                RH-Point
              </span>
              <span className="block text-xs font-medium text-emerald-100">
                Portail de gestion RH
              </span>
            </div>
          </div>
        </div>
        <div className="relative z-10 my-auto py-8">
          <div className="mb-5 text-xs font-medium uppercase tracking-widest text-emerald-100">
            Espace de travail
          </div>
          <h1 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight mb-4">
            Temps de travail, présences et congés
          </h1>
          <p className="text-emerald-50/90 text-sm max-w-md mb-7 leading-relaxed">
            Un espace commun pour enregistrer les pointages, suivre les absences et traiter les demandes.
          </p>
          <div className="space-y-3 max-w-md">
            {[
              'Pointage journalier et historique individuel',
              'Suivi d’équipe par service',
              'Demandes de congé et validations',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border border-white/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100" />
                </div>
                <span className="text-sm text-emerald-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-100 pt-5 border-t border-white/20">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Accès sécurisé
          </span>
          <span>Version 1.0 • 2026</span>
        </div>
      </div>
      {/* Right Login Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-10 bg-[#f6f6f3] text-slate-900">
        <div className="w-full max-w-sm">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded bg-[#0f5c4d] flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900 brand-title">
                RH-Point
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Portail de pointage RH
              </span>
            </div>
          </div>
          <div className="bg-white border border-[#e0e0da] p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 brand-title">
                Connexion
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Veuillez entrer votre matricule et mot de passe pour continuer.
              </p>
            </div>
            {sessionExpired && (
              <div role="status" className="mb-4 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Votre session a expiré. Reconnectez-vous pour reprendre votre travail.
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Matricule field */}
              <div>
                <label
                  htmlFor="matricule"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Matricule professionnel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="matricule"
                    type="text"
                    autoComplete="username"
                    placeholder="Ex: ADMIN ou EMP-001"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white focus:bg-white rounded border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    {...register('matricule')}
                  />
                </div>
                {errors.matricule && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.matricule.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="motDePasse"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="motDePasse"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white focus:bg-white rounded border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    {...register('motDePasse')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.motDePasse && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.motDePasse.message}</p>
                )}
                <Link
                  to="/mot-de-passe-oublie"
                  className="mt-2 inline-block text-xs font-medium text-emerald-800 underline-offset-2 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              {/* Server error banner */}
              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <p className="font-medium">{serverError}</p>
                </div>
              )}
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded text-white font-semibold text-sm bg-[#0f5c4d] hover:bg-[#0b493e] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder à mon espace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            <Link to="/confidentialite" className="underline underline-offset-2 hover:text-emerald-800">
              Confidentialité et cookies
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
