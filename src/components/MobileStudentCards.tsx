import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";

// Mobile Student Cards component
const MobileStudentCards = async ({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined } 
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role || "";
  
  const { page, search } = searchParams;
  const p = page ? parseInt(page) : 1;
  
  const where: any = {
    ...(search ? { 
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { surname: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    } : {})
  };

  const [students, count] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      include: {
        class: true,
        parent: true,
        grade: true
      },
      orderBy: { createdAt: 'desc' },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1)
    }),
    prisma.student.count({ where })
  ]);

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Élèves</h1>
        <p className="text-gray-600">{count} élève{count > 1 ? 's' : ''} trouvé{count > 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {students.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-200">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                {student.img ? (
                  <Image 
                    src={student.img} 
                    alt={`${student.name} ${student.surname}`} 
                    width={64} 
                    height={64}
                    className="object-cover w-16 h-16"
                  />
                ) : (
                  <Image src="/noAvatar.png" alt="avatar" width={32} height={32} />
                )}
              </div>
              
              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {student.name} {student.surname}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.sex === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {student.sex === 'MALE' ? 'Garçon' : 'Fille'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  @{student.username}
                </p>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Image src="/class.png" alt="classe" width={16} height={16} className="mr-2" />
                    <span>Classe: {student.class?.name || 'Non assignée'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Image src="/parent.png" alt="parent" width={16} height={16} className="mr-2" />
                    <span>Parent: {student.parent?.name} {student.parent?.surname}</span>
                  </div>
                  
                  {student.email && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Image src="/mail.png" alt="email" width={16} height={16} className="mr-2" />
                      <span>{student.email}</span>
                    </div>
                  )}
                  
                  {student.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Image src="/phone.png" alt="téléphone" width={16} height={16} className="mr-2" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <Link
                href={`/list/students/${student.id}`}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                Voir
              </Link>
              {role === "admin" && (
                <>
                  <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors">
                    Modifier
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors">
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {count > ITEM_PER_PAGE && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(count / ITEM_PER_PAGE) }, (_, i) => (
              <Link
                key={i + 1}
                href={`?page=${i + 1}${search ? `&search=${search}` : ''}`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  p === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileStudentCards;
