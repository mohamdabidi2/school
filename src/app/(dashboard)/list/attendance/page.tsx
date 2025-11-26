import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import BulkAttendance from "@/components/attendance/BulkAttendance";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AttendanceWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "lessonId":
            query.lessonId = parseInt(value);
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-scoped filtering
  if (role === "teacher" && userId) {
    query.lesson = { teacherId: userId } as any;
  } else if (role === "student" && userId) {
    query.studentId = userId;
  } else if (role === "parent" && userId) {
    query.student = { parentId: userId } as any;
  }

  const [rows, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        lesson: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.attendance.count({ where: query }),
  ]);

  const columns = [
    { enTete: "Élève", cle: "student" },
    { enTete: "Leçon", cle: "lesson" },
    { enTete: "Date", cle: "date", classeNom: "hidden md:table-cell" },
    { enTete: "Statut", cle: "status", classeNom: "hidden md:table-cell" },
    { enTete: "Actions", cle: "action" },
  ];

  const renderRow = (item: any) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.student.name} {item.student.surname}</td>
      <td>{item.lesson.name}</td>
      <td className="hidden md:table-cell">{new Intl.DateTimeFormat("fr-FR", { dateStyle: 'short', timeStyle: 'short' }).format(item.date)}</td>
      <td className="hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {item.present ? 'Présent' : 'Absent'}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <FormContainer table="attendance" type="update" data={item} />
          <FormContainer table="attendance" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Présences</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filtrer" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Trier" width={14} height={14} />
            </button>
            <FormContainer table="attendance" type="create" />
          </div>
        </div>
      </div>
      <Table colonnes={columns} afficherLigne={renderRow} donnees={rows} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage;


