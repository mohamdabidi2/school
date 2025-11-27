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

  // If user is authenticated and on sign-in page, redirect to dashboard
  if (publicRoutes(req) && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is not authenticated and trying to access protected route, redirect to sign-in
  if (!publicRoutes(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
