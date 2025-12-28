import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.INVENTORY_API_URL || 'http://localhost:8000';

async function handler(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/^\/api/, '');
  const searchParams = request.nextUrl.search;
  const url = `${API_URL}/api${path}${searchParams}`;

  const headers = new Headers();

  // Forward relevant headers
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward body for non-GET requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchOptions.body = await request.text();
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
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
