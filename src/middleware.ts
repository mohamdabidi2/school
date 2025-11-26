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
    // If already signed in, redirect to root (which will redirect based on role)
    // But only if not already redirected to avoid loops
    if (userId && !req.nextUrl.searchParams.get("redirected")) {
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("redirected", "true");
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Protect all other routes - just check if user is authenticated
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    // Only add redirect_url if we're not already on sign-in
    if (pathname !== "/sign-in") {
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
