import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const SESSION_COOKIE = "geox_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AuthenticatedUser = {
  id: string;
  username: string;
  role: string;
  teacherId?: string | null;
  studentId?: string | null;
  parentId?: string | null;
  adminId?: string | null;
  staffId?: number | null;
};

export type CurrentUserProfile = AuthenticatedUser & {
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
};

function getTokenFromCookies() {
  return cookies().get(SESSION_COOKIE)?.value || null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = getTokenFromCookies();
  if (!token) return null;

  const session = await prisma.appSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.appSession.delete({ where: { token } });
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  const { user } = session;
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    teacherId: user.teacherId,
    studentId: user.studentId,
    parentId: user.parentId,
    adminId: user.adminId,
    staffId: user.staffId,
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.appSession.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroyCurrentSession() {
  const token = getTokenFromCookies();
  if (token) {
    await prisma.appSession.deleteMany({ where: { token } });
  }
  cookies().delete(SESSION_COOKIE);
}

export async function verifyCredentials(username: string, password: string) {
  const user = await prisma.appUser.findUnique({ where: { username } });
  if (!user) return null;
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return null;
  return user;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  let displayName = user.username;
  let email: string | null = null;
  let avatarUrl: string | null = null;

  if (user.teacherId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: user.teacherId },
      select: { name: true, surname: true, email: true, img: true },
    });
    if (teacher) {
      displayName = `${teacher.name} ${teacher.surname}`.trim();
      email = teacher.email || null;
      avatarUrl = teacher.img || null;
    }
  } else if (user.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: user.studentId },
      select: { name: true, surname: true, email: true, img: true },
    });
    if (student) {
      displayName = `${student.name} ${student.surname}`.trim();
      email = student.email || null;
      avatarUrl = student.img || null;
    }
  } else if (user.parentId) {
    const parent = await prisma.parent.findUnique({
      where: { id: user.parentId },
      select: { name: true, surname: true, email: true },
    });
    if (parent) {
      displayName = `${parent.name} ${parent.surname}`.trim();
      email = parent.email || null;
    }
  } else if (user.staffId) {
    const staff = await prisma.staffUser.findUnique({
      where: { id: user.staffId },
      select: { name: true, surname: true, email: true, img: true },
    });
    if (staff) {
      displayName = `${staff.name} ${staff.surname}`.trim();
      email = staff.email || null;
      avatarUrl = staff.img || null;
    }
  } else if (user.adminId) {
    const admin = await prisma.admin.findUnique({
      where: { id: user.adminId },
      select: { username: true },
    });
    if (admin?.username) {
      displayName = admin.username;
    }
  }

  return {
    ...user,
    displayName,
    email,
    avatarUrl,
  };
}

