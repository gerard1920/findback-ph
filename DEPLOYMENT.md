# FindBack PH - Production Deployment Guide

## Recommended Stack
- **Hosting:** Vercel (free tier available)
- **Database:** Neon PostgreSQL (free tier available)
- **Email:** Resend (free tier: 100 emails/day)
- **Domain:** Your choice (Namecheap, GoDaddy, etc.)

---

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Neon account (sign up at https://neon.tech)
4. Resend account (already configured ✅)
5. Domain name (purchase from any registrar)

---

## Quick Start

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/findback-ph.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables (see below)
4. Click "Deploy"

### 3. Configure Domain
1. Add domain in Vercel Settings → Domains
2. Update DNS at your registrar
3. Wait for propagation (5-30 minutes)

---

## Environment Variables for Production

```env
# Database (from Neon)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Auth (generate new one for production!)
AUTH_SECRET="GENERATE_SECURE_RANDOM_STRING_MINIMUM_32_CHARS"

# App URL (update after domain is active)
NEXT_PUBLIC_APP_URL="https://findback-ph.vercel.app"

# Resend Email
RESEND_API_KEY="YOUR_RESEND_API_KEY"
RESEND_FROM_EMAIL="FindBack PH <noreply@findback.ph>"
```

**Generate AUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup (Neon)

1. Create project at https://neon.tech
2. Copy connection string
3. Run migrations:
```bash
$env:DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
npx prisma migrate deploy
npx prisma db seed
```

---

## Domain Configuration

### Option A: Vercel Nameservers (Recommended)
Update at your domain registrar:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Option B: A/AAAA Records
```
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

---

## After Deployment

1. Update `NEXT_PUBLIC_APP_URL` to your domain
2. Redeploy on Vercel
3. Test all features
4. Verify Resend domain is active

---

## Costs

**Free Tier (Perfect for starting):**
- Vercel: Free (100GB bandwidth)
- Neon: Free (256MB database)
- Resend: Free (100 emails/day)
- Domain: ~$10/year

**Total: FREE (except domain ~$1/month)**

---

## Need Help?

See detailed guides:
- [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)
- [DOMAIN_SETUP.md](./DOMAIN_SETUP.md)
- [POST_DEPLOYMENT.md](./POST_DEPLOYMENT.md)
