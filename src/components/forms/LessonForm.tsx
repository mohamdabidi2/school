"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createLesson, updateLesson } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const LessonForm = ({
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
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
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
      toast(`La leçon a été ${type === "create" ? "créée" : "modifiée"} !`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects = [], classes = [], teachers = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Créer une nouvelle leçon" : "Modifier la leçon"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nom de la leçon"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Jour</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day")}
            defaultValue={data?.day || ""}
          >
            <option value="">Sélectionner</option>
            <option value="MONDAY">Lundi</option>
            <option value="TUESDAY">Mardi</option>
            <option value="WEDNESDAY">Mercredi</option>
            <option value="THURSDAY">Jeudi</option>
            <option value="FRIDAY">Vendredi</option>
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">{errors.day.message.toString()}</p>
          )}
        </div>

        <InputField
          label="Heure de début"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="Heure de fin"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Matière</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId || ""}
          >
            <option value="">Sélectionner</option>
            {subjects.map((s: any) => (
              <option value={s.id} key={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">{errors.subjectId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Classe</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">Sélectionner</option>
            {classes.map((c: any) => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Enseignant</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
            defaultValue={data?.teacherId || ""}
          >
            <option value="">Sélectionner</option>
            {teachers.map((t: any) => (
              <option value={t.id} key={t.id}>{t.name} {t.surname}</option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message.toString()}</p>
          )}
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
        {type === "create" ? "Créer" : "Modifier"}
      </button>
    </form>
  );
};

export default LessonForm;


