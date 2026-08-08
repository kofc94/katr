import React from 'react';
import { Home, Map, Camera, Signpost, BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'capture', label: 'Capture', icon: Camera },
  { id: 'list', label: 'Signs', icon: Signpost, badgeKey: 'placed' },
  { id: 'stats', label: 'Reports', icon: BarChart3 }
];

export default function BottomNav({ activeTab, setActiveTab, placedCount = 0 }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="glass-deep mx-auto flex max-w-md items-stretch justify-between gap-1 rounded-4xl p-1.5">
        {TABS.map(({ id, label, icon: Icon, badgeKey }) => {
          const isActive = activeTab === id;
          const badge = badgeKey === 'placed' ? placedCount : 0;

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              className={`relative flex flex-1 flex-col items-center gap-1 rounded-3xl py-2.5 transition-all duration-200 ${
                isActive ? 'bg-neon-500/12' : 'active:bg-white/5'
              }`}
            >
              <span className="relative">
                <Icon
                  className={`h-[22px] w-[22px] transition-all duration-200 ${
                    isActive
                      ? 'text-neon-400 drop-shadow-[0_0_10px_rgba(34,224,122,0.75)]'
                      : 'text-white/45'
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-neon-500 px-1 text-[10px] font-extrabold text-ink-950 tabular-nums">
                    {badge}
                  </span>
                )}
              </span>

              <span
                className={`text-[10px] leading-none font-bold transition-colors ${
                  isActive ? 'text-neon-400' : 'text-white/40'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
