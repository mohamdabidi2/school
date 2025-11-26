"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Msg = { id: number; subject: string; content: string; createdAt: string; read: boolean; senderId: string; recipientId: string, sender?: { img?: string|null; name?: string; surname?: string } | null };
type UserOpt = { id: string; label: string; role: string };

export default function MessagesPage() {
  const [tab, setTab] = useState<'all'|'compose'>('all');
  const [inbox, setInbox] = useState<Msg[]>([]);
  const [outbox, setOutbox] = useState<Msg[]>([]);
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [active, setActive] = useState<Msg | null>(null);
  const [thread, setThread] = useState<Msg[]>([]);
  const [replyText, setReplyText] = useState("");
  const [compose, setCompose] = useState({ recipientId: '', subject: '', content: '' });
  const [myId, setMyId] = useState<string | null>(null);

  const uniqueByPeer = (items: Msg[]) => {
    // Items sorted newest first; keep first per peer regardless of direction
    const seen = new Set<string>();
    const result: Msg[] = [];
    for (const m of items) {
      const peerId = (myId && m.senderId===myId) ? m.recipientId : m.senderId;
      const key = peerId || 'unknown';
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(m);
    }
    return result;
  };

  const getPeerLabel = (m: Msg) => {
    const peerId = (myId && m.senderId===myId) ? m.recipientId : m.senderId;
    const u = users.find(x => x.id === peerId);
    return u?.label || 'Conversation';
  };

  const timeAgo = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 10) return "à l'instant";
    if (sec < 60) return `il y a ${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `il y a ${min} min`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `il y a ${hrs} h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `il y a ${days} j`;
    const months = Math.floor(days / 30);
    if (months < 12) return `il y a ${months} mois`;
    const years = Math.floor(months / 12);
    return `il y a ${years} an${years > 1 ? 's' : ''}`;
  };

  const limitText = (text: string, max: number) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  const refresh = async () => {
    try {
      const [ibRes, obRes] = await Promise.all([
        fetch('/api/messages/inbox'),
        fetch('/api/messages/outbox'),
      ]);
      const ib = ibRes.ok ? await ibRes.json() : [];
      const ob = obRes.ok ? await obRes.json() : [];
      setInbox(ib); setOutbox(ob);
    } catch {
      setInbox([]); setOutbox([]);
    }
  };

  useEffect(() => {
    refresh();
    fetch('/api/users-min').then(r=>r.json()).then(setUsers);
    fetch('/api/me').then(r=>r.json()).then(d=>setMyId(d?.id || null)).catch(()=>setMyId(null));
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/actions/send-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(compose) });
    if (res.ok) { setCompose({ recipientId: '', subject: '', content: '' }); setTab('all'); refresh(); }
  };

  return (
    <div className="bg-white rounded-md m-0 md:m-4 h-[calc(100vh-2rem)] md:h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h1 className="text-lg font-semibold">Messages</h1>
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700" onClick={()=>setTab('compose')}>+ Nouveau</button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-full md:w-80 border-r flex flex-col min-h-0">
          <div className="p-3 sticky top-0 bg-white z-10 border-b shrink-0" />
          <div className="flex-1 min-h-0 overflow-y-auto">
            {uniqueByPeer([...inbox, ...outbox].sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())).map(m => (
              <div key={m.id} onClick={async()=>{
                setActive(m);
                if (myId && m.recipientId===myId && !m.read) { try { await fetch('/api/messages/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.id }) }); refresh(); } catch {} }
                const peerId = myId && m.senderId===myId ? m.recipientId : m.senderId;
                try {
                  const res = await fetch(`/api/messages/thread?peerId=${peerId}`);
                  const data = res.ok ? await res.json() : [];
                  setThread(data);
                } catch { setThread([]); }
              }} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${active?.id===m.id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <Image src="/noAvatar.png" alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate max-w-[180px] flex items-center gap-2">
                        {!m.read && myId && m.recipientId===myId && (<span className="inline-block w-2 h-2 rounded-full bg-blue-600" />)}
                        <span className="truncate">{getPeerLabel(m)}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 whitespace-nowrap">{timeAgo(m.createdAt)}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const isMe = !!myId && m.senderId===myId;
                        const senderName = isMe ? 'Vous' : (users.find(u=>u.id===m.senderId)?.label || 'Expéditeur');
                        return `${senderName}: ${limitText(m.content, 30)}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {uniqueByPeer([...inbox, ...outbox].sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())).length===0 && (<div className="p-3 text-sm text-gray-500">Aucun message</div>)}
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col p-0">
          {tab==='compose' ? (
            <form onSubmit={send} className="flex-1 flex flex-col p-4 gap-3 max-w-4xl">
              <div>
                <label className="text-xs text-gray-500">Destinataire</label>
                <select className="w-full ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" value={compose.recipientId} onChange={(e)=>setCompose({...compose, recipientId: e.target.value})} required>
                  <option value="">Sélectionner</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.label} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Objet</label>
                <input className="w-full ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" value={compose.subject} onChange={(e)=>setCompose({...compose, subject: e.target.value})} required />
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <label className="text-xs text-gray-500">Message</label>
                <div className="flex-1 min-h-0 border rounded-md bg-gray-50 p-3 overflow-auto text-sm text-gray-700">
                  <textarea
                    className="w-full h-full bg-transparent outline-none resize-none"
                    value={compose.content}
                    onChange={(e)=>setCompose({...compose, content: e.target.value})}
                    onKeyDown={(e)=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(e as any); } }}
                    placeholder={"Écrire un message...\n(Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"}
                    required
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Envoyer</button>
                </div>
              </div>
            </form>
          ) : active ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="p-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
                <div className="text-lg font-semibold truncate">{getPeerLabel(active)}</div>
                <div className="text-xs text-gray-500">{timeAgo(active.createdAt)}</div>
              </div>
              <div className="flex-1 min-h-0 overflow-auto p-4">
                <div className="max-w-3xl space-y-3">
                  {thread.map((tm) => (
                    <div key={tm.id} className={`flex items-end ${tm.senderId===active.senderId ? 'justify-start' : 'justify-end'}`}>
                      {tm.senderId===active.senderId && (
                        <Image src={tm.sender?.img || "/noAvatar.png"} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover mr-2" />
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 whitespace-pre-line break-words break-all leading-6 shadow-sm ${tm.senderId===active.senderId ? 'bg-gray-100 text-gray-900' : 'bg-blue-600 text-white'}`}>
                        <div className="text-[10px] opacity-80 mb-1">{timeAgo(tm.createdAt)}</div>
                        <div>{tm.content}</div>
                      </div>
                      {tm.senderId!==active.senderId && (
                        <Image src={tm.sender?.img || "/noAvatar.png"} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t">
                <form
                  onSubmit={async (e)=>{
                    e.preventDefault();
                    const recipientId = myId && active.senderId===myId ? active.recipientId : active.senderId;
                    const subject = active.subject?.startsWith('Re:') ? active.subject : `Re: ${active.subject}`;
                    if (!replyText.trim()) return;
                    const res = await fetch('/api/actions/send-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId, subject, content: replyText }) });
                    if (res.ok) {
                      setReplyText("");
                      setTab('all');
                      refresh();
                    }
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    className="flex-1 ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                    placeholder="Écrire une réponse..."
                    value={replyText}
                    onChange={(e)=>setReplyText(e.target.value)}
                    onKeyDown={(e)=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); (e.currentTarget.parentElement as HTMLFormElement)?.requestSubmit(); } }}
                    rows={3}
                  />
                  <button disabled={!replyText.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">Répondre</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-6 text-sm text-gray-500">Sélectionnez un message dans la liste pour l&apos;aperçu ou cliquez sur Nouveau pour écrire.</div>
          )}
        </div>
      </div>
    </div>
  );
}


