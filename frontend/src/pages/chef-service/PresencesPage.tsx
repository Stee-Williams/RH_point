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
    <div className="max-w-6xl mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/70 shadow-xs">
            <Users className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 brand-title">
                Supervision des Présences
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Suivi d'équipe
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez les pointages en temps réel, l'assiduité et la ponctualité de vos équipes.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex items-center bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.97] cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Vue en grille"
          >
            <LayoutGrid className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Grille d'équipe</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.97] cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Vue en tableau"
          >
            <List className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Tableau détaillé</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-modern p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">À l'heure</span>
          <p className="font-mono text-2xl font-extrabold text-emerald-800 tabular-nums">{stats.presents}</p>
        </div>
        <div className="card-modern p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Retards</span>
          <p className="font-mono text-2xl font-extrabold text-amber-700 tabular-nums">{stats.retards}</p>
        </div>
        <div className="card-modern p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Départs anticipés</span>
          <p className="font-mono text-2xl font-extrabold text-orange-700 tabular-nums">{stats.departsAnticipes}</p>
        </div>
        <div className="card-modern p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total pointages</span>
          <p className="font-mono text-2xl font-extrabold text-slate-900 tabular-nums">{stats.total}</p>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            Filtres avancés
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Quick search input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Collaborateur
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Nom ou matricule..."
                value={searchCollaborator}
                onChange={(e) => setSearchCollaborator(e.target.value)}
                className="w-full h-10 pl-9 pr-3.5 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all"
              />
            </div>
          </div>

          {/* Service filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Département
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
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

          {/* Statut filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Statut
            </label>
            <select
              value={statutFilter}
              onChange={(e) => {
                setStatutFilter(e.target.value as PointageStatut | '');
                setPage(1);
              }}
              className="w-full h-10 px-3 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="present">Présent</option>
              <option value="retard">En retard</option>
              <option value="depart_anticipe">Départ anticipé</option>
            </select>
          </div>

          {/* Date début */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date de début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => {
                setDateDebut(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date de fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => {
                setDateFin(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 bg-slate-50/60 hover:bg-white focus:bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/15 focus:border-emerald-700 transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Grid View or Table View */}
      {isError ? (
        <div role="alert" className="card-modern rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-rose-950">Impossible de charger les pointages</p>
            <p className="mt-0.5 text-xs text-rose-700">Vérifiez votre connexion puis relancez le chargement.</p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs"
          >
            {isFetching ? 'Chargement…' : 'Réessayer'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-modern p-5 h-36 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredPointages.length === 0 ? (
            <div className="card-modern p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-800">Aucun pointage trouvé</p>
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
                    className="card-modern p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      {/* Card Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {pointage.employe?.prenom?.[0] || 'E'}
                            {pointage.employe?.nom?.[0] || 'P'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 leading-tight">
                              {pointage.employe
                                ? `${pointage.employe.prenom} ${pointage.employe.nom}`
                                : `Employé #${pointage.id}`}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Collaborateur #{pointage.employe?.id}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                              : isRetard
                              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                              : 'bg-orange-50 text-orange-800 border-orange-200/80'
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
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-center mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Arrivée
                          </span>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                            {pointage.heureArrivee || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Départ
                          </span>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                            {pointage.heureDepart || (
                              <span className="text-emerald-700 font-sans font-semibold text-xs">
                                En poste
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer info */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Date : <strong className="text-slate-700">{pointage.datePointage}</strong></span>
                      <span className="capitalize font-medium">{pointage.methode || 'Bouton'}</span>
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
            Page <strong className="text-slate-800">{data.meta.page}</strong> sur <strong className="text-slate-800">{data.meta.totalPages}</strong> ({data.meta.total} enregistrements)
            {isFetching && (
              <span className="text-emerald-700 ml-1.5 animate-pulse">· actualisation...</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Précédent
            </button>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary disabled:opacity-40"
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
