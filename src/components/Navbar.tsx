import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import RealtimeMessaging from "./RealtimeMessaging";
import { useState } from "react";

const Navbar = async () => {
  const { userId } = auth();
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role || "";
  
  // Get user's information from Clerk
  let userInfo = {
    name: "Utilisateur",
    email: "",
    imageUrl: "",
    role: role
  };

  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      userInfo = {
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.username || user.emailAddresses[0]?.emailAddress || "Utilisateur",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl || "",
        role: role
      };
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

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
  return (
    <div className="flex items-center justify-between p-4">
      {/* BARRE DE RECHERCHE */}
    
      {/* ICÔNES ET UTILISATEUR */}
      <div className="flex items-center gap-4 justify-end w-full">
     
   
        {/* User Profile Section */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-800">{userInfo.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(userInfo.role)}`}>
              {getRoleDisplayName(userInfo.role)}
            </span>
         
          </div>
        
          {/* Clerk UserButton */}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "shadow-lg border border-gray-200",
                userButtonPopoverActionButton: "hover:bg-gray-50",
                userButtonPopoverFooter: "hidden" // Hide the "Manage account" link if needed
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
