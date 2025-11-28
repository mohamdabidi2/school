import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CurrentUserProvider from "@/components/providers/CurrentUserProvider";
import { getCurrentUserProfile } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestion scolaire GEOX",
  description: "Système de gestion scolaire",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUserProfile();

  return (
      <html lang="fr">
        <head>
          <link rel="manifest" href="/manifest.json" type="application/manifest+json" />
          <meta name="theme-color" content="#3B82F6" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="GEOX School" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </head>
        <body className={inter.className}>
        <CurrentUserProvider currentUser={currentUser}>
          {children}
          <ToastContainer position="bottom-right" theme="dark" />
        </CurrentUserProvider>
        </body>
      </html>
  );
}
