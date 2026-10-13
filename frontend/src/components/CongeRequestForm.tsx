import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import {
  CalendarDays,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  SunMedium,
  Calculator,
  Tag,
} from 'lucide-react';
import { useCreateConge } from '../hooks/useConges';
const congeSchema = z
  .object({
    typeConge: z.enum(['conge_annuel', 'permission', 'absence_justifiee']),
    dateDebut: z.string().min(1, 'La date de début est obligatoire'),
    dateFin: z.string().min(1, 'La date de fin est obligatoire'),
    motif: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine((data) => data.dateFin >= data.dateDebut, {
    message: 'La date de fin doit être postérieure ou égale à la date de début.',
    path: ['dateFin'],
  });
type CongeFormValues = z.infer<typeof congeSchema>;
const typeConfig: Record<
  CongeFormValues['typeConge'],
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  conge_annuel: {
    label: 'Congé annuel payé',
    description: 'Congés payés réguliers et repos',
    icon: SunMedium,
  },
  permission: {
    label: 'Permission / RTT',
    description: 'Événement familial, récupération',
    icon: Clock,
  },
  absence_justifiee: {
    label: 'Absence justifiée / Maladie',
    description: 'Certificat médical, arrêt maladie',
    icon: FileText,
  },
};
const quickMotifs = [
  "Congés annuels",
  "Obligation familiale",
  "Rendez-vous médical",
  "Déménagement",
  "Repos récupérateur",
];
function countBusinessDays(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  } catch {
    return 0;
  }
}
export function CongeRequestForm() {
  const createConge = useCreateConge();
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CongeFormValues>({
    resolver: zodResolver(congeSchema),
    defaultValues: { typeConge: 'conge_annuel', dateDebut: '', dateFin: '', motif: '' },
  });
  const selectedType = watch('typeConge');
  const dateDebut = watch('dateDebut');
  const dateFin = watch('dateFin');
  let workingDays = 0;
  if (dateDebut && dateFin && dateFin >= dateDebut) {
    workingDays = countBusinessDays(dateDebut, dateFin);
  }
  const onSubmit = async (values: CongeFormValues) => {
    setServerMessage(null);
    try {
      await createConge.mutateAsync({
        typeConge: values.typeConge,
        dateDebut: values.dateDebut,
        dateFin: values.dateFin,
        motif: values.motif || undefined,
      });
      setServerMessage({
        type: 'success',
        text: 'Votre demande a été soumise avec succès et transmise à votre chef de service pour validation.',
      });
      reset();
    } catch (error) {
      setServerMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la soumission.',
      });
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card-modern p-6 sm:p-8 space-y-6"
      noValidate
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 brand-title">
            Déposer une nouvelle demande d'absence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sélectionnez la catégorie, définissez les dates et justifiez si nécessaire.
          </p>
        </div>
      </div>
      {/* Type selection pills */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
          1. Motif d'absence
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(typeConfig) as Array<CongeFormValues['typeConge']>).map((typeKey) => {
            const config = typeConfig[typeKey];
            const Icon = config.icon;
            const isSelected = selectedType === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setValue('typeConge', typeKey, { shouldValidate: true })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-500/10 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-blue-950' : 'text-slate-800'
                    }`}
                  >
                    {config.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register('typeConge')} />
      </div>

      {/* Dates selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
          2. Période demandée
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Date de début
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                {...register('dateDebut')}
              />
            </div>
            {errors.dateDebut && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.dateDebut.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Date de fin
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                {...register('dateFin')}
              />
            </div>
            {errors.dateFin && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.dateFin.message}</p>
            )}
          </div>
        </div>
      </div>

      {workingDays > 0 && (
        <div className="p-4 rounded border border-emerald-200 bg-emerald-50 text-emerald-950 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>
                Du <strong>{dateDebut}</strong> au <strong>{dateFin}</strong> (hors week-ends)
              </span>
            </span>
            <span className="font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs">
              {workingDays} jour{workingDays > 1 ? 's ouvrés décomptés' : ' ouvré décompté'}
            </span>
          </div>

        </div>
      )}

      {/* Motif & Quick Tags */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          3. Motif ou précisions
        </label>

        {/* Quick click tags (Bizneo HR inspiration) */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Tag className="w-3 h-3" /> Suggestions :
          </span>
          {quickMotifs.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setValue('motif', tag, { shouldValidate: true })}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          placeholder="Précisez un motif particulier ou des informations pour votre responsable..."
          className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
          {...register('motif')}
        />
        {errors.motif && (
          <p className="text-xs text-rose-600 mt-1 font-medium">{errors.motif.message}</p>
        )}
      </div>

      {/* Feedback banner */}
      {serverMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
            serverMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {serverMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="font-medium mt-0.5">{serverMessage.text}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={createConge.isPending}
          className="btn-primary w-full sm:w-auto disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {createConge.isPending ? 'Envoi en cours...' : 'Transmettre la demande pour validation'}
        </button>
      </div>
    </form>
  );
}
