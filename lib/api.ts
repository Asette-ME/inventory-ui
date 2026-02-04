type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

/**
 * Normalize endpoint to ensure trailing slash before query params
 * This prevents 308 redirects from FastAPI's redirect_slashes behavior
 */
function normalizeEndpoint(endpoint: string): string {
  // Split path and query string
  const [path, query] = endpoint.split('?');

  // Ensure path ends with trailing slash (FastAPI routes expect this)
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;

  // Reconstruct with query string if present
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

export const api = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (options.headers) Object.assign(headers, options.headers);

    if (token) headers.Authorization = `Bearer ${token}`;

    const config = { ...options, headers };

    // Normalize endpoint to prevent 308 redirects and use relative path /api
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const response = await fetch(`/api${normalizedEndpoint}`, config);

    if (response.status === 401) {
      // TODO: Handle token refresh or logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return response;
  },

  async get(endpoint: string, options: FetchOptions = {}) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint: string, options: FetchOptions = {}) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  },
};
