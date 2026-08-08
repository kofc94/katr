import React, { useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import SignCard from './SignCard';
import { countByStatus, decorateSigns } from '../utils/signUtils';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'placed', label: 'Placed' },
  { id: 'collected', label: 'Collected' },
  { id: 'missing', label: 'Missing' }
];

const ACTIVE_STYLES = {
  all: 'bg-white/12 text-white',
  placed: 'bg-neon-500/18 text-neon-400',
  collected: 'bg-aqua-500/18 text-aqua-400',
  missing: 'bg-flare-500/18 text-flare-400'
};

export default function SignsListView({
  signs,
  userLocation,
  onSelectSign,
  onStatusChange,
  updatingId
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const counts = countByStatus(signs);

  const visible = useMemo(() => {
    const decorated = decorateSigns(signs, userLocation, {
      sortBy: 'nearest',
      search
    });
    return filter === 'all'
      ? decorated
      : decorated.filter((s) => s.status === filter);
  }, [signs, userLocation, search, filter]);

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-32">
      {/* Search */}
      <div className="glass flex items-center gap-2.5 rounded-3xl px-4 py-3">
        <Search className="h-[18px] w-[18px] shrink-0 text-white/40" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search address or notes…"
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-white placeholder:text-white/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="shrink-0 text-white/40"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Status filters */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map(({ id, label }) => {
          const n = id === 'all' ? counts.total : counts[id];
          const isActive = filter === id;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-bold whitespace-nowrap transition-colors ${
                isActive ? ACTIVE_STYLES[id] : 'bg-white/5 text-white/45'
              }`}
            >
              {label}
              <span className="ml-1.5 tabular-nums opacity-60">{n}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="space-y-3.5">
        {visible.length === 0 ? (
          <div className="glass flex flex-col items-center gap-2 rounded-4xl px-6 py-12 text-center">
            <SearchX className="h-8 w-8 text-white/30" />
            <h3 className="text-base font-bold text-white">No matching signs</h3>
            <p className="text-sm text-white/45">
              Try a different search term or status filter.
            </p>
          </div>
        ) : (
          visible.map((sign) => (
            <SignCard
              key={sign.id}
              sign={sign}
              onSelect={onSelectSign}
              onStatusChange={onStatusChange}
              isUpdating={updatingId === sign.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
