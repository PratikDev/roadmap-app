import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/api/auth"];
const AUTH_ROUTES_EXCEPTIONS = ["/sign-out", "/get-session"]; // these are not technically auth routes, but still hits `/api/auth`

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const isAuthRoute = () => {
    // If the route ends with an exception, it's not an auth route
    // This allows us to handle sign-out and get-session without redirecting
    if (
      AUTH_ROUTES_EXCEPTIONS.some((route) =>
        request.nextUrl.pathname.endsWith(route),
      )
    ) {
      return false;
    }

    return AUTH_ROUTES.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    );
  };

  // 1. If request is for auth route and session exists, redirect to home
  if (isAuthRoute() && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If request is not for auth route and session does not exist, redirect to sign-in
  if (!isAuthRoute() && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
