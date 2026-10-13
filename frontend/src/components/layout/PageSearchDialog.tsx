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
      className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/35 px-4 pt-[15vh]"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Recherche de page"
        className="w-full max-w-lg overflow-hidden rounded border border-slate-200 bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
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
            placeholder="Rechercher une page..."
            className="h-12 w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            Échap
          </kbd>
        </div>
        <nav aria-label="Résultats de recherche" className="max-h-72 overflow-y-auto p-1.5">
          {matchingItems.length > 0 ? (
            matchingItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => selectItem(item.to)}
                  className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  {item.label}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              Aucune page ne correspond à cette recherche.
            </p>
          )}
        </nav>
        <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500">
          Entrée pour ouvrir le premier résultat · Échap pour fermer
        </div>
      </section>
    </div>
  );
}
