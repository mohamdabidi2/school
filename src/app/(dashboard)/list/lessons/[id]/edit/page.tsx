import prisma from "@/lib/prisma";
import LessonForm from "@/components/forms/LessonForm";

const EditLessonPage = async ({ params }: { params: { id: string } }) => {
  const id = parseInt(params.id);
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { subject: true, class: true, teacher: true },
  });
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
  const classes = await prisma.class.findMany({ select: { id: true, name: true } });
  const teachers = await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });

  if (!lesson) return null;

  return (
    <div className="bg-white p-4 rounded-md m-4">
      <LessonForm
        type="update"
        data={lesson as any}
        relatedData={{ subjects, classes, teachers }}
      />
    </div>
  );
};

export default EditLessonPage;


