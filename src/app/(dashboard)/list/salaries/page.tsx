import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import { requireCurrentUser } from "@/lib/auth";

type SalaryRow = { id: number; amount: number; date: Date; note: string | null; teacher: { id: string; name: string; surname: string } };

const PageSalaries = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const user = await requireCurrentUser();
  const role = user.role;
  const teacherId = user.teacherId || user.id;

  const { page, search } = searchParams;
  const p = page ? parseInt(page) : 1;

  const where: any = {};
  if (search) {
    where.OR = [
      { note: { contains: search, mode: 'insensitive' } },
      { teacher: { name: { contains: search, mode: 'insensitive' } } },
      { teacher: { surname: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Role-scoped filtering: teacher sees only own salary; others unrestricted (admin/finance)
  if (role === 'teacher') {
    where.teacherId = teacherId;
  }

  const [rows, count] = await prisma.$transaction([
    prisma.salaryPayment.findMany({
      where,
      include: { teacher: { select: { id: true, name: true, surname: true } } },
      orderBy: { date: 'desc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.salaryPayment.count({ where }),
  ]);

  const columns = [
    { enTete: 'Enseignant', cle: 'teacher' },
    { enTete: 'Date', cle: 'date' },
    { enTete: 'Montant', cle: 'amount' },
    { enTete: 'Note', cle: 'note', classeNom: 'hidden md:table-cell' },
    { enTete: 'Actions', cle: 'action' },
  ];

  const renderRow = (item: SalaryRow) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.teacher.name} {item.teacher.surname}</td>
      <td>{new Intl.DateTimeFormat('fr-FR').format(new Date(item.date))}</td>
      <td>{item.amount.toFixed(2)} DH</td>
      <td className="hidden md:table-cell max-w-[320px] truncate">{item.note || '-'}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormContainer table="salaryPayment" type="update" data={item} />
          <FormContainer table="salaryPayment" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Salaires de l&apos;équipe</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormContainer table="salaryPayment" type="create" />
          </div>
        </div>
      </div>
      <Table colonnes={columns} afficherLigne={renderRow} donnees={rows as any} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default PageSalaries;


