# Database Setup - Local Development vs Production

## Problem

InfinityFree MySQL does NOT allow external connections from your local computer.
You can ONLY connect to it from within InfinityFree servers.

## Solution: Use SQLite Locally, MySQL on InfinityFree

---

## Local Development (SQLite)

SQLite is perfect for local development - no server needed!

### Setup:

1. **Keep schema.prisma with SQLite:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update .env for SQLite:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Run migrations:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

This creates `dev.db` file in your project folder.

---

## Production (InfinityFree MySQL)

When you deploy to InfinityFree, switch to MySQL.

### Setup on InfinityFree:

1. **Create .env file on InfinityFree:**
   ```env
   DATABASE_URL="mysql://if0_42625217:Rf09Vwu47l1o@sql208.infinityfree.com:3306/if0_42625217_db_findbackph"
   AUTH_SECRET="your-production-secret-here"
   NEXT_PUBLIC_APP_URL="https://findbackph.infinityfree.me"
   DEV_EMAIL_MODE=false
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM_EMAIL="FindBack PH <your-email@gmail.com>"
   ```

2. **Update schema.prisma on InfinityFree:**
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations on InfinityFree:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

---

## Quick Switch Between SQLite and MySQL

### Script: switch-to-sqlite.ps1

```powershell
# Switch to SQLite for local development
`$schemaPath = "prisma/schema.prisma`"
`$content = Get-Content `$schemaPath -Raw
`$content = `$content -replace 'provider = "mysql"', 'provider = "sqlite"'
Set-Content -Path `$schemaPath -Value `$content -Encoding UTF8

# Update .env
`$envPath = ".env`"
`$envContent = Get-Content `$envPath -Raw
`$envContent = `$envContent -replace 'DATABASE_URL=".*"', 'DATABASE_URL="file:./dev.db"'
Set-Content -Path `$envPath -Value `$envContent -Encoding UTF8

Write-Host "✅ Switched to SQLite" -ForegroundColor Green
```

### Script: switch-to-mysql.ps1

```powershell
# Switch to MySQL for production
`$schemaPath = "prisma/schema.prisma`"
`$content = Get-Content `$schemaPath -Raw
`$content = `$content -replace 'provider = "sqlite"', 'provider = "mysql"'
Set-Content -Path `$schemaPath -Value `$content -Encoding UTF8

# Update .env
`$envPath = ".env`"
`$envContent = Get-Content `$envPath -Raw
`$envContent = `$envContent -replace 'DATABASE_URL=".*"', 'DATABASE_URL="mysql://if0_42625217:Rf09Vwu47l1o@sql208.infinityfree.com:3306/if0_42625217_db_findbackph"'
Set-Content -Path `$envPath -Value `$envContent -Encoding UTF8

Write-Host "✅ Switched to MySQL" -ForegroundColor Green
```

---

## Current Setup

✅ Using SQLite for local development
✅ MySQL configured for InfinityFree production
✅ Easy switch between them

---

## Next Steps

1. **Test locally with SQLite:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

2. **When ready to deploy:**
   - Run switch-to-mysql.ps1
   - Update schema.prisma on InfinityFree
   - Upload to InfinityFree
   - Run migrations on InfinityFree

---

## Why This Approach?

✅ SQLite:
- No server needed
- Perfect for development
- Fast and easy
- Single file database

✅ MySQL on InfinityFree:
- Works on production
- Reliable hosting
- Free hosting
- Your actual domain

---

**You're all set!** Use SQLite for development, switch to MySQL for deployment.
