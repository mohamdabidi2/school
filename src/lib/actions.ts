"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  AssignmentSchema,
  ResultSchema,
  AttendanceSchema,
  LessonSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AnnouncementSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "./auth";
import type { StaffRole } from "@prisma/client";

const STAFF_ROLE_MAP: Record<"finance" | "administration" | "administrateur" | "directeur", StaffRole> = {
  finance: "FINANCE",
  administration: "ADMINISTRATION",
  administrateur: "ADMINISTRATEUR",
  directeur: "DIRECTEUR",
};
type CurrentState = { success: boolean; error: boolean };
// Messaging Actions
export const sendMessage = async (
  currentState: CurrentState,
  data: { subject: string; content: string; recipientId: string; senderId: string }
) => {
  try {
    await prisma.message.create({
      data: {
        subject: data.subject,
        content: data.content,
        recipientId: data.recipientId,
        senderId: data.senderId,
      }
    });
    // revalidatePath('/list/messages');
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const markMessageRead = async (
  currentState: CurrentState,
  data: { id: number }
) => {
  try {
    await prisma.message.update({ where: { id: data.id }, data: { read: true } });
    // revalidatePath('/list/messages');
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteMessage = async (
  currentState: CurrentState,
  data: { id: number }
) => {
  try {
    await prisma.message.delete({ where: { id: data.id } });
    // revalidatePath('/list/messages');
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};
export const createParent = async (
  currentState: CurrentState,
  data: import("./formValidationSchemas").ParentSchema
) => {
  try {
    if (!data.password || data.password === "") {
      return { success: false, error: true, message: "Le mot de passe est requis pour créer un compte !" };
    }

    const parentId = uuidv4();
    const passwordHash = await hashPassword(data.password);

    await prisma.$transaction(async (tx) => {
      await tx.parent.create({
        data: {
          id: parentId,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone,
          address: data.address,
          createdAt: data.createdAt || undefined,
        },
      });

      await tx.appUser.create({
        data: {
          id: parentId,
          username: data.username,
          passwordHash,
          role: "parent",
          parentId,
        },
      });
    });
    // revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: import("./formValidationSchemas").ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const passwordHash =
      data.password && data.password !== "" ? await hashPassword(data.password) : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.parent.update({
        where: {
          id: data.id,
        },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone,
          address: data.address,
        },
      });

      await tx.appUser.updateMany({
        where: { parentId: data.id },
        data: {
          username: data.username,
          ...(passwordHash ? { passwordHash } : {}),
          role: "parent",
        },
      });
    });
    // revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.$transaction([
      prisma.appUser.deleteMany({ where: { parentId: id } }),
      prisma.parent.delete({
        where: {
          id,
        },
      }),
    ]);
    // revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    // Ensure a valid gradeId exists. If the provided gradeId does not correspond
    // to an existing Grade row, try to resolve by level (1..6), otherwise create it.
    let targetGradeId = data.gradeId;
    const existingById = await prisma.grade.findUnique({ where: { id: data.gradeId } });
    if (!existingById) {
      const byLevel = await prisma.grade.findFirst({ where: { level: data.gradeId } });
      if (byLevel) {
        targetGradeId = byLevel.id;
      } else {
        const created = await prisma.grade.create({ data: { level: data.gradeId } });
        targetGradeId = created.id;
      }
    }

    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: targetGradeId,
        supervisorId: data.supervisorId || null,
        ...(data.instructorIds && data.instructorIds.length
          ? { teachers: { connect: data.instructorIds.map((id) => ({ id })) } }
          : {}),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: { id: data.id! },
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId || null,
        ...(data.instructorIds
          ? { teachers: { set: data.instructorIds.map((id) => ({ id })) } }
          : {}),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    if (!data.password || data.password === "") {
      return { success: false, error: true, message: "Le mot de passe est requis !" };
    }

    const teacherId = data.id || uuidv4();
    const passwordHash = await hashPassword(data.password);

    await prisma.$transaction(async (tx) => {
      await tx.teacher.create({
        data: {
          id: teacherId,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          sex: data.sex,
          birthday: data.birthday,
          subjects: {
            connect: data.subjects?.map((subjectId: string) => ({
              id: parseInt(subjectId),
            })),
          },
        },
      });

      await tx.appUser.create({
        data: {
          id: teacherId,
          username: data.username,
          passwordHash,
          role: "teacher",
          teacherId,
        },
      });
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const passwordHash =
      data.password && data.password !== "" ? await hashPassword(data.password) : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.teacher.update({
        where: {
          id: data.id,
        },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          sex: data.sex,
          birthday: data.birthday,
          subjects: {
            set: data.subjects?.map((subjectId: string) => ({
              id: parseInt(subjectId),
            })),
          },
        },
      });

      await tx.appUser.update({
        where: { id: data.id },
        data: {
          username: data.username,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.$transaction([
      prisma.appUser.deleteMany({ where: { teacherId: id } }),
      prisma.teacher.delete({
        where: {
          id,
        },
      }),
    ]);

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    if (!data.password || data.password === "") {
      return { success: false, error: true, message: "Le mot de passe est requis !" };
    }

    const studentId = data.id || uuidv4();
    const passwordHash = await hashPassword(data.password);

    await prisma.$transaction(async (tx) => {
      await tx.student.create({
        data: {
          id: studentId,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          sex: data.sex,
          birthday: data.birthday,
          gradeId: data.gradeId,
          classId: data.classId,
          parentId: data.parentId,
          ...(data.paymentType && { paymentType: data.paymentType as any }),
          ...(data.totalAmount !== undefined && { totalAmount: Number(data.totalAmount) }),
          ...(data.installmentType && { installmentType: data.installmentType as any }),
        },
      });

      await tx.appUser.create({
        data: {
          id: studentId,
          username: data.username,
          passwordHash,
          role: "student",
          studentId,
        },
      });
    });

    // Do not auto-create payments on student creation; only store payment configuration

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const passwordHash =
      data.password && data.password !== "" ? await hashPassword(data.password) : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: {
          id: data.id,
        },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address,
          img: data.img || null,
          sex: data.sex,
          birthday: data.birthday,
          gradeId: data.gradeId,
          classId: data.classId,
          parentId: data.parentId,
          ...(data.paymentType && { paymentType: data.paymentType as any }),
          ...(data.totalAmount !== undefined && { totalAmount: Number(data.totalAmount) }),
          ...(data.installmentType && { installmentType: data.installmentType as any }),
        },
      });

      await tx.appUser.update({
        where: { id: data.id },
        data: {
          username: data.username,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // Remove dependent records first to satisfy FK constraints
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { studentId: id } }),
      prisma.result.deleteMany({ where: { studentId: id } }),
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      prisma.student.delete({ where: { id } }),
      prisma.appUser.deleteMany({ where: { studentId: id } }),
    ]);

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    let lessonId = (data as any).lessonId as number | undefined;
    const subjectId = (data as any).subjectId as number | undefined;
    const classId = (data as any).classId as number | undefined;

    // Try to find existing lesson by subject + class
    if (!lessonId && subjectId && classId) {
      const found = await prisma.lesson.findFirst({
        where: { subjectId, classId },
        select: { id: true },
      });
      if (found) lessonId = found.id;
    }

    // If still none, auto-create a minimal lesson so exams can exist without prior lesson setup
    if (!lessonId) {
      if (!subjectId || !classId) {
        return { success: false, error: true, message: "Sélectionnez une matière et une classe valides." } as any;
      }

      const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true, name: true, teachers: { select: { id: true } } } });
      const klass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true, supervisorId: true, teachers: { select: { id: true } } } });

      if (!subject || !klass) {
        return { success: false, error: true, message: "Matière ou classe introuvable." } as any;
      }

      // Determine teacher: use provided teacherId if valid, else intersection
      let teacherId: string | undefined = (data as any).teacherId as string | undefined;
      const subjectTeacherIds = new Set((subject.teachers || []).map((t) => t.id));
      const classTeacherIds = new Set((klass.teachers || []).map((t) => t.id));
      // Avoid spread on Set for older TS/target compatibility
      const intersection = Array.from(subjectTeacherIds).find((id) => classTeacherIds.has(id));
      if (!teacherId && intersection) teacherId = intersection;

      // Strict requirement: must have a teacher who teaches both the subject and the class
      if (!teacherId) {
        return { success: false, error: true, message: "Aucun enseignant n'enseigne cette matière dans cette classe." } as any;
      }

      // Map JS weekday (0-6) to Prisma Day enum (MONDAY..FRIDAY). Use exam startTime to infer.
      const jsDay = (data as any).startTime ? new Date(data.startTime as any).getDay() : 1;
      const dayEnum = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][jsDay];
      const normalizedDay = (dayEnum === "SUNDAY" || dayEnum === "SATURDAY") ? "MONDAY" : dayEnum;

      const createdLesson = await prisma.lesson.create({
        data: {
          name: `${subject.name} - Session`,
          day: normalizedDay as any,
          startTime: data.startTime as any,
          endTime: data.endTime as any,
          subjectId,
          classId,
          teacherId,
        },
        select: { id: true },
      });
      lessonId = createdLesson.id;
    }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    // Ensure we have a lessonId; if not provided, try to resolve by subject/class or create one
    let lessonId = data.lessonId as number | undefined;
    const subjectId = (data as any).subjectId as number | undefined;
    const classId = (data as any).classId as number | undefined;

    if (!lessonId && subjectId && classId) {
      const found = await prisma.lesson.findFirst({
        where: { subjectId, classId },
        select: { id: true },
      });
      if (found) lessonId = found.id;
    }

    if (!lessonId && subjectId && classId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true, name: true, teachers: { select: { id: true } } } });
      const klass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true, supervisorId: true, teachers: { select: { id: true } } } });
      if (subject && klass) {
        let teacherId: string | undefined;
        const subjectTeacherIds = new Set((subject.teachers || []).map((t) => t.id));
        const classTeacherIds = new Set((klass.teachers || []).map((t) => t.id));
        const intersection = Array.from(subjectTeacherIds).find((id) => classTeacherIds.has(id));
        if (intersection) teacherId = intersection;
        if (teacherId) {
          const jsDay = (data as any).startTime ? new Date(data.startTime as any).getDay() : 1;
          const dayEnum = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][jsDay];
          const normalizedDay = (dayEnum === "SUNDAY" || dayEnum === "SATURDAY") ? "MONDAY" : dayEnum;
          const createdLesson = await prisma.lesson.create({
            data: {
              name: `${subject.name} - Session`,
              day: normalizedDay as any,
              startTime: data.startTime,
              endTime: data.endTime,
              subjectId,
              classId,
              teacherId,
            },
            select: { id: true },
          });
          lessonId = createdLesson.id;
        } else {
          return { success: false, error: true, message: "Aucun enseignant n'enseigne cette matière dans cette classe." } as any;
        }
      }
    }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(lessonId ? { lessonId } : {}),
      },
    });

    // Sync lesson timing/day to match the exam duration
    const finalLessonId = lessonId ?? data.lessonId;
    if (finalLessonId) {
      const jsDay = (data as any).startTime ? new Date(data.startTime as any).getDay() : 1;
      const dayEnum = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][jsDay];
      const normalizedDay = (dayEnum === "SUNDAY" || dayEnum === "SATURDAY") ? "MONDAY" : dayEnum;
      await prisma.lesson.update({
        where: { id: finalLessonId },
        data: {
          day: normalizedDay as any,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });
    }

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Assignment Actions
export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    let lessonId = data.lessonId as number | undefined;
    const subjectId = (data as any).subjectId as number | undefined;
    const classId = (data as any).classId as number | undefined;

    if (!lessonId && subjectId && classId) {
      const found = await prisma.lesson.findFirst({ where: { subjectId, classId }, select: { id: true } });
      if (found) lessonId = found.id;
    }

    if (!lessonId) {
      if (!subjectId || !classId) {
        return { success: false, error: true, message: "Sélectionnez une matière et une classe valides." } as any;
      }
      const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true, name: true, teachers: { select: { id: true } } } });
      const klass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true, supervisorId: true, teachers: { select: { id: true } } } });
      if (!subject || !klass) {
        return { success: false, error: true, message: "Matière ou classe introuvable." } as any;
      }

      let teacherId: string | undefined = (data as any).teacherId as string | undefined;
      const subjectTeacherIds = new Set((subject.teachers || []).map((t) => t.id));
      const classTeacherIds = new Set((klass.teachers || []).map((t) => t.id));
      const intersection = Array.from(subjectTeacherIds).find((id) => classTeacherIds.has(id));
      if (!teacherId && intersection) teacherId = intersection;
      if (!teacherId) {
        return { success: false, error: true, message: "Aucun enseignant n'enseigne cette matière dans cette classe." } as any;
      }

      const jsDay = (data as any).startDate ? new Date(data.startDate as any).getDay() : 1;
      const dayEnum = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][jsDay];
      const normalizedDay = (dayEnum === "SUNDAY" || dayEnum === "SATURDAY") ? "MONDAY" : dayEnum;
      const createdLesson = await prisma.lesson.create({
        data: {
          name: `${subject.name} - Session`,
          day: normalizedDay as any,
          startTime: data.startDate as any,
          endTime: data.dueDate as any,
          subjectId,
          classId,
          teacherId,
        },
        select: { id: true },
      });
      lessonId = createdLesson.id;
    }

    await prisma.assignment.create({
      data: {
        title: data.title,
        content: data.content || null,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: lessonId!,
      },
    });
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    let lessonId = data.lessonId as number | undefined;
    const subjectId = (data as any).subjectId as number | undefined;
    const classId = (data as any).classId as number | undefined;

    if (!lessonId && subjectId && classId) {
      const found = await prisma.lesson.findFirst({ where: { subjectId, classId }, select: { id: true } });
      if (found) lessonId = found.id;
    }
    if (!lessonId && subjectId && classId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true, name: true, teachers: { select: { id: true } } } });
      const klass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true, supervisorId: true, teachers: { select: { id: true } } } });
      if (subject && klass) {
        let teacherId: string | undefined;
        const subjectTeacherIds = new Set((subject.teachers || []).map((t) => t.id));
        const classTeacherIds = new Set((klass.teachers || []).map((t) => t.id));
        const intersection = Array.from(subjectTeacherIds).find((id) => classTeacherIds.has(id));
        if (intersection) teacherId = intersection;
        if (teacherId) {
          const jsDay = (data as any).startDate ? new Date(data.startDate as any).getDay() : 1;
          const dayEnum = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][jsDay];
          const normalizedDay = (dayEnum === "SUNDAY" || dayEnum === "SATURDAY") ? "MONDAY" : dayEnum;
          const createdLesson = await prisma.lesson.create({
            data: {
              name: `${subject.name} - Session`,
              day: normalizedDay as any,
              startTime: data.startDate as any,
              endTime: data.dueDate as any,
              subjectId,
              classId,
              teacherId,
            },
            select: { id: true },
          });
          lessonId = createdLesson.id;
        } else {
          return { success: false, error: true, message: "Aucun enseignant n'enseigne cette matière dans cette classe." } as any;
        }
      }
    }

    await prisma.assignment.update({
      where: { id: data.id! },
      data: {
        title: data.title,
        content: data.content || null,
        startDate: data.startDate,
        dueDate: data.dueDate,
        ...(lessonId ? { lessonId } : {}),
      },
    });

    // Sync lesson timing/day
    const finalLessonId = lessonId ?? data.lessonId;
    if (finalLessonId) {
      const jsDay = (data as any).startDate ? new Date(data.startDate as any).getDay() : 1;
      const dayEnum = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][jsDay];
      const normalizedDay = (dayEnum === "SUNDAY" || dayEnum === "SATURDAY") ? "MONDAY" : dayEnum;
      await prisma.lesson.update({
        where: { id: finalLessonId },
        data: {
          day: normalizedDay as any,
          startTime: data.startDate as any,
          endTime: data.dueDate as any,
        },
      });
    }
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({ where: { id: parseInt(id) } });
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Result Actions
export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId ?? null,
        assignmentId: data.assignmentId ?? null,
      },
    });
    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.update({
      where: { id: data.id! },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId ?? null,
        assignmentId: data.assignmentId ?? null,
      },
    });
    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({ where: { id: parseInt(id) } });
    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Lesson Actions
