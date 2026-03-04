#!/bin/bash
# Deploy Remotion Lambda function for video rendering
# Run once to set up, then reference the function name in REMOTION_FUNCTION_NAME env var
#
# Prerequisites:
#   - AWS credentials configured (REMOTION_AWS_ACCESS_KEY_ID, REMOTION_AWS_SECRET_ACCESS_KEY)
#   - REMOTION_AWS_REGION set (default: us-east-1)
#
# Usage:
#   chmod +x remotion/deploy.sh
#   ./remotion/deploy.sh

set -e

echo "📦 Deploying Remotion Lambda function..."

# Deploy the function
npx remotion lambda functions deploy \
  --memory=2048 \
  --timeout=240 \
  --region="${REMOTION_AWS_REGION:-us-east-1}"

echo ""
echo "🌐 Deploying Remotion site (serve URL)..."

# Deploy the site bundle
npx remotion lambda sites create \
  remotion/index.ts \
  --region="${REMOTION_AWS_REGION:-us-east-1}" \
  --site-name="nomistakes-video"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Set these environment variables:"
echo "  REMOTION_FUNCTION_NAME=<function name from above>"
echo "  REMOTION_SERVE_URL=<serve URL from above>"
echo "  REMOTION_AWS_REGION=${REMOTION_AWS_REGION:-us-east-1}"
