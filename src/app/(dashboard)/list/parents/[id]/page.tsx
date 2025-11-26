import Announcements from "@/components/Announcements";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const ParentProfilePage = async ({ params: { id } }: { params: { id: string } }) => {
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: { students: { include: { class: true } } },
  });

  if (!parent) return notFound();

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image src={"/noAvatar.png"} alt="" width={144} height={144} className="w-36 h-36 rounded-full object-cover" />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{parent.name} {parent.surname}</h1>
              </div>
              <p className="text-sm text-gray-500">Profil Parent</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{parent.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{parent.phone || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/home.png" alt="" width={14} height={14} />
                  <span className="truncate max-w-[220px]">{parent.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS: children count */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image src="/student.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">{parent.students.length}</h1>
                <span className="text-sm text-gray-400">Enfants</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHILDREN LIST */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h3 className="text-lg font-semibold mb-3">Enfants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parent.students.map((s) => (
              <Link key={s.id} href={`/list/students/${s.id}`} className="p-3 rounded-md border hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name} {s.surname}</p>
                    <p className="text-xs text-gray-500">Classe: {s.class?.name || '-'}</p>
                  </div>
                  <span className="text-xs text-blue-600">Voir →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Raccourcis</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/students?parentId=${parent.id}`}>
              Élèves du parent
            </Link>
          </div>
        </div>
        <Announcements />
      </div>
    </div>
  );
};

export default ParentProfilePage;


