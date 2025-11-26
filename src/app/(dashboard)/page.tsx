import dynamicImport from "next/dynamic";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Suspense } from "react";

// Dynamic imports to avoid build trace collection issues on Vercel
const AttendanceChartContainer = dynamicImport(() => import("@/components/AttendanceChartContainer"));
const CountChartContainer = dynamicImport(() => import("@/components/CountChartContainer"));
const InstructorChartContainer = dynamicImport(() => import("@/components/InstructorChartContainer"));
const InstructorAbsenceChartContainer = dynamicImport(() => import("@/components/InstructorAbsenceChartContainer"));
const EventCalendarContainer = dynamicImport(() => import("@/components/EventCalendarContainer"));
const FinanceChartContainer = dynamicImport(() => import("@/components/FinanceChartContainer"));
const StudentPaymentsChartContainer = dynamicImport(() => import("@/components/StudentPaymentsChartContainer"));
const PaymentChartContainer = dynamicImport(() => import("@/components/PaymentChartContainer"));
const OverduePaymentsAlert = dynamicImport(() => import("@/components/OverduePaymentsAlert"));
const Announcements = dynamicImport(() => import("@/components/Announcements"));
const UserCard = dynamicImport(() => import("@/components/UserCard"));
const NotificationManager = dynamicImport(() => import("@/components/NotificationManager"));

