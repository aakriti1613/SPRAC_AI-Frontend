// One place for talking to the platform backend.
// Every request carries the login token; a 401 logs the user out everywhere.
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5174";

const TOKEN_KEY = "platform_token";
export const AUTH_EXPIRED_EVENT = "platform:auth-expired";

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getToken() {
  return storage()?.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  storage()?.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  storage()?.removeItem(TOKEN_KEY);
}

/** Read the expiry from the token (the server still checks the signature). */
export function tokenIsFresh(token = getToken()) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * fetch() against the backend with the token attached.
 * `path` is either "/api/..." or a full URL.
 */
export async function apiFetch(path, options = {}) {
  const url = /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`;
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && !url.endsWith("/api/auth/login")) {
    clearToken();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  return res;
}

export async function loginRequest(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) {
    return { success: false, error: data.error || `Login failed (${res.status})` };
  }
  return { success: true, token: data.token };
}
