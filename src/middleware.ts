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
    
    // If already signed in, redirect immediately
    if (userId) {
      console.log("   └─ 🔄 User is authenticated on public route - REDIRECTING");
      
      // Get redirect_url from query params if it exists, otherwise use "/"
      const redirectUrlParam = searchParams.get("redirect_url");
      const redirectUrl = redirectUrlParam || "/";
      
      console.log("      ├─ redirect_url param:", redirectUrlParam);
      console.log("      ├─ Final redirect URL:", redirectUrl);
      
      // Only redirect if it's a valid internal path (starts with / and not //)
      if (redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
        const targetUrl = new URL(redirectUrl, req.url);
        // Clean up the URL - remove query params
        targetUrl.search = "";
        console.log("      └─ ✅ Redirecting to:", targetUrl.toString());
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return NextResponse.redirect(targetUrl);
      }
      // Fallback to root
      console.log("      └─ ⚠️ Invalid redirect URL, falling back to /");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return NextResponse.redirect(new URL("/", req.url));
    }
    console.log("   └─ ✅ Public route, user not authenticated - ALLOWING ACCESS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.next();
  }

  // Protect all other routes - just check if user is authenticated
  if (!userId) {
    console.log("   └─ 🔒 This is a PROTECTED route");
    console.log("   └─ ❌ User not authenticated - REDIRECTING to sign-in");
    
    const signInUrl = new URL("/sign-in", req.url);
    // Only add redirect_url if we're not already on sign-in and it's a valid path
    if (pathname !== "/sign-in" && pathname !== "/") {
      signInUrl.searchParams.set("redirect_url", pathname);
      console.log("      └─ Adding redirect_url:", pathname);
    } else {
      console.log("      └─ No redirect_url needed (already on sign-in or root)");
    }
    console.log("      └─ Redirecting to:", signInUrl.toString());
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
