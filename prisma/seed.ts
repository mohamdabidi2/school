import { PrismaClient, Day, UserSex } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

function uniqueUsername(base: string, used: Set<string>): string {
  let username = base;
  let i = 1;
  while (used.has(username)) {
    username = `${base}${i}`;
    i++;
  }
  used.add(username);
  return username;
}

// Helper to generate unique emails
function uniqueEmail(base: string, used: Set<string>): string {
  let email = base;
  let i = 1;
  while (used.has(email)) {
    const [local, domain] = base.split("@");
    email = `${local}${i}@${domain}`;
    i++;
  }
  used.add(email);
  return email;
}

type AppUserInput = {
  id: string;
  username: string;
  role: string;
  password?: string;
  teacherId?: string;
  studentId?: string;
  parentId?: string;
  adminId?: string;
};

async function createAppUserRecord({
  id,
  username,
  role,
  password = "password123",
  teacherId,
  studentId,
  parentId,
  adminId,
}: AppUserInput) {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.appUser.create({
    data: {
      id,
      username,
      passwordHash,
      role,
      ...(teacherId ? { teacherId } : {}),
      ...(studentId ? { studentId } : {}),
      ...(parentId ? { parentId } : {}),
      ...(adminId ? { adminId } : {}),
    },
  });
}

