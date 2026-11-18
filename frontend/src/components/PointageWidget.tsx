import { useEffect, useState } from 'react';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Coffee,
  Play,
  Sparkles,
} from 'lucide-react';
import { useClockIn, useClockOut, useTodayPointage } from '../hooks/usePointage';
import { PointageClockHeader } from './PointageClockHeader';

function calculateElapsed(
  heureArriveeStr: string,
  now: Date
): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
  try {
    const [h, m, s] = heureArriveeStr.split(':').map(Number);
    const start = new Date(now);
    start.setHours(h || 0, m || 0, s || 0, 0);
    let diffSec = Math.floor((now.getTime() - start.getTime()) / 1000);
    if (diffSec < 0) diffSec = 0;
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    return { hours, minutes, seconds, totalSeconds: diffSec };
  } catch {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

export function PointageWidget() {
  const [now, setNow] = useState(new Date());
  const { data: today, isLoading, isError, isFetching, refetch } = useTodayPointage();
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const [error, setError] = useState<string | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [breakElapsedSeconds, setBreakElapsedSeconds] = useState(0);
  const [confirmingClockOut, setConfirmingClockOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      if (isOnBreak && breakStart) {
        setBreakElapsedSeconds(Math.floor((new Date().getTime() - breakStart.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnBreak, breakStart]);

  const handleClockIn = async () => {
    setError(null);
    try {
      await clockIn.mutateAsync({ methode: 'bouton' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du pointage.');
    }
  };

  const handleClockOut = async () => {
    setError(null);
    try {
      await clockOut.mutateAsync({ methode: 'bouton' });
      setConfirmingClockOut(false);
      setIsOnBreak(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du pointage.');
    }
  };

  const toggleBreak = () => {
    if (!isOnBreak) {
      setIsOnBreak(true);
      setBreakStart(new Date());
    } else {
      setIsOnBreak(false);
    }
  };

  const hasArrived = today?.heureArrivee != null;
  const hasLeft = today?.heureDepart != null;
  const isStatusUnavailable = isError && !today;

  const elapsed =
    hasArrived && today?.heureArrivee
      ? calculateElapsed(today.heureArrivee, now)
      : { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };

  const standardWorkSec = 7.5 * 3600;
  const progressPercent = Math.min(100, Math.round((elapsed.totalSeconds / standardWorkSec) * 100));

  return (
    <div className="card-modern overflow-hidden bg-white shadow-xl shadow-slate-900/5 border border-slate-200/90 rounded-2xl">
      <PointageClockHeader
        now={now}
        hasArrived={hasArrived}
        hasLeft={hasLeft}
        isOnBreak={isOnBreak}
        isStatusUnavailable={isStatusUnavailable}
        heureArrivee={today?.heureArrivee}
      />

      {/* Action and Status Area */}
      <div className="p-5 sm:p-7">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600/20 border-t-emerald-700 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Chargement de votre pointage...</span>
          </div>
        ) : isStatusUnavailable ? (
          <div role="alert" className="flex flex-col items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-rose-950">Impossible de vérifier votre pointage</p>
              <p className="mt-0.5 text-xs text-rose-700">Votre statut reste inchangé. Réessayez avant d’enregistrer un pointage.</p>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="btn-secondary shrink-0"
            >
              {isFetching ? 'Chargement…' : 'Réessayer'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Not arrived yet */}
            {!hasArrived && (
              <div className="text-center space-y-5 py-2">
                <div className="p-5 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-white text-slate-700 text-sm shadow-xs">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 mb-2 border border-emerald-200/60 shadow-xs">
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base brand-title">
                    Prêt pour votre journée ?
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Enregistrez votre heure d'arrivée officielle d'un simple clic. Le calcul des heures, retards et droits démarre instantanément.
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleClockIn}
                    disabled={clockIn.isPending}
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-auto min-w-[280px] px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 shadow-md shadow-emerald-950/20 active:scale-[0.97] transition-all cursor-pointer border border-emerald-700/60 disabled:opacity-50"
                  >
                    <LogIn className="w-5 h-5 text-emerald-200" />
                    <span>{clockIn.isPending ? 'Enregistrement en cours...' : 'Pointer mon arrivée'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Arrived, at work */}
            {hasArrived && !hasLeft && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="uppercase tracking-wider font-bold text-emerald-900 flex items-center gap-2">
                      <Timer className="w-4 h-4 text-emerald-700" />
                      Temps de travail en direct
                    </span>
                    <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 font-mono font-medium text-slate-700 shadow-xs">
                      Arrivée : {today.heureArrivee}
                    </span>
                  </div>

                  {/* Live Counter */}
                  <div className="text-center py-3">
                    <p className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-slate-900 tabular-nums">
                      {padZero(elapsed.hours)}h {padZero(elapsed.minutes)}m {padZero(elapsed.seconds)}s
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-2">
                      Objectif quotidien : 7h 30m ({progressPercent}%)
                    </p>
                  </div>

                  {/* Progress bar towards daily shift */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-emerald-700 to-teal-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {isOnBreak && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-center justify-between shadow-xs animate-enter">
                    <div className="flex items-center gap-2.5">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>
                        Pause active : <strong className="font-mono text-sm">{padZero(Math.floor(breakElapsedSeconds / 60))}m {padZero(breakElapsedSeconds % 60)}s</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider bg-amber-100/80 px-2 py-0.5 rounded-full">
                      Pause décomptée
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                  <button
                    onClick={toggleBreak}
                    className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-2 border transition-all active:scale-[0.97] cursor-pointer shadow-xs ${
                      isOnBreak
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    {isOnBreak ? (
                      <>
                        <Play className="w-4 h-4 text-white fill-white" />
                        Reprendre mon poste
                      </>
                    ) : (
                      <>
                        <Coffee className="w-4 h-4 text-slate-500" />
                        Prendre une pause
                      </>
                    )}
                  </button>

                  {!confirmingClockOut ? (
                    <button
                      onClick={() => setConfirmingClockOut(true)}
                      className="btn-danger w-full sm:w-auto py-3 px-5 rounded-xl shadow-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      Pointer mon départ
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto animate-enter">
                      <button
                        onClick={handleClockOut}
                        disabled={clockOut.isPending}
                        className="btn-danger flex-1 sm:flex-initial py-3 px-5 rounded-xl"
                      >
                        {clockOut.isPending ? 'Enregistrement...' : 'Confirmer mon départ'}
                      </button>
                      <button
                        onClick={() => setConfirmingClockOut(false)}
                        className="btn-secondary py-3 px-4 rounded-xl"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Clocked out for the day */}
            {hasArrived && hasLeft && (
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mx-auto shadow-sm border border-emerald-200/60">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 brand-title">
                    Journée de travail clôturée
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Vos horaires d'arrivée et de départ ont été validés avec succès pour la journée.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto pt-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-center shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arrivée</span>
                    <p className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                      {today.heureArrivee}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-center shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Départ</span>
                    <p className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                      {today.heureDepart}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-center col-span-2 sm:col-span-1 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</span>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">
                      {today.statut === 'retard' ? 'Retard validé' : 'Conforme'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Punctuality and Overtime Badges */}
            {today && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2.5">
                {today.retardMinutes > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Retard constaté : {today.retardMinutes} min
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Arrivée ponctuelle
                  </span>
                )}

                {today.heuresSupplementairesMinutes > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-xs">
                    <Timer className="w-3.5 h-3.5 text-indigo-600" />
                    Heures supplémentaires : +{today.heuresSupplementairesMinutes} min
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-enter">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
