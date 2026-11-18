import { useMemo, useState } from 'react';
import {
  FileBarChart,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useRapportPresence } from '../../hooks/useRapports';
import { useServiceOptions } from '../../hooks/useReferenceData';
import { rapportService } from '../../services/rapportService';

function toCsv(rows: { [key: string]: string | number | null }[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number | null): string => {
    let text = String(value ?? '');
    if (typeof value === 'string' && /^\s*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(escapeCell).join(';')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCell(row[header] ?? null)).join(';'));
  }
  return lines.join('\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(content: string, filename: string) {
  downloadBlob(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' }), filename);
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function firstDayOfMonth(): string {
  const now = new Date();
  return toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
}

function today(): string {
  return toLocalDateString(new Date());
}

export function RapportsPage() {
  const [dateDebut, setDateDebut] = useState(firstDayOfMonth());
  const [dateFin, setDateFin] = useState(today());
  const [serviceFilter, setServiceFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const isDateRangeInvalid = dateFin < dateDebut;

  const { data: services } = useServiceOptions();

  const params = useMemo(
    () => ({
      dateDebut,
      dateFin,
      serviceId: serviceFilter ? Number(serviceFilter) : undefined,
    }),
    [dateDebut, dateFin, serviceFilter]
  );

  const { data, isLoading, isError, refetch } = useRapportPresence(
    params,
    hasSearched && !isDateRangeInvalid
  );
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'excel' | null>(null);

  const handleExport = () => {
    if (!data) return;
    const rows = data.map((r) => ({
      Employe: `${r.prenom} ${r.nom}`,
      Service: r.service ?? '',
      'Jours presents': r.joursPresents,
      Retards: r.nbRetards,
      'Departs anticipes': r.nbDepartsAnticipes,
      'Total retard (min)': r.totalRetardMinutes,
      'Heures sup (min)': r.totalHsMinutes,
    }));
    downloadCsv(toCsv(rows), `rapport-presence_${dateDebut}_${dateFin}.csv`);
  };

  const handleDownloadPdf = async () => {
    setDownloadError(null);
    setDownloadingFormat('pdf');
    try {
      const blob = await rapportService.presencePdfBlob(params);
      downloadBlob(blob, `rapport-presence_${dateDebut}_${dateFin}.pdf`);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Le téléchargement PDF a échoué.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadError(null);
    setDownloadingFormat('excel');
    try {
      const blob = await rapportService.presenceExcelBlob(params);
      downloadBlob(blob, `rapport-presence_${dateDebut}_${dateFin}.xlsx`);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Le téléchargement Excel a échoué.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
            <FileBarChart className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Rapports de Présence & Exports
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Analytique RH
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Générez des synthèses d'activité consolidées et téléchargez-les au format CSV, PDF ou Excel.
            </p>
          </div>
        </div>
      </div>

      {/* Generation & Filter Toolbar Card */}
      <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date de début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            />
            {isDateRangeInvalid && (
              <p className="mt-1 text-xs text-rose-700 font-semibold" role="alert">
                La date de fin doit être égale ou postérieure à la date de début.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date de fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Service ou département
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            >
              <option value="">Tous les services</option>
              {services?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              if (!isDateRangeInvalid) setHasSearched(true);
            }}
            disabled={isDateRangeInvalid}
            className="btn-primary py-2.5 px-5 rounded-xl shadow-xs"
          >
            <Search className="w-4 h-4 text-emerald-200" />
            <span>Générer la synthèse</span>
          </button>

          {data && data.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleExport}
                disabled={isDateRangeInvalid}
                className="btn-secondary py-2 px-3.5 rounded-xl text-xs shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Format CSV
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloadingFormat !== null || isDateRangeInvalid}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                {downloadingFormat === 'pdf' ? 'Génération...' : 'Télécharger PDF'}
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={downloadingFormat !== null || isDateRangeInvalid}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                {downloadingFormat === 'excel' ? 'Génération...' : 'Télécharger Excel'}
              </button>
            </div>
          )}
        </div>
      </div>

      {downloadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-enter">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{downloadError}</span>
        </div>
      )}

      {/* Results Table */}
      {hasSearched && !isDateRangeInvalid && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="card-modern rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs" role="status" aria-live="polite">
              <div className="w-8 h-8 border-3 border-emerald-600/20 border-t-emerald-700 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500">Calcul des données du rapport en cours...</p>
            </div>
          ) : isError ? (
            <div role="alert" className="card-modern rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-rose-950">Le rapport n’a pas pu être chargé</h3>
                <p className="mt-0.5 text-xs text-rose-700">
                  Vérifiez la période choisie puis relancez la génération.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refetch()}
                className="btn-secondary text-xs"
              >
                Réessayer
              </button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="card-modern rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 brand-title">Aucune donnée trouvée</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Aucun pointage ni heure de travail pour la période et les filtres sélectionnés.
              </p>
            </div>
          ) : (
            <div className="card-modern overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead>
                    <tr className="bg-slate-50/70">
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Jours présents
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Retards
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Départs anticipés
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Total retard
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Heures sup.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {data.map((r) => (
                      <tr key={r.employeId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-800 to-teal-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {r.prenom[0]}
                              {r.nom[0]}
                            </div>
                            <span className="font-bold text-slate-900">
                              {r.prenom} {r.nom}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                          {r.service ?? '—'}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                          {r.joursPresents} <span className="text-xs font-normal text-slate-400 font-sans">j</span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {r.nbRetards > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                              {r.nbRetards}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">0</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {r.nbDepartsAnticipes > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200/80">
                              {r.nbDepartsAnticipes}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">0</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-700">
                          {r.totalRetardMinutes > 0 ? (
                            <span className="text-amber-700 font-bold">
                              {r.totalRetardMinutes} min
                            </span>
                          ) : (
                            <span className="text-slate-400">0 min</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap font-mono">
                          {r.totalHsMinutes > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
                              +{r.totalHsMinutes} min
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">0 min</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
