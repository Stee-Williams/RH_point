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
    <header className="bg-brand px-5 py-6 text-center text-white sm:px-7">
      <div className="mb-3 inline-flex items-center gap-2 rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium">
        {isStatusUnavailable ? (
          <>
            <span className="h-2 w-2 rounded-full bg-rose-300" />
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
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-100">En poste · Travail actif</span>
            </>
          )
        ) : hasLeft ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
            <span className="text-emerald-100">Journée terminée</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="text-slate-200">Non pointé aujourd'hui</span>
          </>
        )}
      </div>
      <p className="my-2 font-mono text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
        {currentTime}
      </p>
      <p className="mt-2 flex items-center justify-center gap-2 text-sm font-medium capitalize text-slate-200">
        <Calendar className="h-4 w-4 text-emerald-200" />
        {now.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-white/15 pt-3 text-xs text-slate-200">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-emerald-200" />
          Horaire standard : <strong>08:30 - 17:00 (7h30)</strong>
        </span>
        <span className="hidden text-white/40 sm:inline">·</span>
        <span>Pause obligatoire : <strong>45 min</strong></span>
        {heureArrivee && <span className="font-mono">Arrivée : {heureArrivee}</span>}
      </div>
    </header>
  );
}
