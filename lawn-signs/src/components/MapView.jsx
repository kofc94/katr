import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, MapPin, CheckCircle2, Loader2, Crosshair } from 'lucide-react';
import SwipeButton from './SwipeButton';
import {
  decorateSigns,
  directionsUrl,
  estimateMinutes,
  formatDistance
} from '../utils/signUtils';

const STATUS_PIN = {
  placed: { cls: 'pin-placed', glyph: '' },
  collected: { cls: 'pin-collected', glyph: '✓' },
  missing: { cls: 'pin-missing', glyph: '!' }
};

function buildPinIcon(status, isTarget) {
  const { cls, glyph } = STATUS_PIN[status] || STATUS_PIN.placed;
  return L.divIcon({
    className: '',
    html: `<div class="pin ${cls} ${isTarget ? 'pin-target' : ''}"><span>${glyph}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
}

export default function MapView({
  signs,
  userLocation,
  isLocating,
  onRefreshLocation,
  onSelectSign,
  onStatusChange,
  updatingId
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const routeRef = useRef(null);
  const userMarkerRef = useRef(null);
  const hasFitRef = useRef(false);

  const [collectedFlash, setCollectedFlash] = useState(false);

  const remaining = useMemo(
    () =>
      decorateSigns(signs, userLocation, { sortBy: 'nearest' }).filter(
        (s) => s.status === 'placed'
      ),
    [signs, userLocation]
  );
  const target = remaining[0] || null;

  /* ---- Init map once ---- */
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40.68, -74.34],
      zoom: 13,
      zoomControl: false,
      attributionControl: true
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 20, attribution: '&copy; OpenStreetMap &copy; CARTO' }
    ).addTo(map);

    routeRef.current = L.polyline([], {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.85,
      lineJoin: 'round'
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      routeRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  /* ---- Markers + pickup route ---- */
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = [];

    signs.forEach((sign) => {
      if (!sign.latitude || !sign.longitude) return;
      const latLng = [sign.latitude, sign.longitude];
      bounds.push(latLng);

      L.marker(latLng, {
        icon: buildPinIcon(sign.status, target && sign.id === target.id)
      })
        .addTo(layer)
        .on('click', () => onSelectSign?.(sign));
    });

    // Route threads the remaining pickups in nearest-first order.
    const routeCoords = [];
    if (userLocation) routeCoords.push([userLocation.latitude, userLocation.longitude]);
    remaining.forEach((s) => {
      if (s.latitude && s.longitude) routeCoords.push([s.latitude, s.longitude]);
    });
    routeRef.current?.setLatLngs(routeCoords);

    // Fit to the signs once, then leave the viewport under the user's control.
    // Asymmetric padding keeps pins clear of the header and the pickup sheet.
    if (!hasFitRef.current && bounds.length > 0) {
      map.fitBounds(bounds, {
        paddingTopLeft: [40, 150],
        paddingBottomRight: [40, 320],
        maxZoom: 15
      });
      hasFitRef.current = true;
    }
  }, [signs, remaining, target, userLocation, onSelectSign]);

  /* ---- User puck ---- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const latLng = [userLocation.latitude, userLocation.longitude];
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latLng);
    } else {
      userMarkerRef.current = L.marker(latLng, {
        icon: L.divIcon({
          className: '',
          html: '<div class="user-puck"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        }),
        zIndexOffset: 1000,
        interactive: false
      }).addTo(map);
    }
  }, [userLocation]);

  const recenter = async () => {
    const loc = await onRefreshLocation();
    if (loc && mapRef.current) {
      mapRef.current.flyTo([loc.latitude, loc.longitude], 15, { duration: 0.8 });
    }
  };

  const handleSwipeCollect = async () => {
    if (!target) return;
    await onStatusChange(target.id, 'collected');
    setCollectedFlash(true);
    setTimeout(() => setCollectedFlash(false), 900);
  };

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top scrim keeps the header legible over bright tiles */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-ink-950/85 to-transparent" />

      {/* Recenter */}
      <button
        onClick={recenter}
        aria-label="Recenter on my location"
        className="glass-deep absolute top-28 right-4 z-500 flex h-11 w-11 items-center justify-center rounded-full text-neon-400"
      >
        {isLocating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Crosshair className="h-5 w-5" strokeWidth={2.2} />
        )}
      </button>

      {/* Legend — a single horizontal pill so it covers as few pins as possible */}
      <div className="glass-deep absolute top-28 left-4 z-500 flex items-center gap-3 rounded-full px-3.5 py-2">
        {[
          ['bg-neon-500', 'Placed'],
          ['bg-aqua-500', 'Collected'],
          ['bg-flare-500', 'Missing']
        ].map(([dot, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <span className="text-[11px] font-semibold text-white/70">{label}</span>
          </div>
        ))}
      </div>

      {/* ---- Next pickup sheet ---- */}
      <div className="absolute inset-x-0 bottom-0 z-500 px-3 pb-[calc(6.25rem+env(safe-area-inset-bottom))]">
        <div className="glass-deep animate-sheet-up mx-auto max-w-md rounded-4xl p-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

          {target ? (
            <>
              <div className="flex items-start gap-3">
                <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-ink-900">
                  {target.s3Url && (
                    <img
                      src={target.s3Url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-neon-400">Next Pickup Target</p>
                  <h3 className="mt-1 line-clamp-2 text-[17px] leading-tight font-extrabold text-white">
                    {target.address}
                  </h3>
                  {formatDistance(target.distanceMiles) && (
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-white/55 tabular-nums">
                      <MapPin className="h-3.5 w-3.5 text-neon-400" />
                      {formatDistance(target.distanceMiles)}
                      <span className="text-white/25">•</span>
                      {estimateMinutes(target.distanceMiles)} min
                    </p>
                  )}
                </div>

                <a
                  href={directionsUrl(target.latitude, target.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[68px] w-[76px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-linear-to-br from-aqua-400 to-azure-600 text-white shadow-lg shadow-azure-500/30 transition-transform active:scale-95"
                >
                  <Navigation className="h-5 w-5" strokeWidth={2.6} />
                  <span className="text-[11px] leading-tight font-extrabold">
                    Start
                  </span>
                  <span className="text-[9px] leading-none font-bold opacity-80">
                    NAVIGATION
                  </span>
                </a>
              </div>

              <div className="mt-3.5">
                <SwipeButton
                  onSwipeComplete={handleSwipeCollect}
                  isBusy={updatingId === target.id}
                  isCompleted={collectedFlash}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-9 w-9 text-neon-400" />
              <h3 className="text-lg font-extrabold text-white">
                All signs collected
              </h3>
              <p className="text-sm text-white/50">
                Nothing left on the pickup route. Nice work.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
