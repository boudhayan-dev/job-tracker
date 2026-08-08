#!/usr/bin/env bash
# Deploys to the "dev" or "prod" Cloudflare Pages project.
#
# Cloudflare Pages only ever reads ./wrangler.toml (no --config flag support), so this
# script swaps the environment-specific config into place for the deploy, then restores
# the local-dev wrangler.toml afterward — success or failure.
#
# Usage: scripts/deploy.sh dev|prod

set -euo pipefail

ENV="${1:-}"
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Usage: scripts/deploy.sh dev|prod" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONFIG="wrangler.${ENV}.toml"

# Strip comment lines before checking — the file's own instructional header mentions the
# literal string "REPLACE_WITH_*", which would otherwise false-positive this check forever,
# even after the real values below it are filled in.
CONFIG_VALUES="$(grep -v '^[[:space:]]*#' "$CONFIG")"

# D1 has no bootstrap chicken-and-egg problem — the database can always be created and its
# ID filled in before the first deploy. No legitimate reason to skip this, so hard block.
if grep -q "REPLACE_WITH_.*D1_DATABASE_ID" <<< "$CONFIG_VALUES"; then
  echo "$CONFIG still has the D1 database_id placeholder — run 'npx wrangler d1 create ...' and fill in the ID first (see DEPLOYMENT.md)." >&2
  exit 1
fi

# Access DOES have a bootstrap problem: Cloudflare Zero Trust won't let you pick a
# *.pages.dev domain to protect until that Pages project has at least one live deployment.
# So the very first deploy is allowed to go out without Access configured — but only with
# an explicit, visible confirmation, since it means the app is briefly unauthenticated.
#
# D1's placeholder was already excluded above (script would have exited on it), so any
# REPLACE_WITH_ still present here is necessarily one of ACCESS_TEAM_DOMAIN/ACCESS_AUD —
# checking generically like this (rather than pattern-matching each variable name) also
# catches the case where only one of the two got filled in.
ACCESS_UNSET=0
if grep -q "REPLACE_WITH_" <<< "$CONFIG_VALUES"; then
  ACCESS_UNSET=1
  echo "⚠️  ACCESS_TEAM_DOMAIN/ACCESS_AUD in $CONFIG are still placeholders."
  echo "   This deploy will go out WITHOUT the Cloudflare Access login gate — the app will be"
  echo "   publicly reachable at its *.pages.dev domain with no auth until you configure Access"
  echo "   and re-run this script with real values filled in. (Note: that domain may not be"
  echo "   exactly job-tracker-${ENV}.pages.dev — *.pages.dev names are global across all"
  echo "   Cloudflare accounts, so yours may have a random suffix. Check the deploy output below"
  echo "   or 'wrangler pages project list' for the real one.)"
  read -r -p "   Deploy anyway, unprotected, so Access has a live domain to target? [y/N] " reply
  if [[ ! "$reply" =~ ^[Yy]$ ]]; then
    echo "Aborted." >&2
    exit 1
  fi
fi

cp wrangler.toml wrangler.toml.localdev.bak
restore_local_config() {
  mv wrangler.toml.localdev.bak wrangler.toml
}
trap restore_local_config EXIT

cp "$CONFIG" wrangler.toml

echo "Building frontend..."
npm run build --prefix frontend

echo "Deploying to job-tracker-${ENV}..."
npx wrangler pages deploy frontend/dist --project-name "job-tracker-${ENV}" --branch "${ENV}"

echo "Deployed job-tracker-${ENV}."

if [[ "$ACCESS_UNSET" == "1" ]]; then
  echo ""
  echo "⚠️  Reminder: no Access gate is protecting this deployment yet."
  echo "   Go set up the Access application now against the *.pages.dev domain shown in the"
  echo "   deploy output above, fill ACCESS_TEAM_DOMAIN/ACCESS_AUD into $CONFIG, then re-run this script."
  echo "   Access starts protecting the domain the moment the policy is saved — no redeploy"
  echo "   required for that part, but re-running keeps the tracked config accurate."
fi
