"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Image from "next/image";
import { Suspense, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const SignInForm = () => {
  useEffect(() => {
    console.log("🔵 [STEP 1] SignInForm component rendered");
  }, []);

  return (
    <SignIn.Root 
      routing="path"
      path="/sign-in"
    >
      <SignIn.Step
        name="start"
        className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-6"
      >
        <Clerk.GlobalError className="text-sm text-red-500 mb-2 text-center" />
        <Clerk.Field name="identifier" className="flex flex-col gap-1">
          <Clerk.Label className="text-sm text-gray-600 font-semibold mb-1">
            Nom d&apos;utilisateur
          </Clerk.Label>
          <Clerk.Input
            type="text"
            required
            autoFocus
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder="Entrez votre nom d&apos;utilisateur"
          />
          <Clerk.FieldError className="text-xs text-red-400 mt-1" />
        </Clerk.Field>
        <Clerk.Field name="password" className="flex flex-col gap-1">
          <Clerk.Label className="text-sm text-gray-600 font-semibold mb-1">
            Mot de passe
          </Clerk.Label>
          <Clerk.Input
            type="password"
            required
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder="Entrez votre mot de passe"
          />
          <Clerk.FieldError className="text-xs text-red-400 mt-1" />
        </Clerk.Field>
        <SignIn.Action
          submit
          className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-lg text-base py-3 mt-2 shadow-md"
        >
          Se connecter
        </SignIn.Action>
      </SignIn.Step>
    </SignIn.Root>
  );
};

const SignInPageContent = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  // Step-by-step debug logging
  useEffect(() => {
    console.log("🟢 [STEP 2] SignInPageContent component rendered/updated");
    console.log("   └─ isLoaded:", isLoaded);
    console.log("   └─ isSignedIn:", isSignedIn);
    console.log("   └─ user:", user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : "null");
    console.log("   └─ current URL:", typeof window !== "undefined" ? window.location.href : "server");
    console.log("   └─ searchParams:", Object.fromEntries(searchParams.entries()));
    console.log("   └─ redirect_url param:", searchParams.get("redirect_url"));
  }, [isLoaded, isSignedIn, user, searchParams]);

  // If user is signed in and we're still on sign-in page, redirect immediately
  // This is a fallback in case middleware redirect didn't work
  useEffect(() => {
    if (isLoaded && isSignedIn && typeof window !== "undefined" && !hasRedirected.current) {
      const currentPath = window.location.pathname;
      if (currentPath === "/sign-in" || currentPath.startsWith("/sign-in")) {
        hasRedirected.current = true;
        const redirectUrl = searchParams.get("redirect_url") || "/dashboard";
        console.log("   └─ 🔄 FALLBACK REDIRECT: Still on sign-in page, redirecting to:", redirectUrl);
        // Use replace to avoid adding to history
        window.location.replace(redirectUrl);
      }
    }
  }, [isLoaded, isSignedIn, searchParams]);

  // Show loading while checking auth status
  if (!isLoaded) {
    console.log("🟠 [STEP 4] Rendering: Loading state (waiting for auth to load)");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-lamaSkyLight to-blue-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // If signed in, show loading while middleware redirects
  // Middleware will handle the redirect, so we just show a loading state
  if (isSignedIn) {
    console.log("🔴 [STEP 5] User is signed in - middleware will redirect");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-lamaSkyLight to-blue-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  console.log("🟣 [STEP 6] Rendering: Sign-in form (user not authenticated)");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-lamaSkyLight to-blue-200">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-full shadow-lg p-3 mb-3">
            <Image src="/logo.png" alt="Logo GEOX School" width={150} height={150} />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight mb-1">GEOX School</h1>
          <h2 className="text-lg text-gray-500 font-medium">Connectez-vous à votre compte</h2>
        </div>
        <Suspense fallback={<div className="bg-white p-8 rounded-2xl shadow-2xl text-center">Chargement...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
};

const PageConnexion = () => {
  useEffect(() => {
    console.log("⚪ [STEP 0] PageConnexion wrapper component mounted");
    console.log("   └─ URL:", typeof window !== "undefined" ? window.location.href : "server");
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-lamaSkyLight to-blue-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  );
};

export default PageConnexion;
