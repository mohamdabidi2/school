"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AttendanceForm = ({
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
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
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
      toast(`La présence a été ${type === "create" ? "ajoutée" : "modifiée"} !`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students = [], lessons = [] } = relatedData || {};

  const toDateLocal = (v: any) => {
    if (!v) return undefined;
    const d = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Marquer une présence" : "Modifier la présence"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Élève</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId || ""}
          >
            <option value="">Sélectionner</option>
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} {s.surname}</option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Leçon</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId || ""}
          >
            <option value="">Sélectionner</option>
            {lessons.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">{errors.lessonId.message.toString()}</p>
          )}
        </div>

        <InputField
          label="Date"
          name="date"
          defaultValue={toDateLocal(data?.date) || toDateLocal(new Date())}
          register={register}
          error={errors?.date}
          type="datetime-local"
        />

        <div className="flex items-center gap-2 w-full md:w-1/4 mt-6">
          <input type="checkbox" id="present" {...register("present")} defaultChecked={data?.present ?? true} />
          <label htmlFor="present" className="text-sm text-gray-700">Présent</label>
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

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Enregistrer" : "Modifier"}
      </button>
    </form>
  );
};

export default AttendanceForm;


