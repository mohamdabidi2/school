export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  // Sign-in page - allow unauthenticated users (no role check)
  "/sign-in": [],
  
  // Root and dashboard routes - allow all authenticated users
  "/": ["admin", "director", "school-manager", "teacher", "student", "parent", "finance", "administration"],
  "/dashboard": ["admin", "director", "school-manager", "teacher", "student", "parent", "finance", "administration"],
  
  // Admin: All pages can access (director and school-manager also use admin page)
  "/admin(.*)": ["admin", "director", "school-manager"],
  
  // School Manager: Full access to everything
  "/school-manager(.*)": ["school-manager"],
  
  // Administration team access
  "/administration(.*)": ["administration"],
  
  // Parent: messages, announces, resultat, examan, devoir a la maison, enseignants, evenements
  "/parent(.*)": ["parent"],
  "/list/messages": ["admin", "parent", "student", "teacher", "director", "school-manager"],
  "/list/teachers": ["admin", "parent", "student", "teacher", "director", "school-manager"],
  
  // Student: examens, devoirs, resultat, evenements, messages
  "/student(.*)": ["student"],
  
  // Teacher: eleves, examens, devoirs, resultat, evenements, messages, presence
  "/teacher(.*)": ["teacher"],
  "/list/students": ["admin", "teacher", "director", "school-manager", "administration"],
  "/list/attendance": ["admin", "teacher", "director", "school-manager", "administration"],
  
  // Administration: eleve, enseignants, parents, matieres, classes, lecons, presence, evenements, annonces, absence enseignants
  "/list/subjects": ["admin", "director", "school-manager", "administration"],
  "/list/lessons": ["admin", "teacher", "director", "school-manager", "administration"],
  "/list/absences": ["admin", "teacher", "director", "school-manager", "administration"],
  "/list/parents": ["admin", "teacher", "director", "school-manager", "administration"],
  "/list/classes": ["admin", "teacher", "director", "school-manager", "administration"],
  
  // Finance: payements, eleves, parents, enseignants, salaires equipe
  "/list/payments": ["admin", "finance", "director", "school-manager"],
  "/list/salaries": ["admin", "finance", "director", "school-manager"],
  
  // Director: all included (has access to everything)
  "/director(.*)": ["director"],
  
  // Finance team access
  "/finance(.*)": ["finance"],
  
  // Management pages
  "/gestion/admin-team": ["admin", "director", "school-manager"],
  "/gestion/finance-team": ["admin", "director", "school-manager"],
  
  // Additional routes
  "/list/depenses": ["admin", "finance", "director", "school-manager"],
  
  // Common routes accessible by multiple roles (merged to avoid duplicates)
  "/list/exams": ["admin", "parent", "student", "teacher", "director", "school-manager"],
  "/list/assignments": ["admin", "parent", "student", "teacher", "director", "school-manager"],
  "/list/results": ["admin", "parent", "student", "teacher", "director", "school-manager"],
  "/list/events": ["admin", "parent", "student", "teacher", "director", "finance", "school-manager", "administration"],
  "/list/announcements": ["admin", "parent", "student", "teacher", "director", "finance", "school-manager", "administration"],
};