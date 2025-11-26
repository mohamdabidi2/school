"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteParent,
  deleteTeacher,
  deleteLesson,
  deleteAssignment,
  deleteResult,
  deleteAttendance,
  deleteAnnouncement,
  deleteEvent,
  deleteTeacherAbsence,
  deleteSalaryPayment,
  deleteStaffUser,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState, ReactNode } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import BulkAttendance from "./attendance/BulkAttendance";

// Dictionnaire des actions de suppression pour chaque table
const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  // TODO : Autres actions de suppression à ajouter
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  teacherAbsence: deleteTeacherAbsence,
  salaryPayment: deleteSalaryPayment,
  staff: deleteStaffUser,
};

// Chargement dynamique (lazy loading) des formulaires
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const ParentForm = dynamic(() => import("./forms/parentForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const InstructorAbsenceForm = dynamic(() => import("./forms/InstructorAbsenceForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const SalaryForm = dynamic(() => import("./forms/SalaryForm"), {
  loading: () => <h1>Chargement...</h1>,
});
const StaffForm = dynamic(() => import("./forms/StaffForm"), {
  loading: () => <h1>Chargement...</h1>,
});
// TODO : Autres formulaires à charger dynamiquement

// Dictionnaire des composants de formulaire selon la table
const formComponentMap: {
  [key: string]: React.ComponentType<{
    type: "create" | "update";
    data?: any;
    setOpen?: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
  }>;
} = {
  subject: SubjectForm,
  class: ClassForm,
  teacher: TeacherForm,
  student: StudentForm,
  exam: ExamForm,
  parent: ParentForm,
  lesson: LessonForm,
  assignment: AssignmentForm,
  result: ResultForm,
  attendance: AttendanceForm,
  announcement: AnnouncementForm,
  event: EventForm,
  teacherAbsence: InstructorAbsenceForm,
  salaryPayment: SalaryForm,
  staff: StaffForm,
  // TODO: autres mappings si besoin
};

const FormStyleWrapper = ({ children }: { children: ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const form = root.querySelector("form");
    if (!form) return;

    form.classList.add("form-card", "styled-form");
    form.classList.remove("flex", "flex-col", "gap-8");

    form.querySelectorAll("span.text-xs.text-gray-400.font-medium").forEach((el) => {
      el.classList.add("form-section-label");
      el.classList.remove("text-gray-400");
    });

    form.querySelectorAll("button.bg-blue-400").forEach((btn) => {
      btn.classList.add("form-primary-btn");
    });

    form
      .querySelectorAll("p.text-xs.text-red-400, p.text-xs.text-red-500")
      .forEach((el) => el.classList.add("text-xs", "font-medium", "text-red-500"));

    form.querySelectorAll("span.text-red-500").forEach((el) => el.classList.add("form-status"));

    const inputs = form.querySelectorAll<HTMLInputElement>(
      "input:not([type='hidden']):not([type='checkbox']):not([type='radio'])"
    );
    inputs.forEach((input) => input.classList.add("form-input"));

    const selects = form.querySelectorAll<HTMLSelectElement>("select");
    selects.forEach((select) => select.classList.add("form-select"));

    const textareas = form.querySelectorAll<HTMLTextAreaElement>("textarea");
    textareas.forEach((textarea) => textarea.classList.add("form-textarea"));
  }, [children]);

  return <div ref={containerRef}>{children}</div>;
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const taille = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const couleurFond =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (ouvert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [ouvert]);

  // Composant interne pour le contenu du formulaire
  const Formulaire = () => {
    // Normalise la signature pour satisfaire TypeScript: (state, formData: FormData)
    const deleteAction = deleteActionMap[table] as unknown as (
      state: any,
      formData: FormData
    ) => Promise<any>;

    const [etat, actionFormulaire] = useFormState(deleteAction, {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (etat.success) {
        toast(`${table} a été supprimé !`);
        setOuvert(false);
        router.refresh();
      }
    }, [etat, router]);

    if (type === "delete" && id) {
      return (
        <form action={actionFormulaire} className="p-4 flex flex-col gap-4">
          <input type="text" name="id" value={id} hidden />
          <span className="text-center font-medium">
            Toutes les données seront perdues. Êtes-vous sûr de vouloir supprimer ce/cette {table} ?
          </span>
          <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
            Supprimer
          </button>
        </form>
      );
    }

    if ((type === "create" || type === "update") && formComponentMap[table]) {
      if (table === 'attendance' && type === 'create') {
        return (
          <div className="p-2">
            <h2 className="text-lg font-semibold mb-4">Marquage en masse</h2>
            <BulkAttendance onDone={() => setOuvert(false)} />
          </div>
        );
      }
      const FormComponent = formComponentMap[table];
      return (
        <FormStyleWrapper>
          <FormComponent
            type={type}
            data={data}
            setOpen={setOuvert}
            relatedData={relatedData}
          />
        </FormStyleWrapper>
      );
    }

    return "Formulaire introuvable !";
  };

  return (
    <>
      <button
        className={`${taille} flex items-center justify-center rounded-full ${couleurFond}`}
        onClick={() => setOuvert(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {ouvert && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-2xl shadow-slate-900/20">
            <Formulaire />
            <div
              className="absolute top-4 right-4 cursor-pointer rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition"
              onClick={() => setOuvert(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
