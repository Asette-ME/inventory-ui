type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
  isFormData?: boolean;
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
    const { isFormData, ...restOptions } = options;

    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData - browser sets it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.headers) Object.assign(headers, options.headers);

    if (token) headers.Authorization = `Bearer ${token}`;

    const config = { ...restOptions, headers };

    // Normalize endpoint to prevent 308 redirects and use relative path /api
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const response = await fetch(`/api${normalizedEndpoint}`, config);

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return response;
  },

  async get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async postFormData(endpoint: string, formData: FormData, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  async put(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async patch(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async patchFormData(endpoint: string, formData: FormData, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: formData,
      isFormData: true,
    });
  },

  async delete(endpoint: string, options: FetchOptions = {}) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  },
};
