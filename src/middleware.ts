// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin for now
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Verify session against server (DB)
  const res = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  });

  if (!res.ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const data = await res.json();

  if (!data?.authenticated || !data?.user || data.user.isBlocked) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!data.user.isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


export const config = {
  // protect admin pages AND admin APIs
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

