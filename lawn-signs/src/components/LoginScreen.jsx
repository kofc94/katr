import React, { useState } from 'react';
import {
  Signpost,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  HardDrive,
  Mail
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { isCloudConfigured } from '../config/appConfig';
import {
  completeNewPassword,
  confirmPasswordReset,
  requestPasswordReset,
  signInWithGoogle,
  signInWithPassword
} from '../services/authService';

/** Google's mark, inlined so the sign-in button needs no network fetch. */
function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.0 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 34.9 44 30 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="eyebrow text-white/45">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-2xl border border-white/10 bg-black/30 px-3.5 py-3 text-[15px] font-medium text-white placeholder:text-white/25 focus:border-neon-500/50 focus:outline-none"
      />
    </label>
  );
}

/** Sign-in gate. Steps: credentials → (new password | reset) → done. */
export default function LoginScreen() {
  const { switchMode, refresh } = useAuth();

  const [step, setStep] = useState('signin'); // signin | newPassword | reset | resetConfirm
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = () => run(() => signInWithGoogle());

  const handlePasswordSignIn = (e) => {
    e.preventDefault();
    return run(async () => {
      const { isSignedIn, nextStep } = await signInWithPassword(email, password);
      if (isSignedIn) return refresh();
      if (nextStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setNotice('Choose a password to finish setting up your account.');
        setStep('newPassword');
        return;
      }
      setError(`Additional verification required (${nextStep}).`);
    });
  };

  const handleNewPassword = (e) => {
    e.preventDefault();
    return run(async () => {
      const { isSignedIn } = await completeNewPassword(newPassword);
      if (isSignedIn) await refresh();
    });
  };

  const handleRequestReset = (e) => {
    e.preventDefault();
    return run(async () => {
      await requestPasswordReset(email);
      setNotice(`We emailed a reset code to ${email}.`);
      setStep('resetConfirm');
    });
  };

  const handleConfirmReset = (e) => {
    e.preventDefault();
    return run(async () => {
      await confirmPasswordReset(email, code, newPassword);
      setNotice('Password updated — sign in with it below.');
      setPassword('');
      setStep('signin');
    });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="glow-neon flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-neon-400 to-neon-600">
            <Signpost className="h-8 w-8 text-ink-950" strokeWidth={2.4} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
            Lawn Sign Tracker
          </h1>
          <p className="mt-1 text-sm text-white/45">K'night at the Races</p>
        </div>

        <div className="glass space-y-4 rounded-4xl p-5">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-flare-500/30 bg-flare-500/10 px-3.5 py-3 text-[13px] font-medium text-flare-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {notice && !error && (
            <div className="flex items-start gap-2 rounded-2xl border border-neon-500/30 bg-neon-500/10 px-3.5 py-3 text-[13px] font-medium text-neon-400">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {!isCloudConfigured && (
            <p className="text-[13px] leading-relaxed text-white/50">
              This build has no AWS configuration, so sign-in is unavailable.
              You can still explore the tracker with demo data.
            </p>
          )}

          {/* ── Sign in ── */}
          {step === 'signin' && isCloudConfigured && (
            <>
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-3.5 text-[15px] font-bold text-ink-950 transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                <GoogleMark />
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="eyebrow text-white/30">or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handlePasswordSignIn} className="space-y-3">
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-neon-400 to-neon-600 py-3.5 text-[15px] font-extrabold text-ink-950 transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign in
                </button>
              </form>

              <button
                onClick={() => {
                  setStep('reset');
                  setNotice(null);
                  setError(null);
                }}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-white/50"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Forgot your password?
              </button>
            </>
          )}

          {/* ── First sign-in: set a password ── */}
          {step === 'newPassword' && (
            <form onSubmit={handleNewPassword} className="space-y-3">
              <Field
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
              <p className="text-[12px] leading-relaxed text-white/40">
                Needs upper and lower case, a number, and a symbol.
              </p>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-neon-400 to-neon-600 py-3.5 text-[15px] font-extrabold text-ink-950 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Set password &amp; continue
              </button>
            </form>
          )}

          {/* ── Reset: request a code ── */}
          {step === 'reset' && (
            <form onSubmit={handleRequestReset} className="space-y-3">
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-neon-400 to-neon-600 py-3.5 text-[15px] font-extrabold text-ink-950 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Email me a reset code
              </button>
              <button
                type="button"
                onClick={() => setStep('signin')}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-white/50"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
            </form>
          )}

          {/* ── Reset: confirm ── */}
          {step === 'resetConfirm' && (
            <form onSubmit={handleConfirmReset} className="space-y-3">
              <Field
                label="Reset code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
              />
              <Field
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-neon-400 to-neon-600 py-3.5 text-[15px] font-extrabold text-ink-950 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </button>
              <button
                type="button"
                onClick={() => setStep('signin')}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-white/50"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
            </form>
          )}
        </div>

        <button
          onClick={() => switchMode('demo')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/6 py-3 text-[13px] font-bold text-white/55 transition-colors active:bg-white/12"
        >
          <HardDrive className="h-4 w-4" />
          Explore with demo data
        </button>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-white/30">
          Access is limited to volunteers on the event roster. Ask an organizer
          if you need an account.
        </p>
      </div>
    </div>
  );
}
