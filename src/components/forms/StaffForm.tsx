"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createStaffUser, updateStaffUser } from "@/lib/actions";
import { CldUploadWidget } from "next-cloudinary";
import { staffUserSchema, type StaffUserSchema } from "@/lib/formValidationSchemas";

const StaffForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffUserSchema>({
    resolver: zodResolver(staffUserSchema),
  });

  const [img, setImg] = useState<any>(data?.img ? { secure_url: data.img } : undefined);

  // Normalise la signature pour satisfaire TypeScript: (state, payload)
  const staffAction = (type === 'create' ? createStaffUser : updateStaffUser) as (
    state: any,
    payload: any
  ) => Promise<any>;

  const [state, formAction] = useFormState(staffAction, { success: false, error: false } as any);

  const onSubmit = handleSubmit((payload) => {
    const basePayload = { ...payload, img: img?.secure_url || (payload as any).img };
    const finalPayload = type === "update" ? { ...basePayload, id: data?.id } : basePayload;

    formAction(finalPayload as any);
  });

  const router = useRouter();

  useEffect(() => {
    if ((state as any).success) {
      toast("Utilisateur créé !");
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Ajouter un membre' : 'Modifier le membre'}</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 w-full">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {img?.secure_url || (data?.img) ? (
              <Image src={img?.secure_url || data?.img} alt="avatar" width={80} height={80} className="object-cover w-20 h-20" />
            ) : (
              <Image src="/noAvatar.png" alt="avatar" width={40} height={40} />
            )}
          </div>
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result: any, { widget }: any) => {
              setImg(result.info);
              widget.close();
            }}
          >
            {({ open }: any) => (
              <button type="button" className="text-sm px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200" onClick={() => open()}>
                Télécharger une photo
              </button>
            )}
          </CldUploadWidget>
        </div>
        <InputField
          label="Prénom"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Nom"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors?.surname}
        />
        <InputField
          label="Nom d&apos;utilisateur"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Mot de passe"
          name="password"
          defaultValue={""}
          register={register}
          error={errors?.password}
          type="password"
        />
        {data && (
            <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id as any} hidden />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Rôle</label>
          <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("role")} defaultValue={data?.role || "administration"}>
           
            <option value="administration">Administration</option>
            <option value="finance">Finance</option>
            <option value="director">Directeur</option>
          </select>
          {errors.role?.message && (<p className="text-xs text-red-400">{errors.role.message.toString()}</p>)}
        </div>

        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email as any}
        />
        <InputField
          label="Téléphone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors?.phone as any}
        />
        <InputField
          label="Salaire"
          name="salary"
          defaultValue={data?.salary}
          register={register}
          error={errors?.salary as any}
          type="number"
        />
        {/* URL photo input removed; image is handled via Cloudinary upload widget */}
      </div>

      {(state as any).error && (
        <span className="text-red-500">
          {typeof (state as any).message === 'string' && (state as any).message ? (state as any).message : "Une erreur est survenue !"}
        </span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">{type === 'create' ? 'Créer' : 'Enregistrer'}</button>
    </form>
  );
};

export default StaffForm;


