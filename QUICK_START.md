# Quick Start - Deploy to Production

## What You Need
1. GitHub account (with code pushed)
2. Vercel account (free) - https://vercel.com
3. Neon database (free) - https://neon.tech
4. Domain name (e.g., findback.ph) - ~$10/year

---

## 5-Minute Quick Start

### 1. Setup Database (5 min)
```bash
# Go to https://neon.tech
# Create project "findback-ph-production"
# Copy connection string
```

### 2. Deploy to Vercel (3 min)
```bash
# 1. Go to https://vercel.com/new
# 2. Import GitHub repository
# 3. Add environment variables:
#    - DATABASE_URL (from Neon)
#    - AUTH_SECRET (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#    - NEXT_PUBLIC_APP_URL=https://findback-ph.vercel.app
#    - RESEND_API_KEY (already have)
#    - RESEND_FROM_EMAIL (already have)
# 4. Click Deploy
```

### 3. Run Migrations (2 min)
```bash
npm i -g vercel
vercel login
vercel env pull .env.production
$env:DATABASE_URL="YOUR_NEON_URL"
npx prisma migrate deploy
npx prisma db seed
```

### 4. Add Domain (5 min)
```bash
# In Vercel: Settings → Domains → Add "findback.ph"
# At your registrar: Update nameservers to:
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### 5. Update & Redeploy (2 min)
```bash
# Update NEXT_PUBLIC_APP_URL to https://findback.ph
# Redeploy in Vercel dashboard
```

---

## That's It! 🎉

Your app is now live at **https://findback.ph**

---

## Detailed Guides

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete overview
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup
- **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** - Vercel deployment
- **[DOMAIN_SETUP.md](./DOMAIN_SETUP.md)** - Domain configuration
- **[POST_DEPLOYMENT.md](./POST_DEPLOYMENT.md)** - After launch checklist

---

## Environment Variables Template

```env
# Copy these to Vercel Settings → Environment Variables

DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="GENERATE_SECURE_SECRET_MINIMUM_32_CHARS"
NEXT_PUBLIC_APP_URL="https://findback.ph"
RESEND_API_KEY="YOUR_RESEND_API_KEY"
RESEND_FROM_EMAIL="FindBack PH <noreply@findback.ph>"
NODE_ENV="production"
```

---

## Costs

**Free Tier:**
- Vercel: Free
- Neon: Free
- Resend: Free
- Domain: ~$10/year

**Total: FREE (except domain)**

---

## Need Help?

1. Read the detailed guides above
2. Check Vercel documentation
3. Review deployment logs in Vercel
4. Check Neon dashboard for database issues

---

**Ready to deploy? Start with DEPLOYMENT.md for complete details!** 🚀
