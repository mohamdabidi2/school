import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { "Content-Type": "application/json" } });

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Corps de requête invalide" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const subject = (body.subject || "").toString().trim();
    const content = (body.content || "").toString().trim();
    const recipientId = (body.recipientId || "").toString().trim();

    if (!recipientId) return new Response(JSON.stringify({ error: "Destinataire requis" }), { status: 400, headers: { "Content-Type": "application/json" } });
    if (!subject) return new Response(JSON.stringify({ error: "Objet requis" }), { status: 400, headers: { "Content-Type": "application/json" } });
    if (!content) return new Response(JSON.stringify({ error: "Message requis" }), { status: 400, headers: { "Content-Type": "application/json" } });

    await prisma.message.create({ data: { subject, content, recipientId, senderId: userId } });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("send-message error:", e);
    const msg = typeof e?.message === 'string' ? e.message : 'Erreur serveur';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


