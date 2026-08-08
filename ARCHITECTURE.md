# Job Tracker + Recall Assistant — Architecture

## Context

You're applying to jobs at volume, tailoring your resume per-JD with AI, and losing track of two things once a recruiter calls: what the JD actually said, and what exact skills/experience you claimed on the resume you sent for *that specific application*. The goals:

1. A tracker for applications with a status pipeline you can flip through.
2. Fast recall — search company, see JD summary, see the resume you sent, and get a short list of "bragging point" nudges tying your claimed skills/exp to what the JD asked for.
3. One responsive webapp, usable from any device (laptop or phone) for both flows — **Track a job** (ingestion: crawl/paste JD, upload resume) and **Search my jobs** (lookup: recall on a call). No device is ingestion-only or lookup-only; it's the same login, same app, either flow, wherever it happens to be open. All the heavy processing (crawl/parse JD, extract resume, generate nudges) still happens once, at ingestion time, so lookup is always just a read.
4. Cheap/free hosting, minimal auth wiring, secrets kept out of the frontend.

This document is the source of truth for the next two steps: frontend design, then implementation and deployment.

## Decisions locked in

| Area | Decision |
|---|---|
| Hosting/backend | **Cloudflare full-stack**: Pages (frontend + Functions API), D1, R2, Workers AI |
| Auth | **Cloudflare Access** (zero-trust gate, Google identity provider, restricted to a two-email allowlist: `boudhayan.dev@gmail.com`, `kamalkalichoudhury36@gmail.com`). Access issues a signed JWT and Cloudflare validates it at the edge before any request reaches the app — no login UI or session code to write. Satisfies "JWT + OIDC, no basic auth" for free. (A Bot Score policy condition was considered as extra defense-in-depth, but `cf.bot_management.score` requires a paid Enterprise Bot Management add-on — not available on this plan, and not worth adding a custom domain/zone for. Skipped: Google sign-in + the email allowlist are already the real, load-bearing boundary.) |
| LLM | **Cloudflare Workers AI** (e.g. `llama-3.3-70b-instruct`) as the ingestion-time LLM — same vendor as the rest of the stack (one less account/secret), 10,000 free neurons/day, no card required. Structured extraction/summarization (JD parsing, resume field extraction, nudge generation) doesn't need frontier-model creativity, so the open model should be sufficient. **Swap risk noted:** if nudge quality disappoints, swapping to Gemini Flash free tier later is a one-function change — but Gemini's free tier ToS allows using submitted content to improve Google's products, which matters here since resume/JD text carries real personal and professional details. Workers AI doesn't carry that caveat, which is the deciding reason to start there rather than convenience alone. |
| Storage: object | **R2** (S3-compatible) — stores the original resume PDF per application, so the exact file sent can be viewed/downloaded later. |
| Storage: structured data | **D1** (serverless SQLite), not KV/DynamoDB-style. The tracker needs to search/filter by company, status, and date — a relational store does that natively where pure key-value would make it painful. |
| Status pipeline | Simple fixed set: **Applied → In Progress → Interviewing → Offer → Rejected**. Stored as an enum column, flip via UI. (Interview-round granularity can be added later as a single column, not a redesign.) |
| JD ingestion | Given a URL: fetch first, strip boilerplate (nav/footer/ads) to isolate JD content. If the result is too thin (below a text-length threshold) or fetch fails outright — common with JS-rendered listings or bot walls (LinkedIn especially) — fall back to **Cloudflare Browser Rendering** (headless browser API, same platform) to get the JS-rendered page and retry extraction. Either way, extracted text runs through the LLM to produce a structured record (company, role, short recall summary, key requirements) and is **shown for review/edit before saving** — never auto-committed. If crawling fails entirely or the result isn't good, JD text can be pasted manually and goes through the same LLM structuring step. One ingestion path, two ways to get text into it. |
| Resume ingestion | PDF upload → raw text extraction (Workers-compatible PDF text extraction library) → LLM prompt that pulls out only the sections that vary per application — **skills** and **work experience** — as structured data. Full original PDF goes to R2; structured skills/workex + raw text go to D1, linked to that specific application (each application owns its own resume version, since it's tailored per JD). |
| Nudges | Once both JD and resume are structured for an application, one more LLM call cross-references JD requirements against resume skills/workex and produces a short, tight list of talking points. Stored as structured JSON on the application record. Exact prompt shape/count is a frontend/prompt-design detail for the next phase — the data model just needs a slot for it, which it has. |
| Backend language | **TypeScript on Workers.** Not really an open choice once Cloudflare Pages/Workers is picked: Java has no Workers runtime, and Python Workers exist but have weaker support for the bindings this app needs (D1, R2, Browser Rendering, Workers AI, Access). |
| Deployment shape | **Cloudflare Pages + Pages Functions**, one project, instead of a separately-hosted Worker. Pages Functions run on the same Workers runtime and support the same bindings (D1, R2, Workers AI, Browser Rendering), so frontend and API ship as one deployable unit on one origin — no CORS to configure, and Cloudflare Access protects page routes and API routes uniformly since they share a hostname. |
| Domain | No custom domain purchase needed. Every Cloudflare Pages project gets a free `*.pages.dev` subdomain automatically — that's the whole app's URL, frontend and API together. **Not guaranteed to be exactly `<project-name>.pages.dev`**: that subdomain namespace is global across every Cloudflare account, so if the plain name is already taken by someone else, Cloudflare appends a random suffix (e.g. `job-tracker-dev-8wv.pages.dev`) — check the actual assigned domain after creating the Pages project rather than assuming it. Custom domain stays an option later, but nothing about this design requires it. |
| Frontend | Deliberately **not decided here** — handled as its own step (frontend design with Claude Code). Constraints carried forward: static assets deployable via Cloudflare Pages, installable as a PWA (manifest + service worker) so it behaves like an app on Android, responsive enough to drive both flows from a phone or a laptop. |
| Environments | **Two fully separate Cloudflare Pages projects**, `job-tracker-dev` and `job-tracker-prod`, each with its own `*.pages.dev` domain, each bound to its own D1 database and R2 bucket, each gated by its own Cloudflare Access application (both policies restricted to the same two-email allowlist). Same Cloudflare account throughout — only the resources are split. See "Environments & deployment" below. |

## System shape

```
Laptop or Android — same webapp, same login, both flows available
                       │
                       ▼
          Cloudflare Access (gate — Google login, 2-email allowlist)
                       ▼
          Cloudflare Pages project (PWA frontend + Pages Functions API, one origin)
             ├─ /              → static app shell (Track a job / Search my jobs)
             └─ /api/*         → Pages Functions (Workers runtime)
                   ├─ fetch() + Browser Rendering → raw JD HTML/text
                   ├─ Workers AI (env.AI binding, no API key needed) → structure JD / resume / nudges
                   ├─ D1 → applications, resume metadata, JD text, nudges
                   └─ R2 → original resume PDFs
```

Two instances of this whole shape exist side by side — `job-tracker-dev` and `job-tracker-prod` — each with its own domain, D1 database, R2 bucket, and Access application. Nothing is shared between them except the Cloudflare account itself.

## Data model (D1) — indicative, not final

- `applications`: id, company, role_title, jd_summary, jd_full_text, jd_url (nullable), status, applied_date, created_at, updated_at
- `resumes`: id, application_id (FK), r2_object_key, skills (json), work_experience (json), raw_text
- `nudges`: id, application_id (FK), points (json)

Exact columns/normalization get finalized during implementation — this is enough to confirm the shape holds up against the workflow.

## Environments & deployment (dev → prod promotion)

Goal: same account, resource-level separation, and a script-driven promotion path — deploy to dev, verify by hand, then run the same thing against prod config.

- **Resources, doubled:** `job-tracker-dev` / `job-tracker-prod` as two separate Pages projects; `job_tracker_dev` / `job_tracker_prod` as two D1 databases; `job-tracker-dev-resumes` / `job-tracker-prod-resumes` as two R2 buckets; two Cloudflare Access applications (one per `*.pages.dev` hostname), both policies scoped to the same two-email allowlist.
- **Config, per environment:** a Wrangler config per environment (e.g. `wrangler.dev.toml` / `wrangler.prod.toml`) holding that environment's D1 database ID and R2 bucket name. Workers AI needs no secret at all — it's a native `env.AI` binding tied to the Cloudflare account, so there's nothing extra to rotate or leak per environment.
- **Deploy scripts:** `npm run deploy:dev` and `npm run deploy:prod`, each just a `wrangler pages deploy` invocation pointed at the matching project name and config file. Promotion flow is manual and deliberate: run `deploy:dev`, test against the dev URL, then run `deploy:prod` once satisfied — no auto-promotion.
- **Later, if wanted:** these same scripts drop straight into a GitHub Actions workflow (push to `develop` → `deploy:dev`, push to `main` → `deploy:prod`) using a Cloudflare API token as a GitHub secret. Not needed for a weekend v1 — noted so the path exists without building it now.

Exact Wrangler syntax gets finalized during implementation — this section fixes the shape (two of everything, script-driven promotion, no shared mutable state between environments), not the literal config files.

## Next steps

1. Frontend design (Claude Code) — screens, component structure, PWA setup.
2. Implementation — Pages Functions API, D1 schema, R2 wiring, Workers AI prompts, Access setup.
3. Deployment — dev environment first, verify, then promote to prod.