export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day as any,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });
    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.update({
      where: { id: data.id! },
      data: {
        name: data.name,
        day: data.day as any,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });
    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({ where: { id: parseInt(id) } });
    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Announcement Actions
export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });
    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: { id: data.id! },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });
    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Payment Actions
export const createPayment = async (
  currentState: CurrentState,
  data: { studentId: string; amount: number; trancheNumber?: number }
) => {
  try {
    // Vérifier si l'étudiant a un paiement complet et s'il essaie d'ajouter un autre paiement
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: { payments: true }
    });

    if (student?.paymentType === 'complete' && student.payments.length > 0) {
      return { success: false, error: true, message: "Un seul paiement autorisé pour ce type de paiement" };
    }

    // Calculate due date for installment payments
    let dueDate = null;
    if (student?.paymentType === 'tranche' && student.installmentType && data.trancheNumber) {
      const now = new Date();
      if (student.installmentType === 'MONTHLY') {
        dueDate = new Date(now.getTime() + (data.trancheNumber * 30 * 24 * 60 * 60 * 1000));
      } else if (student.installmentType === 'TRIMESTER') {
        dueDate = new Date(now.getTime() + (data.trancheNumber * 90 * 24 * 60 * 60 * 1000));
      }
    }

    await prisma.payment.create({
      data: {
        amount: data.amount,
        trancheNumber: data.trancheNumber || null,
        studentId: data.studentId,
        dueDate: dueDate,
        isOverdue: false,
        paid: true
      },
    });

    revalidatePath("/list/students");
    revalidatePath("/list/payments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const getStudentPayments = async (studentId: string) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    });
    return payments;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const updateStudentPaymentType = async (
  currentState: CurrentState,
  data: { studentId: string; paymentType: 'complete' | 'tranche' }
) => {
  try {
    await prisma.student.update({
      where: { id: data.studentId },
      data: { paymentType: data.paymentType }
    });

    revalidatePath("/list/students");
    revalidatePath("/list/payments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudentPaymentInfo = async (
  currentState: CurrentState,
  data: { 
    studentId: string; 
    paymentType: 'complete' | 'tranche';
    totalAmount?: number | null;
    installmentType?: 'TRIMESTER' | 'MONTHLY' | null;
    installmentCount?: number | null;
    firstInstallmentAmount?: number | null;
  }
) => {
  try {
    await prisma.student.update({
      where: { id: data.studentId },
      data: { 
        paymentType: data.paymentType,
        totalAmount: data.totalAmount,
        installmentType: data.installmentType,
        installmentCount: data.installmentCount,
        firstInstallmentAmount: data.firstInstallmentAmount
      }
    });

    revalidatePath("/list/students");
    revalidatePath("/list/payments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const getOverduePayments = async () => {
  try {
    const now = new Date();
    const overduePayments = await prisma.payment.findMany({
      where: {
        paid: false,
        dueDate: { lt: now },
        isOverdue: false
      },
      include: {
        student: {
          include: {
            class: true
          }
        }
      }
    });

    // Update overdue status
    for (const payment of overduePayments) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { isOverdue: true }
      });
    }

    return overduePayments;
  } catch (err) {
    console.log(err);
    return [];
  }
};

// Expense Actions
export const createExpense = async (
  currentState: CurrentState,
  data: { title: string; description?: string; amount: number; createdBy: string }
) => {
  try {
    await prisma.expense.create({
      data: {
        title: data.title,
        description: data.description || null,
        amount: data.amount,
        createdBy: data.createdBy,
      },
    });

    revalidatePath("/list/depenses");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const getAllExpenses = async () => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    return expenses;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const updateExpenseStatus = async (
  currentState: CurrentState,
  data: { expenseId: number; status: 'PENDING' | 'APPROVED' | 'REJECTED' }
) => {
  try {
    await prisma.expense.update({
      where: { id: data.expenseId },
      data: { status: data.status }
    });

    revalidatePath("/validation");
    revalidatePath("/list/depenses");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Attendance Actions
export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.create({
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });
    // revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.update({
      where: { id: data.id! },
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });
    // revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.attendance.delete({ where: { id: parseInt(id) } });
    // revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Teacher Absence Actions
export const createTeacherAbsence = async (
  currentState: CurrentState,
  data: { date: Date; reason?: string | null; teacherId: string }
) => {
  try {
    await prisma.teacherAbsence.create({
      data: {
        date: data.date,
        reason: data.reason || null,
        teacherId: data.teacherId,
      },
    });
    // revalidatePath("/list/absences");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateTeacherAbsence = async (
  currentState: CurrentState,
  data: { id: number; date: Date; reason?: string | null; teacherId: string }
) => {
  try {
    await prisma.teacherAbsence.update({
      where: { id: data.id },
      data: {
        date: data.date,
        reason: data.reason || null,
        teacherId: data.teacherId,
      },
    });
    // revalidatePath("/list/absences");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteTeacherAbsence = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.teacherAbsence.delete({ where: { id: parseInt(id) } });
    // revalidatePath("/list/absences");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Salary Payment Actions
export const createSalaryPayment = async (
  currentState: CurrentState,
  data: { amount: number; date?: Date; note?: string | null; teacherId: string }
) => {
  try {
    await prisma.salaryPayment.create({
      data: {
        amount: data.amount,
        date: data.date || new Date(),
        note: data.note || null,
        teacherId: data.teacherId,
      },
    });
    // revalidatePath("/list/salaries");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateSalaryPayment = async (
  currentState: CurrentState,
  data: { id: number; amount: number; date?: Date; note?: string | null; teacherId: string }
) => {
  try {
    await prisma.salaryPayment.update({
      where: { id: data.id },
      data: {
        amount: data.amount,
        date: data.date || new Date(),
        note: data.note || null,
        teacherId: data.teacherId,
      },
    });
    // revalidatePath("/list/salaries");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteSalaryPayment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.salaryPayment.delete({ where: { id: parseInt(id) } });
    // revalidatePath("/list/salaries");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Staff (Finance/Admin) user creation
export const createStaffUser = async (
  currentState: CurrentState,
  data: { username: string; password: string; role: 'finance' | 'administration' | 'administrateur' | 'directeur'; name: string; surname: string; email?: string; phone?: string; img?: string; salary?: number }
) => {
  try {
    if (!data.password || data.password === "") {
      return { success: false, error: true, message: "Le mot de passe est requis !" };
    }

    const roleEnum = STAFF_ROLE_MAP[data.role];
    const passwordHash = await hashPassword(data.password);

    const staff = await prisma.staffUser.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        img: data.img || null,
        salary: data.salary ?? null,
        role: roleEnum,
      },
    });

    await prisma.appUser.create({
      data: {
        username: data.username,
        passwordHash,
        role: data.role,
        staffId: staff.id,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateStaffUser = async (
  currentState: CurrentState,
  data: { id: number; username: string; password?: string; role: 'finance' | 'administration' | 'administrateur' | 'directeur'; name: string; surname: string; email?: string | null; phone?: string | null; img?: string | null; salary?: number | null }
) => {
  try {
    const roleEnum = STAFF_ROLE_MAP[data.role];
    const passwordHash = data.password && data.password !== "" ? await hashPassword(data.password) : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.staffUser.update({
        where: { id: data.id },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          img: data.img || null,
          salary: data.salary ?? null,
          role: roleEnum,
        },
      });

      await tx.appUser.updateMany({
        where: { staffId: data.id },
        data: {
          username: data.username,
          role: data.role,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteStaffUser = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get('id') as string;
  try {
    const numericId = parseInt(id);
    await prisma.$transaction([
      prisma.appUser.deleteMany({ where: { staffId: numericId } }),
      prisma.staffUser.delete({ where: { id: numericId } }),
    ]);
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

// Event Actions
export const createEvent = async (
  currentState: CurrentState,
  data: { title: string; description: string; startTime: Date; endTime: Date; classId?: number | null }
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
      },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: { id: number; title: string; description: string; startTime: Date; endTime: Date; classId?: number | null }
) => {
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
      },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: { id: number }
) => {
  try {
    await prisma.event.delete({
      where: { id: data.id },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: err?.message || 'Erreur serveur' } as any;
  }
};
