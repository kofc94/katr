import React, { useEffect, useState } from 'react';

/**
 * Neon dual-arc progress ring (mockup 3 hero).
 *
 * Two stacked strokes give the glow its depth: a heavily blurred copy of the
 * arc sits underneath the crisp one, so the light appears to bleed onto the
 * card rather than being a flat ring with a drop shadow.
 */
export default function ProgressRing({
  percentage = 0,
  collected = 0,
  total = 0,
  size = 208,
  strokeWidth = 14
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate the arc from empty on mount so the number counts into place.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(percentage), 120);
    return () => clearTimeout(t);
  }, [percentage]);

  const offset = circumference - (shown / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c7ee" />
              <stop offset="55%" stopColor="#38dcf5" />
              <stop offset="100%" stopColor="#4ef08a" />
            </linearGradient>
            <filter id="ringBloom" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />

          {/* Blurred bloom copy */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#ringBloom)"
            opacity="0.85"
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)' }}
          />

          {/* Crisp arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[3.4rem] font-extrabold leading-none tracking-tighter text-white tabular-nums">
            {percentage}
            <span className="text-3xl font-bold text-white/70">%</span>
          </span>
          <p className="mt-2 text-[13px] font-semibold text-white/80">Signs Collected</p>
          <p className="mt-0.5 text-xs font-medium text-white/45 tabular-nums">
            ({collected} / {total} Total)
          </p>
        </div>
      </div>
    </div>
  );
}
