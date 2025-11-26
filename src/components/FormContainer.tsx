import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

// Définition des propriétés du composant FormContainer
export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "teacherAbsence"
    | "salaryPayment"
    | "staff";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

// Composant principal FormContainer
const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let donneesLiees = {};

  // Authentification de l'utilisateur courant
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const utilisateurActuelId = userId;

  // Config de sélection réutilisée pour classes et matières (exam / assignment)
  const classSelectConfig = {
    id: true,
    name: true,
    teachers: {
      select: {
        id: true,
        name: true,
        surname: true,
      },
    },
  };

  const subjectSelectConfig = {
    id: true,
    name: true,
    teachers: {
      select: {
        id: true,
        name: true,
        surname: true,
      },
    },
  };

  // Récupération des données liées selon le type et la table
  if (type !== "delete") {
    switch (table) {
      case "subject":
        const enseignantsPourMatiere = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        donneesLiees = { teachers: enseignantsPourMatiere };
        break;
      case "class":
        const niveauxClasse = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const enseignantsClasse = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        donneesLiees = { teachers: enseignantsClasse, grades: niveauxClasse };
        break;
      case "teacher":
        const matieresEnseignant = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        donneesLiees = { subjects: matieresEnseignant };
        break;
      case "student":
        const niveauxEleve = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classesEleve = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const parentsEleve = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true }
        });
        donneesLiees = { classes: classesEleve, grades: niveauxEleve, parents: parentsEleve };
        break;
      case "exam":
        const leconsExamen = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: utilisateurActuelId! } : {}),
          },
          select: { id: true, name: true, class: { select: { id: true, name: true } }, subject: { select: { id: true, name: true } } },
        });
        const classesForExam = role === "teacher"
          ? await prisma.class.findMany({
              where: { teachers: { some: { id: utilisateurActuelId! } } },
              select: classSelectConfig,
            })
          : await prisma.class.findMany({ select: classSelectConfig });
        const subjectsForExam = role === "teacher"
          ? await prisma.subject.findMany({
              where: { teachers: { some: { id: utilisateurActuelId! } } },
              select: subjectSelectConfig,
            })
          : await prisma.subject.findMany({ select: subjectSelectConfig });
        let teachersForExam = role === "teacher"
          ? await prisma.teacher.findMany({ where: { id: utilisateurActuelId! }, select: { id: true, name: true, surname: true } })
          : await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });
        if (!teachersForExam.length) {
          const map: Record<string, { id: string; name: string; surname: string }> = {};
          subjectsForExam.forEach((s: any) => (s.teachers||[]).forEach((t:any)=> { map[t.id] ||= { id: t.id, name: t.name||"", surname: t.surname||"" }; }));
          classesForExam.forEach((c: any) => (c.teachers||[]).forEach((t:any)=> { map[t.id] ||= { id: t.id, name: t.name||"", surname: t.surname||"" }; }));
          teachersForExam = Object.values(map);
        }
        donneesLiees = { lessons: leconsExamen, classes: classesForExam, subjects: subjectsForExam, teachers: teachersForExam, role };
        break;
      case "assignment":
        const leconsDevoir = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: utilisateurActuelId! } : {}),
          },
          select: { id: true, name: true, class: { select: { id: true, name: true } }, subject: { select: { id: true, name: true } } },
        });
        const classesForAssign = role === "teacher"
          ? await prisma.class.findMany({
              where: { teachers: { some: { id: utilisateurActuelId! } } },
              select: classSelectConfig,
            })
          : await prisma.class.findMany({ select: classSelectConfig });
        const subjectsForAssign = role === "teacher"
          ? await prisma.subject.findMany({
              where: { teachers: { some: { id: utilisateurActuelId! } } },
              select: subjectSelectConfig,
            })
          : await prisma.subject.findMany({ select: subjectSelectConfig });
        let teachersForAssign = role === "teacher"
          ? await prisma.teacher.findMany({ where: { id: utilisateurActuelId! }, select: { id: true, name: true, surname: true } })
          : await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });
        if (!teachersForAssign.length) {
          const map: Record<string, { id: string; name: string; surname: string }> = {};
          subjectsForAssign.forEach((s: any) => (s.teachers||[]).forEach((t:any)=> { map[t.id] ||= { id: t.id, name: t.name||"", surname: t.surname||"" }; }));
          classesForAssign.forEach((c: any) => (c.teachers||[]).forEach((t:any)=> { map[t.id] ||= { id: t.id, name: t.name||"", surname: t.surname||"" }; }));
          teachersForAssign = Object.values(map);
        }
        donneesLiees = { lessons: leconsDevoir, classes: classesForAssign, subjects: subjectsForAssign, teachers: teachersForAssign, role };
        break;
      case "result":
        const eleves = await prisma.student.findMany({ select: { id: true, name: true, surname: true } });
        const examens = await prisma.exam.findMany({ select: { id: true, title: true } });
        const devoirs = await prisma.assignment.findMany({ select: { id: true, title: true } });
        donneesLiees = { students: eleves, exams: examens, assignments: devoirs };
        break;
      case "attendance":
        const leconsPresence = await prisma.lesson.findMany({ select: { id: true, name: true } });
        const etudiantsPresence = await prisma.student.findMany({ select: { id: true, name: true, surname: true } });
        donneesLiees = { lessons: leconsPresence, students: etudiantsPresence };
        break;
      case "lesson":
        const matieresLecon = await prisma.subject.findMany({ select: { id: true, name: true } });
        const classesLecon = await prisma.class.findMany({ select: { id: true, name: true } });
        const enseignantsLecon = await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });
        donneesLiees = { subjects: matieresLecon, classes: classesLecon, teachers: enseignantsLecon };
        break;
      case "announcement":
        const classesAnnonce = await prisma.class.findMany({ select: { id: true, name: true } });
        donneesLiees = { classes: classesAnnonce };
        break;
      case "event":
        const classesEvent = await prisma.class.findMany({ select: { id: true, name: true } });
        donneesLiees = { classes: classesEvent };
        break;
      case "teacherAbsence":
        const enseignantsAbs = await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });
        donneesLiees = { teachers: enseignantsAbs };
        break;
      case "salaryPayment":
        const enseignantsSal = await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });
        donneesLiees = { teachers: enseignantsSal };
        break;
      case "staff":
        // pas de données liées nécessaires
        donneesLiees = {};
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={donneesLiees}
      />
    </div>
  );
};

export default FormContainer;
