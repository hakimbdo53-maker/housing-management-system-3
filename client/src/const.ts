export const OAUTH_SERVER_URL = import.meta.env.VITE_OAUTH_SERVER_URL;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getLoginUrl = () => {
  if (!OAUTH_SERVER_URL) {
    throw new Error("VITE_OAUTH_SERVER_URL environment variable is not set");
  }
  return new URL("/login", OAUTH_SERVER_URL).toString();
};
