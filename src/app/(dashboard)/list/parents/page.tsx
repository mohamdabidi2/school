import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

// Type pour la liste de parents incluant les élèves associés
type ListeParent = Parent & { students: Student[] };

// Page de la liste des parents (FR)
const PageListeParents = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Récupération du rôle de l'utilisateur connecté
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Définition des colonnes du tableau des parents
  const colonnes = [
    {
      enTete: "Informations",
      cle: "info",
    },
    {
      enTete: "Élèves",
      cle: "students",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Téléphone",
      cle: "phone",
      classeNom: "hidden lg:table-cell",
    },
    {
      enTete: "Adresse",
      cle: "address",
      classeNom: "hidden lg:table-cell",
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

  // Fonction d'affichage d'une ligne du tableau de parents
  const afficherLigne = (item: ListeParent) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.students.map((student) => student.name).join(", ")}
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="parent" type="update" data={item} />
            <FormContainer table="parent" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...autresParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Construction des filtres depuis les paramètres d'URL
  const query: Prisma.ParentWhereInput = {};
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
  // Scope for teachers: only parents of students in teacher's classes
  if (role === "teacher" && userId) {
    query.students = {
      some: {
        class: {
          teachers: {
            some: { id: userId },
          },
        },
      },
    } as any;
  }

  const [donnees, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* HAUT */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Tous les parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="parent" type="create" />}
          </div>
        </div>
      </div>
      {/* LISTE */}
      <Table colonnes={colonnes} afficherLigne={afficherLigne} donnees={donnees} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default PageListeParents;
