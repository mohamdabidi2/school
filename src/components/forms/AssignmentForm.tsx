"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AssignmentForm = ({
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
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((payload) => {
    try { console.log('[AssignmentForm] submit payload (raw):', payload); } catch {}
    // pass along resolved IDs
    const sId = subjectId && subjectId !== "" ? Number(subjectId) : undefined;
    const cId = classId && classId !== "" ? Number(classId) : undefined;
    if (!sId || !cId) {
      toast("Sélectionnez une matière et une classe valides.");
      return;
    }
    // Verify teacher overlap between selected subject and class
    const subj = subjects.find((s:any)=> String(s.id)===String(sId));
    const klass = classes.find((c:any)=> String(c.id)===String(cId));
    const overlap = subj && klass
      ? (subj.teachers||[]).some((t:any)=> (klass.teachers||[]).some((u:any)=> u.id===t.id))
      : false;
    if (!overlap) {
      toast("Aucun enseignant n&apos;enseigne cette matière dans cette classe.");
      return;
    }
    const submitPayload = { ...payload, id: data?.id, subjectId: sId as any, classId: cId as any } as any;
    try { console.log('[AssignmentForm] submit payload (final):', submitPayload); } catch {}
    formAction(submitPayload);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Le devoir a été ${type === "create" ? "créé" : "modifié"} !`);
      setOpen(false);
      router.refresh();
    }
    if ((state as any)?.error) {
      try { console.log('[AssignmentForm] action error state:', state); } catch {}
    }
  }, [state, router, type, setOpen]);

  // No client-side lessons; backend resolves/creates lesson
  const classesSource = relatedData?.classes;
  const subjectsSource = relatedData?.subjects;
  const teachersSource = relatedData?.teachers;
  const role = (relatedData && relatedData.role) || "";
  const classes = useMemo(() => classesSource || [], [classesSource]);
  const subjects = useMemo(() => subjectsSource || [], [subjectsSource]);
  const teachers = useMemo(() => teachersSource || [], [teachersSource]);
  const [fallbackClasses, setFallbackClasses] = useState<any[]>([]);
  const [fallbackSubjects, setFallbackSubjects] = useState<any[]>([]);
  const [fallbackTeachers, setFallbackTeachers] = useState<any[]>([]);
  useEffect(() => {
    try {
      console.log("[AssignmentForm] role:", role);
      console.log("[AssignmentForm] teachers:", teachers);
      console.log("[AssignmentForm] subjects:", subjects);
      console.log("[AssignmentForm] classes:", classes);
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
  // No client-side lesson resolution needed

  const filteredClasses = useMemo(() => {
    const cls = (classes && classes.length ? classes : fallbackClasses);
    let pool = cls;
    if (teacherId) {
      pool = pool.filter((c:any)=> (c.teachers||[]).some((t:any)=> String(t.id)===String(teacherId)));
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

  const toDateLocal = (v: any) => {
    if (!v) return undefined;
    const d = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Créer un nouveau devoir" : "Modifier le devoir"}
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
          label="Titre"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Contenu (devoir à la maison)</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
            {...register("content")}
            defaultValue={data?.content || ""}
            placeholder="Consignes, exercices, ressources, etc."
          />
        </div>

        <InputField
          label="Date de début"
          name="startDate"
          defaultValue={toDateLocal(data?.startDate)}
          register={register}
          error={errors?.startDate}
          type="datetime-local"
        />

        <InputField
          label="Date limite"
          name="dueDate"
          defaultValue={toDateLocal(data?.dueDate)}
          register={register}
          error={errors?.dueDate}
          type="datetime-local"
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Matière</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={subjectId}
            onChange={(e)=> setSubjectId(e.target.value)}
          >
            <option value="">Sélectionner</option>
            {filteredSubjects.map((s:any)=> (
              <option value={s.id} key={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Classe</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={classId}
            onChange={(e)=> setClassId(e.target.value)}
          >
            <option value="">Sélectionner</option>
            {filteredClasses.map((c:any)=> (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
          <input type="hidden" {...register("subjectId")} value={subjectId} />
          <input type="hidden" {...register("classId")} value={classId} />
          <input type="hidden" {...register("teacherId" as any)} value={teacherId} />
        </div>

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
      </div>

      {state.error && (
        <span className="text-red-500">
          {typeof (state as any).message === 'string' && (state as any).message
            ? (state as any).message
            : "Une erreur est survenue !"}
        </span>
      )}
      {subjectId && classId && filteredClasses.length === 0 && (
        <span className="text-red-500">Aucun enseignant n&apos;enseigne cette matière dans cette classe.</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Créer" : "Modifier"}
      </button>
    </form>
  );
};

export default AssignmentForm;
