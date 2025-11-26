"use client";

import { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import Menu from "@/components/Menu";
import NavbarClient from "@/components/NavbarClient";
import Image from "next/image";
import Link from "next/link";
import { getRoleRedirect } from "@/lib/getRoleRedirect";

// Mobile-first responsive layout
export default function DispositionTableauDeBord({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string || "";
  const homeUrl = getRoleRedirect(role) || "/";

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href={homeUrl} className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={28} height={28} />
          <span className="font-bold text-lg">GEOX School</span>
        </Link>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative bg-white h-full w-80 max-w-[85vw] shadow-xl flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Link href={homeUrl} className="flex items-center gap-2">
                  <Image src="/logo.png" alt="logo" width={32} height={32} />
                  <span className="font-bold">GEOX School</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Menu />
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex w-64 xl:w-72 p-4 bg-white border-r border-gray-200 flex-col">
        <Link
          href={homeUrl}
          className="flex items-center gap-3 mb-6"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="font-bold text-lg">GEOX School</span>
        </Link>
        <Menu />
      </div>
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-[#F7F8FA] flex flex-col min-h-0">
        <NavbarClient />
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
