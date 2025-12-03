type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export const api = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
      "Content-Type": "application/json",
      Authorization: "",
      ...options.headers,
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const config = { ...options, headers };

    // Use relative path /api to trigger Next.js rewrites
    const response = await fetch(`/api${endpoint}`, config);

    if (response.status === 401) {
      // TODO: Handle token refresh or logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    return response;
  },

  async get(endpoint: string, options: FetchOptions = {}) {
    return this.fetch(endpoint, { ...options, method: "GET" });
  },

  async post(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async put(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint: string, options: FetchOptions = {}) {
    return this.fetch(endpoint, { ...options, method: "DELETE" });
  },
};
