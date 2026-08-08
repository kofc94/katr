#!/usr/bin/env bash
#
# Deployment helper for K'night at the Races (katr.org).
#
# Usage:
#   ./deploy.sh                 Deploy the active year (var.current_year)
#   ./deploy.sh 2026            Deploy a specific year's site
#   ./deploy.sh lawn-signs      Deploy the volunteer lawn sign tracker
#   ./deploy.sh all             Deploy the active year and the tracker
#
# Everything lands in the same S3 bucket behind the same CloudFront
# distribution; the edge router (cloudfront.tf) maps paths to folders.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$SCRIPT_DIR"

# ── Helpers ──────────────────────────────────────────────────────────────────

log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mWarning:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31mError:\033[0m %s\n' "$*" >&2; exit 1; }

# `tofu output -raw` writes warnings to stdout on some versions, so filter.
tf_output() {
  tofu output -raw "$1" 2>/dev/null | grep -vi "warning" | tail -1 || true
}

require_tool() {
  command -v "$1" >/dev/null 2>&1 || die "$1 is required but not installed."
}

# ── Preflight ────────────────────────────────────────────────────────────────

require_tool tofu
require_tool aws
require_tool npm

aws sts get-caller-identity >/dev/null 2>&1 \
  || die "AWS CLI is not authenticated. Run 'aws sso login' first."

log "Checking OpenTofu state"
if [ ! -d ".terraform" ]; then
  # -reconfigure keeps this working after the backend moved to S3.
  tofu init -reconfigure
fi

BUCKET_NAME=$(tf_output s3_bucket_name)
DISTRIBUTION_ID=$(tf_output cloudfront_distribution_id)

if [ -z "$BUCKET_NAME" ]; then
  log "Stack not provisioned yet — applying OpenTofu configuration"
  tofu apply -auto-approve
  BUCKET_NAME=$(tf_output s3_bucket_name)
  DISTRIBUTION_ID=$(tf_output cloudfront_distribution_id)
fi

[ -n "$BUCKET_NAME" ] || die "Could not determine the S3 bucket name from outputs."

# Paths we invalidate at the end, collected as we go.
INVALIDATION_PATHS=()

# ── Year site ────────────────────────────────────────────────────────────────

deploy_year() {
  local year="$1"
  local year_dir="$PROJECT_ROOT/$year"

  [ -d "$year_dir" ] || die "Year directory '$year_dir' does not exist."

  local build_dir="$year_dir"
  if [ -f "$year_dir/package.json" ]; then
    log "Building $year site"
    (cd "$year_dir" && npm install && npm run build)
    build_dir="$year_dir/dist"
  fi

  [ -d "$build_dir" ] || die "Build output '$build_dir' not found."

  log "Syncing $year to s3://$BUCKET_NAME/$year/"
  aws s3 sync "$build_dir" "s3://$BUCKET_NAME/$year/" --delete

  INVALIDATION_PATHS+=("/$year/*")

  # Root traffic is rewritten to the active year at the edge, so a year deploy
  # only needs a root invalidation when it *is* the active year.
  local active_year
  active_year=$(tf_output current_active_year)
  if [ "$year" = "$active_year" ]; then
    INVALIDATION_PATHS+=("/" "/index.html")
  fi
}

# ── Lawn sign tracker ────────────────────────────────────────────────────────

deploy_lawn_signs() {
  local app_dir="$PROJECT_ROOT/lawn-signs"

  [ -d "$app_dir" ] || die "Lawn signs app not found at '$app_dir'."

  # Pull the app's public configuration out of the stack. These are all
  # non-secret identifiers (API URL, Cognito pool/client/domain) — there is no
  # AWS credential in this build, by design.
  local api_endpoint user_pool_id client_id cognito_domain
  api_endpoint=$(tf_output lawn_signs_api_endpoint)
  user_pool_id=$(tf_output lawn_signs_user_pool_id)
  client_id=$(tf_output lawn_signs_user_pool_client_id)
  cognito_domain=$(tf_output lawn_signs_cognito_domain)

  if [ -z "$api_endpoint" ] || [ -z "$user_pool_id" ] || \
     [ -z "$client_id" ] || [ -z "$cognito_domain" ]; then
    warn "Lawn sign API/Cognito outputs are missing."
    warn "The app will build in demo mode (local data only, no sign-in)."
    warn "Run 'tofu apply' with the lawn-signs stack configured to enable live mode."
  else
    log "Building against API $api_endpoint"
  fi

  log "Building lawn sign tracker"
  (
    cd "$app_dir"
    npm install
    VITE_API_ENDPOINT="$api_endpoint" \
    VITE_COGNITO_USER_POOL_ID="$user_pool_id" \
    VITE_COGNITO_CLIENT_ID="$client_id" \
    VITE_COGNITO_DOMAIN="$cognito_domain" \
    VITE_EVENT_ID="katr-$(tf_output current_active_year)" \
      npm run build
  )

  [ -d "$app_dir/dist" ] || die "Lawn signs build produced no dist/ directory."

  log "Syncing lawn-signs to s3://$BUCKET_NAME/lawn-signs/"
  aws s3 sync "$app_dir/dist" "s3://$BUCKET_NAME/lawn-signs/" --delete

  INVALIDATION_PATHS+=("/lawn-signs/*")
}

# ── Dispatch ─────────────────────────────────────────────────────────────────

TARGET="${1:-}"

if [ -z "$TARGET" ]; then
  TARGET=$(tf_output current_active_year)
  [ -n "$TARGET" ] || die "Could not determine the active year; pass one explicitly."
fi

echo "=========================================="
echo "   KATR deploy — target: $TARGET"
echo "=========================================="

case "$TARGET" in
  lawn-signs)
    deploy_lawn_signs
    ;;
  all)
    active_year=$(tf_output current_active_year)
    [ -n "$active_year" ] || die "Could not determine the active year."
    deploy_year "$active_year"
    deploy_lawn_signs
    ;;
  [0-9][0-9][0-9][0-9])
    deploy_year "$TARGET"
    ;;
  *)
    die "Unknown target '$TARGET'. Expected a 4-digit year, 'lawn-signs', or 'all'."
    ;;
esac

# ── Invalidate ───────────────────────────────────────────────────────────────

if [ -n "$DISTRIBUTION_ID" ] && [ ${#INVALIDATION_PATHS[@]} -gt 0 ]; then
  log "Invalidating CloudFront: ${INVALIDATION_PATHS[*]}"
  # Scoped paths rather than /* — the first 1000 paths per month are free.
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "${INVALIDATION_PATHS[@]}" \
    --query 'Invalidation.Id' --output text
else
  warn "CloudFront distribution id unavailable — cache invalidation skipped."
fi

echo
echo "=========================================="
echo " Deployed: $TARGET"
case "$TARGET" in
  lawn-signs) echo " Visit: https://katr.org/lawn-signs/" ;;
  all)        echo " Visit: https://katr.org and https://katr.org/lawn-signs/" ;;
  *)          echo " Visit: https://katr.org/$TARGET/" ;;
esac
echo "=========================================="
