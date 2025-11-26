import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import MobileDataCards from "@/components/MobileDataCards";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";

// Définition du type pour la liste des étudiants incluant la classe
type ListeEtudiant = Student & { class: Class };

// Page de la liste des étudiants (en français)
const PageListeEtudiants = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Récupération du rôle de l'utilisateur connecté
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Définition des colonnes du tableau d'élèves
  const colonnes = [
    {
      enTete: "Infos",
      cle: "info",
    },
    {
      enTete: "Identifiant",
      cle: "studentId",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Niveau",
      cle: "grade",
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

  // Fonction pour afficher une ligne du tableau d'élèves
  const afficherLigne = (eleve: ListeEtudiant) => (
    <tr
      key={eleve.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={eleve.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{eleve.name}</h3>
          <p className="text-xs text-gray-500">{eleve.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{eleve.username}</td>
      <td className="hidden md:table-cell">{eleve.class.name[0]}</td>
      <td className="hidden md:table-cell">{eleve.phone}</td>
      <td className="hidden md:table-cell">{eleve.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${eleve.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="Voir" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="student" type="delete" id={eleve.id} />
          )}
        </div>
      </td>
    </tr>
  );

  // Gestion de la pagination et des paramètres de recherche
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Création des filtres selon les paramètres passés
  const requete: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            requete.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "search":
            requete.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-scoped visibility
  if (role === "teacher" && userId) {
    requete.class = {
      teachers: {
        some: { id: userId },
      },
    } as any;
  } else if (role === "student" && userId) {
    requete.id = userId;
  } else if (role === "parent" && userId) {
    requete.parentId = userId;
  }

  // Récupération de la liste des élèves et du nombre total
  const [donnees, total] = await prisma.$transaction([
    prisma.student.findMany({
      where: requete,
      include: {
        class: true,
        parent: {
          select: { name: true, surname: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: requete }),
  ]);

  // Prepare data for mobile cards
  const mobileCardData = donnees.map((student) => ({
    id: student.id,
    title: `${student.name} ${student.surname}`,
    subtitle: `@${student.username}`,
    image: student.img || undefined,
    badge: {
      text: student.sex === 'MALE' ? 'Garçon' : 'Fille',
      color: student.sex === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
    },
    details: [
      {
        icon: '/class.png',
        label: 'Classe',
        value: student.class?.name || 'Non assignée'
      },
      {
        icon: '/parent.png',
        label: 'Parent',
        value: `${student.parent?.name} ${student.parent?.surname}`
      },
      ...(student.email ? [{
        icon: '/mail.png',
        label: 'Email',
        value: student.email
      }] : []),
      ...(student.phone ? [{
        icon: '/phone.png',
        label: 'Téléphone',
        value: student.phone
      }] : [])
    ],
    actions: [
      {
        label: 'Voir',
        href: `/list/students/${student.id}`,
        variant: 'primary' as const
      },
      ...(role === "admin" ? [
        {
          label: 'Modifier',
          href: '#',
          variant: 'secondary' as const
        },
        {
          label: 'Supprimer',
          href: '#',
          variant: 'danger' as const
        }
      ] : [])
    ]
  }));

  return (
    <>
      {/* Desktop/Tablet View */}
      <div className="hidden md:block bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* EN-TÊTE */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Tous les élèves</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="Filtrer" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="Trier" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormContainer table="student" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* LISTE */}
        <Table colonnes={colonnes} afficherLigne={afficherLigne} donnees={donnees} />
        {/* PAGINATION */}
        <Pagination page={p} count={total} />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileDataCards
          title="Tous les élèves"
          subtitle={`${total} élève${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
          items={mobileCardData}
          totalCount={total}
          showPagination={total > ITEM_PER_PAGE}
          currentPage={p}
          totalPages={Math.ceil(total / ITEM_PER_PAGE)}
        />
      </div>
    </>
  );
};

export default PageListeEtudiants;
