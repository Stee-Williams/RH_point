import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
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
        setMessage({ type: 'success', text: 'Votre mot de passe a été modifié. Vous pouvez vous connecter.' });
      } else {
        await authService.demanderReinitialisationMotDePasse(email);
        setMessage({
          type: 'success',
          text: 'Si cette adresse correspond à un compte actif, un lien de réinitialisation lui a été envoyé.',
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
    <main className="min-h-screen bg-[#f6f6f3] px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <Link to="/connexion" className="btn-quiet mb-5">
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
        <section className="border border-[#e0e0da] bg-white p-6 sm:p-8">
          <div className="mb-5 flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-800">
            {isResetMode ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isResetMode ? 'Choisir un nouveau mot de passe' : 'Mot de passe oublié'}
          </h1>
          <p className="mt-2 text-sm leading-5 text-slate-600">
            {isResetMode
              ? 'Choisissez un mot de passe d’au moins 8 caractères pour retrouver l’accès à votre compte.'
              : 'Saisissez l’adresse e-mail associée à votre compte. Si elle est reconnue, vous recevrez un lien valable 30 minutes.'}
          </p>

          {isResetMode && !isValidToken ? (
            <div role="alert" className="mt-5 border-y border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              Ce lien de réinitialisation est invalide. Demandez-en un nouveau.
            </div>
          ) : message?.type === 'success' && isResetMode ? (
            <div role="status" className="mt-5 border-y border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {message.text}
              </p>
              <Link to="/connexion" className="btn-primary mt-4 w-full">
                Retour à la connexion
              </Link>
            </div>
          ) : message?.type === 'success' ? (
            <div role="status" className="mt-5 border-y border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
              {message.text}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
              {isResetMode ? (
                <>
                  <div>
                    <label htmlFor="new-password" className="mb-1 block text-xs font-semibold text-slate-700">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full border border-slate-300 bg-white px-3 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-1 block text-xs font-semibold text-slate-700">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      className="w-full border border-slate-300 bg-white px-3 text-sm text-slate-900"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="recovery-email" className="mb-1 block text-xs font-semibold text-slate-700">
                    Adresse e-mail professionnelle
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={150}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border border-slate-300 bg-white px-3 text-sm text-slate-900"
                  />
                </div>
              )}
              {message?.type === 'error' && (
                <p role="alert" className="border-y border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {message.text}
                </p>
              )}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting
                  ? 'Traitement en cours…'
                  : isResetMode
                    ? 'Enregistrer le nouveau mot de passe'
                    : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}
          <p className="mt-5 border-t border-slate-200 pt-3 text-xs text-slate-500">
            Si vous n’avez plus accès à votre adresse e-mail, contactez votre service RH.
          </p>
        </section>
      </div>
    </main>
  );
}
