-- CreateTable
CREATE TABLE "_ClassTeachers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClassTeachers_AB_unique" ON "_ClassTeachers"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassTeachers_B_index" ON "_ClassTeachers"("B");

-- AddForeignKey
ALTER TABLE "_ClassTeachers" ADD CONSTRAINT "_ClassTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassTeachers" ADD CONSTRAINT "_ClassTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
