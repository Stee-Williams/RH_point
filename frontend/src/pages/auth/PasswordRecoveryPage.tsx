import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

export function PasswordRecoveryPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const isResetMode = token.length > 0;
  const isValidToken = /^[a-f0-9]{64}$/.test(token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (isResetMode && password !== confirmation) {
      setMessage({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isResetMode) {
        await authService.reinitialiserMotDePasse(token, password);
        setMessage({ type: 'success', text: 'Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.' });
      } else {
        await authService.demanderReinitialisationMotDePasse(email);
        setMessage({
          type: 'success',
          text: 'Si cette adresse correspond à un compte actif, un lien de réinitialisation sécurisé lui a été envoyé.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'La demande n’a pas pu être traitée. Réessayez.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 font-sans flex flex-col justify-center items-center animate-enter">
      <div className="w-full max-w-md">
        <Link
          to="/connexion"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à la connexion</span>
        </Link>

        <section className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-9 shadow-xl shadow-slate-900/5">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs">
            {isResetMode ? <KeyRound className="h-6 w-6 text-emerald-700" /> : <Mail className="h-6 w-6 text-emerald-700" />}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 brand-title">
            {isResetMode ? 'Nouveau mot de passe' : 'Mot de passe oublié'}
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            {isResetMode
              ? 'Choisissez un mot de passe d’au moins 8 caractères pour restaurer l’accès à votre compte.'
              : 'Saisissez votre e-mail professionnel. Un lien de réinitialisation valable 30 minutes vous sera transmis.'}
          </p>

          {isResetMode && !isValidToken ? (
            <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.</span>
            </div>
          ) : message?.type === 'success' && isResetMode ? (
            <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950">
              <p className="flex items-start gap-2.5 font-medium">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{message.text}</span>
              </p>
              <Link to="/connexion" className="btn-primary mt-4 w-full py-2.5 rounded-xl">
                Se connecter
              </Link>
            </div>
          ) : message?.type === 'success' ? (
            <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-medium leading-relaxed">{message.text}</span>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              {isResetMode ? (
                <>
                  <div>
                    <label htmlFor="new-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full h-11 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="••••••••••••"
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      className="w-full h-11 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="recovery-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Adresse e-mail professionnelle
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={150}
                    placeholder="vous@entreprise.tld"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/90 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
                  />
                </div>
              )}

              {message?.type === 'error' && (
                <div role="alert" className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-11 rounded-xl font-bold shadow-xs mt-2"
              >
                {isSubmitting
                  ? 'Traitement en cours…'
                  : isResetMode
                    ? 'Valider le nouveau mot de passe'
                    : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}

          <p className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400 text-center">
            En cas de difficulté persistante, veuillez contacter votre administrateur RH.
          </p>
        </section>
      </div>
    </main>
  );
}
