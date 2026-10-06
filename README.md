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

Built with React and Vite. The app saves its data in the browser on each device. Use Settings → Download backup to keep a copy.

## Deploy on Netlify

1. Netlify → **Add new project → Import an existing project → GitHub** → pick this repo.
2. Netlify reads `netlify.toml`, so the settings fill in by themselves:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Click **Deploy**.
4. Make forms visible: **Project configuration → Forms** → enable form detection, then redeploy once. Form submissions then show up under **Forms**.

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
