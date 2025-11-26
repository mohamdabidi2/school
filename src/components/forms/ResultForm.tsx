"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SearchableSelect from "@/components/SearchableSelect";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ResultForm = ({
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
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((payload) => {
    formAction({ ...payload, id: data?.id });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Le résultat a été ${type === "create" ? "créé" : "modifié"} !`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students = [], exams = [], assignments = [] } = relatedData || {};
  const [typeEval, setTypeEval] = useState<'exam' | 'assignment' | ''>(data?.examId ? 'exam' : (data?.assignmentId ? 'assignment' : ''));
  const [studentQuery, setStudentQuery] = useState('');
  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s: any) => `${s.name} ${s.surname}`.toLowerCase().includes(q));
  }, [students, studentQuery]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Créer un nouveau résultat" : "Modifier le résultat"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Note (0 - 20)"
          name="score"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
          type="number"
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Élève</label>
          <SearchableSelect
            value={data?.studentId}
            onChange={(v) => {
              // sync to RHF
              const ev = { target: { name: 'studentId', value: v } } as any;
              (register('studentId').onChange as any)(ev);
            }}
            options={students.map((s: any) => ({ value: s.id, label: `${s.name} ${s.surname}` }))}
            placeholder="Sélectionner un élève"
          />
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Type d&apos;évaluation</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={typeEval}
            onChange={(e) => setTypeEval(e.target.value as any)}
          >
            <option value="">Sélectionner</option>
            <option value="exam">Examen</option>
            <option value="assignment">Devoir à la maison</option>
          </select>
        </div>

        {typeEval === 'exam' && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Examen</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("examId")}
              defaultValue={data?.examId || ""}
            >
              <option value="">Sélectionner</option>
              {exams.map((e: any) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
        )}

        {typeEval === 'assignment' && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Devoir à la maison</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assignmentId")}
              defaultValue={data?.assignmentId || ""}
            >
              <option value="">Sélectionner</option>
              {assignments.map((a: any) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}

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

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Créer" : "Modifier"}
      </button>
    </form>
  );
};

export default ResultForm;


