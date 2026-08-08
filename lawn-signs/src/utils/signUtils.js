import { calculateDistanceMiles } from '../services/geocodingService';

/** Within this many miles a sign counts as "in range" for on-site editing. */
export const PROXIMITY_THRESHOLD_MILES = 0.15;

/**
 * Attach distance-from-user to each sign and order the list.
 * Signs with no fix sort last rather than jumping to the top as `null`.
 */
export function decorateSigns(signs, userLocation, { sortBy = 'nearest', search = '' } = {}) {
  const needle = search.trim().toLowerCase();

  return signs
    .filter((sign) => {
      if (!needle) return true;
      return (
        (sign.address || '').toLowerCase().includes(needle) ||
        (sign.notes || '').toLowerCase().includes(needle)
      );
    })
    .map((sign) => {
      const distanceMiles =
        userLocation && sign.latitude && sign.longitude
          ? calculateDistanceMiles(
              userLocation.latitude,
              userLocation.longitude,
              sign.latitude,
              sign.longitude
            )
          : null;

      return {
        ...sign,
        distanceMiles,
        isCloseEnough:
          distanceMiles !== null && distanceMiles <= PROXIMITY_THRESHOLD_MILES
      };
    })
    .sort((a, b) => {
      if (sortBy === 'nearest') {
        if (a.distanceMiles === null && b.distanceMiles === null) {
          return new Date(b.placedAt) - new Date(a.placedAt);
        }
        if (a.distanceMiles === null) return 1;
        if (b.distanceMiles === null) return -1;
        return a.distanceMiles - b.distanceMiles;
      }
      return new Date(b.placedAt) - new Date(a.placedAt);
    });
}

/**
 * Distance label. Haversine rounds to 0.1 mi, so anything closer than that
 * would otherwise render as a confusing "0 mi away" while you stand next to it.
 */
export function formatDistance(miles) {
  if (miles === null || miles === undefined) return null;
  if (miles < 0.1) return 'Right here';
  return `${miles.toFixed(1)} mi away`;
}

/** Rough drive time, used for the map's next-target card. */
export function estimateMinutes(miles) {
  if (miles === null || miles === undefined) return null;
  return Math.max(1, Math.round(miles * 3));
}

/** "2h ago" / "3d ago" — compact relative time for feed rows. */
export function relativeTime(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function countByStatus(signs) {
  return {
    total: signs.length,
    placed: signs.filter((s) => s.status === 'placed').length,
    collected: signs.filter((s) => s.status === 'collected').length,
    missing: signs.filter((s) => s.status === 'missing').length
  };
}

/** Native maps handoff — Apple Maps on iOS, Google Maps everywhere else. */
export function directionsUrl(latitude, longitude) {
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  return isApple
    ? `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
