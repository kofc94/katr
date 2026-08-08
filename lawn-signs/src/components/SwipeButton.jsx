import React, { useCallback, useRef, useState } from 'react';
import { ChevronsRight, Check, Signpost, Loader2 } from 'lucide-react';

const TRACK_H = 60;
const HANDLE = 52;
const PAD = 4;

/**
 * Drag-to-confirm slider (mockup 2).
 *
 * Deliberately not a plain button: marking a sign collected is destructive to
 * the pickup route and volunteers are tapping one-handed while driving, so the
 * gesture needs to be hard to trigger by accident.
 */
export default function SwipeButton({
  onSwipeComplete,
  label = 'Swipe to Mark Collected',
  isCompleted = false,
  isBusy = false
}) {
  const trackRef = useRef(null);
  const maxRef = useRef(0);
  const firedRef = useRef(false);

  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const locked = isCompleted || isBusy;

  const maxDrag = () => {
    const w = trackRef.current?.getBoundingClientRect().width ?? 0;
    return Math.max(0, w - HANDLE - PAD * 2);
  };

  const onPointerDown = useCallback(
    (e) => {
      if (locked) return;
      firedRef.current = false;
      maxRef.current = maxDrag();
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [locked]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging || locked) return;
      const rect = trackRef.current.getBoundingClientRect();
      const next = Math.min(
        Math.max(0, e.clientX - rect.left - PAD - HANDLE / 2),
        maxRef.current
      );
      setX(next);

      if (!firedRef.current && next >= maxRef.current - 2) {
        firedRef.current = true;
        setDragging(false);
        onSwipeComplete?.();
      }
    },
    [dragging, locked, onSwipeComplete]
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
    if (!firedRef.current) setX(0); // Snap back when the swipe falls short.
  }, []);

  const fillWidth = x + HANDLE + PAD * 2;
  const progress = maxRef.current > 0 ? x / maxRef.current : 0;

  return (
    <div
      ref={trackRef}
      style={{ height: TRACK_H }}
      className={`relative w-full overflow-hidden rounded-full border select-none ${
        isCompleted
          ? 'glow-neon border-neon-400/70 bg-neon-500/20'
          : 'border-neon-500/45 bg-ink-900/80'
      }`}
    >
      {/* Fill track */}
      <div
        style={{
          width: isCompleted ? '100%' : fillWidth,
          transition: dragging ? 'none' : 'width 0.35s cubic-bezier(0.16,1,0.3,1)'
        }}
        className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-neon-600/70 to-neon-400/70"
      />

      {/* Label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 px-14">
        <span
          style={{ opacity: isCompleted ? 1 : 1 - progress * 0.85 }}
          className={`truncate text-[15px] font-extrabold ${
            isCompleted ? 'text-ink-950' : 'text-neon-300'
          }`}
        >
          {isCompleted ? 'Collected!' : isBusy ? 'Saving…' : label}
        </span>
      </div>

      {/* Trailing sign glyph */}
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
        <Signpost className="h-6 w-6 text-neon-400/70" strokeWidth={2} />
      </div>

      {/* Handle */}
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          // Keyboard/AT fallback — the drag gesture is pointer-only.
          if (!locked && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSwipeComplete?.();
          }
        }}
        style={{
          width: HANDLE,
          height: HANDLE,
          top: PAD,
          left: PAD,
          transform: `translateX(${isCompleted ? maxRef.current : x}px)`,
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.16,1,0.3,1)'
        }}
        className="absolute flex touch-none items-center justify-center rounded-full bg-linear-to-br from-neon-400 to-neon-600 text-ink-950 shadow-lg shadow-neon-500/40"
      >
        {isBusy ? (
          <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2.6} />
        ) : isCompleted ? (
          <Check className="h-6 w-6" strokeWidth={3} />
        ) : (
          <ChevronsRight className="h-6 w-6 animate-nudge" strokeWidth={2.8} />
        )}
      </div>
    </div>
  );
}
