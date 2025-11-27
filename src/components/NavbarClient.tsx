"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import RealtimeMessaging from "./RealtimeMessaging";
import { useCurrentUser } from "./providers/CurrentUserProvider";
import { useRouter } from "next/navigation";

const NavbarClient = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Role display mapping
  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'teacher': 'Enseignant',
      'student': 'Étudiant',
      'parent': 'Parent',
      'administration': 'Administration',
      'finance': 'Finance',
      'director': 'Directeur',
      'school-manager': 'Gestionnaire École'
    };
    return roleMap[role] || role;
  };

  // Role color mapping
  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'teacher': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800',
      'parent': 'bg-purple-100 text-purple-800',
      'administration': 'bg-yellow-100 text-yellow-800',
      'finance': 'bg-indigo-100 text-indigo-800',
      'director': 'bg-pink-100 text-pink-800',
      'school-manager': 'bg-emerald-100 text-emerald-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  const userRole = user?.role || '';
  const displayName = user?.displayName || user?.username || "Utilisateur";
  const avatarUrl = user?.avatarUrl || "/noAvatar.png";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/logout", { method: "POST" });
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="flex items-center justify-end p-3 lg:p-4 bg-white border-b border-gray-200">
        {/* MOBILE SEARCH */}
       
       
       
       

        {/* ICÔNES ET UTILISATEUR */}
        <div className="flex items-center gap-2 lg:gap-4 justify-end">
        
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Image src={avatarUrl} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-800">{displayName}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(userRole)}`}>
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium disabled:opacity-50"
            >
              {loggingOut ? "Déconnexion..." : "Se déconnecter"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Real-time Messaging Modal */}
      <RealtimeMessaging 
        isOpen={isMessagingOpen} 
        onClose={() => setIsMessagingOpen(false)} 
      />
    </>
  );
};

export default NavbarClient;
