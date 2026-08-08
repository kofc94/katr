import React from 'react';
import {
  Download,
  MapPin,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import { countByStatus, relativeTime } from '../utils/signUtils';

const CSV_COLUMNS = [
  ['ID', (s) => s.id],
  ['Event ID', (s) => s.eventId || 'katr-2026'],
  ['Status', (s) => s.status],
  ['Address', (s) => s.address],
  ['Latitude', (s) => s.latitude],
  ['Longitude', (s) => s.longitude],
  ['S3 Bucket', (s) => s.s3Bucket],
  ['S3 Key', (s) => s.s3Key],
  ['S3 URL', (s) => s.s3Url],
  ['Placed At', (s) => s.placedAt],
  ['Placed By', (s) => s.placedBy || 'Volunteer'],
  ['Collected At', (s) => s.collectedAt || ''],
  ['Notes', (s) => s.notes || '']
];

/** RFC-4180 escaping — addresses and notes routinely contain commas. */
function csvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function StatTile({ icon: Icon, value, label, tone }) {
  return (
    <div className={`glass rounded-3xl border-t px-3 py-4 text-center ${tone.border}`}>
      <Icon className={`mx-auto h-5 w-5 ${tone.text}`} strokeWidth={2.3} />
      <p className="mt-2 text-2xl font-extrabold text-white tabular-nums">{value}</p>
      <p className={`eyebrow mt-1 ${tone.text}`}>{label}</p>
    </div>
  );
}

export default function StatsView({ signs }) {
  const { total, placed, collected, missing } = countByStatus(signs);
  const pct = (n) => (total > 0 ? (n / total) * 100 : 0);
  const collectionRate = total > 0 ? Math.round((collected / total) * 100) : 0;

  const handleExportCSV = () => {
    if (signs.length === 0) return;

    const rows = [
      CSV_COLUMNS.map(([header]) => header).join(','),
      ...signs.map((sign) =>
        CSV_COLUMNS.map(([, get]) => csvCell(get(sign))).join(',')
      )
    ];

    // Blob rather than a data: URI — data URIs cap out and mangle UTF-8.
    const blob = new Blob([`﻿${rows.join('\r\n')}`], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lawn_signs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const recent = [...signs]
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-32">
      {/* Collection rate */}
      <section className="glass rounded-4xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-neon-400">Post-event collection</p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white">
              {collectionRate}% recovered
            </h2>
            <p className="mt-0.5 text-[13px] font-medium text-white/45 tabular-nums">
              {collected} of {total} signs back in storage
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-500/12 text-neon-400">
            <TrendingUp className="h-5 w-5" strokeWidth={2.3} />
          </div>
        </div>

        {/* Segmented bar: collected | missing | still out */}
        <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            style={{ width: `${pct(collected)}%` }}
            className="h-full bg-linear-to-r from-aqua-400 to-azure-500 transition-[width] duration-700"
          />
          <div
            style={{ width: `${pct(missing)}%` }}
            className="h-full bg-flare-500 transition-[width] duration-700"
          />
          <div
            style={{ width: `${pct(placed)}%` }}
            className="h-full bg-neon-500/70 transition-[width] duration-700"
          />
        </div>
      </section>

      {/* Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={MapPin}
          value={placed}
          label="Still out"
          tone={{ border: 'border-neon-500/50', text: 'text-neon-400' }}
        />
        <StatTile
          icon={CheckCircle2}
          value={collected}
          label="Collected"
          tone={{ border: 'border-aqua-500/50', text: 'text-aqua-400' }}
        />
        <StatTile
          icon={XCircle}
          value={missing}
          label="Missing"
          tone={{ border: 'border-flare-500/50', text: 'text-flare-400' }}
        />
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <section className="glass rounded-4xl p-4">
          <h3 className="text-[15px] font-bold text-white">Recent activity</h3>
          <ul className="mt-3 space-y-2.5">
            {recent.map((sign) => (
              <li key={sign.id} className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    sign.status === 'collected'
                      ? 'bg-aqua-500'
                      : sign.status === 'missing'
                        ? 'bg-flare-500'
                        : 'bg-neon-500'
                  }`}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-white/75">
                  {sign.address}
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-white/35">
                  {relativeTime(sign.placedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Export */}
      <section className="glass rounded-4xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-neon-400">
            <FileSpreadsheet className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-white">Export inventory</h3>
            <p className="mt-0.5 text-[13px] text-white/45">
              Full sign list with S3 URLs and timestamps.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={signs.length === 0}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/8 py-3 text-[14px] font-bold text-white transition-colors active:bg-white/14 disabled:opacity-40"
        >
          <Download className="h-4 w-4 text-neon-400" strokeWidth={2.4} />
          Download CSV
        </button>
      </section>
    </div>
  );
}
