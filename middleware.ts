import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

function getAllowedOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  return allowedOrigins.includes(origin) ? origin : null;
}

function buildCorsHeaders(req: NextRequest) {
  const headers = new Headers();
  const allowedOrigin = getAllowedOrigin(req);

  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  headers.set("Access-Control-Max-Age", "86400");

  return headers;
}

function buildCspHeader(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.generativelanguage.googleapis.com https://*.cloudinary.com https://*.clerk.accounts.dev https://*.clerk.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export default clerkMiddleware(async (auth, req) => {
  // Handle CORS preflight FIRST, before auth runs.
  // Browsers send OPTIONS without cookies/auth headers, so auth.protect()
  // would reject it before your CORS headers ever get attached.
  if (req.method === "OPTIONS" && isApiRoute(req)) {
    return new NextResponse(null, {
      status: 204,
      headers: buildCorsHeaders(req),
    });
  }

  if (isProtectedRoute(req)) await auth.protect();

  // Generate a fresh nonce for this request only.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Pass the nonce to the app via a request header so layout.tsx can read it
  // and Next can apply it to its own injected scripts.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (isApiRoute(req)) {
    buildCorsHeaders(req).forEach((value, key) =>
      response.headers.set(key, value),
    );
  }

  response.headers.set("Content-Security-Policy", buildCspHeader(nonce));

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
