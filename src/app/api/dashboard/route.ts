import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// This route uses auth and other dynamic server features; ensure it's treated as dynamic
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.role;

    // Fetch data based on role
    switch (role) {
      case "admin":
      case "director":
      case "school-manager":
        return await getAdminDashboardData();
      case "administration":
        return await getAdministrationDashboardData();
      case "teacher":
        return await getTeacherDashboardData(user.teacherId || user.id);
      case "student":
        return await getStudentDashboardData(user.studentId || user.id);
      case "parent":
        return await getParentDashboardData(user.parentId || user.id);
      case "finance":
        return await getFinanceDashboardData();
      default:
        return NextResponse.json({ role, data: {} });
    }
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function getAdminDashboardData() {
  // Return empty - AdminStatistics handles its own data
  return NextResponse.json({ role: "admin", data: {} });
}

async function getAdministrationDashboardData() {
  try {
    const [totalStudents, totalTeachers, totalParents, totalClasses, totalSubjects] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.class.count(),
      prisma.subject.count(),
    ]);

    return NextResponse.json({
      role: "administration",
      data: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClasses,
        totalSubjects,
      },
    });
  } catch (error: any) {
    console.error("Administration dashboard error:", error);
    return NextResponse.json({ role: "administration", data: {} });
  }
}

async function getTeacherDashboardData(teacherId: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        classes: {
          include: {
            students: true,
            lessons: true,
          },
        },
        lessons: {
          include: {
            class: {
              include: {
                students: true,
              },
            },
            subject: true,
            assignments: {
              include: {
                results: true,
              },
            },
            attendances: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ role: "teacher", data: {} });
    }

    // Calculate statistics
    const classesCount = teacher.classes.length;
    const studentsCount = teacher.classes.reduce((sum, cls) => sum + cls.students.length, 0);
    const assignments = teacher.lessons.flatMap(l => l.assignments);
    const assignmentsCount = assignments.length;
    
    // Calculate pending assignments (assignments with incomplete results)
    let pendingAssignments = 0;
    for (const assignment of assignments) {
      const lesson = teacher.lessons.find(l => l.id === assignment.lessonId);
      if (lesson && lesson.class) {
        const classStudentCount = lesson.class.students.length;
        const completedCount = assignment.results.length;
        if (new Date(assignment.dueDate) >= new Date() && completedCount < classStudentCount) {
          pendingAssignments++;
        }
      }
    }

    // Calculate attendance rate
    const allAttendances = teacher.lessons.flatMap(l => l.attendances);
    const presentCount = allAttendances.filter(a => a.present).length;
    const attendanceRate = allAttendances.length > 0 
      ? Math.round((presentCount / allAttendances.length) * 100) 
      : 0;

    // Get classes with student counts
    const classesList = teacher.classes.map(cls => {
      const classLessons = cls.lessons.filter(l => l.teacherId === teacherId);
      return {
        name: cls.name,
        studentCount: cls.students.length,
        lessonCount: classLessons.length,
        hoursPerWeek: classLessons.length, // Simplified - assuming 1 hour per lesson
      };
    });

    // Get recent assignments
    const recentAssignments = assignments
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, 5)
      .map(a => ({
        title: a.title,
        class: teacher.lessons.find(l => l.id === a.lessonId)?.class.name || "",
        dueDate: a.dueDate.toISOString().split('T')[0],
        completedCount: a.results.length,
        totalCount: teacher.lessons.find(l => l.id === a.lessonId)?.class.students.length || 0,
      }));

    // Get schedule
    const schedule = getScheduleForTeacher(teacher.lessons);

    return NextResponse.json({
      role: "teacher",
      data: {
        classesCount,
        studentsCount,
        assignmentsCount,
        pendingAssignments,
        attendanceRate,
        classesList,
        recentAssignments,
        schedule,
      },
    });
  } catch (error: any) {
    console.error("Teacher dashboard error:", error);
    return NextResponse.json({ role: "teacher", data: {} });
  }
}

