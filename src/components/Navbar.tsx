import Image from "next/image";
import RealtimeMessaging from "./RealtimeMessaging";
import { useState } from "react";
import { getCurrentUserProfile } from "@/lib/auth";

const Navbar = async () => {
  const user = await getCurrentUserProfile();
  const userInfo = {
    name: user?.displayName || user?.username || "Utilisateur",
    email: user?.email || "",
    imageUrl: user?.avatarUrl || "/noAvatar.png",
    role: user?.role || "",
  };

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
        
          <Image src={userInfo.imageUrl} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
