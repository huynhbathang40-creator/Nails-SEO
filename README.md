# GlowBack

More Google reviews and more returning clients for nail salons, in English and Vietnamese.

The project has two parts:

- **Website** (`/`): the GlowBack landing page. Its forms (free trial, demo booking, "text me my results", newsletter) send submissions to **Netlify Forms**.
- **Salon app** (`/app`): the owner's dashboard.
  - **Today:** this month's numbers (review requests sent, clients who came back, money brought in) and who to text today.
  - **Clients:** add clients, import a list (paste or CSV), and see who is due for a review request or a win-back text.
  - **One-tap texting:** opens the phone's Messages app with the text filled in, in English or Tiếng Việt. No SMS provider needed.
  - **Review replies:** paste a Google review to get a polite suggested reply to copy.
  - **Text templates** and **Salon settings** (Google review link, booking link, win-back timing).

- **Login & profiles:** email + password accounts through **Supabase Auth**. `/login` signs in or creates an account. All of `/app` requires sign-in.
  - **Create your profile** (`/app/create-profile`): after signing up, each user creates their own profile in two steps. Step 1 is about them: photo, name, phone, language, bio. Step 2 is their salon: name, city, Google review link, booking link. Users can't reach the dashboard until their profile exists.
  - **My profile** (`/app/profile`): view and edit everything above, upload or change the photo, change password, sign out.

- **Roles & admin area** (`/admin`):
  - **Admin:** full access. Can manage users, roles and passwords.
  - **Employee:** GlowBack staff. Can view everything in the admin area but can't change anything.
  - **User:** salon owner, the default. No admin access.
  - **Overview:** live health checks (database, login service, file storage, admin functions) with auto-refresh, user stats, a 30-day sign-ups chart, and database size, connections, uptime and tables.
  - **Users:** search and filter by role or status, export CSV, add a user. Open a user to change their role, set a new password, confirm their email, block or unblock, sign them out everywhere, edit their profile, or delete the account.
  - **Activity log:** every admin action, with who did it and when (can't be edited). Exportable.
  - Admins see an **Admin area** link in the app sidebar.

Built with React and Vite. Accounts and profiles live in Supabase (project `glowback`):
- **`public.profiles` table:** one row per user, created by the user. Row-level security means a user can only create, read, edit or delete their own profile. A database trigger stops anyone changing a profile's id, email or creation date.
- **`avatars` storage bucket:** holds profile photos (max 2 MB, images only). Users can only upload into their own folder.
- **`public.user_roles` table:** each user's role. It can only be changed through `admin_set_role()`, which requires admin and always keeps at least one admin.
- **`public.admin_audit_log` table:** the admin activity log.
- **`admin_*` database functions:** used by the admin page. Each one checks the caller's role first.
- **`admin-users` Edge Function** (`supabase/functions/admin-users`): creates and deletes accounts with the service key. Admin only.
- **SQL files:** the full database setup is in `supabase/migrations/`. The salon's client list and texts are saved in the browser, separately for each account. Use Settings → Download backup to keep a copy.

## Deploy on Netlify

1. Netlify → **Add new project → Import an existing project → GitHub** → pick this repo.
2. Netlify reads `netlify.toml`, so the settings fill in by themselves:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Click **Deploy**.
4. Make forms visible: **Project configuration → Forms** → enable form detection, then redeploy once. Form submissions then show up under **Forms**.

## Supabase (login)

The Supabase URL and publishable key are in `src/lib/supabase.js`. They are safe to be public, so Netlify needs no extra settings. To use a different project, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in Netlify → Project configuration → Environment variables.

One setting must be changed by hand in the Supabase dashboard, because the Supabase connector can't change auth settings:

- **Authentication → Sign In / Providers → Email → turn off "Confirm email" → Save.** Without this, new users must click an email link first, and Supabase's built-in email service only delivers to your own team's addresses.

## Run it on your computer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Forms don't send while running locally. They log to the browser console instead.

## Before you launch

- Replace the placeholder numbers marked `[X]` / `[XX]` and the testimonials in `src/landing/data.js`.
- Replace the phone number `(561) 555-0123` with your real one. Search the project for `555-0123` to find every place it appears.
- Have a lawyer review the starter Privacy, Terms and SMS pages in `src/pages/Legal.jsx`.
- Add the real demo video in `src/landing/Bottom.jsx` (look for "Video embed").

## Project layout

```
index.html            page shell + hidden Netlify form definitions
netlify.toml          build settings + single-page-app redirect
src/landing/          landing page sections, copy (data.js), sign-up modal
src/app/              salon app screens + EN/VI strings (strings.js)
src/lib/              forms, calculator, text templates, data store
design/               the original Claude Design export, for reference
```
