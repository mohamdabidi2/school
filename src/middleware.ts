import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes(req)) {
    // If already signed in, redirect immediately
    if (userId) {
      // Get redirect_url from query params if it exists, otherwise use "/"
      const redirectUrlParam = req.nextUrl.searchParams.get("redirect_url");
      const redirectUrl = redirectUrlParam || "/";
      
      // Only redirect if it's a valid internal path (starts with / and not //)
      if (redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
        const targetUrl = new URL(redirectUrl, req.url);
        // Clean up the URL - remove query params
        targetUrl.search = "";
        return NextResponse.redirect(targetUrl);
      }
      // Fallback to root
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes - just check if user is authenticated
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    // Only add redirect_url if we're not already on sign-in and it's a valid path
    if (pathname !== "/sign-in" && pathname !== "/") {
      signInUrl.searchParams.set("redirect_url", pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  // Allow access for all authenticated users
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