async function getStudentDashboardData(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            lessons: {
              include: {
                subject: true,
                teacher: true,
                assignments: {
                  include: { results: { where: { studentId } } },
                },
                exams: {
                  include: { results: { where: { studentId } } },
                },
              },
            },
          },
        },
        results: {
          include: {
            exam: { include: { lesson: { include: { subject: true } } } },
            assignment: { include: { lesson: { include: { subject: true } } } },
          },
        },
        attendances: {
          include: { lesson: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ role: "student", data: {} });
    }

    // Calculate average grade
    const allResults = student.results.filter(r => r.score !== null);
    const averageGrade = allResults.length > 0
      ? (allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length / 20 * 100).toFixed(1)
      : "0";

    // Get subjects count
    const subjectsCount = new Set(
      student.class.lessons.map(l => l.subject.id)
    ).size;

    // Get assignments and exams counts
    const assignments = student.class.lessons.flatMap(l => l.assignments);
    const assignmentsCount = assignments.length;
    const overdueAssignments = assignments.filter(a => 
      new Date(a.dueDate) < new Date() && !a.results.some(r => r.studentId === studentId)
    ).length;

    const exams = student.class.lessons.flatMap(l => l.exams);
    const upcomingExams = exams.filter(e => new Date(e.startTime) > new Date()).length;

    // Get grades by subject
    const gradesBySubject = calculateGradesBySubject(student.results);

    // Get assignments due
    const assignmentsDue = assignments
      .filter(a => new Date(a.dueDate) >= new Date() && !a.results.some(r => r.studentId === studentId))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
      .map(a => {
        const lessonSubject = student.class.lessons.find(l => l.id === a.lessonId)?.subject.name || "";
        return {
          title: a.title,
          subject: lessonSubject,
          dueDate: a.dueDate.toISOString().split('T')[0],
          isOverdue: new Date(a.dueDate) < new Date(),
        };
      });

    // Get schedule
    const schedule = getScheduleForClass(student.class.lessons);

    return NextResponse.json({
      role: "student",
      data: {
        averageGrade,
        subjectsCount,
        assignmentsCount,
        overdueAssignments,
        upcomingExams,
        className: student.class.name,
        gradesBySubject,
        assignmentsDue,
        schedule,
      },
    });
  } catch (error: any) {
    console.error("Student dashboard error:", error);
    return NextResponse.json({ role: "student", data: {} });
  }
}

async function getParentDashboardData(parentId: string) {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        students: {
          include: {
            class: true,
            results: {
              include: {
                exam: { include: { lesson: { include: { subject: true } } } },
                assignment: { include: { lesson: { include: { subject: true } } } },
              },
            },
            payments: {
              where: { paid: true },
            },
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ role: "parent", data: {} });
    }

    const childrenCount = parent.students.length;

    // Calculate overall average
    const allResults = parent.students.flatMap(s => s.results);
    const averageGrade = allResults.length > 0
      ? (allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length / 20 * 100).toFixed(1)
      : "0";

    // Get unread messages count (simplified - you may need to adjust based on your Message model)
    const messagesCount = 0; // TODO: Implement based on your Message model
    const unreadMessagesCount = 0; // TODO: Implement

    // Check payment status
    const totalPayments = parent.students.reduce((sum, s) => 
      sum + s.payments.reduce((pSum, p) => pSum + p.amount, 0), 0
    );
    const isPaymentUpToDate = true; // TODO: Implement logic to check if payments are up to date

    // Get children progress
    const childrenProgress = parent.students.map(student => {
      const studentResults = student.results;
      const studentAverage = studentResults.length > 0
        ? (studentResults.reduce((sum, r) => sum + r.score, 0) / studentResults.length / 20 * 100).toFixed(1)
        : "0";

      // Get grades by subject for this student
      const gradesBySubject = calculateGradesBySubject(studentResults);

      return {
        name: `${student.name} ${student.surname}`,
        className: student.class.name,
        average: studentAverage,
        gradesBySubject,
      };
    });

    return NextResponse.json({
      role: "parent",
      data: {
        childrenCount,
        averageGrade,
        messagesCount,
        unreadMessagesCount,
        isPaymentUpToDate,
        childrenProgress,
      },
    });
  } catch (error: any) {
    console.error("Parent dashboard error:", error);
    return NextResponse.json({ role: "parent", data: {} });
  }
}

