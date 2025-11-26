import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Page de profil d'un enseignant (en français)
const PageUniqueEnseignant = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const enseignant:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!enseignant) {
    return notFound();
  }
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* GAUCHE */}
      <div className="w-full xl:w-2/3">
        {/* HAUT */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* CARTE D'INFOS ENSEIGNANT */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={enseignant.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {enseignant.name + " " + enseignant.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="teacher" type="update" data={enseignant} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Description de l&apos;enseignant à compléter...
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("fr-FR").format(enseignant.birthday)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{enseignant.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{enseignant.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* PETITES CARTES */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARTE Présence */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Présence</span>
              </div>
            </div>
            {/* CARTE Matières */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {enseignant._count.subjects}
                </h1>
                <span className="text-sm text-gray-400">Matières</span>
              </div>
            </div>
            {/* CARTE Leçons */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {enseignant._count.lessons}
                </h1>
                <span className="text-sm text-gray-400">Leçons</span>
              </div>
            </div>
            {/* CARTE Classes */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {enseignant._count.classes}
                </h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>
        {/* BAS */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <BigCalendarContainer 
            type="teacherId" 
            id={enseignant.id}
            title={`Emploi du temps - ${enseignant.name} ${enseignant.surname}`}
            showStats={true}
          />
        </div>
      </div>
      {/* DROITE */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Raccourcis</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/classes?supervisorId=${enseignant.id}`}
            >
              Classes de l&apos;enseignant
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/students?teacherId=${enseignant.id}`}
            >
              Élèves de l&apos;enseignant
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/lessons?teacherId=${enseignant.id}`}
            >
              Leçons de l&apos;enseignant
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?teacherId=${enseignant.id}`}
            >
              Examens de l&apos;enseignant
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?teacherId=${enseignant.id}`}
            >
              Devoirs de l&apos;enseignant
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default PageUniqueEnseignant;
