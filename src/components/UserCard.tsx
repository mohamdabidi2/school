import prisma from "@/lib/prisma";
import Image from "next/image";

const labels: Record<"admin" | "teacher" | "student" | "parent" | "class" | "subject", string> = {
  admin: "Administrateurs",
  teacher: "Enseignants",
  student: "Étudiants",
  parent: "Parents",
  class: "Classes",
  subject: "Matières",
};

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent" | "class" | "subject";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
    class: prisma.class,
    subject: prisma.subject,
  };

  const data = await modelMap[type].count();

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2024/25
        </span>
        <Image src="/more.png" alt="Plus" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{data}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{labels[type]}</h2>
    </div>
  );
};

export default UserCard;