async function getFinanceDashboardData() {
  try {
    // Get current month's date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Payments this month
    const paymentsThisMonth = await prisma.payment.aggregate({
      where: {
        date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        paid: true,
      },
      _sum: { amount: true },
      _count: true,
    });

    // Expenses this month
    const expensesThisMonth = await prisma.expense.aggregate({
      where: {
        date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        status: "APPROVED",
      },
      _sum: { amount: true },
      _count: true,
    });

    // Total salaries
    const salaries = await prisma.salaryPayment.aggregate({
      where: {
        date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
      _sum: { amount: true },
    });

    // Payment collection rate
    const totalStudents = await prisma.student.count();
    const studentsWithPayments = await prisma.student.count({
      where: {
        payments: {
          some: {
            paid: true,
            date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
          },
        },
      },
    });
    const collectionRate = totalStudents > 0 
      ? Math.round((studentsWithPayments / totalStudents) * 100) 
      : 0;

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { paid: true },
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        student: {
          include: { class: true },
        },
      },
    });

    // Payment status summary
    const allPayments = await prisma.payment.findMany({
      where: { paid: true },
    });
    const overduePayments = await prisma.payment.count({
      where: { isOverdue: true, paid: false },
    });
    const unpaidPayments = await prisma.payment.count({
      where: { paid: false, isOverdue: false },
    });
    const paidPayments = await prisma.payment.count({
      where: { paid: true },
    });
    const totalPaymentCount = paidPayments + unpaidPayments + overduePayments;
    
    const paymentStatus = {
      paid: totalPaymentCount > 0 ? Math.round((paidPayments / totalPaymentCount) * 100) : 0,
      overdue: totalPaymentCount > 0 ? Math.round((overduePayments / totalPaymentCount) * 100) : 0,
      unpaid: totalPaymentCount > 0 ? Math.round((unpaidPayments / totalPaymentCount) * 100) : 0,
      paidCount: paidPayments,
      overdueCount: overduePayments,
      unpaidCount: unpaidPayments,
    };

    return NextResponse.json({
      role: "finance",
      data: {
        paymentsThisMonth: paymentsThisMonth._sum.amount || 0,
        expensesThisMonth: expensesThisMonth._sum.amount || 0,
        salariesThisMonth: salaries._sum.amount || 0,
        collectionRate,
        recentPayments: recentPayments.map(p => ({
          studentName: `${p.student.name} ${p.student.surname}`,
          className: p.student.class.name,
          amount: p.amount,
          date: p.date.toISOString().split('T')[0],
        })),
        paymentStatus,
      },
    });
  } catch (error: any) {
    console.error("Finance dashboard error:", error);
    return NextResponse.json({ role: "finance", data: {} });
  }
}

// Helper functions
function calculateHoursPerWeek(day: string, startTime: Date, endTime: Date): number {
  // Simplified - assumes each lesson is 1 hour
  // You may want to calculate actual duration
  return 1;
}

function getScheduleForTeacher(lessons: any[]) {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const schedule: any = {};

  days.forEach(day => {
    schedule[day] = lessons
      .filter(l => l.day === day)
      .map(l => ({
        className: l.class.name,
        subject: l.subject.name,
        startTime: l.startTime.toISOString(),
        endTime: l.endTime.toISOString(),
      }))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  return schedule;
}

function getScheduleForClass(lessons: any[]) {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const schedule: any = {};

  days.forEach(day => {
    schedule[day] = lessons
      .filter(l => l.day === day)
      .map(l => ({
        subject: l.subject.name,
        teacher: `${l.teacher.name} ${l.teacher.surname}`,
        startTime: l.startTime.toISOString(),
        endTime: l.endTime.toISOString(),
      }))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  return schedule;
}

function calculateGradesBySubject(results: any[]) {
  const subjectGrades: { [key: string]: { scores: number[]; average: number } } = {};

  results.forEach(result => {
    let subjectName = '';
    if (result.exam?.lesson?.subject) {
      subjectName = result.exam.lesson.subject.name;
    } else if (result.assignment?.lesson?.subject) {
      subjectName = result.assignment.lesson.subject.name;
    }

    if (subjectName) {
      if (!subjectGrades[subjectName]) {
        subjectGrades[subjectName] = { scores: [], average: 0 };
      }
      subjectGrades[subjectName].scores.push(result.score);
    }
  });

  return Object.entries(subjectGrades).map(([subject, data]) => ({
    subject,
    average: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1),
    teacher: '', // TODO: Get teacher name
    change: '+0.0', // TODO: Calculate change
  }));
}
