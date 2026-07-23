// Per-year entry point. The actual app bootstrap lives in the shared
// common/ folder; this thin wrapper exists so the entry sits inside the Vite
// root (making `npm run dev` work), while the shared module is resolved via
// the @common alias in both dev and build.
import '@common/main.jsx';
