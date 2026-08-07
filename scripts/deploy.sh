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

if grep -q "REPLACE_WITH_" "wrangler.${ENV}.toml"; then
  echo "wrangler.${ENV}.toml still has REPLACE_WITH_* placeholders — fill in real resource IDs first (see DEPLOYMENT.md)." >&2
  exit 1
fi

cp wrangler.toml wrangler.toml.localdev.bak
restore_local_config() {
  mv wrangler.toml.localdev.bak wrangler.toml
}
trap restore_local_config EXIT

cp "wrangler.${ENV}.toml" wrangler.toml

echo "Building frontend..."
npm run build --prefix frontend

echo "Deploying to job-tracker-${ENV}..."
npx wrangler pages deploy frontend/dist --project-name "job-tracker-${ENV}" --branch "${ENV}"

echo "Deployed job-tracker-${ENV}."
