# Deployment Script for InfinityFree
# This script prepares your app for deployment

Write-Host ''
Write-Host '═══════════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  DEPLOY TO INFINITYFREE' -ForegroundColor Green
Write-Host '═══════════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''

# Step 1: Switch schema to MySQL
Write-Host 'Step 1: Switching database schema to MySQL...' -ForegroundColor Yellow
`$schemaPath = "prisma/schema.prisma"
`$content = Get-Content `$schemaPath -Raw
`$content = `$content -replace 'provider = "sqlite"', 'provider = "mysql"'
Set-Content -Path `$schemaPath -Value `$content -Encoding UTF8
Write-Host '✅ Schema updated to MySQL' -ForegroundColor Green
Write-Host ''

# Step 2: Update .env for production
Write-Host 'Step 2: Creating production .env file...' -ForegroundColor Yellow
`$prodEnv = @"
# Production Environment - InfinityFree
DATABASE_URL="mysql://if0_42625217:Rf09Vwu47l1o@sql208.infinityfree.com:3306/if0_42625217_db_findbackph"

# NextAuth Secret (CHANGE THIS IN PRODUCTION!)
AUTH_SECRET="CHANGE-THIS-TO-A-RANDOM-32-CHAR-SECRET"

# App URL
NEXT_PUBLIC_APP_URL="https://findbackph.infinityfree.me"

# Email Configuration
# Option 1: Gmail SMTP (Recommended)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="balaorogerard20@gmail.com"
SMTP_PASS="YOUR-GMAIL-APP-PASSWORD-HERE"
SMTP_FROM_EMAIL="FindBack PH <balaorogerard20@gmail.com>"

# Node Environment
NODE_ENV="production"
"@
Set-Content -Path ".env.production" -Value `$prodEnv -Encoding UTF8
Write-Host '✅ Production .env created (.env.production)' -ForegroundColor Green
Write-Host ''

# Step 3: Install dependencies
Write-Host 'Step 3: Installing dependencies...' -ForegroundColor Yellow
npm install
Write-Host '✅ Dependencies installed' -ForegroundColor Green
Write-Host ''

# Step 4: Generate Prisma client
Write-Host 'Step 4: Generating Prisma client for MySQL...' -ForegroundColor Yellow
`$env:DATABASE_URL = "mysql://if0_42625217:Rf09Vwu47l1o@sql208.infinityfree.com:3306/if0_42625217_db_findbackph"
npx prisma generate
Write-Host '✅ Prisma client generated' -ForegroundColor Green
Write-Host ''

# Step 5: Build the app
Write-Host 'Step 5: Building app for production...' -ForegroundColor Yellow
Write-Host 'This may take a few minutes...' -ForegroundColor Gray
npm run build
Write-Host '✅ Build complete' -ForegroundColor Green
Write-Host ''

Write-Host '═══════════════════════════════════════════════════════════════' -ForegroundColor Green
Write-Host '  BUILD COMPLETE!' -ForegroundColor Green
Write-Host '═══════════════════════════════════════════════════════════════' -ForegroundColor Green
Write-Host ''
Write-Host 'Next steps:' -ForegroundColor Yellow
Write-Host '1. Upload these files to InfinityFree:' -ForegroundColor White
Write-Host '   - .next/ folder' -ForegroundColor Cyan
Write-Host '   - public/ folder' -ForegroundColor Cyan
Write-Host '   - package.json' -ForegroundColor Cyan
Write-Host '   - .env.production (rename to .env on InfinityFree)' -ForegroundColor Cyan
Write-Host ''
Write-Host '2. On InfinityFree, run:' -ForegroundColor White
Write-Host '   npm install --production' -ForegroundColor Cyan
Write-Host '   npm start' -ForegroundColor Cyan
Write-Host ''
Write-Host '3. Visit your site:' -ForegroundColor White
Write-Host '   https://findbackph.infinityfree.me' -ForegroundColor Cyan
Write-Host ''
