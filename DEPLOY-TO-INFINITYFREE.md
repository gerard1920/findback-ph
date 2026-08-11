# Deploy to InfinityFree - Complete Guide

## 🎯 Your Domain
**URL:** `https://findbackph.infinityfree.me`
**Status:** Active
**Home Directory:** /home/vol15_4/infinityfree.com/if0_42625217

---

## 📋 Pre-Deployment Checklist

### Already Complete
- Next.js app built
- All pages implemented
- Database schema ready
- Forgot password feature complete
- Admin moderation system complete
- Email service configured

### Need to Configure
- Database setup (PostgreSQL/MySQL)
- Environment variables
- Email configuration
- Build and upload files

---

## Step 1: Test Locally First

```bash
npm run dev

# Visit
http://localhost:3000

# Test these pages:
# - /login
# - /register
# - /forgot-password
# - /dashboard
```

**Demo Account:**
- Email: demo@findback.local
- Password: DemoPass123!

---

## Step 2: Database Setup

### Option A: InfinityFree MySQL (Easiest)

1. Create MySQL Database in InfinityFree control panel
2. Note: database name, username, password, host
3. Update package.json to use MySQL:
   ```bash
   npm install @prisma/adapter-mysql @prisma/client
   ```
4. Update prisma/schema.prisma:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
5. Update .env.local:
   ```env
   DATABASE_URL="mysql://username:password@localhost/findbackph"
   ```

### Option B: External PostgreSQL (Neon - Free)

1. Sign up at https://neon.tech
2. Create new database
3. Update .env.local:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/findbackph?sslmode=require"
   ```

---

## Step 3: Email Configuration

### Option A: Gmail SMTP (Recommended)

1. Enable 2FA: https://myaccount.google.com/apppasswords
2. Generate App Password (16 chars)
3. Update .env.local:
   ```env
   DEV_EMAIL_MODE=false
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM_EMAIL="FindBack PH <your-email@gmail.com>"
   ```

### Option B: Resend (Professional)

1. Sign up at https://resend.com
2. Get API key
3. Update .env.local:
   ```env
   RESEND_API_KEY="re_your_key"
   RESEND_FROM_EMAIL="FindBack PH <noreply@findbackph.infinityfree.me>"
   ```

---

## Step 4: Build for Production

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Build the app
npm run build
```

This creates the .next folder with your production build.

---

## Step 5: Upload to InfinityFree

1. **Open InfinityFree File Manager**
2. **Navigate to:** /home/vol15_4/infinityfree.com/if0_42625217/
3. **Upload:**
   - .next/ folder
   - public/ folder
   - package.json
   - .env file

---

## Step 6: Install Dependencies on InfinityFree

Using File Manager Terminal:
```bash
cd /home/vol15_4/infinityfree.com/if0_42625217/
npm install --production
```

---

## Step 7: Start the Application

```bash
# Start the app
npm start
```

**Note:** App needs to run continuously. If InfinityFree doesn't support this, consider:
- Using a VPS
- Using Vercel, Netlify, or Railway
- Using InfinityFree Cron Jobs to restart periodically

---

## Step 8: Update Environment Variables

Create `.env` on InfinityFree:
```env
DATABASE_URL="mysql://username:password@localhost/findbackph"
AUTH_SECRET="your-production-secret"
NEXT_PUBLIC_APP_URL="https://findbackph.infinityfree.me"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_EMAIL="FindBack PH <your-email@gmail.com>"
DEV_EMAIL_MODE=false
NODE_ENV="production"
```

---

## Step 9: Test Your Deployment

1. Visit: https://findbackph.infinityfree.me
2. Test registration
3. Test login
4. Test forgot password
5. Test creating items

---

## Troubleshooting

### App won't start
Check logs in InfinityFree control panel

### Database connection fails
- Verify DATABASE_URL
- Check database credentials
- Ensure database exists

### Emails not sending
- Verify SMTP credentials
- Use Gmail App Password
- Ensure DEV_EMAIL_MODE=false

---

## Alternative: Deploy to Modern Platforms

If InfinityFree doesn't work well:

### Vercel (Recommended - Free)
```bash
npm install -g vercel
vercel
```

### Netlify (Free)
```bash
npm install -g netlify-cli
netlify deploy
```

### Railway (Free tier)
```bash
npm install -g @railway/cli
railway up
```

---

## Quick Start Summary

```bash
# 1. Test locally
npm run dev

# 2. Build for production
npm run build

# 3. Upload to InfinityFree
# - .next/
# - public/
# - package.json
# - .env

# 4. Install dependencies
npm install --production

# 5. Start app
npm start
```

---

## Your Next Steps

1. Test locally: npm run dev
2. Setup database (MySQL or Neon PostgreSQL)
3. Configure email (Gmail SMTP recommended)
4. Build app: npm run build
5. Upload to InfinityFree
6. Install dependencies: npm install --production
7. Start app: npm start
8. Test live site

---

**Your app is ready to deploy!**
