import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  FolderKanban,
  MapPin,
  Hash,
  User,
  Building,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataService } from '../../services/dataService';
import { SearchResult } from '../../types';

interface GlobalSearchModalProps {
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await DataService.universalSearch(query);
      setResults(res);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleSelect = (route: string) => {
    setIsSearchOpen(false);
    setQuery('');
    onNavigate(route);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROJECT':
        return <FolderKanban className="w-3.5 h-3.5 text-blue-600" />;
      case 'PARCEL':
        return <MapPin className="w-3.5 h-3.5 text-emerald-600" />;
      case 'SURVEY NUMBER':
        return <Hash className="w-3.5 h-3.5 text-amber-600" />;
      case 'LANDOWNER':
        return <User className="w-3.5 h-3.5 text-purple-600" />;
      case 'VILLAGE':
        return <Building className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      id="global-search-overlay"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        id="global-search-modal"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, parcels, survey numbers (e.g. 128/4A), landowners, villages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm md:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            id="global-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-200 rounded border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {query.trim().length >= 2 && results.length === 0 && !isSearching && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for &quot;NH-326&quot;, &quot;128/4A&quot;, &quot;PCL-00421&quot;, or &quot;Ramesh&quot;
              </p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Suggested Universal Queries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setQuery('NH-326')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-left text-slate-700"
                >
                  <span className="font-semibold text-slate-900">NH-326 Highway Corridor</span>
                  <span className="text-[11px] text-slate-400">Project</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('PCL-00421')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-left text-slate-700"
                >
                  <span className="font-semibold text-slate-900">Parcel PCL-00421</span>
                  <span className="text-[11px] text-slate-400">Parcel 360</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('128/4A')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-left text-slate-700"
                >
                  <span className="font-semibold text-slate-900">Survey No. 128/4A</span>
                  <span className="text-[11px] text-slate-400">Cadastral</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Ramesh')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-left text-slate-700"
                >
                  <span className="font-semibold text-slate-900">Ramesh Kumar Sharma</span>
                  <span className="text-[11px] text-slate-400">Landowner</span>
                </button>
              </div>
            </div>
          )}

          {(Object.entries(groupedResults) as [string, SearchResult[]][]).map(([category, items]) => (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {getCategoryIcon(category)}
                <span>{category}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.route)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group"
                    id={`search-item-${item.id}`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.meta && (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline-block">
                          {item.meta}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            Universal index connected to <strong>Projects, Parcels, Surveys, Landowners & RoR</strong>
          </span>
          <span className="hidden sm:inline">Use ↑↓ arrows to navigate, Enter to select</span>
        </div>
      </div>
    </div>
  );
};
