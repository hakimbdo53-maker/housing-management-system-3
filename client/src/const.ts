import apiConfig from '@/lib/api';

// Re-export from centralized config for backward compatibility
export const OAUTH_SERVER_URL = apiConfig.oauthBaseURL;
export const API_URL = apiConfig.apiURL;
export const API_BASE_URL = apiConfig.apiURL; // Alias for backward compatibility

export const getLoginUrl = () => apiConfig.loginURL;
