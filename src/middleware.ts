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

  // Check if the request is on a subdomain of our app domain
  // e.g., socialvault.nomistakes.app → subdomain = "socialvault"
  if (host !== appDomain && host.endsWith(`.${appDomain}`)) {
    const subdomain = host.replace(`.${appDomain}`, "");

    // Skip www
    if (subdomain === "www") {
      return NextResponse.next();
    }

    // Rewrite to the internal /site/[slug] route
    const url = request.nextUrl.clone();
    url.pathname = `/site/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Check if request is on a completely different custom domain
  // (i.e. not a subdomain of appDomain and not the appDomain itself)
  if (host !== appDomain && !host.endsWith(`.${appDomain}`)) {
    // This is a custom domain — look up the slug via a header rewrite
    // The slug will be resolved by the /site/[slug] route from the domain
    const url = request.nextUrl.clone();
    url.pathname = `/site/_domain${pathname === "/" ? "" : pathname}`;
    url.searchParams.set("_host", host);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
