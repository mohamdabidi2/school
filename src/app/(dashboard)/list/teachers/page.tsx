import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import MobileDataCards from "@/components/MobileDataCards";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { requireCurrentUser } from "@/lib/auth";

// Définition du type pour la liste des enseignants avec matières et classes associées
type ListeEnseignant = Teacher & { subjects: Subject[] } & { classes: Class[] };

// Page de la liste des enseignants (en français)
const PageListeEnseignants = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Récupération du rôle de l'utilisateur connecté
  const user = await requireCurrentUser();
  const role = user.role;
  const teacherScopeId = user.teacherId || user.id;
  const studentScopeId = user.studentId || user.id;
  const parentScopeId = user.parentId || user.id;

  // Définition des colonnes du tableau d'enseignants
  const colonnes = [
    {
      enTete: "Infos",
      cle: "info",
    },
    {
      enTete: "Identifiant",
      cle: "teacherId",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Matières",
      cle: "subjects",
      classeNom: "hidden md:table-cell",
    },
    {
      enTete: "Classes",
      cle: "classes",
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

  // Fonction d'affichage d'une ligne du tableau d'enseignants
  const afficherLigne = (item: ListeEnseignant) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(", ")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((classeItem) => classeItem.name).join(", ")}
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...autresParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Construction des filtres depuis les paramètres d'URL
  const query: Prisma.TeacherWhereInput = {};

  if (autresParams) {
    for (const [key, value] of Object.entries(autresParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
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
    query.id = teacherScopeId;
  } else if (role === "student") {
    // Teachers who teach student's class
    const student = await prisma.student.findUnique({ where: { id: studentScopeId }, select: { classId: true } });
    if (student?.classId) {
      query.lessons = { some: { classId: student.classId } };
    } else {
      query.id = "__none__" as any; // no results
    }
  } else if (role === "parent") {
    // Teachers who teach any of the parent's children classes
    const children = await prisma.student.findMany({ where: { parentId: parentScopeId }, select: { classId: true } });
    const classIds = Array.from(new Set(children.map(c => c.classId).filter(Boolean))) as number[];
    if (classIds.length) {
      query.lessons = { some: { classId: { in: classIds } as any } } as any;
    } else {
      query.id = "__none__" as any;
    }
  }

  const [donnees, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  // Prepare data for mobile cards
  const mobileCardData = donnees.map((teacher) => ({
    id: teacher.id,
    title: `${teacher.name} ${teacher.surname}`,
    subtitle: `@${teacher.username}`,
    image: teacher.img || undefined,
    badge: {
      text: teacher.sex === 'MALE' ? 'Homme' : 'Femme',
      color: teacher.sex === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
    },
    details: [
      {
        icon: '/subject.png',
        label: 'Matières',
        value: teacher.subjects.map(s => s.name).join(', ') || 'Aucune'
      },
      {
        icon: '/class.png',
        label: 'Classes',
        value: teacher.classes.map(c => c.name).join(', ') || 'Aucune'
      },
      ...(teacher.email ? [{
        icon: '/mail.png',
        label: 'Email',
        value: teacher.email
      }] : []),
      ...(teacher.phone ? [{
        icon: '/phone.png',
        label: 'Téléphone',
        value: teacher.phone
      }] : [])
    ],
    actions: [
      {
        label: 'Voir',
        href: `/list/teachers/${teacher.id}`,
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
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Tous les enseignants</h1>
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
                <FormContainer table="teacher" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* TABLEAU - LISTE */}
        <Table colonnes={colonnes} afficherLigne={afficherLigne} donnees={donnees} />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileDataCards
          title="Tous les enseignants"
          subtitle={`${count} enseignant${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`}
          items={mobileCardData}
          totalCount={count}
          showPagination={count > ITEM_PER_PAGE}
          currentPage={p}
          totalPages={Math.ceil(count / ITEM_PER_PAGE)}
        />
      </div>
    </>
  );
};

export default PageListeEnseignants;
