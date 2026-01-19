export const OAUTH_SERVER_URL =
  import.meta.env.VITE_OAUTH_SERVER_URL || "http://localhost:3002";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

export const getLoginUrl = () => {
  const baseUrl = OAUTH_SERVER_URL || "http://localhost:3002";
  return new URL("/login", baseUrl).toString();
};
