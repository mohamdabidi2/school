import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'ID requis' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    await prisma.message.updateMany({ where: { id: Number(id), recipientId: user.id }, data: { read: true } });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}


