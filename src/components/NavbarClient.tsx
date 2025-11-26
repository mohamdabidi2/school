"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import RealtimeMessaging from "./RealtimeMessaging";

const NavbarClient = () => {
  const { user } = useUser();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const userRole = user?.publicMetadata?.role as string || '';

  if (!mounted) return null;

  return (
    <>
      <div className="flex items-center justify-end p-3 lg:p-4 bg-white border-b border-gray-200">
        {/* MOBILE SEARCH */}
       
       
       
       

        {/* ICÔNES ET UTILISATEUR */}
        <div className="flex items-center gap-2 lg:gap-4 justify-end">
        
          {/* User Profile Section - Mobile */}
          <div className="lg:hidden flex items-center gap-2">
           
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "shadow-lg border border-gray-200",
                  userButtonPopoverActionButton: "hover:bg-gray-50",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            />
          </div>

          {/* User Profile Section - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-800">{user?.fullName || 'Utilisateur'}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(userRole)}`}>
                {getRoleDisplayName(userRole)}
              </span>
          
            </div>
            
        
            
            {/* Clerk UserButton */}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "shadow-lg border border-gray-200",
                  userButtonPopoverActionButton: "hover:bg-gray-50",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            />
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
