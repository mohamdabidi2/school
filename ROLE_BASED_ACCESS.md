# Role-Based Access Control System

## User Roles and Permissions

### 1. ADMIN
- **Access**: All pages can access
- **Description**: Full system administrator with complete access to all features

### 2. PARENT
- **Access**: 
  - Messages
  - Announcements
  - Results (Résultats)
  - Exams (Examens)
  - Assignments (Devoirs à la maison)
  - Teachers (Enseignants)
  - Events (Événements)
- **Description**: Can view academic information about their children

### 3. STUDENT
- **Access**:
  - Exams (Examens)
  - Assignments (Devoirs)
  - Results (Résultats)
  - Events (Événements)
  - Messages
- **Description**: Can view their own academic information and communications

### 4. TEACHER
- **Access**:
  - Exams (Examens)
  - Assignments (Devoirs)
  - Results (Résultats)
  - Events (Événements)
  - Messages
  - Attendance (Présence)
  - Students (Élèves)
  - Parents (Parents)
  - Classes (Classes)
  - Lessons (Leçons)
  - Teacher Absences (Absences Enseignants)
- **Description**: Can manage their classes and students

### 5. ADMINISTRATION
- **Access**:
  - Students (Élèves)
  - Teachers (Enseignants)
  - Parents (Parents)
  - Subjects (Matières)
  - Classes (Classes)
  - Lessons (Leçons)
  - Attendance (Présence)
  - Events (Événements)
  - Announcements (Annonces)
  - Teacher Absences (Absences Enseignants)
- **Description**: Manages academic and administrative aspects

### 6. FINANCE
- **Access**:
  - Payments (Paiements)
  - Students (Élèves)
  - Parents (Parents)
  - Teachers (Enseignants)
  - Team Salaries (Salaires Équipe)
  - Expenses (Dépenses)
  - Events (Événements)
  - Announcements (Annonces)
- **Description**: Manages financial aspects of the school

### 7. DIRECTOR
- **Access**: All included (has access to everything)
- **Description**: School director with complete oversight access

## Route Protection

The system uses middleware to protect routes based on user roles. Each route is mapped to specific roles that can access it.

## Menu Visibility

The navigation menu dynamically shows/hides items based on the user's role, ensuring users only see features they have access to.

## Implementation

- **Route Access Map**: `src/lib/settings.ts` - Defines which roles can access which routes
- **Menu Component**: `src/components/Menu.tsx` - Shows/hides menu items based on role
- **Middleware**: `src/middleware.ts` - Enforces route protection
- **Page Components**: Individual pages check user roles for additional security
