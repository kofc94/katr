#!/usr/bin/env bash
set -e

# Helper deployment script for K'night at the Races (katr.org)
# Usage: ./deploy.sh [YEAR] (defaults to 2026)

YEAR="${1:-2026}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
YEAR_DIR="$PROJECT_ROOT/$YEAR"

echo "=========================================="
echo "   Deploying KATR Website - Year: $YEAR"
echo "=========================================="

if [ ! -d "$YEAR_DIR" ]; then
  echo "Error: Directory '$YEAR_DIR' does not exist."
  exit 1
fi

# Build React application if package.json exists
if [ -f "$YEAR_DIR/package.json" ]; then
  echo "[1/4] Building React application in '$YEAR_DIR'..."
  (cd "$YEAR_DIR" && npm install && npm run build)
  BUILD_DIR="$YEAR_DIR/dist"
else
  BUILD_DIR="$YEAR_DIR"
fi

cd "$SCRIPT_DIR"

# 1. Initialize OpenTofu if needed
echo "[2/4] Checking OpenTofu state..."
if [ ! -d ".terraform" ]; then
  tofu init
fi

# 2. Get S3 bucket name and CloudFront distribution ID from outputs
BUCKET_NAME=$(tofu output -raw s3_bucket_name 2>/dev/null | grep -v "Warning" | grep -E '^[a-zA-Z0-9_.-]+$' || echo "")
DISTRIBUTION_ID=$(tofu output -raw cloudfront_distribution_id 2>/dev/null | grep -v "Warning" | grep -E '^[a-zA-Z0-9_.-]+$' || echo "")

if [ -z "$BUCKET_NAME" ]; then
  echo "OpenTofu stack not fully deployed yet. Applying OpenTofu configuration..."
  tofu apply -auto-approve
  BUCKET_NAME=$(tofu output -raw s3_bucket_name)
  DISTRIBUTION_ID=$(tofu output -raw cloudfront_distribution_id)
fi

echo "[3/4] Uploading content for year '$YEAR' to s3://$BUCKET_NAME/$YEAR/..."
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME/$YEAR/" --delete

# Note: root traffic (katr.org/) is routed to the active year by the CloudFront
# "year_router" function (see platform/cloudfront.tf, driven by var.current_year),
# so no root index.html copy is needed here.

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "[4/4] Invalidating CloudFront cache for distribution $DISTRIBUTION_ID..."
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
else
  echo "Warning: CloudFront Distribution ID not found. Cache invalidation skipped."
fi

echo "=========================================="
echo " Successfully deployed KATR $YEAR!"
echo " Visit: https://katr.org"
echo "=========================================="
