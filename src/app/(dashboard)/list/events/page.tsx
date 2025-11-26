import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

// Type pour la liste d'événements incluant la classe associée
type ListeEvenement = Event & { class: Class };

// Page de la liste des événements (FR)
const PageListeEvenements = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Colonnes du tableau des événements
  const colonnes = [
    {
      enTete: "Titre",
      cle: "title",
    },
    {
      enTete: "Classe",
      cle: "class",
    },
    {
      enTete: "Date",
      cle: "date",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Heure début",
      cle: "startTime",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Heure fin",
      cle: "endTime",
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

  // Fonction d'affichage d'une ligne du tableau d'évènements
  const afficherLigne = (item: ListeEvenement) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name || "Tous"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("fr-FR").format(item.startTime)}
      </td>
      <td className="hidden md:table-cell">
        {item.startTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td className="hidden md:table-cell">
        {item.endTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Construction de la requête selon les paramètres
  const requete: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            requete.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-scoped filtering
  if (role === "teacher" && currentUserId) {
    // Events for classes the teacher teaches
    const classes = await prisma.class.findMany({
      where: { lessons: { some: { teacherId: currentUserId } } },
      select: { id: true },
    });
    const classIds = classes.map(c => c.id);
    if (classIds.length) requete.classId = { in: classIds } as any; else requete.classId = -1 as any;
  } else if (role === "student" && currentUserId) {
    const student = await prisma.student.findUnique({ where: { id: currentUserId }, select: { classId: true } });
    if (student?.classId) requete.classId = student.classId; else requete.classId = -1 as any;
  } else if (role === "parent" && currentUserId) {
    const children = await prisma.student.findMany({ where: { parentId: currentUserId }, select: { classId: true } });
    const classIds = Array.from(new Set(children.map(c => c.classId).filter(Boolean))) as number[];
    if (classIds.length) requete.classId = { in: classIds } as any; else requete.classId = -1 as any;
  }

  // Récupération des données événements avec la pagination
  const [donnees, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: requete,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        startTime: 'asc'
      }
    }),
    prisma.event.count({ where: requete }),
  ]);

  

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* HAUT */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Tous les événements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="event" type="create" />}
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

export default PageListeEvenements;
