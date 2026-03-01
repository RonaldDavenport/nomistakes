import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Main app domain — set NEXT_PUBLIC_APP_DOMAIN in env for production
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "";

  // Skip middleware for API routes, static files, Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If no app domain configured or we're on localhost, skip subdomain logic
  if (!appDomain || host.startsWith("localhost") || host.startsWith("127.")) {
    return NextResponse.next();
  }

  // Subdomains and custom domains are handled by separate Vercel deployments.
  // No rewriting needed — just pass through.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
