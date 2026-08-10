# 🚀 Deploy FindBack PH to Vercel

## Prerequisites
✅ Neon database created
✅ Neon connection string obtained
✅ GitHub repository connected
✅ Vercel CLI installed

---

## Step 1: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **gerard1920/findback-ph**
4. Click **"Import"**

### Option B: Using Vercel CLI
```powershell
vercel login
vercel
```
Follow the prompts to link your project.

---

## Step 2: Add Environment Variables

After importing, configure these environment variables in Vercel Dashboard:

### Required Variables:
```env
# Database
DATABASE_URL=your_neon_database_url_here

# Authentication
AUTH_SECRET=your_auth_secret_here

# App URL (Production)
NEXT_PUBLIC_APP_URL=https://findback-ph.vercel.app

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=FindBack PH <onboarding@resend.dev>
```

**How to add in Vercel:**
1. Go to your project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Click **"Add New"** for each variable
4. Select all environments (Production, Preview, Development)
5. Click **"Save"**

---

## Step 3: Deploy

1. Click **"Deploy"** button in Vercel
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://findback-ph.vercel.app`

---

## Step 4: Run Database Migrations

After deployment, run migrations to set up your production database:

```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed database with initial data (optional)
npx prisma db seed
```

---

## Step 5: Test Your Live App

1. Visit your live URL: `https://findback-ph.vercel.app`
2. Test the following features:
   - ✅ Homepage loads
   - ✅ User registration works
   - ✅ User login works
   - ✅ Report lost item
   - ✅ Report found item
   - ✅ Browse items
   - ✅ Admin dashboard (if admin account exists)

---

## Step 6: Create Admin Account (Optional)

If you don't have an admin account yet:

1. Register a new account on your live site
2. Go to Neon dashboard → **SQL Editor**
3. Run this SQL to make yourself admin:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

---

## Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all environment variables are set correctly
- Verify `DATABASE_URL` format is correct

### Database Connection Issues
- Verify Neon database is active (check Neon dashboard)
- Ensure `sslmode=require` is in connection string
- Check if Neon database is in "idle" state (wake it up)

### Migrations Fail
- Ensure you're using the correct `DATABASE_URL`
- Check if migrations already ran: `npx prisma migrate status`
- If needed, reset database: `npx prisma migrate reset` (WARNING: deletes data)

---

## Next Steps After Deployment

1. **Test all features thoroughly**
2. **Set up custom domain** (see DOMAIN_SETUP.md)
3. **Configure email templates** in Resend dashboard
4. **Enable monitoring** in Vercel dashboard
5. **Share your app** with users!

---

## Important URLs

- **Live App:** https://findback-ph.vercel.app
- **Vercel Dashboard:** https://vercel.com/gerard1920/findback-ph
- **Neon Dashboard:** https://console.neon.tech
- **Resend Dashboard:** https://resend.com/overview
- **GitHub Repo:** https://github.com/gerard1920/findback-ph

---

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test database connection from Neon SQL Editor

🎉 **Congratulations! Your FindBack PH app is now live!**
