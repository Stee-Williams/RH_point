import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from '../../types/auth';

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
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Left Brand Showcase Banner */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-12 text-white">
        {/* Glowing atmospheric orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
              <Clock className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white brand-title block leading-none">
                RH-Point
              </span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-1 block">
                Portail de gestion des temps & RH
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Expérience collaborateur moderne</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight mb-5 text-white">
            Suivi des présences, temps et congés d'équipe.
          </h1>
          <p className="text-slate-300 text-base mb-8 leading-relaxed">
            Un espace unifié, fluide et réactif pour enregistrer vos pointages en un clic, piloter les absences et simplifier la vie de l'entreprise.
          </p>

          <div className="space-y-4">
            {[
              'Pointage intelligent en temps réel avec calcul automatique des retards & heures sup.',
              'Workflow d’approbation de congés transparent pour collaborateurs et managers.',
              'Tableau de bord et indicateurs RH consolidés au quotidien.',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-slate-200 leading-snug">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Authentification chiffrée & JWT sécurisé
          </span>
          <span className="font-mono">RH-Point v1.0</span>
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md animate-enter">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center text-white shadow-md">
              <Clock className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 brand-title block">
                RH-Point
              </span>
              <span className="text-xs font-medium text-emerald-700">
                Portail des présences & RH
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-9 shadow-xl shadow-slate-900/5">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Connexion
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Entrez votre matricule professionnel et votre mot de passe.
              </p>
            </div>

            {sessionExpired && (
              <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 font-medium animate-enter">
                Votre session a expiré. Veuillez vous reconnecter pour poursuivre.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Matricule field */}
              <div>
                <label
                  htmlFor="matricule"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Matricule professionnel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="matricule"
                    type="text"
                    autoComplete="username"
                    placeholder="Ex: ADMIN ou EMP-001"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                    {...register('matricule')}
                  />
                </div>
                {errors.matricule && (
                  <p className="text-xs text-rose-600 mt-1.5 font-semibold">{errors.matricule.message}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="motDePasse"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Mot de passe
                  </label>
                  <Link
                    to="/mot-de-passe-oublie"
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="motDePasse"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                    {...register('motDePasse')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 active:scale-95 transition-transform cursor-pointer"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {errors.motDePasse && (
                  <p className="text-xs text-rose-600 mt-1.5 font-semibold">{errors.motDePasse.message}</p>
                )}
              </div>

              {/* Server error banner */}
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-enter">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <p className="font-semibold">{serverError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 inline-flex items-center justify-center gap-2.5 h-12 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 shadow-md shadow-emerald-950/20 active:scale-[0.97] transition-all cursor-pointer border border-emerald-700/60 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder à mon espace</span>
                    <ArrowRight className="w-4 h-4 text-emerald-200" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            En vous connectant, vous acceptez la{' '}
            <Link to="/confidentialite" className="font-medium text-slate-600 hover:text-emerald-800 underline underline-offset-2">
              politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
