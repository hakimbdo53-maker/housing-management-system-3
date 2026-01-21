/**
 * Centralized API Configuration
 * All API endpoints and base URLs configured here
 */

// Environment variables with fallback values
const API_URL = import.meta.env.VITE_API_URL || 'http://housingms.runasp.net/api';
const OAUTH_SERVER_URL = import.meta.env.VITE_OAUTH_SERVER_URL || 'http://housingms.runasp.net';

/**
 * API Configuration Object
 * Centralized source of truth for all API endpoints
 */
export const apiConfig = {
  // API URL (includes /api base path)
  apiURL: API_URL,
  oauthBaseURL: OAUTH_SERVER_URL,

  // tRPC Endpoint (API_URL already includes /api)
  trpcURL: `${API_URL}/trpc`,

  // OAuth & Auth URLs
  loginURL: new URL('/login', OAUTH_SERVER_URL).toString(),
  signupURL: new URL('/signup', OAUTH_SERVER_URL).toString(),
  logoutURL: new URL('/logout', OAUTH_SERVER_URL).toString(),

  // Validation
  validate() {
    if (!API_URL) {
      console.warn('⚠️ VITE_API_URL not set, using default:', API_URL);
    }
    if (!OAUTH_SERVER_URL) {
      console.warn('⚠️ VITE_OAUTH_SERVER_URL not set, using default:', OAUTH_SERVER_URL);
    }
  },
} as const;

// Validate on module load
apiConfig.validate();

export default apiConfig;
