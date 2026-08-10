# Database Setup for Production

## Using Neon PostgreSQL (Recommended)

### Why Neon?
- Free tier: 256MB database, perfect for starting
- Serverless - scales automatically
- Easy to use with Prisma
- Fast connections (edge network)

---

## Step-by-Step Setup

### 1. Create Neon Account

1. Go to https://neon.tech
2. Click "Sign Up" (use GitHub for quick setup)
3. Verify your email

### 2. Create New Project

1. Click "New Project"
2. Fill in details:
   - **Project name:** `findback-ph-production`
   - **Region:** `ap-southeast-1` (Singapore) or `ap-northeast-1` (Tokyo) - closest to Philippines
   - **PostgreSQL version:** Latest (default)
3. Click "Create Project"

### 3. Get Connection String

After creation, you'll see:
- **Connection details** section
- Copy the connection string (it looks like):
  ```
  postgresql://neondb_owner:npg_xxxxxx@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
  ```
- Save this - you'll need it for Vercel!

### 4. Configure for Local Development (Optional)

To test locally with production database:

```bash
# In PowerShell
$env:DATABASE_URL="postgresql://neondb_owner:npg_xxxxxx@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Test connection
npx prisma db pull
```

### 5. Run Migrations

```bash
# Set the connection string
$env:DATABASE_URL="postgresql://neondb_owner:npg_xxxxxx@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Run all pending migrations
npx prisma migrate deploy

# Seed initial data (optional but recommended)
npx prisma db seed
```

### 6. Verify Database

```bash
# Open Prisma Studio to verify data
npx prisma studio
```

---

## Alternative: Using Railway

If you prefer Railway:

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

### 2. Create PostgreSQL Database
1. Click "New Project"
2. Select "PostgreSQL" template
3. Railway will provision a database

### 3. Get Connection String
1. Click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy "Postgres Connection URL"

### 4. Run Migrations
```bash
$env:DATABASE_URL="postgresql://postgres:password@host:5432/railway"
npx prisma migrate deploy
npx prisma db seed
```

---

## Database Schema

Your Prisma schema includes:
- **Users** - Account information
- **Items** - Lost/found reports
- **ItemImages** - Photo uploads
- **Claims** - Ownership claims
- **Messages** - User conversations
- **Notifications** - In-app notifications
- **SavedItems** - Bookmarked items
- **Reports** - User reports
- **Blocks** - User blocks
- **PasswordResets** - Password reset tokens
- **Matches** - Potential matches

---

## Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Parameters:**
- `USER` - Database username (usually `neondb_owner` for Neon)
- `PASSWORD` - Auto-generated password from Neon
- `HOST` - Database host (e.g., `ep-xxxxx.ap-southeast-1.aws.neon.tech`)
- `PORT` - Usually `5432`
- `DATABASE` - Database name (usually `neondb` for Neon)
- `sslmode=require` - **Important!** Always use SSL for production

---

## Important Notes

### SSL Mode
Always use `?sslmode=require` in production for security.

### Connection Pooling
For production with high traffic, consider connection pooling:
```
postgresql://user:pass@host:5432/db?sslmode=require&pgbouncer=true
```

### Database Size Limits

**Neon Free Tier:**
- 256MB storage
- 100 hours compute/month
- Enough for ~10,000 users

**When to upgrade:**
- Database approaching 200MB
- Slow query performance
- High concurrent users

---

## Backup Strategy

### Automatic Backups
- **Neon:** Automatic backups included (free tier: 7 days retention)

### Manual Backup
```bash
# Export database
npx prisma db pull

# Or use pg_dump
pg_dump $env:DATABASE_URL > backup.sql
```

### Restore from Backup
```bash
# Restore database
psql $env:DATABASE_URL < backup.sql
```

---

## Monitoring

### Check Database Status
```bash
# View database info
npx prisma db execute --stdin <<< "SELECT version();"

# Check table sizes
npx prisma db execute --stdin <<< "SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats WHERE schemaname='public';"
```

### Neon Dashboard
Monitor at https://neon.tech:
- Database size
- Query performance
- Active connections
- Compute usage

---

## Security

### Production Checklist
- ✅ Use strong passwords (Neon provides these)
- ✅ Always use SSL (`sslmode=require`)
- ✅ Never commit `.env` to Git
- ✅ Use environment variables in Vercel
- ✅ Enable connection pooling for high traffic
- ✅ Regular backups (Neon handles this)

---

## Troubleshooting

### "Connection refused"
**Solution:** Check if `sslmode=require` is set

### "Password authentication failed"
**Solution:** Copy connection string again from Neon dashboard

### "Database does not exist"
**Solution:** Run `npx prisma migrate deploy` first

### "Migration failed"
**Solution:** 
```bash
# Reset and re-run migrations (WARNING: deletes data)
npx prisma migrate reset
npx prisma db seed
```

---

## Next Steps

After setting up database:
1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Run migrations in production
4. ✅ Test the application
5. ✅ Set up custom domain

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.