// middleware.ts
// Handles locale routing via next-intl and blocks /dev/* in production.

import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block /dev/* and /api/dev/* in non-development environments
  if (process.env.NODE_ENV !== "development") {
    if (pathname.startsWith("/dev/") || pathname.startsWith("/api/dev/")) {
      return new NextResponse(null, { status: 404 });
    }
    // Also block locale-prefixed /en/dev paths etc.
    const devPathMatch = /^\/(?:en|hi|mr)\/dev/.test(pathname);
    if (devPathMatch) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all paths except static files and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt)).*)",
  ],
};
