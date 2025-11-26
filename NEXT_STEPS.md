Next Steps to Stabilize the Project (Zero-Bug Checklist)

1) Database and Migrations
- Ensure Postgres is reachable via DATABASE_URL in .env
- Run migrations to apply recent schema updates:
  - npx prisma migrate dev -n init_or_sync
  - npx prisma migrate dev -n add_messages
  - npx prisma migrate dev -n add_absences_and_salaries
  - npx prisma migrate dev -n add_staff_user
  - npx prisma migrate dev -n extend_staff_user
- Regenerate Prisma client: npx prisma generate
- Seed essential data if needed: students, teachers, classes (check prisma/seed.ts)

2) Clerk/Auth Setup
- Configure Clerk keys in .env (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
- In Clerk dashboard, add roles in publicMetadata when creating users (admin, teacher, student, parent, finance, administration)
- Verify /api/me returns the current user id

3) Cloudinary for Image Uploads
- Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (and upload preset `school`) in .env
- Test uploads in Student and Staff forms

4) Messaging QA
- Open Messages page: verify sidebar shows unique conversations, names not subjects, time-ago stamps
- Compose message; verify thread loads, unread marks clear on click
- Stress test long words (>50 chars): verify wrapping, truncation in sidebar (30 chars)

5) Announcements
- Create/update/delete via list page; ensure role-based visibility (classId null or class membership)

6) Administration Team
- Add/edit/delete staff (administration) and verify fields (name, surname, username, email, phone, salary, photo)
- Confirm salary displayed in TND and role column renders properly

7) Absences and Salaries (Legacy)
- If using Absences/Salaires lists, run migrations and visit pages; otherwise ignore

8) Menu/Navigation
- Sidebar collapsible sections render; sections grouped correctly (Gestion, Pédagogie, etc.)
- Removed AUTRE; ensure no dead links remain

9) Environment & Build
- npm install
- npm run dev (or docker-compose up if using Docker)
- Fix any TypeScript errors (tsconfig strictness) and ESLint issues

10) Data Exports & PDF (if used)
- Verify /api/export endpoints and /api/generate-pdf work with current data

11) Final QA
- Test each role (admin, teacher, student, parent, finance, administration)
- Cross-browser smoke test (Chrome/Edge/Firefox)
- Mobile viewport test for layout overflows

If issues appear, capture console/network errors and add failing steps here.

