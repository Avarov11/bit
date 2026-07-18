import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"],
};

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const AUTH_PATHS    = ["/api/auth/login", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value ?? "";
  const session = token ? await verifyToken(token) : null;
  const path    = req.nextUrl.pathname;
  const isLogin = path === "/login";
  const isApi   = path.startsWith("/api/");
  const isAuthApi = AUTH_PATHS.some(p => path.startsWith(p));

  // Auth API routes are always open
  if (isAuthApi) return NextResponse.next();

  // Protect dashboard routes
  if (!isApi) {
    if (!session && !isLogin) return NextResponse.redirect(new URL("/login", req.url));
    if (session && isLogin)   return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Block write operations for read-only users on all API routes
  if (isApi && session?.role === "readonly" && WRITE_METHODS.has(req.method)) {
    return NextResponse.json({ error: "Read-only access — contact admin" }, { status: 403 });
  }

  // Block unauthenticated API access (except auth routes already handled above)
  if (isApi && !session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const res = NextResponse.next();
  if (session) {
    res.headers.set("x-user-role",     session.role);
    res.headers.set("x-user-username", session.username);
  }
  return res;
}
