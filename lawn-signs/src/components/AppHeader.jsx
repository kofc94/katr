import React from 'react';
import { Settings, Cloud, HardDrive } from 'lucide-react';

/**
 * Centered title flanked by two round glass buttons (mockup 3).
 * The left button doubles as the storage-mode indicator so volunteers can
 * tell at a glance whether captures are going to AWS or staying local.
 */
export default function AppHeader({ title, isDemo, onOpenSettings }) {
  const isLive = !isDemo;
  return (
    <header className="pt-safe sticky top-0 z-30 px-4 pb-3">
      <div className="absolute inset-0 bg-linear-to-b from-ink-950 via-ink-950/85 to-transparent backdrop-blur-md" />

      <div className="relative mx-auto flex max-w-md items-center justify-between gap-3 pt-2">
        <button
          onClick={onOpenSettings}
          aria-label={isLive ? 'Live event data' : 'Demo storage mode'}
          className={`flex h-10 items-center gap-1.5 rounded-full border px-3 transition-colors ${
            isLive
              ? 'border-neon-500/40 bg-neon-500/12 text-neon-400'
              : 'border-white/12 bg-white/6 text-white/55'
          }`}
        >
          {isLive ? (
            <Cloud className="h-4 w-4" strokeWidth={2.4} />
          ) : (
            <HardDrive className="h-4 w-4" strokeWidth={2.2} />
          )}
          <span className="eyebrow">{isLive ? 'Live' : 'Demo'}</span>
        </button>

        <h1 className="eyebrow flex-1 text-center text-[13px] tracking-[0.2em] text-white">
          {title}
        </h1>

        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/70 transition-colors active:bg-white/12"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={2.1} />
        </button>
      </div>
    </header>
  );
}
