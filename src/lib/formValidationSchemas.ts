import { z } from "zod";

// Schéma de validation pour une matière
export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Le nom de la matière est requis !" }),
  teachers: z.array(z.string()), // identifiants des enseignants
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

// Schéma de validation pour une classe
export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Le nom de la classe est requis !" }),
  capacity: z.coerce.number().min(1, { message: "La capacité est requise !" }),
  gradeId: z.coerce.number().min(1, { message: "Le niveau est requis !" }),
  supervisorId: z.coerce.string().optional(),
  instructorIds: z.array(z.string()).optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

// Schéma de validation pour un enseignant
export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Le nom d'utilisateur doit comporter au moins 3 caractères !" })
    .max(20, { message: "Le nom d'utilisateur doit comporter au plus 20 caractères !" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit comporter au moins 8 caractères !" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est requis !" }),
  surname: z.string().min(1, { message: "Le nom de famille est requis !" }),
  email: z
    .string()
    .email({ message: "Adresse e-mail invalide !" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  // bloodType removed
  birthday: z.coerce.date({ message: "La date de naissance est requise !" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Le sexe est requis !" }),
  subjects: z.array(z.string()).optional(), // identifiants des matières
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

// Schéma de validation pour un élève
export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Le nom d'utilisateur doit comporter au moins 3 caractères !" })
    .max(20, { message: "Le nom d'utilisateur doit comporter au plus 20 caractères !" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit comporter au moins 8 caractères !" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est requis !" }),
  surname: z.string().min(1, { message: "Le nom de famille est requis !" }),
  email: z
    .string()
    .email({ message: "Adresse e-mail invalide !" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  // bloodType removed
  birthday: z.coerce.date({ message: "La date de naissance est requise !" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Le sexe est requis !" }),
  gradeId: z.coerce.number().min(1, { message: "Le niveau est requis !" }),
  classId: z.coerce.number().min(1, { message: "La classe est requise !" }),
  parentId: z.string().min(1, { message: "Le parent est requis !" }),
  // Payment fields
  paymentType: z.enum(["complete", "tranche"]).optional(),
  totalAmount: z
    .preprocess((v) => (v === "" ? undefined : v), z.coerce.number().positive().optional())
    .optional(),
  installmentType: z
    .enum(["TRIMESTER", "MONTHLY"]) // Required when paymentType is tranche
    .optional(),
}).refine((data) => data.paymentType !== 'tranche' || !!data.installmentType, {
  message: "Le type d'échéance est requis pour un paiement par tranches",
  path: ["installmentType"],
});

export type StudentSchema = z.infer<typeof studentSchema>;

// Schéma de validation pour un examen
export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Le titre de l'examen est requis !" }),
  startTime: z.coerce.date({ message: "L'heure de début est requise !" }),
  endTime: z.coerce.date({ message: "L'heure de fin est requise !" }),
  lessonId: z.coerce.number({ message: "La leçon est requise !" }).optional(),
  subjectId: z.coerce.number().optional(),
  classId: z.coerce.number().optional(),
});

export type ExamSchema = z.infer<typeof examSchema>;

// Schéma de validation pour un devoir (assignment)
export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Le titre du devoir est requis !" }),
  content: z.string().optional(),
  startDate: z.coerce.date({ message: "La date de début est requise !" }),
  dueDate: z.coerce.date({ message: "La date limite est requise !" }),
  lessonId: z.coerce.number().optional(),
  subjectId: z.coerce.number().optional(),
  classId: z.coerce.number().optional(),
}).refine((data)=> !!data.lessonId || (!!data.subjectId && !!data.classId), {
  message: "Sélectionnez une leçon ou une paire matière/classe",
  path: ["lessonId"],
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

// Schéma de validation pour un résultat
export const resultSchema = z
  .object({
    id: z.coerce.number().optional(),
    score: z
      .coerce
      .number()
      .min(0, { message: "La note doit être >= 0" })
      .max(20, { message: "La note doit être <= 20" }),
    studentId: z.string({ message: "L'élève est requis !" }),
    examId: z.coerce.number().optional().nullable(),
    assignmentId: z.coerce.number().optional().nullable(),
  })
  .refine((data) => !!data.examId || !!data.assignmentId, {
    message: "Sélectionnez un examen ou un devoir",
    path: ["examId"],
  });

export type ResultSchema = z.infer<typeof resultSchema>;

// Schéma de validation pour une présence
export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  date: z.coerce.date({ message: "La date est requise !" }),
  present: z.boolean({ message: "Présence requise !" }),
  studentId: z.string({ message: "L'élève est requis !" }),
  lessonId: z.coerce.number({ message: "La leçon est requise !" }),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

// Schéma de validation pour une leçon
export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Le nom de la leçon est requis !" }),
  day: z.enum(["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"], { message: "Le jour est requis !" }),
  startTime: z.coerce.date({ message: "L'heure de début est requise !" }),
  endTime: z.coerce.date({ message: "L'heure de fin est requise !" }),
  subjectId: z.coerce.number({ message: "La matière est requise !" }),
  classId: z.coerce.number({ message: "La classe est requise !" }),
  teacherId: z.string({ message: "L'enseignant est requis !" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

// Schéma de validation pour un parent
export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Le nom d'utilisateur doit comporter au moins 3 caractères !" })
    .max(20, { message: "Le nom d'utilisateur doit comporter au plus 20 caractères !" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit comporter au moins 8 caractères !" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est requis !" }),
  surname: z.string().min(1, { message: "Le nom de famille est requis !" }),
  email: z
    .string()
    .email({ message: "Adresse e-mail invalide !" })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(1, { message: "Le numéro de téléphone est requis !" }),
  address: z.string().min(1, { message: "L'adresse est requise !" }),
  createdAt: z.coerce.date().optional(),
  // Le champ "students" est généralement une relation, géré séparément dans le code
});

export type ParentSchema = z.infer<typeof parentSchema>;

// Schéma de validation pour une annonce
export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Le titre est requis !" }),
  description: z.string().min(1, { message: "La description est requise !" }),
  date: z.coerce.date({ message: "La date est requise !" }),
  classId: z.coerce.number().optional().nullable(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

// Schéma de validation pour un événement
export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Le titre est requis !" }),
  description: z.string().min(1, { message: "La description est requise !" }),
  startTime: z.coerce.date({ message: "L'heure de début est requise !" }),
  endTime: z.coerce.date({ message: "L'heure de fin est requise !" }),
  classId: z.coerce.number().optional().nullable(),
});

export type EventSchema = z.infer<typeof eventSchema>;

// Schéma de validation pour un utilisateur staff
export const staffUserSchema = z.object({
  id: z.coerce.number().optional(),
  username: z.string().min(3, { message: "Au moins 3 caractères" }),
  password: z.string().min(8, { message: "Au moins 8 caractères" }).optional().or(z.literal("")),
  role: z.enum(["finance", "administration", "administrateur", "directeur"], { required_error: "Rôle requis" }),
  name: z.string().min(1, { message: "Le prénom est requis" }),
  surname: z.string().min(1, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Email invalide" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  img: z.string().optional().or(z.literal("")),
  salary: z.preprocess((v)=> v===""? undefined : v, z.coerce.number().optional()),
});

export type StaffUserSchema = z.infer<typeof staffUserSchema>;

// Schéma de validation pour une absence d'enseignant
export const teacherAbsenceSchema = z.object({
  id: z.coerce.number().optional(),
  date: z.coerce.date({ message: "La date est requise !" }),
  reason: z.string().optional().or(z.literal("")),
  teacherId: z.string().min(1, { message: "L'enseignant est requis !" }),
});

export type TeacherAbsenceSchema = z.infer<typeof teacherAbsenceSchema>;

// Schéma de validation pour un paiement de salaire
export const salaryPaymentSchema = z.object({
  id: z.coerce.number().optional(),
  amount: z.coerce.number().min(0, { message: "Le montant doit être positif !" }),
  date: z.coerce.date().optional(),
  note: z.string().optional().or(z.literal("")),
  teacherId: z.string().min(1, { message: "L'enseignant est requis !" }),
});

export type SalaryPaymentSchema = z.infer<typeof salaryPaymentSchema>;
