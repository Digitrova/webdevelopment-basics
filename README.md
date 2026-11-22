# Web Academy — Browser-only LMS

A static, browser-based learning management system designed for GitHub + Vercel. It uses **no external backend**, database service, authentication provider, or API credentials.

## Included
- Student registration and login
- First-admin setup from `/admin.html`
- Student dashboard with progress tracking
- 24-week curriculum (96 lessons)
- YouTube tutorial search links, with admin-editable direct video URLs
- Lesson completion tracking
- Admin student list, role management and password reset
- Lesson notes, video URLs and publish/unpublish controls
- JSON backup export and restore
- Password hashing with Web Crypto PBKDF2
- Responsive pages and static Vercel deployment

## Deploy
1. Upload the contents of this folder to the root of your GitHub repository.
2. Let Vercel deploy the commit.
3. Open `https://YOUR-DOMAIN/admin.html`.
4. Create the first administrator account.
5. Students can register at `/login.html`.

No environment variables or external service setup are required.

## Important limitations
This is a **single-browser / single-device demo LMS**, not a secure multi-user hosted LMS:
- Accounts, passwords (hashed), progress and course overrides are saved in that browser's `localStorage`.
- Students using another device or another browser profile will not see the same account or progress.
- Clearing browser storage deletes the data. Admins should export backups regularly.
- Since all logic runs in the browser, a technically capable visitor can inspect or modify local data and bypass UI-only role checks. Do not use this for confidential student data, paid courses, regulated content, or high-stakes certificates.
- Password reset is manual: the administrator can set a temporary password from the Students tab. There is no email recovery.
- YouTube search links are topic-based. Admin can paste a specific YouTube video URL for each lesson.
- This project does not execute student code on a server.

For multi-device accounts and real access control, a server-side authentication and database service is unavoidable.
