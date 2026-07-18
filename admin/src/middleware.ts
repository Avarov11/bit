import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value ?? "";
  const session = token ? await verifyToken(token) : null;
  const isLogin = req.nextUrl.pathname === "/login";

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Pass role to page via header for read-only enforcement
  const res = NextResponse.next();
  if (session) res.headers.set("x-user-role", session.role);
  return res;
}
