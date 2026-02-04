'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.INVENTORY_API_URL || 'http://localhost:8000';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

export async function serverFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = await getAuthToken();

  // Normalize endpoint to have trailing slash before query params
  const [path, query] = endpoint.split('?');
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;
  const normalizedEndpoint = query ? `${normalizedPath}?${query}` : normalizedPath;

  const url = `${API_URL}/api${normalizedEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { body, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.message || error.detail || 'Request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return { success: true } as T;
  }

  return response.json();
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  return serverFetch<T>(endpoint, { method: 'GET' });
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  return serverFetch<T>(endpoint, { method: 'POST', body });
}

export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  return serverFetch<T>(endpoint, { method: 'PATCH', body });
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return serverFetch<T>(endpoint, { method: 'DELETE' });
}
