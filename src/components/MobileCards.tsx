"use client";

import Image from "next/image";
import Link from "next/link";
import { getRoleRedirect } from "@/lib/getRoleRedirect";
import { useCurrentUser } from "./providers/CurrentUserProvider";

// Mobile Cards component for phone screens
const MobileCards = () => {
  const user = useCurrentUser();
  const role = user?.role || "";
  const homeUrl = getRoleRedirect(role);

  // Menu items with the same structure as Menu.tsx
  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: "Accueil",
          href: "/", // Will be replaced with role-specific URL
          visible: ["admin", "teacher", "student", "parent", "director", "finance", "school-manager"],
        },
        {
          icon: "/teacher.png",
          label: "Enseignants",
          href: "/list/teachers",
          visible: ["admin", "parent", "student", "teacher", "director", "school-manager"],
        },
        {
          icon: "/student.png",
          label: "Élèves",
          href: "/list/students",
          visible: ["admin", "teacher", "director", "school-manager"],
        },
        {
          icon: "/parent.png",
          label: "Parents",
          href: "/list/parents",
          visible: ["admin", "teacher", "director", "school-manager"],
        },
        {
          icon: "/subject.png",
          label: "Matières",
          href: "/list/subjects",
          visible: ["admin", "director", "school-manager"],
        },
        {
          icon: "/class.png",
          label: "Classes",
          href: "/list/classes",
          visible: ["admin", "teacher", "director", "school-manager"],
        },
        {
          icon: "/setting.png",
          label: "Équipe Administration",
          href: "/gestion/admin-team",
          visible: ["admin", "director", "school-manager"],
        },
        {
          icon: "/lesson.png",
          label: "Leçons",
          href: "/list/lessons",
          visible: ["admin", "teacher", "director", "school-manager"],
        },
        {
          icon: "/exam.png",
          label: "Examens",
          href: "/list/exams",
          visible: ["admin", "parent", "student", "teacher", "director", "school-manager"],
        },
        {
          icon: "/assignment.png",
          label: "Devoirs à la maison",
          href: "/list/assignments",
          visible: ["admin", "parent", "student", "teacher", "director", "school-manager"],
        },
        {
          icon: "/result.png",
          label: "Résultats",
          href: "/list/results",
          visible: ["admin", "parent", "student", "teacher", "director", "school-manager"],
        },
        {
          icon: "/attendance.png",
          label: "Présence",
          href: "/list/attendance",
          visible: ["admin", "teacher", "director", "school-manager"],
        },
        {
          icon: "/calendar.png",
          label: "Événements",
          href: "/list/events",
          visible: ["admin", "parent", "student", "teacher", "director", "finance", "school-manager"],
        },
        {
          icon: "/message.png",
          label: "Messages",
          href: "/list/messages",
          visible: ["admin", "parent", "student", "teacher", "director", "school-manager"],
        },
        {
          icon: "/announcement.png",
          label: "Annonces",
          href: "/list/announcements",
          visible: ["admin", "parent", "student", "teacher", "director", "finance", "school-manager"],
        },
        {
          icon: "/finance.png",
          label: "Paiements",
          href: "/list/payments",
          visible: ["admin", "finance", "director", "school-manager"],
        },
        {
          icon: "/finance.png",
          label: "Dépenses",
          href: "/list/depenses",
          visible: ["admin", "finance", "director", "school-manager"],
        },
        {
          icon: "/attendance.png",
          label: "Absences Enseignants",
          href: "/list/absences",
          visible: ["admin", "teacher", "director", "school-manager"],
        },
        {
          icon: "/finance.png",
          label: "Salaires Équipe",
          href: "/list/salaries",
          visible: ["admin", "finance", "director", "school-manager"],
        },
      ],
    },
    {
      title: "ADMIN",
      items: [
        {
          icon: "/setting.png",
          label: "Validation Dépenses",
          href: "/admin/validation",
          visible: ["admin", "director", "school-manager"],
        },
      ],
    },
  ];

  // Flatten and filter items based on role
  const flat = menuItems.flatMap((s) => s.items.map(item => {
    // Replace "/" href with role-specific home URL
    if (item.href === "/") {
      return { ...item, href: homeUrl };
    }
    return item;
  }));
  const visibleItems = flat.filter((item) => item.visible.includes(role));

  // Group items by category
  const labelToGroup: Record<string, string> = {
    "Accueil": "Général",
    "Enseignants": "Gestion",
    "Élèves": "Gestion",
    "Parents": "Gestion",
    "Matières": "Gestion",
    "Classes": "Gestion",
    "Équipe Finance": "Gestion",
    "Équipe Administration": "Gestion",
    "Leçons": "Pédagogie",
    "Examens": "Pédagogie",
    "Devoirs à la maison": "Pédagogie",
    "Résultats": "Pédagogie",
    "Présence": "Pédagogie",
    "Événements": "Pédagogie",
    "Messages": "Communication",
    "Annonces": "Communication",
    "Paiements": "Finance",
    "Dépenses": "Finance",
    "Salaires Équipe": "Finance",
    "Absences Enseignants": "Administration",
    "Validation Dépenses": "Administration",
  };

  const groupsOrder = ["Général", "Gestion", "Pédagogie", "Communication", "Finance", "Administration"];
  const grouped: Record<string, typeof flat> = {} as any;
  
  visibleItems.forEach((item) => {
    const group = labelToGroup[item.label] || "Autre";
    (grouped[group] ||= []).push(item);
  });

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Menu Principal</h1>
        <p className="text-gray-600">Sélectionnez une option ci-dessous</p>
      </div>

      {groupsOrder.map((group) => (
        grouped[group] && grouped[group].length ? (
          <div key={group} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
              {group}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {grouped[group].map((item) => (
                <Link
                  href={item.href}
                  key={item.label}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-200 hover:border-blue-300 group"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <Image 
                        src={item.icon} 
                        alt={item.label} 
                        width={24} 
                        height={24}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null
      ))}
    </div>
  );
};

export default MobileCards;
