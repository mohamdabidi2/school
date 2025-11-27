"use client";

import { createContext, useContext } from "react";
import type { CurrentUserProfile } from "@/lib/auth";

const CurrentUserContext = createContext<CurrentUserProfile | null>(null);

export const useCurrentUser = () => useContext(CurrentUserContext);

export default function CurrentUserProvider({
  currentUser,
  children,
}: {
  currentUser: CurrentUserProfile | null;
  children: React.ReactNode;
}) {
  return <CurrentUserContext.Provider value={currentUser}>{children}</CurrentUserContext.Provider>;
}


