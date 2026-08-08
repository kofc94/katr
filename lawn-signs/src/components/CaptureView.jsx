import React, { useEffect, useRef, useState } from 'react';
import {
  Aperture,
  MapPin,
  Pencil,
  RotateCcw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCurrentLocation, reverseGeocode } from '../services/geocodingService';
import { saveNewSignRecord } from '../services/signsService';
import { compressImage } from '../utils/imageCompressor';

/** Green L-brackets that frame the viewfinder (mockup 1). */
function ViewfinderBrackets() {
  const base =
    'pointer-events-none absolute h-9 w-9 border-neon-400 drop-shadow-[0_0_8px_rgba(34,224,122,0.8)]';
  return (
    <>
      <div className={`${base} top-4 left-4 rounded-tl-2xl border-t-[3px] border-l-[3px]`} />
      <div className={`${base} top-4 right-4 rounded-tr-2xl border-t-[3px] border-r-[3px]`} />
      <div className={`${base} bottom-4 left-4 rounded-bl-2xl border-b-[3px] border-l-[3px]`} />
      <div className={`${base} right-4 bottom-4 rounded-br-2xl border-r-[3px] border-b-[3px]`} />
    </>
  );
}

export default function CaptureView({ onSignCaptured }) {
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const acquireLocation = async () => {
    setIsLocating(true);
    setError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      setAddress(await reverseGeocode(loc.latitude, loc.longitude));
    } catch (err) {
      setError(
        `${err.message || 'Could not get GPS.'} You can type the address in manually.`
      );
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    acquireLocation();
    // Release the last preview blob when the screen unmounts.
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setError(null);
    try {
      let blob;
      try {
        blob = await compressImage(file);
      } catch {
        blob = file; // Compression is an optimisation, not a requirement.
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(blob);
      setPhotoBlob(blob);
      setPhotoPreview(objectUrlRef.current);
    } finally {
      setIsCompressing(false);
      e.target.value = ''; // Allow re-selecting the same file.
    }
  };

  const handleSubmit = async () => {
    if (!photoBlob) {
      setError('Take a photo of the sign first.');
      return;
    }
    if (!address.trim()) {
      setError('Enter an address for this sign.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const result = await saveNewSignRecord({
        address: address.trim(),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        photoBlob,
        notes: note.trim()
      });

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.7 },
        colors: ['#22e07a', '#38dcf5', '#4ef08a']
      });
      setSaved(true);

      setTimeout(() => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setPhotoBlob(null);
        setPhotoPreview(null);
        setNote('');
        setSaved(false);
        onSignCaptured?.(result.record);
      }, 1100);
    } catch (err) {
      setError(err.message || 'Could not save this sign.');
    } finally {
      setIsSaving(false);
    }
  };

  const openCamera = () => fileInputRef.current?.click();

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-32">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ---- Viewfinder ---- */}
      <div className="relative aspect-4/3 overflow-hidden rounded-5xl border border-white/10 bg-ink-900">
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Captured lawn sign"
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            onClick={openCamera}
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-b from-ink-850 to-ink-950"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neon-500/40 bg-neon-500/12">
              <Camera className="h-7 w-7 text-neon-400" strokeWidth={2.2} />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-white">Tap to open camera</p>
              <p className="mt-1 text-xs text-white/45">
                Point at the sign — GPS is logged automatically
              </p>
            </div>
          </button>
        )}

        <ViewfinderBrackets />

        {/* Glowing GPS drop-pin — only over a real photo, where it reads as
            "this spot is tagged" rather than colliding with the empty state */}
        {photoPreview && (
          <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-halo rounded-full bg-neon-500/25 blur-md" />
              <MapPin
                className="relative h-11 w-11 text-neon-400 drop-shadow-[0_0_14px_rgba(34,224,122,0.9)]"
                strokeWidth={2.2}
              />
            </div>
          </div>
        )}

        {/* Resolved-address chip — inset past the corner brackets so the two
            never overlap, matching the mockup's centred pill */}
        <div className="absolute inset-x-16 bottom-5 flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-black/60 px-3 py-2.5 backdrop-blur-md">
          <MapPin className="h-4 w-4 shrink-0 text-neon-400" strokeWidth={2.5} />
          <span className="truncate text-[13px] font-semibold text-white">
            {isLocating ? 'Locating…' : address || 'No location yet'}
          </span>
        </div>

        {photoPreview && (
          <button
            onClick={openCamera}
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-md"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retake
          </button>
        )}

        {isCompressing && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
            <Loader2 className="h-7 w-7 animate-spin text-neon-400" />
          </div>
        )}
      </div>

      {/* ---- Editable address ---- */}
      <div className="glass rounded-3xl px-4 py-3">
        <div className="flex items-center justify-between">
          <label htmlFor="sign-address" className="eyebrow text-white/45">
            Editable Address
          </label>
          <button
            onClick={acquireLocation}
            className="eyebrow flex items-center gap-1 text-neon-400"
          >
            {isLocating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            Refresh GPS
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <input
            id="sign-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
            className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-white placeholder:text-white/30 focus:outline-none"
          />
          <Pencil className="h-4 w-4 shrink-0 text-white/35" />
        </div>
      </div>

      {/* ---- Shutter ---- */}
      <div className="flex items-center justify-center gap-5 py-2">
        <button
          onClick={openCamera}
          aria-label="Take photo"
          className="relative flex h-24 w-24 items-center justify-center"
        >
          <span className="absolute inset-0 animate-halo rounded-full border-2 border-neon-500/60" />
          <span className="glow-neon absolute inset-2 rounded-full border-[3px] border-neon-400" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-ink-800 to-ink-950 ring-1 ring-neon-500/50">
            <Aperture className="h-8 w-8 text-neon-400" strokeWidth={2} />
          </span>
        </button>

        <span className="eyebrow text-glow-neon text-[15px] tracking-[0.12em] text-neon-400">
          Snap &amp; Save
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-flare-500/30 bg-flare-500/10 px-3.5 py-3 text-[13px] font-medium text-flare-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ---- Event + submit ---- */}
      <div className="flex items-stretch gap-3">
        <div className="glass min-w-0 flex-1 rounded-3xl px-4 py-2.5">
          <label htmlFor="sign-note" className="eyebrow block text-white/45">
            Note (optional)
          </label>
          <input
            id="sign-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. by the mailbox"
            maxLength={200}
            className="mt-1 w-full truncate bg-transparent text-[15px] font-semibold text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving || saved}
          className="glow-neon flex shrink-0 items-center justify-center gap-2 rounded-3xl bg-linear-to-br from-neon-400 to-neon-600 px-7 text-[15px] font-extrabold text-ink-950 transition-transform active:scale-[0.97] disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.6} />
          ) : null}
          {saved ? 'Saved' : isSaving ? 'Saving' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
