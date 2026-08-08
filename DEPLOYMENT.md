# Deployment

CareerRecall runs as a single Cloudflare Pages project (static frontend + Pages Functions API) per
environment. There are three places it runs:

- **Local** — `wrangler pages dev` + local D1/R2 emulation. No Cloudflare resources needed, except
  Workers AI and Browser Rendering (see the note below).
- **Dev** — a `job-tracker-dev*.pages.dev` domain (the exact one Cloudflare assigns — see the domain
  note below), its own D1 database, R2 bucket, and Access application.
- **Prod** — `job-tracker-prod*.pages.dev`, same shape, fully separate resources.

**Domain note:** `*.pages.dev` subdomains are global across every Cloudflare account, not just
yours — if `job-tracker-dev.pages.dev` is already taken by someone else, Cloudflare assigns
`job-tracker-dev-<random>.pages.dev` instead. Check `wrangler pages project list` or the dashboard
for the real one after creating the project; don't assume the plain name.

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

## Secrets — why the `wrangler.*.toml` files are safe to commit

None of the values currently in `wrangler.dev.toml` / `wrangler.prod.toml` are bearer credentials:

- D1 `database_id` and R2 `bucket_name` are resource identifiers, not access keys — they don't
  authenticate anything by themselves. Whoever has your Cloudflare account login can already see
  them in the dashboard.
- `ACCESS_TEAM_DOMAIN` is visible to anyone who visits the site anyway (it's the domain the browser
  gets redirected to for login).
- `ACCESS_AUD` identifies which Access application a JWT was issued for — it stops JWTs from one
  app being replayed against another, but on its own it doesn't let anyone forge a session; that
  still requires actually passing Google sign-in and being on the email allowlist.
- Workers AI, R2, D1, and Browser Rendering are all **native bindings** — Cloudflare authenticates
  them at the platform level (your account owns the Pages project, the Pages project owns the
  binding), so none of this architecture needs an embedded API key at all.

So there's nothing to hide in these files, and committing them is what makes `scripts/deploy.sh`
work without a manual "go paste your secrets" step.

**If a real secret ever shows up later** (an external LLM API key if you swap off Workers AI, a
Cloudflare API token for CI, anything that actually authenticates as *you*) — it does **not** go in
any `wrangler.*.toml` file, committed or not. Cloudflare Pages has a proper secret store for exactly
this, set per-project and never written to disk in this repo:

```bash
npx wrangler pages secret put SOME_API_KEY --project-name job-tracker-dev
npx wrangler pages secret put SOME_API_KEY --project-name job-tracker-prod
```

It prompts for the value interactively, stores it server-side against that Pages project, and it
shows up in `env.SOME_API_KEY` at runtime — same shape as everything else in `functions/`, just
never touching git. That's the mechanism to reach for instead of any interpolation-at-deploy-time
script — Cloudflare already built the thing that script would be reinventing.

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

6. **Bootstrap deploy, before Access exists** — Cloudflare Zero Trust won't let you pick a
   `*.pages.dev` domain to protect in an Access policy until that Pages project has at least one
   live deployment, so this first deploy necessarily goes out **without** the Access gate:
   ```bash
   npm run deploy:dev
   ```
   `wrangler.dev.toml` still has placeholder `ACCESS_TEAM_DOMAIN`/`ACCESS_AUD` at this point —
   `scripts/deploy.sh` detects that, warns you explicitly that the app will be briefly
   unauthenticated and public, and asks for a `y` confirmation before proceeding. This is the one
   deploy in the whole lifecycle where that's expected and unavoidable.

   Take the deployed URL Wrangler prints — check `wrangler pages project list` if you need it
   again — and confirm it's your actual domain: **`*.pages.dev` subdomains are global across every
   Cloudflare account**, so if `job-tracker-dev.pages.dev` was already taken by someone else,
   Cloudflare will have assigned `job-tracker-dev-<random>.pages.dev` instead.

7. **Set up Cloudflare Access now** (dashboard, not CLI), using that real domain:
   - **Add Google as an identity provider first — this is an account-level, one-time setup, not
     an option inside the application wizard.** New Zero Trust accounts default to "Cloudflare"
     as the only login method, so Google won't appear in the app's IdP picker until you add it:
     1. Find your team name: Zero Trust → Settings → General → "Team domain" — that's the
        `<team>` in `<team>.cloudflareaccess.com`.
     2. In [Google Cloud Console](https://console.cloud.google.com): create/select a project →
        APIs & Services → Credentials → Configure Consent Screen (External) → Credentials →
        Create OAuth client → type **Web application**.
        - Authorized JavaScript origins: `https://<team>.cloudflareaccess.com`
        - Authorized redirect URIs: `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`
        - Copy the **Client ID** and **Client secret**.
     3. Back in Cloudflare: Zero Trust → Integrations → Identity providers → Add new identity
        provider → **Google** → paste Client ID (as "App ID") and Client secret → Save.
   - Zero Trust → Access → Applications → **Add an application** → *Self-hosted*.
   - Domain: the exact `*.pages.dev` domain from step 6.
   - Identity provider: Google now shows up automatically if "Accept all available identity
     providers" is on; otherwise select it explicitly under "Choose available identity providers".
   - Policy: **Allow**, rule = *Emails* = `boudhayan.dev@gmail.com`, `kamalkalichoudhury36@gmail.com`
     (add both as separate values in the same Emails rule — anyone not on this list never gets a
     valid session, regardless of what they authenticate with). No additional bot-protection
     condition — `Bot Score` requires a paid Enterprise Bot Management add-on and isn't available
     here; Google sign-in + this email allowlist is already the real, load-bearing boundary.
   - Save — **Access starts protecting the domain immediately**, no redeploy needed. Then copy the
     **Application Audience (AUD) Tag** from the application's Overview tab.
   - Fill both into `wrangler.dev.toml`:
     - `ACCESS_TEAM_DOMAIN` = `<your-team-name>.cloudflareaccess.com`
     - `ACCESS_AUD` = the AUD tag you just copied

8. **Redeploy** so the tracked config matches reality (optional for protection, since Access is
   already live from the moment you saved it above — this just keeps `wrangler.dev.toml` accurate
   for next time and re-runs without the unprotected-deploy warning):
   ```bash
   npm run deploy:dev
   ```

9. Visit your dev domain. You should hit the Access login gate first (Google sign-in), then land
   in the app.

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
npm run deploy:prod   # bootstrap deploy — same "confirm unprotected" prompt as dev, see step 6 above
```

Check the real assigned domain (same global-uniqueness caveat as dev — don't assume it's exactly
`job-tracker-prod.pages.dev`), then repeat the Access application setup (step 7 above) against it,
filling `ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` into `wrangler.prod.toml` — **use a separate Access
application from dev**, even though the policy (same two emails) is identical, so the two
environments stay fully independent. Redeploy once more afterward to sync the config:

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

- **`deploy:dev`/`deploy:prod` refuses to run, mentions the D1 database_id placeholder** — you
  skipped "copy the ID into wrangler.\<env\>.toml" for D1. Hard-blocked deliberately — there's no
  legitimate reason that one can't be filled in before deploying.
- **`deploy:dev`/`deploy:prod` prompts "Deploy anyway, unprotected?"** — this is expected on the
  very first deploy of an environment, before Access exists (see "Bootstrap deploy" above). Not
  expected on later deploys — if you see it again after Access is already set up, it means
  `ACCESS_TEAM_DOMAIN`/`ACCESS_AUD` in that env's config got reverted or never got filled in; check
  `git diff wrangler.<env>.toml`.
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
