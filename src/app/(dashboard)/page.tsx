import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import InstructorChartContainer from "@/components/InstructorChartContainer";
import InstructorAbsenceChartContainer from "@/components/InstructorAbsenceChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import StudentPaymentsChartContainer from "@/components/StudentPaymentsChartContainer";
import PaymentChartContainer from "@/components/PaymentChartContainer";
import OverduePaymentsAlert from "@/components/OverduePaymentsAlert";
import Announcements from "@/components/Announcements";
import UserCard from "@/components/UserCard";
import NotificationManager from "@/components/NotificationManager";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

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
  if (userId) {
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      role = (clerkUser.publicMetadata?.role as string) || "";
      email = clerkUser.emailAddresses?.[0]?.emailAddress;
    } catch {}
  }

  // Resolve domain IDs primarily by Clerk userId, fallback to email
  try {
    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({ where: { OR: [{ id: userId || "" }, { email: email || undefined }] } });
      if (teacher) roleContext.teacherId = teacher.id;
    } else if (role === "student") {
      const student = await prisma.student.findFirst({ where: { OR: [{ id: userId || "" }, { email: email || undefined }] } });
      if (student) roleContext.studentId = student.id;
    } else if (role === "parent") {
      const parent = await prisma.parent.findFirst({ where: { OR: [{ id: userId || "" }, { email: email || undefined }] } });
      if (parent) roleContext.parentId = parent.id;
    }
  } catch {}

  const isAdminLike = ["admin", "director", "school-manager", "finance"].includes(role);
  const isTeacher = role === "teacher";
  const isStudentOrParent = role === "student" || role === "parent";
  const isAdministration = role === "administration";
  const isFinance = role === "finance";
  const isAdmin = role === "admin" || role === "director" || role === "school-manager";

  // Redirect teacher/student/parent to their respective profile pages
  if (isTeacher && roleContext.teacherId) {
    return redirect(`/list/teachers/${roleContext.teacherId}`);
  }
  if (role === "student" && roleContext.studentId) {
    return redirect(`/list/students/${roleContext.studentId}`);
  }
  if (role === "parent" && roleContext.parentId) {
    return redirect(`/list/parents/${roleContext.parentId}`);
  }

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
          <NotificationManager />
        </div>
        {/* Timetable always accessible in sidebar as well */}
        <EventCalendarContainer searchParams={searchParams} />
        {/* Announcements in sidebar for visibility across roles */}
        <div className="bg-white p-4 rounded-lg shadow-sm border"><Announcements /></div>
      </div>
    </div>
  );
};

export default AccueilPage;
