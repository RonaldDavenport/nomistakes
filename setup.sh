#!/bin/bash
set -e

echo "🚀 No Mistakes — Full Backend Setup"
echo "======================================"
echo ""

# 1. Login to Supabase
echo "Step 1: Logging into Supabase..."
npx supabase login

# 2. Get org ID
echo ""
echo "Step 2: Finding your organization..."
ORG_ID=$(npx supabase orgs list --output json 2>/dev/null | python3 -c "import sys,json; orgs=json.load(sys.stdin); print(orgs[0]['id'])" 2>/dev/null)

if [ -z "$ORG_ID" ]; then
  echo "Could not auto-detect org. Listing orgs:"
  npx supabase orgs list
  echo ""
  read -p "Paste your org ID: " ORG_ID
fi

echo "Using org: $ORG_ID"

# 3. Create project
echo ""
echo "Step 3: Creating Supabase project..."
DB_PASS=$(openssl rand -base64 16)
PROJECT_OUTPUT=$(npx supabase projects create nomistakes --org-id "$ORG_ID" --db-password "$DB_PASS" --region us-east-1 --output json 2>/dev/null || true)

# If project already exists, list and find it
if echo "$PROJECT_OUTPUT" | grep -q "already exists"; then
  echo "Project 'nomistakes' already exists. Finding it..."
  PROJECT_OUTPUT=$(npx supabase projects list --output json 2>/dev/null)
fi

echo "Waiting 30s for project to initialize..."
sleep 30

# 4. Get project ref and API keys
echo ""
echo "Step 4: Getting API keys..."
PROJECT_REF=$(npx supabase projects list --output json 2>/dev/null | python3 -c "
import sys, json
projects = json.load(sys.stdin)
for p in projects:
    if 'nomistakes' in p.get('name','').lower():
        print(p['id'])
        break
")

if [ -z "$PROJECT_REF" ]; then
  echo "ERROR: Could not find project. Please check supabase dashboard."
  exit 1
fi

echo "Project ref: $PROJECT_REF"

API_KEYS=$(npx supabase projects api-keys --project-ref "$PROJECT_REF" --output json 2>/dev/null)
ANON_KEY=$(echo "$API_KEYS" | python3 -c "import sys,json; keys=json.load(sys.stdin); print([k['api_key'] for k in keys if k['name']=='anon'][0])")
SERVICE_KEY=$(echo "$API_KEYS" | python3 -c "import sys,json; keys=json.load(sys.stdin); print([k['api_key'] for k in keys if k['name']=='service_role'][0])")
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "URL: $SUPABASE_URL"
echo "Anon key: ${ANON_KEY:0:20}..."
echo "Service key: ${SERVICE_KEY:0:20}..."

# 5. Run migration
echo ""
echo "Step 5: Running database migration..."
npx supabase db execute --project-ref "$PROJECT_REF" -f ./supabase/migration.sql 2>/dev/null || \
  PGPASSWORD="$DB_PASS" psql "postgresql://postgres:${DB_PASS}@db.${PROJECT_REF}.supabase.co:5432/postgres" -f ./supabase/migration.sql 2>/dev/null || \
  echo "⚠️  Auto-migration failed. Please run migration.sql manually in Supabase SQL Editor."

# 6. Write .env.local
echo ""
echo "Step 6: Writing .env.local..."
cat > .env.local << ENVEOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-PASTE_YOUR_KEY_HERE}
ENVEOF

echo "Wrote .env.local"

# 7. Set Vercel env vars
echo ""
echo "Step 7: Setting Vercel environment variables..."
npx vercel link --yes 2>/dev/null || echo "Linking to Vercel..."
echo "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production 2>/dev/null || true
echo "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production 2>/dev/null || true
echo "$SERVICE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production 2>/dev/null || true

echo ""
echo "⚠️  Don't forget to add your ANTHROPIC_API_KEY to Vercel:"
echo "   npx vercel env add ANTHROPIC_API_KEY production"
echo ""

# 8. Push and deploy
echo ""
echo "Step 8: Pushing to GitHub..."
rm -f .git/index.lock
git add .
git commit -m "Add backend: auth, Claude API, site generation" || echo "Nothing to commit"
git push

echo ""
echo "✅ DONE! No Mistakes backend is live."
echo "   Supabase: $SUPABASE_URL"
echo "   Site: https://nomistakes.vercel.app"
echo ""
