"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  examSchema,
  ExamSchema,
  subjectSchema,
  SubjectSchema,
} from "@/lib/formValidationSchemas";
import {
  createExam,
  createSubject,
  updateExam,
  updateSubject,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
  });

  // APRÈS REACT 19, CE SERA USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    // Ensure subjectId and classId are set before submit
    try { console.log('[ExamForm] submit payload (raw):', data); } catch {}
    const sId = subjectId && subjectId !== "" ? Number(subjectId) : undefined;
    const cId = classId && classId !== "" ? Number(classId) : undefined;
    if (!sId || !cId) {
      toast("Sélectionnez une matière et une classe valides.");
      return;
    }
    const payload = { ...data, subjectId: sId, classId: cId, lessonId: matchedLessonId ? Number(matchedLessonId) : undefined } as any;
    try { console.log('[ExamForm] submit payload (final):', payload); } catch {}
    formAction(payload);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `L'examen a été ${type === "create" ? "créé" : "modifié"} !`
      );
      setOpen(false);
      router.refresh();
    }
    if ((state as any)?.error) {
      try { console.log('[ExamForm] action error state:', state); } catch {}
    }
  }, [state, router, type, setOpen]);

  const { lessons, classes, subjects, teachers = [], role } = relatedData;
  const [fallbackClasses, setFallbackClasses] = useState<any[]>([]);
  const [fallbackSubjects, setFallbackSubjects] = useState<any[]>([]);
  const [fallbackTeachers, setFallbackTeachers] = useState<any[]>([]);
  useEffect(() => {
    try {
      // Debug fetched data for empty selects
      console.log("[ExamForm] role:", role);
      console.log("[ExamForm] teachers:", teachers);
      console.log("[ExamForm] subjects:", subjects);
      console.log("[ExamForm] classes:", classes);
    } catch {}
  }, [relatedData, teachers, subjects, classes, role]);

  useEffect(() => {
    const needTeachers = !teachers || teachers.length === 0;
    const needClasses = !classes || classes.length === 0;
    const needSubjects = !subjects || subjects.length === 0;
    (async () => {
      try {
        if (needTeachers) {
          const r = await fetch('/api/users-min');
          const data = await r.json();
          setFallbackTeachers(data.map((u:any)=> ({ id: u.id, name: (u.label||'').split(' ')[0]||'', surname: (u.label||'').split(' ').slice(1).join(' ')||'' })));
        }
        if (needClasses) {
          const r = await fetch('/api/classes-min');
          const data = await r.json();
          setFallbackClasses(data);
        }
        if (needSubjects) {
          const r = await fetch('/api/subjects-min');
          const data = await r.json();
          setFallbackSubjects(data);
        }
      } catch {}
    })();
  }, [teachers, classes, subjects]);
  const [teacherId, setTeacherId] = useState<string>(teachers?.length === 1 ? String(teachers[0].id) : "");
  const [subjectId, setSubjectId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const filteredClasses = useMemo(() => {
    const cls = (classes && classes.length ? classes : fallbackClasses);
    let pool = classes;
    if (teacherId) {
      pool = cls.filter((c:any)=> (c.teachers||[]).some((t:any)=> String(t.id)===String(teacherId)));
    }
    if (!subjectId) return pool;
    const sub = (subjects && subjects.length ? subjects : fallbackSubjects);
    const subject = sub.find((s:any)=> String(s.id)===String(subjectId));
    if (!subject || !subject.teachers) return pool;
    const subjectTeacherIds = new Set(subject.teachers.map((t:any)=> t.id));
    return pool.filter((c:any)=> (c.teachers||[]).some((t:any)=> subjectTeacherIds.has(t.id)));
  }, [classes, subjects, fallbackClasses, fallbackSubjects, subjectId, teacherId]);

  const filteredSubjects = useMemo(() => {
    const sub = (subjects && subjects.length ? subjects : fallbackSubjects);
    let pool = sub;
    if (teacherId) {
      pool = pool.filter((s:any)=> (s.teachers||[]).some((t:any)=> String(t.id)===String(teacherId)));
    }
    if (!classId) return pool;
    const cls = (classes && classes.length ? classes : fallbackClasses);
    const klass = cls.find((c:any)=> String(c.id)===String(classId));
    if (!klass || !klass.teachers) return pool;
    const classTeacherIds = new Set(klass.teachers.map((t:any)=> t.id));
    return pool.filter((s:any)=> (s.teachers||[]).some((t:any)=> classTeacherIds.has(t.id)));
  }, [subjects, classes, fallbackSubjects, fallbackClasses, classId, teacherId]);
  const matchedLessonId = useMemo(() => {
    if (!subjectId || !classId) return "";
    const found = lessons.find((l: any) => String(l.subject?.id) === String(subjectId) && String(l.class?.id) === String(classId));
    return found ? String(found.id) : "";
  }, [lessons, subjectId, classId]);

  // Keep RHF values in sync with local selects so server receives them reliably
  useEffect(() => {
    setValue("subjectId", subjectId ? Number(subjectId) : (undefined as any));
  }, [subjectId, setValue]);
  useEffect(() => {
    setValue("classId", classId ? Number(classId) : (undefined as any));
  }, [classId, setValue]);
  useEffect(() => {
    setValue("lessonId", matchedLessonId ? Number(matchedLessonId) : (undefined as any));
  }, [matchedLessonId, setValue]);

  const formatDateTimeLocal = (v: any) => {
    if (!v) return undefined;
    const d = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Créer un nouvel examen"
          : "Modifier l'examen"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Enseignant</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={teacherId}
            onChange={(e)=> setTeacherId(e.target.value)}
            disabled={role === "teacher"}
          >
            <option value="">Sélectionner</option>
            {(teachers && teachers.length ? teachers : fallbackTeachers).map((t:any)=> (
              <option value={t.id} key={t.id}>{t.name} {t.surname}</option>
            ))}
          </select>
        </div>
        <InputField
          label="Titre de l'examen"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Date de l'examen"
          name="startTime"
          defaultValue={formatDateTimeLocal(data?.startTime)}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="Date de fin"
          name="endTime"
          defaultValue={formatDateTimeLocal(data?.endTime)}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Matière</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">Toutes</option>
            {filteredSubjects.map((s: any) => (
              <option value={s.id} key={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Classe</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Sélectionner</option>
            {filteredClasses.map((c: any) => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
          <input type="hidden" {...register("classId")} />
          <input type="hidden" {...register("subjectId")} />
          <input type="hidden" {...register("lessonId")} />
          <input type="hidden" {...register("teacherId" as any)} value={teacherId} />
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">
          {typeof (state as any).message === 'string' && (state as any).message
            ? (state as any).message
            : "Une erreur est survenue !"}
        </span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Créer" : "Modifier"}
      </button>
    </form>
  );
};

export default ExamForm;
