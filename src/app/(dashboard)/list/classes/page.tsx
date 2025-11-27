import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { requireCurrentUser } from "@/lib/auth";

// Type étendu pour la liste des classes incluant le professeur principal
type ListeClasse = Class & { supervisor: Teacher, teachers: Pick<Teacher,'id'|'name'|'surname'>[] };

// Page de la liste des classes (FR)
const PageListeClasses = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await requireCurrentUser();
  const role = user.role;
  const teacherScopeId = user.teacherId || user.id;
  const studentScopeId = user.studentId || user.id;
  const parentScopeId = user.parentId || user.id;

  // Définition des colonnes du tableau des classes
  const colonnes = [
    {
      enTete: "Nom de la classe",
      cle: "name",
    },
    {
      enTete: "Capacité",
      cle: "capacity",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Niveau",
      cle: "gradeId",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Professeur principal",
      cle: "supervisor",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Enseignants",
      cle: "teachers",
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

  // Fonction pour afficher une ligne du tableau des classes
  const afficherLigne = (item: ListeClasse) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">{item.capacity}</td>
      <td className="hidden md:table-cell">{item.gradeId}</td>
      <td className="hidden md:table-cell">
        {item.supervisor.name + " " + item.supervisor.surname}
      </td>
      <td className="hidden md:table-cell">
        {item.teachers.map(t => `${t.name} ${t.surname}`).join(', ') || '-'}
      </td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Traitement des paramètres de recherche
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-scoped visibility
  if (role === "teacher") {
    query.teachers = { some: { id: teacherScopeId } } as any;
  } else if (role === "student") {
    const student = await prisma.student.findUnique({ where: { id: studentScopeId }, select: { classId: true } });
    if (student?.classId) query.id = student.classId;
    else query.id = -1 as any;
  } else if (role === "parent") {
    const children = await prisma.student.findMany({ where: { parentId: parentScopeId }, select: { classId: true } });
    const classIds = Array.from(new Set(children.map(c => c.classId).filter(Boolean))) as number[];
    if (classIds.length) query.id = { in: classIds } as any; else query.id = -1 as any;
  }

  const [donnees, total] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        teachers: { select: { id: true, name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Liste des classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filtrer" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Trier" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="class" type="create" />}
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

export default PageListeClasses;
