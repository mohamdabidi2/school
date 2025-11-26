"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRoleRedirect } from "@/lib/getRoleRedirect";

// Menu en français
const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Accueil",
        href: "/", // Will be replaced with role-specific URL in component
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
        visible: ["admin", "director"],
      },
      {
        icon: "/lesson.png",
        label: "Leçons",
        href: "/list/lessons",
        visible: ["admin", "teacher", "director"],
      },
      {
        icon: "/exam.png",
        label: "Examens",
        href: "/list/exams",
        visible: ["admin", "parent", "student", "teacher", "director"],
      },
      {
        icon: "/assignment.png",
        label: "Devoirs à la maison",
        href: "/list/assignments",
        visible: ["admin", "parent", "student", "teacher", "director"],
      },
      {
        icon: "/result.png",
        label: "Résultats",
        href: "/list/results",
        visible: ["admin", "parent", "student", "teacher", "director"],
      },
      {
        icon: "/attendance.png",
        label: "Présence",
        href: "/list/attendance",
        visible: ["admin", "teacher", "director"],
      },
      {
        icon: "/calendar.png",
        label: "Événements",
        href: "/list/events",
        visible: ["admin", "parent", "student", "teacher", "director", "finance"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "parent", "student", "teacher", "director"],
      },
      {
        icon: "/announcement.png",
        label: "Annonces",
        href: "/list/announcements",
        visible: ["admin", "parent", "student", "teacher", "director", "finance"],
      },
      {
        icon: "/finance.png",
        label: "Paiements",
        href: "/list/payments",
        visible: ["admin", "finance", "director"],
      },
      {
        icon: "/finance.png",
        label: "Dépenses",
        href: "/list/depenses",
        visible: ["admin", "finance", "director"],
      },
      {
        icon: "/attendance.png",
        label: "Absences Enseignants",
        href: "/list/absences",
        visible: ["admin", "teacher", "director"],
      },
      {
        icon: "/finance.png",
        label: "Salaires Équipe",
        href: "/list/salaries",
        visible: ["admin", "finance", "director"],
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
        visible: ["admin", "director"],
      },
    ],
  },
];

const Menu = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const role = user?.publicMetadata?.role as string || "";

  // Get role-specific home URL
  const homeUrl = getRoleRedirect(role);

  // Aplatir tous les items en une seule section, puis regrouper par contexte et rendre collapsible
  const flat = menuItems.flatMap((s) => s.items.map(item => {
    // Replace "/" href with role-specific home URL
    if (item.href === "/") {
      return { ...item, href: homeUrl };
    }
    return item;
  }));

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
    "Profil": "Autre",
    "Paramètres": "Autre",
    "Déconnexion": "Autre",
  };

  const groupsOrder = ["Général", "Gestion", "Pédagogie", "Communication", "Finance", "Administration", "Autre"];
  const grouped: Record<string, typeof flat> = {} as any;
  flat.forEach((it) => {
    if (!it.visible.includes(role)) return;
    const g = labelToGroup[it.label] || "Autre";
    (grouped[g] ||= []).push(it);
  });

  return (
    <div className="mt-4 text-sm">
      <details className="flex flex-col gap-2" open>
        <summary className="hidden lg:block text-gray-400 font-semibold tracking-wide my-3 cursor-pointer select-none">MENU</summary>
        {groupsOrder.map((g) => (
          grouped[g] && grouped[g].length ? (
            <details key={g} className="ml-0 rounded-md border border-gray-200 overflow-hidden" open>
              <summary className="hidden lg:flex items-center justify-between text-gray-700 font-medium px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer select-none">
                <span>{g}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
                  <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="flex flex-col gap-1 p-1">
                {grouped[g].map((item) => (
                  <Link
                    href={item.href}
                    key={item.label}
                    className="flex items-center justify-start gap-3 text-gray-600 py-2 px-2 rounded-md hover:bg-lamaSkyLight hover:text-gray-900 transition-colors"
                  >
                    <Image src={item.icon} alt="" width={20} height={20} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </details>
          ) : null
        ))}
      </details>
    </div>
  );
};

export default Menu;
