const DEFAULT_PROD_API_URL = "https://gen-ai-placement-management-syste.onrender.com/api";
const DEFAULT_DEV_API_URL = "https://gen-ai-placement-management-syste.onrender.com/api";

const normalizeUrl = (url) => (url || "").trim().replace(/\/+$/, "");
const isLocalhostUrl = (url) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);

const rawApiUrl = normalizeUrl(import.meta.env.VITE_API_URL);
const safeApiUrl =
  rawApiUrl && !(import.meta.env.PROD && isLocalhostUrl(rawApiUrl))
    ? rawApiUrl
    : import.meta.env.PROD
      ? DEFAULT_PROD_API_URL
      : DEFAULT_DEV_API_URL;

const rawBackendUrl = normalizeUrl(import.meta.env.VITE_BACKEND_URL);
const derivedBackendUrl = safeApiUrl.replace(/\/api\/?$/, "");

export const API_BASE_URL = safeApiUrl;
export const BACKEND_BASE_URL =
  rawBackendUrl
    ? rawBackendUrl
    : derivedBackendUrl;
