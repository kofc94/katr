import React, { useState } from 'react';
import {
  X,
  Cloud,
  HardDrive,
  RotateCcw,
  LogOut,
  ShieldCheck,
  UserRound,
  Loader2
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { resetDemoData } from '../services/signsService';

export default function SettingsModal({ isOpen, onClose, onModeChanged }) {
  const { user, isDemo, mode, switchMode, signOut, cloudAvailable } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const choose = (next) => {
    if (next === mode) return;
    switchMode(next);
    onModeChanged?.();
  };

  const handleReset = () => {
    if (!window.confirm('Reset the local demo signs back to sample data?')) return;
    resetDemoData();
    onModeChanged?.();
    onClose();
  };

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-1000 flex items-end justify-center bg-ink-950/70 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-deep animate-sheet-up max-h-[88vh] w-full max-w-md space-y-4 overflow-y-auto rounded-4xl p-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Account */}
        {user && (
          <div className="flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neon-500/15 text-neon-400">
              <UserRound className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-white">
                {user.name || user.email}
              </p>
              {user.email && user.name && (
                <p className="truncate text-[13px] text-white/45">{user.email}</p>
              )}
            </div>
            {user.isAdmin && (
              <span className="eyebrow shrink-0 rounded-lg bg-neon-500/15 px-2 py-1 text-neon-400">
                Admin
              </span>
            )}
          </div>
        )}

        {/* Storage mode */}
        <div>
          <p className="eyebrow mb-2 text-white/45">Data source</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => choose('demo')}
              className={`flex flex-col items-center gap-1.5 rounded-3xl border px-3 py-4 transition-colors ${
                isDemo
                  ? 'border-neon-500/50 bg-neon-500/12 text-neon-400'
                  : 'border-white/10 bg-white/4 text-white/45'
              }`}
            >
              <HardDrive className="h-5 w-5" strokeWidth={2.2} />
              <span className="text-[13px] font-bold">Demo (local)</span>
            </button>

            <button
              onClick={() => choose('cloud')}
              disabled={!cloudAvailable}
              className={`flex flex-col items-center gap-1.5 rounded-3xl border px-3 py-4 transition-colors disabled:opacity-40 ${
                !isDemo
                  ? 'border-aqua-500/50 bg-aqua-500/12 text-aqua-400'
                  : 'border-white/10 bg-white/4 text-white/45'
              }`}
            >
              <Cloud className="h-5 w-5" strokeWidth={2.2} />
              <span className="text-[13px] font-bold">Live event</span>
            </button>
          </div>

          <p className="mt-2 text-[12px] leading-relaxed text-white/40">
            {isDemo
              ? 'Demo data stays on this device and never reaches AWS.'
              : 'Signs sync to the shared event database for every volunteer.'}
          </p>
          {!cloudAvailable && (
            <p className="mt-1 text-[12px] leading-relaxed text-white/40">
              Live mode is unavailable — this build has no AWS configuration.
            </p>
          )}
        </div>

        {/* How data is secured */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/4 px-3.5 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon-400" />
          <p className="text-[12px] leading-relaxed text-white/55">
            This app holds no AWS keys. Photos upload through single-use links
            issued by the event API after you sign in.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/8 px-4 py-3 text-[13px] font-bold text-white/60 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" /> Reset demo
          </button>

          {user && (
            <button
              onClick={handleSignOut}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-flare-500/15 py-3 text-[14px] font-extrabold text-flare-400 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
