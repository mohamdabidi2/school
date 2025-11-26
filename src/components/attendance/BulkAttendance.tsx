"use client";

import { useEffect, useState } from "react";

type ClassItem = { id: number; name: string };
type StudentItem = { id: string; name: string; surname: string };
type LessonItem = { id: number; name: string };

export default function BulkAttendance({ onDone }: { onDone?: () => void }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [absentIds, setAbsentIds] = useState<Record<string, boolean>>({});
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [lessonId, setLessonId] = useState<number | "">("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,16));

  useEffect(() => {
    fetch('/api/classes-min').then(r => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetch(`/api/students-by-class?classId=${selectedClassId}`).then(r => r.json()).then((list: StudentItem[]) => {
        setStudents(list);
        setAbsentIds({});
      });
      fetch(`/api/lessons-by-class?classId=${selectedClassId}`).then(r => r.json()).then(setLessons);
    } else {
      setStudents([]);
      setAbsentIds({});
      setLessons([]);
      setLessonId("");
    }
  }, [selectedClassId]);

  const toggleAbsent = (id: string) => {
    setAbsentIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const submit = async () => {
    const absentStudentIds = Object.keys(absentIds).filter(id => absentIds[id]);
    if (!lessonId || !date) return alert('Sélectionnez la leçon et la date');
    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, lessonId: Number(lessonId), absentStudentIds }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      alert('Présences enregistrées');
      if (onDone) onDone();
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Classe</label>
          <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Sélectionner</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Leçon</label>
          <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" value={lessonId as any} onChange={(e) => setLessonId(e.target.value ? Number(e.target.value) : "")} disabled={!lessons.length}>
            <option value="">Sélectionner</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Date</label>
          <input className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Élèves</h4>
        {students.length === 0 ? (
          <div className="text-sm text-gray-500">Sélectionnez une classe pour afficher les élèves.</div>
        ) : (
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 text-xs font-medium text-gray-600">
              <div className="col-span-8 p-2">Nom</div>
              <div className="col-span-4 p-2 text-right">Absent</div>
            </div>
            <div className="max-h-80 overflow-auto">
              {students.map((s, idx) => (
                <div key={s.id} className={`grid grid-cols-12 items-center p-2 text-sm ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="col-span-8">{s.name} {s.surname}</div>
                  <div className="col-span-4 flex justify-end">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" checked={!!absentIds[s.id]} onChange={() => toggleAbsent(s.id)} />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">Marquer absent</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={!selectedClassId || !lessonId}>
          Enregistrer les absences
        </button>
      </div>
    </div>
  );
}


