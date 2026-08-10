# Deploy to Vercel - Quick Guide

## Prerequisites
- Code pushed to GitHub
- Vercel account (https://vercel.com)
- Neon database ready (see DATABASE_SETUP.md)

---

## Quick Deployment

### 1. Import Project
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework auto-detected: Next.js ✅

### 2. Add Environment Variables

```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="GENERATE_NEW_SECURE_SECRET_32_CHARS"
NEXT_PUBLIC_APP_URL="https://findback-ph.vercel.app"
RESEND_API_KEY="YOUR_RESEND_API_KEY"
RESEND_FROM_EMAIL="FindBack PH <noreply@findback.ph>"
```

### 3. Deploy
Click "Deploy" button and wait 2-3 minutes.

---

## After Deployment

### Run Database Migrations
```bash
npm i -g vercel
vercel login
vercel env pull .env.production
$env:DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
npx prisma migrate deploy
npx prisma db seed
```

### Redeploy
1. Go to Vercel dashboard
2. Click "Redeploy" on latest deployment

---

## Add Custom Domain

1. Vercel → Settings → Domains
2. Add `findback.ph`
3. Update DNS at your registrar:
   - **Nameservers:**
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - **Or A/AAAA records:**
     ```
     Type: A, Name: @, Value: 76.76.21.21
     Type: CNAME, Name: www, Value: cname.vercel-dns.com
     ```

4. Wait for DNS propagation (5-30 min)

---

## Update After Domain Active

1. Update `NEXT_PUBLIC_APP_URL` to `https://findback.ph`
2. Redeploy

---

## Verify Deployment

Test these features:
- [ ] Homepage loads
- [ ] Registration works
- [ ] Login works
- [ ] Forgot password sends email
- [ ] Can create items
- [ ] SSL padlock appears

---

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull env vars
vercel env pull .env.production
```

---

Your app is live at: https://findback-ph.vercel.app 🚀

See POST_DEPLOYMENT.md for next steps.
