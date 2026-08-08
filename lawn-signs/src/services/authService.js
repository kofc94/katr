/**
 * Cognito authentication, wrapped so the rest of the app never imports Amplify.
 *
 * Supports both paths a volunteer might take:
 *   - "Continue with Google" via the Cognito hosted UI (OAuth code + PKCE)
 *   - Email + the temporary password from their invitation, with self-service
 *     reset for anyone whose address isn't a Google account.
 */

import { Amplify } from 'aws-amplify';
import {
  confirmResetPassword,
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
  resetPassword,
  signIn as amplifySignIn,
  signInWithRedirect,
  signOut as amplifySignOut
} from 'aws-amplify/auth';

import config, { isCloudConfigured, redirectUri } from '../config/appConfig';

let configured = false;

/** Amplify is only wired up when the build actually points at a user pool. */
export function initAuth() {
  if (configured || !isCloudConfigured) return;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.cognito.userPoolId,
        userPoolClientId: config.cognito.userPoolClientId,
        loginWith: {
          oauth: {
            domain: config.cognito.domain,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [redirectUri()],
            redirectSignOut: [redirectUri()],
            responseType: 'code'
          }
        }
      }
    }
  });

  configured = true;
}

/** Kick off the hosted-UI round trip to Google. */
export async function signInWithGoogle() {
  initAuth();
  await signInWithRedirect({ provider: 'Google' });
}

/**
 * Email + password sign-in.
 *
 * Cognito answers an invitation's temporary password with a
 * NEW_PASSWORD_REQUIRED challenge; the caller surfaces that as a
 * "choose a password" step rather than an error.
 */
export async function signInWithPassword(email, password) {
  initAuth();
  const { isSignedIn, nextStep } = await amplifySignIn({
    username: email.trim().toLowerCase(),
    password
  });

  return { isSignedIn, nextStep: nextStep?.signInStep ?? null };
}

/** Complete the NEW_PASSWORD_REQUIRED challenge for an invited user. */
export async function completeNewPassword(newPassword) {
  const { isSignedIn, nextStep } = await confirmSignIn({
    challengeResponse: newPassword
  });
  return { isSignedIn, nextStep: nextStep?.signInStep ?? null };
}

/** Send a reset code to the address on file. */
export async function requestPasswordReset(email) {
  initAuth();
  await resetPassword({ username: email.trim().toLowerCase() });
}

/** Finish the reset with the emailed code. */
export async function confirmPasswordReset(email, code, newPassword) {
  await confirmResetPassword({
    username: email.trim().toLowerCase(),
    confirmationCode: code.trim(),
    newPassword
  });
}

export async function signOut() {
  initAuth();
  await amplifySignOut();
}

/** Current user, or null when nobody is signed in. */
export async function getCurrentUser() {
  if (!isCloudConfigured) return null;
  initAuth();

  try {
    await amplifyGetCurrentUser();
    const session = await fetchAuthSession();
    const claims = session.tokens?.idToken?.payload ?? {};

    return {
      sub: claims.sub,
      email: claims.email ?? null,
      name: claims.name ?? claims['cognito:username'] ?? null,
      groups: claims['cognito:groups'] ?? [],
      isAdmin: (claims['cognito:groups'] ?? []).includes('admin')
    };
  } catch {
    return null;
  }
}

/**
 * ID token for API calls. Amplify refreshes it automatically when the cached
 * one is close to expiry, so this is safe to call before every request.
 */
export async function getIdToken() {
  if (!isCloudConfigured) return null;
  initAuth();

  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
