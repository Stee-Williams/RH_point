import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] px-4 py-8 text-slate-900 sm:py-12">
      <article className="mx-auto max-w-3xl">
        <Link to="/connexion" className="btn-quiet mb-6">
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
        <header className="border-b border-slate-300 pb-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-800">
            RH-Point · Information
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Confidentialité et cookies</h1>
          <p className="mt-2 text-sm text-slate-600">
            Cette page décrit les traitements liés à l’utilisation du portail RH-Point.
          </p>
        </header>

        <div className="divide-y divide-slate-200 border-b border-slate-200 bg-white">
          <section className="py-5 sm:px-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-800" />
              <h2 className="text-base font-semibold">Données traitées</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Le portail traite les informations nécessaires à la gestion des comptes, des
              pointages, des absences et des demandes de congés : identité professionnelle,
              matricule, affectation, horaires et données de présence. Ces informations sont
              utilisées pour fournir les fonctions RH et gérer les validations associées.
            </p>
          </section>

          <section className="py-5 sm:px-5">
            <h2 className="text-base font-semibold">Accès et conservation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              L’accès aux informations est limité par le rôle et le périmètre professionnel de
              chaque utilisateur. Les données sont conservées par l’administration selon les
              obligations applicables et ses règles de conservation. Pour connaître la durée
              applicable, demander l’accès ou la rectification de vos données, contactez le
              service RH ou le responsable de la protection des données de votre administration.
            </p>
          </section>

          <section className="py-5 sm:px-5">
            <div className="flex items-center gap-2">
              <Cookie className="h-4 w-4 text-emerald-800" />
              <h2 className="text-base font-semibold">Cookies et stockage local</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              RH-Point n’utilise pas de cookies publicitaires ni de mesure d’audience dans cette
              version. Le jeton d’authentification est conservé en mémoire de l’application et
              disparaît lorsque celle-ci est rechargée ou fermée. Aucun bandeau de consentement
              n’est donc nécessaire pour des cookies non essentiels. Le navigateur peut conserver
              ses propres données techniques de fonctionnement.
            </p>
          </section>

          <section className="py-5 sm:px-5">
            <h2 className="text-base font-semibold">Sécurité et contact</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Des mesures de contrôle d’accès et de sécurité protègent les données contre les accès
              non autorisés. Pour toute question ou demande relative à vos données, adressez-vous
              au service RH ou au responsable de la protection des données de votre administration.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Information générale de l’application. L’administration responsable doit la compléter
              avec son identité, ses coordonnées, les bases légales et les durées de conservation
              applicables avant sa mise en production.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
