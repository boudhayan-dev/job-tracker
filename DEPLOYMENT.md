# Deployment

CareerRecall runs as a single Cloudflare Pages project (static frontend + Pages Functions API) per
environment. There are three places it runs:

- **Local** — `wrangler pages dev` + local D1/R2 emulation. No Cloudflare resources needed, except
  Workers AI and Browser Rendering (see the note below).
- **Dev** — `job-tracker-dev.pages.dev`, its own D1 database, R2 bucket, and Access application.
- **Prod** — `job-tracker-prod.pages.dev`, same shape, fully separate resources.

Config lives in three files at the repo root:

| File | Purpose |
|---|---|
| `wrangler.toml` | Local dev only. This is the file Wrangler actually reads — Cloudflare Pages has no `--config` flag, so `scripts/deploy.sh` temporarily swaps the right file into this path for a deploy and restores this one afterward. |
| `wrangler.dev.toml` | Real config for the dev environment. Committed — none of these values are secret (D1/R2 names and an Access AUD tag, not credentials). |
| `wrangler.prod.toml` | Same, for prod. |

**One important caveat:** Workers AI and Browser Rendering have no local emulator — even
`wrangler pages dev` proxies those specific calls to your real Cloudflare account, which requires
`wrangler login`. Everything else (D1, R2, the rest of the API, the whole frontend) runs fully
offline.

---

## Local run, end to end

One-time setup:

```bash
npm install
npm install --prefix frontend
npm run build
npm run db:migrate:local
```

Two terminals, both from the repo root:

```bash
# Terminal 1 — Pages Functions (API), served on :8788
npm run functions:dev
```

```bash
# Terminal 2 — frontend dev server, proxies /api to :8788 (see frontend/vite.config.ts)
npm run dev --prefix frontend
```

Open `http://localhost:5173`. The Dashboard, Track Job wizard, status flips, and the Application
Detail screen all work fully offline against local D1/R2.

To exercise JD parsing, resume extraction, or nudge generation locally, run `wrangler login` once
first (opens a browser to authenticate) — those three calls need a real Workers AI connection even
in local dev. Without it, every other route still works; those three return a 500.

---

## First-time dev deployment

1. **Authenticate**, if you haven't:
   ```bash
   wrangler login
   ```

2. **Create the Pages project**:
   ```bash
   npx wrangler pages project create job-tracker-dev --production-branch dev
   ```

3. **Create the D1 database**, then copy the printed `database_id` into `wrangler.dev.toml`
   (replacing `REPLACE_WITH_DEV_D1_DATABASE_ID`):
   ```bash
   npx wrangler d1 create career-recall-dev
   ```

4. **Create the R2 bucket** (name already matches `wrangler.dev.toml`, nothing to copy):
   ```bash
   npx wrangler r2 bucket create career-recall-dev-resumes
   ```

5. **Run the schema migration** against the real dev database:
   ```bash
   npm run db:migrate:dev
   ```

6. **Set up Cloudflare Access** (dashboard, not CLI):
   - Zero Trust → Access → Applications → **Add an application** → *Self-hosted*.
   - Domain: `job-tracker-dev.pages.dev` (or your actual dev domain once you know it — Pages
     assigns this on first deploy, so it's fine to deploy once first and come back to this step).
   - Identity provider: Google (add it under Settings → Authentication if not already configured).
   - Policy: **Allow**, rule = *Emails* = your email address only.
   - Save, then copy the **Application Audience (AUD) Tag** from the application's Overview tab.
   - Fill both into `wrangler.dev.toml`:
     - `ACCESS_TEAM_DOMAIN` = `<your-team-name>.cloudflareaccess.com`
     - `ACCESS_AUD` = the AUD tag you just copied

7. **Deploy**:
   ```bash
   npm run deploy:dev
   ```

8. Visit `https://job-tracker-dev.pages.dev`. You should hit the Access login gate first (Google
   sign-in), then land in the app.

## Successive dev deployments

```bash
npm run deploy:dev
```

If `db/schema.sql` changed since the last deploy, run `npm run db:migrate:dev` first — migrations
aren't automatic.

---

## First-time prod deployment

Same steps as dev, with prod names throughout:

```bash
npx wrangler pages project create job-tracker-prod --production-branch prod
npx wrangler d1 create career-recall-prod   # copy database_id into wrangler.prod.toml
npx wrangler r2 bucket create career-recall-prod-resumes
npm run db:migrate:prod
```

Then repeat the Access application setup (step 6 above) for `job-tracker-prod.pages.dev`, filling
`ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` into `wrangler.prod.toml` — **use a separate Access application
from dev**, even though the policy (your email only) is identical, so the two environments stay
fully independent.

```bash
npm run deploy:prod
```

## Successive prod deployments

```bash
npm run deploy:prod
```

Same migration caveat as dev: run `npm run db:migrate:prod` first if the schema changed.

---

## Troubleshooting

- **`deploy:dev`/`deploy:prod` refuses to run, mentions `REPLACE_WITH_`** — you skipped one of the
  "copy the ID into wrangler.\<env\>.toml" steps above. The script checks for this deliberately
  rather than deploying a broken config.
- **`CLOUDFLARE_API_TOKEN` / non-interactive environment error** — run `wrangler login`
  interactively first; it can't complete the OAuth flow non-interactively.
- **Deploy succeeds but the site 500s on JD parsing / resume upload** — check that the AI/Browser
  Rendering bindings are present for that environment (they're in both `wrangler.dev.toml` and
  `wrangler.prod.toml` by default; this usually means the account-level Workers AI product needs
  enabling once in the dashboard).
- **After a deploy, `wrangler.toml` looks wrong / like the dev or prod config** — `scripts/deploy.sh`
  restores it from a backup on exit (even on failure), but if the process was killed mid-deploy
  (e.g. `kill -9`), restore it manually: it should match the "Local development config" version —
  check `git diff wrangler.toml` and revert if needed.
