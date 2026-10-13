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

  const { data, isLoading, isFetching, isError, refetch } = useRapportPresence(
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileBarChart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
              Rapports de Présence & Exports
            </h1>
            <p className="text-sm text-slate-500">
              Générez des synthèses d'activité consolidées et téléchargez-les au format CSV, PDF ou Excel.
            </p>
          </div>
        </div>
      </div>

      {/* Generation & Filter Toolbar */}
      <div className="filter-strip py-3 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            />
            {isDateRangeInvalid && (
              <p className="mt-1 text-xs text-rose-700" role="alert">
                La date de fin doit être égale ou postérieure à la date de début.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Service concerné
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
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
            className="btn-primary disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            Générer la synthèse
          </button>

          {data && data.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExport}
                disabled={isDateRangeInvalid}
                className="btn-secondary disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Format CSV
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloadingFormat !== null || isDateRangeInvalid}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                {downloadingFormat === 'pdf' ? 'Génération...' : 'Télécharger PDF'}
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={downloadingFormat !== null || isDateRangeInvalid}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                {downloadingFormat === 'excel' ? 'Génération...' : 'Télécharger Excel'}
              </button>
            </div>
          )}
        </div>
      </div>

      {downloadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{downloadError}</span>
        </div>
      )}

      {/* Results Table */}
      {hasSearched && !isDateRangeInvalid && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="border-y border-slate-200 bg-white p-8 text-center" role="status" aria-live="polite">
              <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-slate-500">Calcul du rapport en cours...</p>
            </div>
          ) : isError ? (
            <div role="alert" className="flex flex-col gap-3 border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-rose-900">Le rapport n’a pas pu être chargé</h3>
                <p className="mt-1 text-xs text-rose-800">
                  Vérifiez la période et votre connexion, puis relancez la génération.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refetch()}
                className="shrink-0 rounded border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
              >
                Réessayer
              </button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="border-y border-slate-200 bg-white p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Aucune donnée trouvée</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Aucun enregistrement de présence pour la période et les filtres sélectionnés.
              </p>
            </div>
          ) : (
            <div className="card-modern overflow-hidden border border-slate-200/90 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Jours présents
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Retards
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Départs anticipés
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Total retard
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Heures sup.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((r) => (
                      <tr key={r.employeId} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-brand text-white font-semibold text-xs flex items-center justify-center">
                              {r.prenom[0]}
                              {r.nom[0]}
                            </div>
                            <span className="font-semibold text-slate-900">
                              {r.prenom} {r.nom}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                          {r.service ?? '—'}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-bold text-slate-800">{r.joursPresents}</span>
                          <span className="text-xs text-slate-400 ml-1">jours</span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-700">
                          {r.nbRetards > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              {r.nbRetards}
                            </span>
                          ) : (
                            '0'
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-700">
                          {r.nbDepartsAnticipes > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                              {r.nbDepartsAnticipes}
                            </span>
                          ) : (
                            '0'
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-slate-700">
                          {r.totalRetardMinutes > 0 ? (
                            <span className="text-amber-600 font-semibold">
                              {r.totalRetardMinutes} min
                            </span>
                          ) : (
                            '0 min'
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono">
                          {r.totalHsMinutes > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              +{r.totalHsMinutes} min
                            </span>
                          ) : (
                            '0 min'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isFetching && (
                <div className="px-4 py-2 bg-slate-50 text-[11px] text-blue-600 border-t border-slate-100 flex items-center gap-1.5 animate-pulse">
                  <span>Actualisation des calculs...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
