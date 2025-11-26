import FormContainer from "@/components/FormContainer";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { ITEM_PER_PAGE } from "@/lib/settings";
import prisma from "@/lib/prisma";

const AdminTeamPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const { page, search } = searchParams;
  const p = page ? parseInt(page) : 1;
  const where: any = { ...(search ? { username: { contains: search, mode: 'insensitive' } } : {}) };
  const [admins, count] = await prisma.$transaction([
    prisma.staffUser.findMany({ where, orderBy: { createdAt: 'desc' }, take: ITEM_PER_PAGE, skip: ITEM_PER_PAGE * (p - 1) }),
    prisma.staffUser.count({ where })
  ]);

  const columns = [
    { enTete: 'Nom', cle: 'name' },
    { enTete: 'Prénom', cle: 'surname' },
    { enTete: "Nom d'utilisateur", cle: 'username' },
    { enTete: 'Email', cle: 'email', classeNom: 'hidden md:table-cell' },
    { enTete: 'Téléphone', cle: 'phone', classeNom: 'hidden md:table-cell' },
    { enTete: 'Rôle', cle: 'role' },
    { enTete: 'Salaire (TND)', cle: 'salary' },
    { enTete: 'Actions', cle: 'action' },
  ];

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'teacher': 'Enseignant',
      'student': 'Étudiant',
      'parent': 'Parent',
      'administration': 'Administration',
      'finance': 'Finance',
      'director': 'Directeur'
    };
    return roleMap[role] || role;
  };

  const renderRow = (u: any) => (
    <tr key={u.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{u.name}</td>
      <td>{u.surname}</td>
      <td>{u.username}</td>
      <td className="hidden md:table-cell">{u.email || '-'}</td>
      <td className="hidden md:table-cell">{u.phone || '-'}</td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          u.role === 'admin' ? 'bg-red-100 text-red-800' :
          u.role === 'director' ? 'bg-purple-100 text-purple-800' :
          u.role === 'finance' ? 'bg-green-100 text-green-800' :
          u.role === 'administration' ? 'bg-blue-100 text-blue-800' :
          u.role === 'teacher' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {getRoleDisplayName(u.role)}
        </span>
      </td>
      <td>{u.salary != null ? `${u.salary.toFixed(2)} TND` : '-'}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormContainer table="staff" type="update" data={u} />
          <FormContainer table="staff" type="delete" id={u.id} />
        </div>
      </td>
    </tr>
  );
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Gestion Équipe Staff</h1>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <TableSearch />
        <FormContainer table="staff" type="create" data={{ role: 'administration' }} />
      </div>

      <Table colonnes={columns} afficherLigne={renderRow} donnees={admins as any} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AdminTeamPage;


