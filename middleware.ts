import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("asuma_token")?.value;

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  // Has token → redirect away from auth pages
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // No token → redirect away from protected pages
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
};
