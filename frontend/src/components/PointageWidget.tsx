import { useEffect, useState } from 'react';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Coffee,
  Play,
  Clock,
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
    <div className="card-modern overflow-hidden bg-white">
      <PointageClockHeader
        now={now}
        hasArrived={hasArrived}
        hasLeft={hasLeft}
        isOnBreak={isOnBreak}
        isStatusUnavailable={isStatusUnavailable}
        heureArrivee={today?.heureArrivee}
      />
      {/* Action and Status Area */}
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-medium">Chargement de votre statut...</span>
          </div>
        ) : isStatusUnavailable ? (
          <div role="alert" className="flex flex-col items-start justify-between gap-3 border-y border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-rose-900">Impossible de vérifier votre pointage du jour</p>
              <p className="mt-0.5 text-xs text-rose-800">Votre statut reste inchangé. Réessayez avant d’enregistrer un pointage.</p>
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
              <div className="text-center space-y-4">
                <div className="p-4 rounded border border-slate-200 bg-[#f6f6f3] text-slate-700 text-sm">
                  <div className="flex items-center justify-center gap-2 font-semibold text-slate-900 mb-1">
                    <Clock className="w-4 h-4 text-emerald-800" />
                    <span>Prêt à commencer votre journée ?</span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Cliquez ci-dessous pour enregistrer votre heure d'arrivée officielle. Vos droits et calculs d'heures sont appliqués en temps réel.
                  </p>
                </div>
                <button
                  onClick={handleClockIn}
                  disabled={clockIn.isPending}
                  className="btn-primary w-full sm:w-auto min-w-[280px] disabled:opacity-50"
                >
                  <LogIn className="w-5 h-5" />
                  {clockIn.isPending ? 'Enregistrement en cours...' : "Pointer mon arrivée"}
                </button>
              </div>
            )}
            {/* Step 2: Arrived, at work */}
            {hasArrived && !hasLeft && (
              <div className="space-y-6">
                <div className="p-4 rounded border border-slate-200 bg-[#f6f6f3] text-slate-900">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="uppercase tracking-wider font-semibold text-emerald-900 flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-emerald-800" />
                      Temps travaillé en continu
                    </span>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-700">
                      Arrivé(e) à {today.heureArrivee}
                    </span>
                  </div>
                  {/* Live Counter */}
                  <div className="text-center py-2">
                    <p className="text-4xl sm:text-5xl font-semibold font-mono tracking-tight text-slate-900 tabular-nums">
                      {padZero(elapsed.hours)}h {padZero(elapsed.minutes)}m {padZero(elapsed.seconds)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Objectif quotidien : 7h 30m ({progressPercent}%)
                    </p>
                  </div>
                  {/* Progress bar towards daily shift */}
                  <div className="w-full bg-slate-200 rounded h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-[#0f5c4d] h-full rounded transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {isOnBreak && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>
                        Pause en cours : <strong className="font-mono">{padZero(Math.floor(breakElapsedSeconds / 60))}m {padZero(breakElapsedSeconds % 60)}s</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold uppercase">Décompté de la pause</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={toggleBreak}
                    className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isOnBreak
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isOnBreak ? (
                      <>
                        <Play className="w-4 h-4" />
                        Reprendre le travail
                      </>
                    ) : (
                      <>
                        <Coffee className="w-4 h-4" />
                        Prendre une pause
                      </>
                    )}
                  </button>

                  {!confirmingClockOut ? (
                    <button
                      onClick={() => setConfirmingClockOut(true)}
                      className="btn-danger w-full sm:w-auto"
                    >
                      <LogOut className="w-4 h-4" />
                      Pointer mon départ
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleClockOut}
                        disabled={clockOut.isPending}
                        className="btn-danger flex-1 sm:flex-initial"
                      >
                        {clockOut.isPending ? 'Enregistrement...' : 'Confirmer le départ'}
                      </button>
                      <button
                        onClick={() => setConfirmingClockOut(false)}
                        className="btn-secondary"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasArrived && hasLeft && (
              <div className="p-6 rounded border border-slate-200 bg-white text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 brand-title">
                    Journée de travail clôturée
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Vos horaires ont été enregistrés et validés par le système de pointage.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Arrivée</span>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                      {today.heureArrivee}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Départ</span>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                      {today.heureDepart}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Statut</span>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      {today.statut === 'retard' ? 'Retard' : 'Validé'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Punctuality and Overtime Badges */}
            {today && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
                {today.retardMinutes > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Retard constaté : {today.retardMinutes} min
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Arrivée à l'heure (Ponctuel)
                  </span>
                )}

                {today.heuresSupplementairesMinutes > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Timer className="w-3.5 h-3.5 text-indigo-500" />
                    Heures supplémentaires : +{today.heuresSupplementairesMinutes} min
                  </span>
                )}

              </div>
            )}

          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
