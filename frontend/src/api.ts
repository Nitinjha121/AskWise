/**
 * Talks to the backend. Requests go to same-origin /api, which Vite proxies to
 * the backend in development (see vite.config.ts), so no CORS is needed.
 */

// Kept in memory only (not localStorage), so it's never persisted to disk.
let token: string | null = null;

/** POSTs to the API, turning a network failure into a readable error. */
async function post(url: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(url, { method: "POST", ...init });
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }
}

/** Gets a test token from the dev-only endpoint (stands in for a real login). */
async function getToken(): Promise<string> {
  if (token) return token;

  const res = await post("/api/auth/token");
  if (!res.ok) throw new Error("Could not get an access token.");

  token = ((await res.json()) as { token: string }).token;
  return token;
}

export async function askQuery(query: string): Promise<string> {
  const res = await post("/api/query", {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` },
    body: JSON.stringify({ query })
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // The token may have expired: drop it so the next attempt fetches a new one.
    if (res.status === 401) token = null;
    throw new Error(data?.error?.message ?? `Request failed (HTTP ${res.status}).`);
  }

  return (data as { answer: string }).answer;
}
