import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Radar,
  Lock,
  Undo2,
  Loader2,
  ImageOff
} from 'lucide-react';
import { formatDistance } from '../utils/signUtils';

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=600&q=70';

function SignPhoto({ src, alt }) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-ink-850">
        <ImageOff className="h-6 w-6 text-white/25" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover"
      onError={(e) => {
        // One retry against the stock photo, then fall back to the icon.
        if (e.currentTarget.src !== FALLBACK_PHOTO) {
          e.currentTarget.src = FALLBACK_PHOTO;
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

export default function SignCard({
  sign,
  onSelect,
  onStatusChange,
  isUpdating = false
}) {
  const { status, distanceMiles, isCloseEnough } = sign;
  const isResolved = status === 'collected' || status === 'missing';

  const accent =
    status === 'collected'
      ? 'border-aqua-500/35'
      : status === 'missing'
        ? 'border-flare-500/35'
        : isCloseEnough
          ? 'border-neon-500/45'
          : 'border-white/8';

  const act = (e, next) => {
    e.stopPropagation();
    onStatusChange(sign.id, next);
  };

  return (
    <article
      onClick={() => onSelect?.(sign)}
      className={`glass animate-rise cursor-pointer rounded-4xl border p-3.5 transition-all duration-200 active:scale-[0.985] ${accent}`}
    >
      <div className="flex gap-3.5">
        {/* Photo */}
        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-ink-900">
          <SignPhoto src={sign.s3Url} alt={`Lawn sign at ${sign.address}`} />
          {isCloseEnough && !isResolved && (
            <div className="absolute inset-0 ring-2 ring-inset ring-neon-500/60" />
          )}
        </div>

        {/* Detail */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-white">
            {sign.address}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            {formatDistance(distanceMiles) && (
              <span className="rounded-lg bg-black/45 px-2 py-1 text-[11px] font-semibold text-white/75 tabular-nums">
                {formatDistance(distanceMiles)}
              </span>
            )}

            {isResolved ? (
              <span
                className={`eyebrow inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
                  status === 'collected'
                    ? 'bg-aqua-500/15 text-aqua-400'
                    : 'bg-flare-500/15 text-flare-400'
                }`}
              >
                {status === 'collected' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {status}
              </span>
            ) : isCloseEnough ? (
              <span className="eyebrow inline-flex items-center gap-1 rounded-lg bg-neon-500/18 px-2 py-1 text-neon-400">
                <Radar className="h-3 w-3" /> In range
              </span>
            ) : (
              <span className="eyebrow inline-flex items-center gap-1 rounded-lg bg-white/6 px-2 py-1 text-white/45">
                <Lock className="h-3 w-3" /> Out of range
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3.5 border-t border-white/8 pt-3">
        {isResolved ? (
          <button
            onClick={(e) => act(e, 'placed')}
            disabled={isUpdating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/6 py-2.5 text-[13px] font-bold text-white/70 transition-colors hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Undo2 className="h-4 w-4" />
            )}
            Reopen sign
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={(e) => act(e, 'collected')}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-aqua-400 to-azure-600 py-3 text-[13px] font-extrabold tracking-wide text-white shadow-lg shadow-aqua-500/25 transition-transform active:scale-[0.97] disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
              )}
              COLLECT
            </button>

            <button
              onClick={(e) => act(e, 'missing')}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-flare-400 to-flare-600 py-3 text-[13px] font-extrabold tracking-wide text-white shadow-lg shadow-flare-500/25 transition-transform active:scale-[0.97] disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" strokeWidth={2.5} />
              MISSING
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
