/**
 * Runtime configuration.
 *
 * Every value is a *public* identifier — API URL, Cognito pool/client id,
 * hosted-UI domain. No secret is ever built into this bundle. Authentication
 * happens against Cognito, and the API is reached with the resulting JWT.
 *
 * Populate these from `tofu output` at build time (see .env.example).
 */

const env = import.meta.env;

export const config = {
  apiEndpoint: env.VITE_API_ENDPOINT ?? '',
  cognito: {
    userPoolId: env.VITE_COGNITO_USER_POOL_ID ?? '',
    userPoolClientId: env.VITE_COGNITO_CLIENT_ID ?? '',
    domain: env.VITE_COGNITO_DOMAIN ?? ''
  },
  eventId: env.VITE_EVENT_ID ?? 'katr-2026'
};

/**
 * True when the build has everything needed to talk to AWS.
 *
 * When false the app runs entirely on localStorage demo data — which is the
 * supported way to develop and to demo the tracker with no AWS account at all.
 */
export const isCloudConfigured = Boolean(
  config.apiEndpoint &&
    config.cognito.userPoolId &&
    config.cognito.userPoolClientId &&
    config.cognito.domain
);

/** Where Cognito sends the browser back after hosted-UI sign-in. */
export function redirectUri() {
  // Must exactly match a callback URL registered on the app client, including
  // the trailing slash and the /lawn-signs/ base path.
  return `${window.location.origin}${import.meta.env.BASE_URL}`;
}

export default config;
