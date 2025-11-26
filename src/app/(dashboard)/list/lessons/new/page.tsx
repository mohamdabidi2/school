import prisma from "@/lib/prisma";
import LessonForm from "@/components/forms/LessonForm";

const NewLessonPage = async () => {
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
  const classes = await prisma.class.findMany({ select: { id: true, name: true } });
  const teachers = await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });

  return (
    <div className="bg-white p-4 rounded-md m-4">
      <LessonForm
        type="create"
        relatedData={{ subjects, classes, teachers }}
        setOpen={() => {}}
      />
    </div>
  );
};

export default NewLessonPage;


