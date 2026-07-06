// API base URL. Overridable per-build via EXPO_PUBLIC_API_URL (see eas.json);
// defaults to the production deployment.
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://shipping-savior.vercel.app'
).replace(/\/+$/, '');