// Force dynamic rendering since we use auth() and searchParams
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Page d'accueil axée sur les graphiques (FR) — rendue selon le rôle
const AccueilPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { userId } = await auth();
  let role: string = "";
  let email: string | undefined;
  let roleContext: { parentId?: string; studentId?: string; teacherId?: string } = {};
  
  // Debug logging for dashboard data fetching
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 [DASHBOARD] Fetching user data from Clerk");
  console.log("   ├─ userId:", userId ? `✅ ${userId}` : "❌ null");
  
  // Get all user data from Clerk publicMetadata - no database queries needed
  if (userId) {
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const metadata = clerkUser.publicMetadata as { role?: string; teacherId?: string; studentId?: string; parentId?: string } | undefined;
      
      // Debug: Log full publicMetadata
      console.log("   ├─ Full publicMetadata:", JSON.stringify(clerkUser.publicMetadata, null, 2));
      console.log("   ├─ Parsed metadata:", JSON.stringify(metadata, null, 2));
      
      // Get role from publicMetadata
      role = metadata?.role || "";
      email = clerkUser.emailAddresses?.[0]?.emailAddress;
      
      console.log("   ├─ Role extracted:", role || "❌ EMPTY/UNDEFINED");
      console.log("   ├─ Email:", email || "❌ not found");
      
      // Use userId directly as domain ID (Clerk userId = database ID)
      // Also check publicMetadata for explicit IDs if they exist
      if (role === "teacher") {
        roleContext.teacherId = metadata?.teacherId || userId;
        console.log("   ├─ Teacher ID:", roleContext.teacherId);
      } else if (role === "student") {
        roleContext.studentId = metadata?.studentId || userId;
        console.log("   ├─ Student ID:", roleContext.studentId);
      } else if (role === "parent") {
        roleContext.parentId = metadata?.parentId || userId;
        console.log("   ├─ Parent ID:", roleContext.parentId);
      }
      
      console.log("   └─ Role Context:", JSON.stringify(roleContext, null, 2));
    } catch (error) {
      console.error("   └─ ❌ Error fetching user from Clerk:", error);
    }
  } else {
    console.log("   └─ ❌ No userId - cannot fetch user data");
  }

  const isAdminLike = ["admin", "director", "school-manager", "finance"].includes(role);
  const isTeacher = role === "teacher";
  const isStudentOrParent = role === "student" || role === "parent";
  const isAdministration = role === "administration";
  const isFinance = role === "finance";
  const isAdmin = role === "admin" || role === "director" || role === "school-manager";
  
  // Debug: Log role flags
  console.log("📊 [DASHBOARD] Role flags:");
  console.log("   ├─ isAdmin:", isAdmin);
  console.log("   ├─ isTeacher:", isTeacher);
  console.log("   ├─ isStudentOrParent:", isStudentOrParent);
  console.log("   ├─ isAdministration:", isAdministration);
  console.log("   ├─ isFinance:", isFinance);
  console.log("   └─ isAdminLike:", isAdminLike);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // All users see the dashboard with role-based content
  // No redirects - dashboard handles all roles appropriately
  return (
    <div className="p-2 lg:p-4 flex gap-2 lg:gap-4 flex-col lg:flex-row">
      {/* ZONE PRINCIPALE AVEC GRAPHIQUES SELON RÔLE */}
      <div className="hidden lg:flex w-full lg:w-2/3 flex-col gap-8">
        {/* ADMIN / DIRECTOR / SCHOOL-MANAGER: all charts + cards */}
        {isAdmin && (
          <>
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="class" />
          <UserCard type="subject" />
          <UserCard type="admin" />
          <UserCard type="parent" />
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 h-[450px]"><CountChartContainer /></div>
              <div className="w-full lg:w-2/3 h-[450px]"><AttendanceChartContainer context={roleContext} /></div>
          </div>
            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 h-[450px]"><InstructorChartContainer /></div>
              <div className="w-full lg:w-2/3 h-[450px]"><InstructorAbsenceChartContainer /></div>
          </div>
            <div className="w-full h-[500px]"><FinanceChartContainer /></div>
            <div className="w-full h-[500px]"><StudentPaymentsChartContainer context={roleContext} /></div>
          </>
        )}

        {/* FINANCE: all charts + payments/depenses cards */}
        {isFinance && (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><OverduePaymentsAlert /></div>
            <div className="w-full h-[450px]"><PaymentChartContainer /></div>
            <div className="w-full h-[500px]"><FinanceChartContainer /></div>
            <div className="w-full h-[500px]"><StudentPaymentsChartContainer /></div>
          </>
        )}

        {/* TEACHER: own timetable + attendance by class + announcements */}
        {isTeacher && (
          <>
            <div className="w-full"><EventCalendarContainer searchParams={searchParams} /></div>
            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 h-[450px]"><AttendanceChartContainer context={roleContext} /></div>
              <div className="w-full lg:w-1/2 h-[450px]"><InstructorAbsenceChartContainer /></div>
        </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><Announcements /></div>
          </>
        )}

        {/* STUDENT / PARENT: timetable + kid payments + kid attendance + announcements */}
        {isStudentOrParent && (
          <>
            <div className="w-full"><EventCalendarContainer searchParams={searchParams} /></div>
            <div className="w-full h-[450px]"><AttendanceChartContainer context={roleContext} /></div>
            <div className="w-full h-[500px]"><StudentPaymentsChartContainer context={roleContext} /></div>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><Announcements /></div>
          </>
        )}

        {/* ADMINISTRATION: all charts without payments */}
        {isAdministration && (
          <>
        <div className="flex gap-4 flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 h-[450px]"><CountChartContainer /></div>
              <div className="w-full lg:w-2/3 h-[450px]"><AttendanceChartContainer /></div>
          </div>
            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 h-[450px]"><InstructorChartContainer /></div>
              <div className="w-full lg:w-2/3 h-[450px]"><InstructorAbsenceChartContainer /></div>
          </div>
          </>
        )}
        </div>

      {/* MOBILE: pile verticale selon rôle */}
      <div className="lg:hidden w-full flex flex-col gap-6">
        {isAdmin && (
          <>
            <div className="h-[260px]"><CountChartContainer /></div>
            <div className="h-[260px]"><AttendanceChartContainer /></div>
            <div className="h-[260px]"><InstructorChartContainer /></div>
            <div className="h-[260px]"><InstructorAbsenceChartContainer /></div>
            <div className="h-[300px]"><FinanceChartContainer /></div>
            <div className="h-[300px]"><StudentPaymentsChartContainer /></div>
          </>
        )}
        {isFinance && (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><OverduePaymentsAlert /></div>
            <div className="h-[260px]"><PaymentChartContainer /></div>
            <div className="h-[300px]"><FinanceChartContainer /></div>
            <div className="h-[300px]"><StudentPaymentsChartContainer /></div>
          </>
        )}
        {isTeacher && (
          <>
            <div className=""><EventCalendarContainer searchParams={searchParams} /></div>
            <div className="h-[260px]"><AttendanceChartContainer /></div>
            <div className="h-[260px]"><InstructorAbsenceChartContainer /></div>
          </>
        )}
        {isStudentOrParent && (
          <>
            <div className=""><EventCalendarContainer searchParams={searchParams} /></div>
            <div className="h-[260px]"><AttendanceChartContainer /></div>
            <div className="h-[300px]"><StudentPaymentsChartContainer /></div>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><Announcements /></div>
          </>
        )}
        {isAdministration && (
          <>
            <div className="h-[260px]"><CountChartContainer /></div>
            <div className="h-[260px]"><AttendanceChartContainer /></div>
            <div className="h-[260px]"><InstructorChartContainer /></div>
            <div className="h-[260px]"><InstructorAbsenceChartContainer /></div>
          </>
        )}
      </div>
      
      {/* PANNEAU LATÉRAL AVEC NOTIFS + AGENDA */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <Suspense fallback={<div className="p-4 text-center">Chargement...</div>}>
            <NotificationManager />
          </Suspense>
        </div>
        {/* Timetable always accessible in sidebar as well */}
        <Suspense fallback={<div className="bg-white p-4 rounded-md text-center">Chargement...</div>}>
          <EventCalendarContainer searchParams={searchParams} />
        </Suspense>
        {/* Announcements in sidebar for visibility across roles */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <Suspense fallback={<div className="p-4 text-center">Chargement...</div>}>
            <Announcements />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AccueilPage;
