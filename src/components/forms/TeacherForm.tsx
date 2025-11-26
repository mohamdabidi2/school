"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((payload) => {
    formAction({ ...payload, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `L'enseignant a été ${type === "create" ? "créé" : "modifié"} !`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData;
  const preview = img?.secure_url || data?.img;

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h1 className="text-2xl font-semibold text-slate-900">
        {type === "create"
          ? "Créer un nouvel enseignant"
          : "Modifier l'enseignant"}
      </h1>

      <span className="form-section-label">Informations d&apos;authentification</span>
      <div className="form-grid">
        <InputField
          label="Nom d&apos;utilisateur"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Mot de passe"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>

      <span className="form-section-label">Informations personnelles</span>
      <div className="form-grid">
        <InputField
          label="Prénom"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Nom"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Téléphone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Adresse"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Date de naissance"
          name="birthday"
          defaultValue={
            data?.birthday
              ? data?.birthday.toISOString().split("T")[0]
              : undefined
          }
          register={register}
          error={errors.birthday}
          type="date"
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
        <div className="form-field md:w-1/4">
          <label className="input-label">Sexe</label>
          <select
            className="form-select"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Homme</option>
            <option value="FEMALE">Femme</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs font-medium text-red-500">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="form-field md:w-1/2">
          <label className="input-label">Matières</label>
          <select
            multiple
            className="form-select h-40"
            {...register("subjects")}
            defaultValue={data?.subjects}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs font-medium text-red-500">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <div className="form-field md:w-1/3">
          <label className="input-label">Photo professionnelle</label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center overflow-hidden">
              {preview ? (
                <Image
                  src={preview}
                  alt="avatar"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image src="/noAvatar.png" alt="avatar" width={32} height={32} />
              )}
            </div>
            <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                widget.close();
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  className="form-secondary-btn text-sm"
                  onClick={() => open()}
                >
                  <Image src="/upload.png" alt="" width={20} height={20} />
                  <span>Télécharger</span>
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>
      </div>

      {state.error && (
        <span className="form-status">
          {typeof (state as any).message === "string" && (state as any).message
            ? (state as any).message
            : "Une erreur est survenue !"}
        </span>
      )}
      <button className="form-primary-btn">
        {type === "create" ? "Créer" : "Modifier"}
      </button>
    </form>
  );
};

export default TeacherForm;
