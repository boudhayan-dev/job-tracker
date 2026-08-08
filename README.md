# CareerRecall

A personal job-application tracker and recruiter-call recall assistant. Track applications with a
status pipeline, and when a recruiter calls, instantly pull up the JD summary, the exact resume you
sent, and a few AI-generated talking points connecting your resume to that role.

Private, single/two-user tool — gated behind Cloudflare Access, not a public product.

## Stack

Cloudflare Pages (React/Vite/TypeScript frontend + Pages Functions API), D1, R2, Workers AI, Browser
Rendering, Cloudflare Access for auth. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design and
the decisions behind it.

## Project layout

```
frontend/     React app (Vite, TypeScript, Tailwind, PWA)
functions/    Pages Functions API (JD parsing, applications CRUD, resume extraction, nudges)
db/           D1 schema
design/       Stitch mockups + design system reference
```

## Running locally

```bash
npm install && npm install --prefix frontend
npm run build
npm run db:migrate:local
npm run functions:dev        # terminal 1 — API on :8788
npm run dev --prefix frontend  # terminal 2 — app on :5173
```

Full instructions, including first-time and successive deploys to dev/prod, are in
[DEPLOYMENT.md](DEPLOYMENT.md).

## License

All rights reserved.
