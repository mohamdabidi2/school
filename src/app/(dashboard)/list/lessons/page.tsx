import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { requireCurrentUser } from "@/lib/auth";

// Définir le type pour une ligne de la liste des leçons
type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  // Authentification et récupération du rôle de l'utilisateur
  const user = await requireCurrentUser();
  const role = user.role;
  const teacherId = user.teacherId || user.id;
  const studentId = user.studentId || user.id;
  const parentId = user.parentId || user.id;

  // Définition des colonnes du tableau, avec l'affichage conditionnel selon le rôle
  const colonnes = [
    {
      enTete: "Nom de la matière",
      cle: "name",
    },
    {
      enTete: "Classe",
      cle: "class",
    },
    {
      enTete: "Enseignant",
      cle: "teacher",
      classeNom: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            enTete: "Actions",
            cle: "action",
          },
        ]
      : []),
  ];

  // Fonction pour rendre une ligne du tableau
  const afficherLigne = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name + " " + item.teacher.surname}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Extraction de la page courante et des autres paramètres de recherche
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Construction de la requête en fonction des paramètres d'URL
  const requete: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            requete.classId = parseInt(value);
            break;
          case "teacherId":
            requete.teacherId = value;
            break;
          case "search":
            requete.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Filtrage par rôle: chaque rôle ne voit que ses leçons pertinentes
  if (role === "teacher") {
    requete.teacherId = teacherId;
  } else if (role === "student") {
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { classId: true } });
    if (student?.classId) requete.classId = student.classId;
  } else if (role === "parent") {
    const children = await prisma.student.findMany({ where: { parentId }, select: { classId: true } });
    const classIds = Array.from(new Set(children.map(c => c.classId).filter(Boolean))) as number[];
    if (classIds.length) requete.classId = { in: classIds } as any;
    else requete.classId = -1 as any; // no results if no classes
  }

  // Récupération des données et du nombre total de résultats
  const [donnees, total] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: requete,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: requete }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Toutes les leçons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filtrer" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Trier" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="lesson" type="create" />}
          </div>
        </div>
      </div>
      {/* LISTE */}
      <Table colonnes={colonnes} afficherLigne={afficherLigne} donnees={donnees} />
      {/* PAGINATION */}
      <Pagination page={p} count={total} />
    </div>
  );
};

export default LessonListPage;
