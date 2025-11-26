import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";

import { auth } from "@clerk/nextjs/server";

// Déclaration du type pour chaque résultat
type ListeResultat = {
  id: number;
  titre: string;
  nomEtudiant: string;
  prenomEtudiant: string;
  nomProf: string;
  prenomProf: string;
  note: number;
  nomClasse: string;
  dateDebut: Date;
};

const PageListeResultats = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const idUtilisateur = userId;

  // Colonnes pour le tableau des résultats
  const colonnes = [
    {
      enTete: "Titre",
      cle: "titre",
    },
    {
      enTete: "Élève",
      cle: "eleve",
    },
    {
      enTete: "Note",
      cle: "note",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Enseignant",
      cle: "enseignant",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Classe",
      cle: "classe",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Date",
      cle: "date",
      classeNom: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            enTete: "Actions",
            cle: "actions",
          },
        ]
      : []),
  ];

  // Fonction pour rendre une ligne du tableau
  const afficherLigne = (item: ListeResultat) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.titre}</td>
      <td>{item.nomEtudiant + " " + item.prenomEtudiant}</td>
      <td className="hidden md:table-cell">{item.note}</td>
      <td className="hidden md:table-cell">
        {item.nomProf + " " + item.prenomProf}
      </td>
      <td className="hidden md:table-cell">{item.nomClasse}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("fr-FR").format(item.dateDebut)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Construction de la requête selon les paramètres de recherche
  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Filtrage supplémentaire selon le rôle de l'utilisateur
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: idUtilisateur! } } },
        { assignment: { lesson: { teacherId: idUtilisateur! } } },
      ];
      break;
    case "student":
      query.studentId = idUtilisateur!;
      break;
    case "parent":
      query.student = {
        parentId: idUtilisateur!,
      };
      break;
    default:
      break;
  }

  // Récupération des résultats et du nombre total
  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  // Formatage des données pour alimenter le tableau
  const donnees = dataRes.map((item) => {
    const evaluation = item.exam || item.assignment;

    if (!evaluation) return null;

    const estExamen = "startTime" in evaluation;

    return {
      id: item.id,
      titre: evaluation.title,
      nomEtudiant: item.student.name,
      prenomEtudiant: item.student.surname,
      nomProf: evaluation.lesson.teacher.name,
      prenomProf: evaluation.lesson.teacher.surname,
      note: item.score,
      nomClasse: evaluation.lesson.class.name,
      dateDebut: estExamen ? evaluation.startTime : evaluation.startDate,
    };
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* HAUT */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Tous les résultats
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
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

export default PageListeResultats;
