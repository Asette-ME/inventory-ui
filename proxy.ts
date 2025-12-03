import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Only run on /api routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers);

    // Set the X-Forwarded-Host header to the frontend host (e.g., localhost:3000)
    requestHeaders.set("X-Forwarded-Host", request.headers.get("host") || "");
    requestHeaders.set(
      "X-Forwarded-Proto",
      request.nextUrl.protocol.replace(":", "")
    );

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
