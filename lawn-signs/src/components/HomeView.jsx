import React, { useMemo, useState } from 'react';
import { ChevronsUpDown, LocateFixed, Loader2, PartyPopper } from 'lucide-react';
import ProgressRing from './ProgressRing';
import SignCard from './SignCard';
import { countByStatus, decorateSigns } from '../utils/signUtils';

export default function HomeView({
  signs,
  userLocation,
  isLocating,
  onRefreshLocation,
  onSelectSign,
  onStatusChange,
  updatingId
}) {
  const [sortBy, setSortBy] = useState('nearest');

  const { total, collected } = countByStatus(signs);
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

  const ordered = useMemo(
    () => decorateSigns(signs, userLocation, { sortBy }),
    [signs, userLocation, sortBy]
  );

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 pb-32">
      {/* Progress hero */}
      <section className="glass rounded-5xl px-5 py-7">
        <ProgressRing
          percentage={percentage}
          collected={collected}
          total={total}
        />
      </section>

      {/* Feed controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold tracking-tight text-white">
            {sortBy === 'nearest' ? 'Nearest' : 'Recent'}
          </h2>
          <button
            onClick={onRefreshLocation}
            aria-label="Refresh GPS location"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/6 text-neon-400 transition-colors active:bg-white/12"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort signs"
            className="appearance-none rounded-xl bg-transparent py-1 pr-6 pl-2 text-[13px] font-semibold text-white/65 outline-none"
          >
            <option value="nearest">Sort by Nearest Distance</option>
            <option value="newest">Sort by Most Recent</option>
          </select>
          <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-1 h-3.5 w-3.5 -translate-y-1/2 text-white/50" />
        </div>
      </div>

      {!userLocation && !isLocating && (
        <p className="-mt-2 text-xs font-medium text-white/40">
          Enable location to sort signs by how close they are to you.
        </p>
      )}

      {/* Feed */}
      <div className="space-y-3.5">
        {ordered.length === 0 ? (
          <div className="glass flex flex-col items-center gap-2 rounded-4xl px-6 py-12 text-center">
            <PartyPopper className="h-8 w-8 text-neon-400" />
            <h3 className="text-base font-bold text-white">No signs logged yet</h3>
            <p className="text-sm text-white/50">
              Head to the Capture tab to log your first lawn sign.
            </p>
          </div>
        ) : (
          ordered.map((sign) => (
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
