import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession, verifyCredentials } from "@/lib/auth";
import { getRoleRedirect } from "@/lib/getRoleRedirect";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur et le mot de passe sont requis." },
        { status: 400 }
      );
    }

    const user = await verifyCredentials(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      role: user.role,
      redirectTo: getRoleRedirect(user.role),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

