// Thin fetch wrapper. Attaches the token, surfaces the server's own error
// message rather than a generic one, and flags expired sessions so the app can
// send the user back to the login page.

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

let token: string | null = null;

interface RequestOptions {
  method?: string;
  body?: any;
  signal?: AbortSignal;
}

async function request(path: string, { method = 'GET', body, signal }: RequestOptions = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    // Network-level failure: backend is not running or unreachable
    const err: any = new Error('Cannot reach the SkyBridge server.');
    err.code = 'NETWORK';
    throw err;
  }

  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // If a static host like Vercel returns index.html for missing /api endpoints
    const text = await response.text().catch(() => '');
    if (text.trim().startsWith('<') || response.status === 404) {
      const err: any = new Error(
        response.status === 404
          ? 'SkyBridge backend route not found (404).'
          : 'SkyBridge backend unavailable (received HTML from static host).'
      );
      err.status = response.status;
      err.code = 'SERVER_UNAVAILABLE';
      err.isServerUnavailable = true;
      throw err;
    }
  }

  if (!response.ok) {
    const err: any = new Error(data?.error || `Request failed (${response.status})`);
    err.status = response.status;
    err.code = data?.code || (response.status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED');
    err.isServerUnavailable = response.status >= 502;
    throw err;
  }
  return data;
}

export const api = {
  setToken: (value: string | null) => {
    token = value;
  },
  getToken: () => token,
  get: (path: string, opts?: RequestOptions) => request(path, { ...opts, method: 'GET' }),
  post: (path: string, body?: any, opts?: RequestOptions) => request(path, { ...opts, method: 'POST', body }),
  patch: (path: string, body?: any, opts?: RequestOptions) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path: string, opts?: RequestOptions) => request(path, { ...opts, method: 'DELETE' }),
};

export default api;