async function main() {
  // ADMINISTRATEURS
  await prisma.admin.createMany({
    data: [
      { id: "admin1", username: "admin" },
      { id: "admin2", username: "admin2" },
    ],
  });
  await createAppUserRecord({ id: "admin1", username: "admin", role: "admin", password: "admin123", adminId: "admin1" });
  await createAppUserRecord({ id: "admin2", username: "admin2", role: "admin", password: "admin123", adminId: "admin2" });

  // NIVEAUX
  await prisma.grade.createMany({
    data: Array.from({ length: 6 }, (_, i) => ({ level: i + 1 })),
  });

  // CLASSES
  const nomsClasses = ["6A", "5A", "4A", "3A", "2A", "1A"];
  await prisma.class.createMany({
    data: nomsClasses.map((nom, i) => ({
      name: nom,
      gradeId: i + 1,
      capacity: 30,
    })),
  });

  // MATIÈRES
  const matieres = [
    { name: "Mathématiques" },
    { name: "Sciences" },
    { name: "Français" },
    { name: "Arabe" },
    { name: "Histoire-Géographie" },
    { name: "Physique" },
    { name: "Informatique" },
  ];
  await prisma.subject.createMany({ data: matieres });

  // ENSEIGNANTS
  const prenomsProf = ["Ali", "Sami", "Mouna", "Rym", "Omar", "Nadia"];
  const nomsProf = ["Ben Salah", "Trabelsi", "Gharbi", "Masmoudi", "Jlassi", "Saidi"];
  const usedTeacherUsernames = new Set<string>();
  const usedTeacherEmails = new Set<string>();
  for (let i = 0; i < 6; i++) {
    const isMale = i % 2 === 0;
    const prenom = prenomsProf[i];
    const nom = nomsProf[i];
    const username = uniqueUsername(`prof.${prenom.toLowerCase()}`, usedTeacherUsernames);
    const emailBase = `${prenom.toLowerCase()}.${nom.toLowerCase().replace(" ", "")}@ecole.fr`;
    const email = uniqueEmail(emailBase, usedTeacherEmails);
    await prisma.teacher.create({
      data: {
        id: `prof${i + 1}`,
        username,
        name: prenom,
        surname: nom,
        email,
        phone: `+33 6 12 34 56 0${i}`,
        address: `Rue ${nom}, Paris`,
        sex: isMale ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: (i % matieres.length) + 1 }] },
        classes: { connect: [{ id: (i % 6) + 1 }] },
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - (30 + i))),
      },
    });
    await createAppUserRecord({
      id: `prof${i + 1}`,
      username,
      role: "teacher",
      password: "teacher123",
      teacherId: `prof${i + 1}`,
    });
  }

  // COURS
  const jours = Object.values(Day);
  for (let i = 0; i < 12; i++) {
    await prisma.lesson.create({
      data: {
        name: `Cours de ${matieres[i % matieres.length].name}`,
        day: jours[i % jours.length],
        startTime: new Date(new Date().setHours(8 + (i % 6), 0, 0, 0)),
        endTime: new Date(new Date().setHours(10 + (i % 6), 0, 0, 0)),
        subjectId: (i % matieres.length) + 1,
        classId: (i % 6) + 1,
        teacherId: `prof${(i % 6) + 1}`,
      },
    });
  }

  // PARENTS
  const prenomsParents = ["Ahmed", "Bechir", "Amina", "Zahra", "Moncef", "Salwa"];
  const usedParentUsernames = new Set<string>();
  const usedParentEmails = new Set<string>();
  for (let i = 0; i < 6; i++) {
    const isMale = i % 2 === 0;
    const prenom = prenomsParents[i];
    const nom = nomsProf[(i + 2) % nomsProf.length];
    const username = uniqueUsername(`parent.${prenom.toLowerCase()}`, usedParentUsernames);
    const emailBase = `${prenom.toLowerCase()}.${nom.toLowerCase().replace(" ", "")}@gmail.com`;
    const email = uniqueEmail(emailBase, usedParentEmails);
    await prisma.parent.create({
      data: {
        id: `parent${i + 1}`,
        username,
        name: prenom,
        surname: nom,
        email,
        phone: `+33 7 98 76 54 0${i}`,
        address: `Avenue ${nom}, Lyon`,
      },
    });
    await createAppUserRecord({
      id: `parent${i + 1}`,
      username,
      role: "parent",
      password: "parent123",
      parentId: `parent${i + 1}`,
    });
  }

  // ÉLÈVES
  const prenomsEleves = ["Youssef", "Aziz", "Yosra", "Sirine", "Adam", "Sarah"];
  const usedStudentUsernames = new Set<string>();
  const usedStudentEmails = new Set<string>();
  for (let i = 0; i < 12; i++) {
    const isMale = i % 2 === 0;
    const prenom = prenomsEleves[i % prenomsEleves.length];
    const nom = nomsProf[(i + 3) % nomsProf.length];
    const username = uniqueUsername(`eleve.${prenom.toLowerCase()}`, usedStudentUsernames);
    const emailBase = `${prenom.toLowerCase()}.${nom.toLowerCase().replace(" ", "")}@ecole.fr`;
    const email = uniqueEmail(emailBase, usedStudentEmails);
    await prisma.student.create({
      data: {
        id: `eleve${i + 1}`,
        username,
        name: prenom,
        surname: nom,
        email,
        phone: `+33 6 23 45 67 0${i}`,
        address: `Rue ${nom}, Marseille`,
        sex: isMale ? UserSex.MALE : UserSex.FEMALE,
        parentId: `parent${(i % 6) + 1}`,
        gradeId: (i % 6) + 1,
        classId: (i % 6) + 1,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - (12 + (i % 4)))),
      },
    });
    await createAppUserRecord({
      id: `eleve${i + 1}`,
      username,
      role: "student",
      password: "student123",
      studentId: `eleve${i + 1}`,
    });
  }

  // EXAMENS
  const titresExamens = [
    "Contrôle de Mathématiques",
    "Devoir de Sciences",
    "Examen de Français",
    "Contrôle d'Arabe",
    "Devoir d'Histoire-Géographie",
    "Examen de Physique",
    "Contrôle d'Informatique",
  ];
  for (let i = 0; i < 7; i++) {
    await prisma.exam.create({
      data: {
        title: titresExamens[i],
        startTime: new Date(new Date().setHours(9, 0, 0, 0)),
        endTime: new Date(new Date().setHours(11, 0, 0, 0)),
        lessonId: (i % 12) + 1,
      },
    });
  }

  // DEVOIRS
  for (let i = 0; i < 7; i++) {
    await prisma.assignment.create({
      data: {
        title: `Devoir Maison de ${matieres[i % matieres.length].name}`,
        startDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        lessonId: (i % 12) + 1,
      },
    });
  }

  // RÉSULTATS
  for (let i = 0; i < 14; i++) {
    await prisma.result.create({
      data: {
        score: Math.floor(Math.random() * 8) + 12,
        studentId: `eleve${(i % 12) + 1}`,
        ...(i < 7
          ? { examId: (i % 7) + 1 }
          : { assignmentId: ((i - 7) % 7) + 1 }),
      },
    });
  }

  // PRÉSENCES
  for (let i = 0; i < 24; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(new Date().setDate(new Date().getDate() - (i % 10))),
        present: Math.random() > 0.2,
        studentId: `eleve${(i % 12) + 1}`,
        lessonId: (i % 12) + 1,
      },
    });
  }

  // ÉVÉNEMENTS
  const evenements = [
    { title: "Fête Nationale", description: "Célébration nationale" },
    { title: "Journée du Savoir", description: "Fête du savoir" },
    { title: "Tournoi Sportif", description: "Compétition sportive" },
  ];
  for (let i = 0; i < evenements.length; i++) {
    await prisma.event.create({
      data: {
        title: evenements[i].title,
        description: evenements[i].description,
        startTime: new Date(new Date().setDate(new Date().getDate() + (i * 10))),
        endTime: new Date(new Date().setDate(new Date().getDate() + (i * 10) + 1)),
        classId: (i % 6) + 1,
      },
    });
  }

  // ANNONCES
  const annonces = [
    { title: "Rentrée Scolaire", description: "Début de l'année scolaire" },
    { title: "Réunion des Parents", description: "Réunion générale" },
  ];
  for (let i = 0; i < annonces.length; i++) {
    await prisma.announcement.create({
      data: {
        title: annonces[i].title,
        description: annonces[i].description,
        date: new Date(new Date().setDate(new Date().getDate() + i)),
        classId: (i % 6) + 1,
      },
    });
  }

  console.log("Génération des données françaises terminée.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });