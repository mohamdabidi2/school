"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions";
import { eventSchema, type EventSchema } from "@/lib/formValidationSchemas";

const EventForm = ({
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
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false } as any
  );

  const onSubmit = handleSubmit((payload) => {
    if (type === "update") {
      // Garantit que l'id est toujours présent pour l'action d'update
      formAction({ ...payload, id: data?.id } as any);
    } else {
      formAction(payload as any);
    }
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(
        type === "create" ? "Événement créé avec succès" : "Événement modifié avec succès"
      );
      setOpen(false);
    }
    if (state?.error) {
      toast.error(state?.message || "Une erreur est survenue");
    }
  }, [state, type, setOpen]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">
        {type === "create" ? "Créer un événement" : "Modifier l'événement"}
      </h2>

      {type === "update" && (
        <>
          <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id as any} hidden />
        </>
      )}

      <InputField
        label="Titre"
        name="title"
        defaultValue={data?.title}
        register={register}
        error={errors?.title}
      />

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs text-gray-500">Description</label>
        <textarea
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("description")}
          defaultValue={data?.description}
          rows={3}
        />
        {errors?.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-4 flex-col md:flex-row">
        <InputField
          label="Date et heure de début"
          name="startTime"
          type="datetime-local"
          defaultValue={data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : ""}
          register={register}
          error={errors?.startTime}
        />

        <InputField
          label="Date et heure de fin"
          name="endTime"
          type="datetime-local"
          defaultValue={data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ""}
          register={register}
          error={errors?.endTime}
        />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs text-gray-500">Classe (optionnel)</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("classId")}
          defaultValue={data?.classId || ""}
        >
          <option value="">Toutes les classes</option>
          {relatedData?.classes?.map((classe: any) => (
            <option key={classe.id} value={classe.id}>
              {classe.name}
            </option>
          ))}
        </select>
        {errors?.classId && (
          <p className="text-xs text-red-400">{errors.classId.message}</p>
        )}
      </div>

      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {type === "create" ? "Créer" : "Modifier"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
