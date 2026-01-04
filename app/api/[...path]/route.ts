import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.INVENTORY_API_URL || 'http://localhost:8000';

async function handler(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/^\/api/, '');
  const searchParams = request.nextUrl.search;
  const url = `${API_URL}/api${path}${searchParams}`;

  const isAuthAPI = path.includes('/auth');

  const headers = new Headers();

  // Forward Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) headers.set('Authorization', authHeader);

  // Forward Content-Type
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);

  const fetchOptions: RequestInit = { method: request.method, headers };

  // Google Auth specific handling
  if (isAuthAPI) {
    // Forward Cookies for state validation
    const cookie = request.headers.get('cookie');
    if (cookie) headers.set('Cookie', cookie);

    // Set Proxy Headers
    headers.set('X-Forwarded-Host', request.headers.get('host') || request.nextUrl.host);
    headers.set('X-Forwarded-Proto', request.nextUrl.protocol.replace(':', ''));

    // Handle redirects manually to prevent server-side following
    fetchOptions.redirect = 'manual';
  }

  // Forward body for non-GET requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchOptions.body = await request.text();
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.arrayBuffer();

    if (isAuthAPI) {
      // Complex header handling for Google Auth to preserve Set-Cookie and others
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') return;
        responseHeaders.append(key, value);
      });

      // Handle Set-Cookie separately
      const getSetCookie = (response.headers as any).getSetCookie;
      if (typeof getSetCookie === 'function') {
        const cookies = getSetCookie.call(response.headers);
        cookies.forEach((cookie: string) => responseHeaders.append('Set-Cookie', cookie));
      } else {
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) responseHeaders.append('Set-Cookie', setCookie);
      }

      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } else {
      // Simple response handling for standard APIs (Restores original behavior)
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ success: false, message: 'Failed to connect to API' }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
