"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
  subjectSchema,
  SubjectSchema,
} from "@/lib/formValidationSchemas";
import {
  createClass,
  createSubject,
  updateClass,
  updateSubject,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
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
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
  });

  // APRÈS REACT 19, CE SERA USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `La classe a été ${type === "create" ? "créée" : "modifiée"} !`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers, grades } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Créer une nouvelle classe"
          : "Modifier la classe"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nom de la classe"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Capacité"
          name="capacity"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
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
          <label className="text-xs text-gray-500">Surveillant</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
            defaultValue={data?.teachers}
          >
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option
                  value={teacher.id}
                  key={teacher.id}
                  selected={data && teacher.id === data.supervisorId}
                >
                  {teacher.name + " " + teacher.surname}
                </option>
              )
            )}
          </select>
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Niveau</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId ?? ""}
          >
            <option value="" disabled>
              Sélectionner le niveau
            </option>
            {Array.from({ length: 6 }, (_, i) => i + 1).map((level) => (
              <option
                value={level}
                key={level}
                selected={data && level === data.gradeId}
              >
                {level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Enseignants (multi)</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-36"
            {...register("instructorIds")}
            defaultValue={(data as any)?.teachers?.map((t: any) => t.id) || []}
          >
            {teachers.map((t: { id: string; name: string; surname: string }) => (
              <option value={t.id} key={t.id}>
                {t.name} {t.surname}
              </option>
            ))}
          </select>
          {errors && (errors as any).instructorIds?.message && (
            <p className="text-xs text-red-400">{String((errors as any).instructorIds?.message)}</p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">
          Une erreur s&apos;est produite !
        </span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Créer" : "Modifier"}
      </button>
    </form>
  );
};

export default ClassForm;
