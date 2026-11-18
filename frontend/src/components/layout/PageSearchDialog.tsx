import { useState } from 'react';
import { Search } from 'lucide-react';

export interface SearchPageItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PageSearchDialogProps {
  items: SearchPageItem[];
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function PageSearchDialog({ items, onClose, onNavigate }: PageSearchDialogProps) {
  const [query, setQuery] = useState('');

  const matchingItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const selectItem = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/40 backdrop-blur-xs px-4 pt-[14vh] transition-opacity duration-150"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Recherche de page"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/85 bg-white shadow-2xl shadow-slate-950/25 animate-enter"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-1">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matchingItems[0]) {
                selectItem(matchingItems[0].to);
              }
            }}
            placeholder="Rechercher une page ou fonctionnalité..."
            className="h-12 w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
          />
          <kbd className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-500 shadow-xs">
            Échap
          </kbd>
        </div>

        <nav aria-label="Résultats de recherche" className="max-h-76 overflow-y-auto p-2">
          {matchingItems.length > 0 ? (
            matchingItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => selectItem(item.to)}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">
              Aucune page ne correspond à votre recherche.
            </div>
          )}
        </nav>

        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            <kbd className="font-mono text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.2">Entrée</kbd> pour ouvrir
          </span>
          <span>
            <kbd className="font-mono text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.2">Échap</kbd> pour fermer
          </span>
        </div>
      </section>
    </div>
  );
}
