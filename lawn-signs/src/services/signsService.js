/**
 * Sign data access.
 *
 * Two interchangeable backends:
 *
 *   cloud — every call goes to the API Gateway with the caller's Cognito ID
 *           token. Photos are uploaded straight to S3 with a short-lived
 *           presigned URL the API mints. No AWS credential exists in this
 *           bundle or in the browser.
 *
 *   demo  — everything lives in localStorage. Requires no AWS account at all,
 *           which is how the tracker is developed and demonstrated.
 */

import config, { isCloudConfigured } from '../config/appConfig';
import { getIdToken } from './authService';
import { INITIAL_MOCK_SIGNS } from './mockData';

const SIGNS_KEY = 'katr_lawn_signs_v1';
const MODE_KEY = 'katr_lawn_signs_mode_v1';

/* ── Storage mode ─────────────────────────────────────────────────────────── */

/** 'cloud' | 'demo'. Falls back to demo whenever the build has no AWS config. */
export function getStorageMode() {
  if (!isCloudConfigured) return 'demo';
  return localStorage.getItem(MODE_KEY) === 'demo' ? 'demo' : 'cloud';
}

export function setStorageMode(mode) {
  localStorage.setItem(MODE_KEY, mode === 'demo' ? 'demo' : 'cloud');
}

export const isDemoMode = () => getStorageMode() === 'demo';

/* ── Local storage backend ────────────────────────────────────────────────── */

export function getLocalSigns() {
  const stored = localStorage.getItem(SIGNS_KEY);
  if (!stored) {
    localStorage.setItem(SIGNS_KEY, JSON.stringify(INITIAL_MOCK_SIGNS));
    return INITIAL_MOCK_SIGNS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_MOCK_SIGNS;
  }
}

export function saveLocalSigns(signs) {
  localStorage.setItem(SIGNS_KEY, JSON.stringify(signs));
}

export function resetDemoData() {
  saveLocalSigns(INITIAL_MOCK_SIGNS);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/* ── API helper ───────────────────────────────────────────────────────────── */

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch(path, { method = 'GET', body } = {}) {
  const token = await getIdToken();
  if (!token) {
    throw new ApiError('Your session has expired — please sign in again.', 401);
  }

  const response = await fetch(`${config.apiEndpoint}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.error) detail = payload.error;
    } catch {
      // Non-JSON error body — keep the status-based message.
    }
    throw new ApiError(detail, response.status);
  }

  return response.status === 204 ? null : response.json();
}

/**
 * Normalise an API record into the shape the UI already renders.
 * The API returns a freshly signed `photoUrl`; the UI reads `s3Url`.
 */
function fromApi(sign) {
  return { ...sign, s3Url: sign.photoUrl ?? sign.s3Url ?? '' };
}

/* ── Public API ───────────────────────────────────────────────────────────── */

export async function fetchAllSigns() {
  if (isDemoMode()) return getLocalSigns();

  const { signs } = await apiFetch('/signs');
  return signs.map(fromApi);
}

/**
 * Record a newly placed sign.
 *
 * Cloud path is three steps: ask the API for a presigned PUT, upload the
 * bytes straight to S3, then write the record. The photo never passes through
 * Lambda, so a large image costs nothing in function time.
 */
export async function saveNewSignRecord({
  address,
  latitude,
  longitude,
  photoBlob,
  notes = '',
  placedBy = 'Volunteer'
}) {
  if (isDemoMode()) {
    const record = {
      id: `sign_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      eventId: config.eventId,
      address,
      latitude,
      longitude,
      s3Bucket: 'demo',
      s3Key: 'demo',
      s3Url: await blobToDataUrl(photoBlob),
      status: 'placed',
      placedAt: new Date().toISOString(),
      placedBy,
      collectedAt: null,
      notes
    };
    saveLocalSigns([record, ...getLocalSigns()]);
    return { success: true, record, mode: 'demo' };
  }

  const contentType = photoBlob.type || 'image/jpeg';

  const { signId, s3Key, uploadUrl } = await apiFetch('/signs/upload-url', {
    method: 'POST',
    body: { contentType }
  });

  const upload = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: photoBlob
  });
  if (!upload.ok) {
    throw new ApiError(`Photo upload failed (${upload.status})`, upload.status);
  }

  const { sign } = await apiFetch('/signs', {
    method: 'POST',
    body: { id: signId, s3Key, address, latitude, longitude, notes }
  });

  return { success: true, record: fromApi(sign), mode: 'cloud' };
}

/** Move a sign between placed / collected / missing. Returns the full list. */
export async function updateSignStatus(signId, newStatus, notes = null) {
  if (isDemoMode()) {
    const resolvedAt =
      newStatus === 'collected' || newStatus === 'missing'
        ? new Date().toISOString()
        : null;

    const updated = getLocalSigns().map((sign) =>
      sign.id === signId
        ? {
            ...sign,
            status: newStatus,
            collectedAt: resolvedAt,
            ...(notes !== null ? { notes } : {})
          }
        : sign
    );
    saveLocalSigns(updated);
    return updated;
  }

  await apiFetch(`/signs/${encodeURIComponent(signId)}`, {
    method: 'PATCH',
    body: { status: newStatus, ...(notes !== null ? { notes } : {}) }
  });

  // Re-read so every client converges on the server's view.
  return fetchAllSigns();
}

export { ApiError };
