import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔷 [MIDDLEWARE] Request received");
  
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams;

  console.log("   ├─ Path:", pathname);
  console.log("   ├─ UserId:", userId ? `✅ authenticated (${userId})` : "❌ not authenticated");
  console.log("   ├─ Query params:", Object.fromEntries(searchParams.entries()));
  console.log("   └─ Full URL:", req.url);

  // Allow public routes
  if (publicRoutes(req)) {
    console.log("   └─ ✅ This is a PUBLIC route");
    
    // If already signed in, redirect immediately to /dashboard (ignore redirect_url)
    if (userId) {
      console.log("   └─ 🔄 User is authenticated on public route - REDIRECTING to /dashboard");
      console.log("      └─ ⚠️ Ignoring redirect_url param - always go to /dashboard");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      // Always redirect to /dashboard, ignore any redirect_url parameter
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    console.log("   └─ ✅ Public route, user not authenticated - ALLOWING ACCESS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.next();
  }

  // Protect all other routes - just check if user is authenticated
  if (!userId) {
    console.log("   └─ 🔒 This is a PROTECTED route");
    console.log("   └─ ❌ User not authenticated - REDIRECTING to sign-in");
    
    // Always redirect to /sign-in without redirect_url - after login, go directly to /dashboard
    const signInUrl = new URL("/sign-in", req.url);
    // Don't add redirect_url - we always want to go to /dashboard after login
    console.log("      └─ Redirecting to /sign-in (will go to /dashboard after login)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.redirect(signInUrl);
  }

  // Allow access for all authenticated users
  console.log("   └─ ✅ Authenticated user on protected route - ALLOWING ACCESS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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
