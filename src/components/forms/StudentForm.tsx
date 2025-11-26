"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  studentSchema,
  StudentSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
  createStudent,
  updateStudent,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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
    watch,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    formAction({ ...data, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `L'élève a été ${type === "create" ? "créé" : "modifié"} !`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades, classes, parents } = relatedData;
  const selectedGradeId = watch("gradeId");
  const paymentType = watch("paymentType");

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h1 className="text-2xl font-semibold text-slate-900">
        {type === "create"
          ? "Créer un nouvel élève"
          : "Modifier l'élève"}
      </h1>
      <span className="form-section-label">
        Informations d&apos;authentification
      </span>
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

      {/* Payment configuration */}
      <div className="form-grid">
        <div className="form-field md:w-1/3">
          <label className="input-label">Type de paiement</label>
          <select
            className="form-select"
            {...register("paymentType")}
            defaultValue={data?.paymentType || "complete"}
          >
            <option value="complete">Complet</option>
            <option value="tranche">Par tranches</option>
          </select>
        </div>
        <div className="form-field md:w-1/3">
          <label className="input-label">Montant total (TND)</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("totalAmount")}
            defaultValue={data?.totalAmount}
          />
          {errors as any && (errors as any).totalAmount?.message && (
            <p className="text-xs font-medium text-red-500">{(errors as any).totalAmount.message.toString()}</p>
          )}
        </div>
        {paymentType === 'tranche' && (
          <div className="form-field md:w-1/3">
            <label className="input-label">Type d&apos;échéance</label>
            <select
              className="form-select"
              {...register("installmentType")}
              defaultValue={data?.installmentType || ""}
            >
              <option value="">Sélectionner</option>
              <option value="MONTHLY">Mensuel</option>
              <option value="TRIMESTER">Trimestriel</option>
            </select>
            {(errors as any)?.installmentType?.message && (
              <p className="text-xs font-medium text-red-500">{(errors as any).installmentType.message.toString()}</p>
            )}
          </div>
        )}
      </div>
      <span className="form-section-label">
        Informations personnelles
      </span>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center ring-1 ring-slate-200">
          {img?.secure_url || data?.img ? (
            <Image src={img?.secure_url || data?.img} alt="avatar" width={80} height={80} className="object-cover w-20 h-20" />
          ) : (
            <Image src="/noAvatar.png" alt="avatar" width={40} height={40} />
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
            <button type="button" className="form-secondary-btn" onClick={() => open()}>
              Télécharger une photo
            </button>
          )}
        </CldUploadWidget>
      </div>
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
        {/* blood type removed */}
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
        {/* Parent selection now as a select list */}
        <div className="form-field md:w-1/3">
          <label className="input-label">Parent</label>
          <select
            className="form-select"
            {...register("parentId")}
            defaultValue={data?.parentId}
          >
            <option value="">Sélectionner un parent</option>
            {parents?.map((parent: { id: string; name: string; surname: string }) => (
              <option value={parent.id} key={parent.id}>
                {parent.name} {parent.surname} ({parent.id})
              </option>
            ))}
          </select>
          {errors.parentId?.message && (
            <p className="text-xs font-medium text-red-500">
              {errors.parentId.message.toString()}
            </p>
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
        <div className="form-field md:w-1/4">
          <label className="input-label">Sexe</label>
          <select
            className="form-select"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Masculin</option>
            <option value="FEMALE">Féminin</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs font-medium text-red-500">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="form-field md:w-1/4">
          <label className="input-label">Niveau</label>
          <select
            className="form-select"
            {...register("gradeId")}
            defaultValue={data?.gradeId || ""}
          >
            <option value="">Sélectionner un niveau</option>
            {grades
              .slice()
              .sort((a: any, b: any) => a.level - b.level)
              .map((grade: { id: number; level: number }) => (
                <option value={grade.id} key={grade.id}>
                  {grade.level}
                </option>
              ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs font-medium text-red-500">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        <div className="form-field md:w-1/4">
          <label className="input-label">Classe</label>
          <select
            className="form-select"
            {...register("classId")}
            defaultValue={data?.classId || ""}
            key={selectedGradeId || 'no-grade'}
            disabled={!selectedGradeId}
          >
            {!selectedGradeId && (
              <option value="">Sélectionner un niveau d&apos;abord</option>
            )}
            {selectedGradeId && classes
              .filter((c: any) => c.gradeId == selectedGradeId)
              .slice()
              .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name), 'fr'))
              .map(
              (classItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
                gradeId?: number;
              }) => (
                <option value={classItem.id} key={classItem.id}>
                  ({classItem.name} -{" "}
                  {classItem._count.students + "/" + classItem.capacity}{" "}
                  Capacité)
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs font-medium text-red-500">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="form-status">
          {typeof (state as any).message === 'string' && (state as any).message
            ? (state as any).message
            : "Une erreur est survenue !"}
        </span>
      )}
      <button type="submit" className="form-primary-btn">
        {type === "create" ? "Créer" : "Modifier"}
      </button>
    </form>
  );
};

export default StudentForm;
