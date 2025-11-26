"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createSalaryPayment, updateSalaryPayment } from "@/lib/actions";
import { salaryPaymentSchema, type SalaryPaymentSchema } from "@/lib/formValidationSchemas";

type SalaryPayload = { id?: number; amount: number; date?: Date; note?: string | null; teacherId: string };

const SalaryForm = ({
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
  } = useForm<SalaryPaymentSchema>({
    resolver: zodResolver(salaryPaymentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSalaryPayment : updateSalaryPayment,
    { success: false, error: false } as any
  );

  const onSubmit = handleSubmit((payload) => {
    formAction({ ...payload, id: data?.id });
  });

  const router = useRouter();

  useEffect(() => {
    if ((state as any).success) {
      toast(`Salaire ${type === "create" ? "enregistré" : "modifié"} !`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers = [] } = relatedData || {};

  const formatDateLocal = (v: any) => {
    if (!v) return undefined;
    const d = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Enregistrer un salaire" : "Modifier le salaire"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Enseignant</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId" as any)}
            defaultValue={data?.teacherId || ""}
          >
            <option value="">Sélectionner</option>
            {teachers.map((t: any) => (
              <option value={t.id} key={t.id}>{t.name} {t.surname}</option>
            ))}
          </select>
        </div>

        <InputField
          label="Montant"
          name="amount"
          defaultValue={data?.amount}
          register={register as any}
          error={undefined}
          type="number"
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Date (optionnel)</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("date" as any)}
            defaultValue={formatDateLocal(data?.date)}
          />
        </div>

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register as any}
            error={undefined}
            hidden
          />
        )}

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Note (optionnel)</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-28"
            {...register("note" as any)}
            defaultValue={data?.note || ""}
          />
        </div>
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Enregistrer" : "Modifier"}
      </button>
    </form>
  );
};

export default SalaryForm;


