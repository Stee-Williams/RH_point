import { useMemo, useState } from 'react';
import {
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';
import { usePointagesList } from '../../hooks/usePointage';
import { useServiceOptions } from '../../hooks/useReferenceData';
import { PointageHistoryTable } from '../../components/PointageHistoryTable';
import type { PointageStatut } from '../../types/pointage';
export function PresencesPage() {
  const [serviceFilter, setServiceFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState<PointageStatut | ''>('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [searchCollaborator, setSearchCollaborator] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [page, setPage] = useState(1);
  const { data: services } = useServiceOptions();
  const listParams = useMemo(
    () => ({
      serviceId: serviceFilter ? Number(serviceFilter) : undefined,
      statut: statutFilter,
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined,
      page,
      limit: 15,
    }),
    [serviceFilter, statutFilter, dateDebut, dateFin, page]
  );
  const { data, isLoading, isFetching, isError, refetch } = usePointagesList(listParams);
  const handleResetFilters = () => {
    setServiceFilter('');
    setStatutFilter('');
    setDateDebut('');
    setDateFin('');
    setSearchCollaborator('');
    setPage(1);
  };
  const hasActiveFilters = Boolean(
    serviceFilter || statutFilter || dateDebut || dateFin || searchCollaborator
  );
  // Filter items in memory if searching by name in grid mode
  const filteredPointages = useMemo(() => {
    if (!data?.items) return [];
    if (!searchCollaborator.trim()) return data.items;
    const query = searchCollaborator.toLowerCase();
    return data.items.filter((p) => {
      const fullName = `${p.employe?.prenom || ''} ${p.employe?.nom || ''}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [data?.items, searchCollaborator]);

  // Presence statistics for current view
  const stats = useMemo(() => {
    const items = data?.items || [];
    const presents = items.filter((p) => p.statut === 'present').length;
    const retards = items.filter((p) => p.statut === 'retard').length;
    const departsAnticipes = items.filter((p) => p.statut === 'depart_anticipe').length;
    return { presents, retards, departsAnticipes, total: data?.meta?.total || 0 };
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Supervision des Présences
              </h1>
              <p className="text-sm text-slate-500">
                Suivi en temps réel de l'activité, pointages et ponctualité de vos équipes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vue en grille"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grille d'équipe</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vue en tableau"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau détaillé</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-y border-slate-200 bg-white sm:grid-cols-4 sm:divide-y-0">
        <div className="px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">À l'heure</span>
          <p className="font-mono text-lg font-semibold text-emerald-800 tabular-nums">{stats.presents}</p>
        </div>
        <div className="px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Retards</span>
          <p className="font-mono text-lg font-semibold text-amber-700 tabular-nums">{stats.retards}</p>
        </div>
        <div className="px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Départs anticipés</span>
          <p className="font-mono text-lg font-semibold text-orange-700 tabular-nums">{stats.departsAnticipes}</p>
        </div>
        <div className="px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Enregistrements</span>
          <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums">{stats.total}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-strip py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filtres & Recherche
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Quick search input */}
          <div className="relative lg:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Collaborateur
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Nom ou matricule..."
                value={searchCollaborator}
                onChange={(e) => setSearchCollaborator(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Service filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Service / Pôle
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
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

          {/* Statut filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Statut du pointage
            </label>
            <select
              value={statutFilter}
              onChange={(e) => {
                setStatutFilter(e.target.value as PointageStatut | '');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="present">Présent</option>
              <option value="retard">En retard</option>
              <option value="depart_anticipe">Départ anticipé</option>
            </select>
          </div>

          {/* Date début */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => {
                setDateDebut(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => {
                setDateFin(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Grid View or Table View */}
      {isError ? (
        <div role="alert" className="flex flex-col gap-3 border-y border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-900">Impossible de charger les pointages</p>
            <p className="mt-0.5 text-xs text-rose-800">Vérifiez votre connexion puis relancez le chargement.</p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="btn-secondary shrink-0 disabled:opacity-50"
          >
            {isFetching ? 'Chargement…' : 'Réessayer'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-modern p-5 h-36 bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredPointages.length === 0 ? (
            <div className="card-modern p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Aucun pointage trouvé</p>
              <p className="text-xs text-slate-400 mt-1">
                Modifiez vos critères de recherche ou sélectionnez une autre date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPointages.map((pointage) => {
                const isPresent = pointage.statut === 'present';
                const isRetard = pointage.statut === 'retard';

                return (
                  <div
                    key={pointage.id}
                    className="card-modern p-4 bg-white flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-brand text-white font-semibold text-xs flex items-center justify-center">
                            {pointage.employe?.prenom?.[0] || 'E'}
                            {pointage.employe?.nom?.[0] || 'P'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 leading-tight">
                              {pointage.employe
                                ? `${pointage.employe.prenom} ${pointage.employe.nom}`
                                : `Employé #${pointage.id}`}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Collaborateur #{pointage.employe?.id}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRetard
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPresent ? 'bg-emerald-500' : isRetard ? 'bg-amber-500' : 'bg-orange-500'
                            }`}
                          />
                          {pointage.statut === 'present'
                            ? 'Présent'
                            : pointage.statut === 'retard'
                            ? `Retard (+${pointage.retardMinutes}m)`
                            : 'Départ anticipé'}
                        </span>
                      </div>

                      {/* Timestamps */}
                      <div className="grid grid-cols-2 gap-2 p-2 border-y border-slate-200 bg-slate-50 text-center mb-3">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Arrivée
                          </span>
                          <p className="text-xs font-mono font-bold text-slate-800">
                            {pointage.heureArrivee || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Départ
                          </span>
                          <p className="text-xs font-mono font-bold text-slate-800">
                            {pointage.heureDepart || (
                              <span className="text-emerald-600 font-sans font-medium text-[11px]">
                                En poste
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer info */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Date : {pointage.datePointage}</span>
                      <span className="capitalize">{pointage.methode || 'Bouton'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <PointageHistoryTable pointages={data?.items ?? []} isLoading={isLoading} showEmploye />
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
          <span className="font-medium">
            Page {data.meta.page} sur {data.meta.totalPages} ({data.meta.total} enregistrements)
            {isFetching && (
              <span className="text-blue-600 ml-1.5 animate-pulse">· actualisation...</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Précédent
            </button>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              Suivant
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
