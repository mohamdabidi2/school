import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

// Type pour la liste des matières incluant les enseignants
type ListeMatiere = Subject & { teachers: Teacher[] };

// Page de la liste des matières (FR)
const PageListeMatieres = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Définition des colonnes du tableau de matières
  const colonnes = [
    {
      enTete: "Nom de la matière",
      cle: "name",
    },
    {
      enTete: "Enseignants",
      cle: "teachers",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Actions",
      cle: "action",
    },
  ];

  // Fonction pour afficher une ligne du tableau de matières
  const afficherLigne = (item: ListeMatiere) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.teachers.map((teacher) => teacher.name).join(", ")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...autresParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Construction des filtres depuis les paramètres d'URL
  const query: Prisma.SubjectWhereInput = {};

  if (autresParams) {
    for (const [key, value] of Object.entries(autresParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-scoped filtering
  if (role === 'teacher' && userId) {
    query.teachers = { some: { id: userId } } as any;
  } else if (role === 'student' && userId) {
    const student = await prisma.student.findUnique({ where: { id: userId }, select: { classId: true } });
    if (student?.classId) {
      query.lessons = { some: { classId: student.classId } } as any;
    } else {
      query.id = -1 as any;
    }
  } else if (role === 'parent' && userId) {
    const children = await prisma.student.findMany({ where: { parentId: userId }, select: { classId: true } });
    const classIds = Array.from(new Set(children.map(c => c.classId).filter(Boolean))) as number[];
    if (classIds.length) query.lessons = { some: { classId: { in: classIds } as any } } as any; else query.id = -1 as any;
  }

  // Récupération des matières et du nombre total
  const [donnees, total] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Toutes les matières</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="subject" type="create" />
            )}
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

export default PageListeMatieres;
