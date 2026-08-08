import React from 'react';
import {
  X,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Undo2
} from 'lucide-react';
import { directionsUrl, relativeTime } from '../utils/signUtils';

const STATUS_TONE = {
  placed: 'bg-neon-500/15 text-neon-400',
  collected: 'bg-aqua-500/15 text-aqua-400',
  missing: 'bg-flare-500/15 text-flare-400'
};

export default function SignDetailModal({ sign, onClose, onStatusChange }) {
  if (!sign) return null;

  const isResolved = sign.status === 'collected' || sign.status === 'missing';

  const act = async (next) => {
    await onStatusChange(sign.id, next);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-1000 flex items-end justify-center bg-ink-950/70 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-deep animate-sheet-up max-h-[88vh] w-full max-w-md overflow-y-auto rounded-4xl p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`eyebrow rounded-lg px-2.5 py-1.5 ${STATUS_TONE[sign.status]}`}
          >
            {sign.status}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photo */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900">
          <img
            src={sign.s3Url}
            alt={`Lawn sign at ${sign.address}`}
            className="max-h-[38vh] w-full object-cover"
          />
          {sign.s3Url && (
            <a
              href={sign.s3Url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md"
            >
              <ExternalLink className="h-3 w-3" /> Full size
            </a>
          )}
        </div>

        <h2 className="mt-4 text-xl leading-tight font-extrabold text-white">
          {sign.address}
        </h2>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-white/5 px-3 py-2.5">
            <p className="eyebrow text-white/40">Coordinates</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-white/85 tabular-nums">
              {sign.latitude?.toFixed(5)}, {sign.longitude?.toFixed(5)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-2.5">
            <p className="eyebrow text-white/40">Placed by</p>
            <p className="mt-1 truncate text-[13px] font-semibold text-white/85">
              {sign.placedBy || 'Volunteer'}
            </p>
          </div>
        </div>

        {sign.notes && (
          <p className="mt-2.5 rounded-2xl bg-white/5 px-3.5 py-3 text-[13px] leading-relaxed text-white/70 italic">
            “{sign.notes}”
          </p>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-white/40">
          <Clock className="h-3.5 w-3.5" />
          Placed {relativeTime(sign.placedAt)} ·{' '}
          {new Date(sign.placedAt).toLocaleDateString()}
        </p>

        {/* Actions */}
        <div className="mt-4 space-y-2.5 border-t border-white/8 pt-4">
          <a
            href={directionsUrl(sign.latitude, sign.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-aqua-400 to-azure-600 py-3.5 text-[15px] font-extrabold text-white shadow-lg shadow-azure-500/25 active:scale-[0.98]"
          >
            <Navigation className="h-[18px] w-[18px]" strokeWidth={2.5} />
            Navigate here
          </a>

          {isResolved ? (
            <button
              onClick={() => act('placed')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/8 py-3 text-[14px] font-bold text-white/75 active:scale-[0.98]"
            >
              <Undo2 className="h-4 w-4" /> Reopen sign
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => act('collected')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-neon-500/15 py-3 text-[14px] font-extrabold text-neon-400 active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> Collect
              </button>
              <button
                onClick={() => act('missing')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-flare-500/15 py-3 text-[14px] font-extrabold text-flare-400 active:scale-[0.98]"
              >
                <XCircle className="h-4 w-4" strokeWidth={2.5} /> Missing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
