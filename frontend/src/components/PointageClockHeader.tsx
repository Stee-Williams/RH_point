import { Calendar, CheckCircle2, Clock } from 'lucide-react';

interface PointageClockHeaderProps {
  now: Date;
  hasArrived: boolean;
  hasLeft: boolean;
  isOnBreak: boolean;
  isStatusUnavailable: boolean;
  heureArrivee?: string | null;
}

export function PointageClockHeader({
  now,
  hasArrived,
  hasLeft,
  isOnBreak,
  isStatusUnavailable,
  heureArrivee,
}: PointageClockHeaderProps) {
  const currentTime = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 px-6 py-8 text-center text-white sm:px-8">
      {/* Subtle background glow effect */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md shadow-xs">
          {isStatusUnavailable ? (
            <>
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="text-rose-100">Statut indisponible</span>
            </>
          ) : hasArrived && !hasLeft ? (
            isOnBreak ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-amber-200">En pause déjeuner</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-emerald-100 font-medium">En poste · Session active</span>
              </>
            )
          ) : hasLeft ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-emerald-100 font-medium">Journée terminée</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="text-slate-200">Non pointé aujourd'hui</span>
            </>
          )}
        </div>

        <p className="my-1 font-mono text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl text-white drop-shadow-xs">
          {currentTime}
        </p>

        <p className="mt-2.5 flex items-center justify-center gap-2 text-sm font-medium capitalize text-slate-300">
          <Calendar className="h-4 w-4 text-emerald-300" />
          {now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-4 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-emerald-300" />
            Horaire standard : <strong className="text-white">08:30 – 17:00 (7h30)</strong>
          </span>
          <span className="hidden text-white/30 sm:inline">·</span>
          <span>Pause recommandée : <strong className="text-white">45 min</strong></span>
          {heureArrivee && (
            <>
              <span className="hidden text-white/30 sm:inline">·</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">Arrivée : {heureArrivee}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
