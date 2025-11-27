import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  /^\/sign-in(\/.*)?$/,
  /^\/api\/login$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((pattern) => pattern.test(pathname));
  const sessionToken = req.cookies.get("geox_session")?.value;

  if (!isPublic && !sessionToken) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
