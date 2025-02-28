import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { parse, serialize } from "cookie";

const PUBLIC_ROUTES = [
  "/login",
  "/api/login",
  "/registration",
  "/api/registration",
  "/api/logout",
];

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your_secret_key"
); // Use TextEncoder for Edge compatibility

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log(`[Middleware] Requested Path: ${pathname}`);

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log("[Middleware] Public route, allowing access.");
    return NextResponse.next();
  }

  // Extract token from cookies
  const cookies = parse(req.headers.get("cookie") || "");
  const token = cookies.authToken;
  console.log(`[Middleware] Token found: ${!!token}`);

  if (!token) {
    console.log("[Middleware] No token found, redirecting to /login");
    return NextResponse.redirect(new URL("/registration", req.url));
  }

  try {
    // Verify token using `jose`
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log(
      `[Middleware] Token decoded successfully: User ID - ${payload.userId}, Role - ${payload.role}`
    );

    // Restrict access to /admin routes
    if (pathname.startsWith("/admin")) {
      console.log("[Middleware] Admin route accessed.");
      if (payload.role !== "admin") {
        console.log("[Middleware] User is not admin, redirecting to /");
        return NextResponse.redirect(new URL("/", req.url));
      }
      console.log("[Middleware] User is admin, access granted.");
      // return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Clone request headers and attach user data
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("userid", payload.userId);
    requestHeaders.set("role", payload.role);

    console.log("[Middleware] User data added to headers. Proceeding to next.");

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set(
      "Set-Cookie",
      serialize("userId", payload.userId, {
        path: "/",
      })
    );

    return response;

  } catch (error) {
    console.error("[Middleware] Token verification failed:", error.message);
    console.log("[Middleware] Invalid token, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
