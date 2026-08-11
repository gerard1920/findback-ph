# Continue Setup - While DNS Propagates

## Your Current Status

✅ **Domain Added**: findbackph.com in Resend
⏳ **DNS Status**: Pending (propagating)
📧 **Current Limitation**: Using test sender (can only send to your Resend email)
🎯 **Goal**: Send to any Gmail address

---

## What You Can Do RIGHT NOW (While Waiting for DNS)

### 1. Create .env.local File

Create a file named `.env.local` in your project root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Or create it manually with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/findbackph"

# NextAuth
AUTH_SECRET="your-secret-key-min-32-chars"

# App URL (use your actual domain when deployed)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email - Option 1: Dev Mode (NO EMAIL, shows link on page)
DEV_EMAIL_MODE=true

# Email - Option 2: Resend (uncomment after domain verified)
# RESEND_API_KEY="re_your_key_here"
# RESEND_FROM_EMAIL="FindBack PH <noreply@findbackph.com>"
```

### 2. Test the Password Reset Flow (Dev Mode)

```bash
# Start dev server
npm run dev

# Visit in browser
http://localhost:3000/forgot-password

# Test with demo account
Email: demo@findback.local
Password: DemoPass123!
```

**In Dev Mode**:
- You'll see the reset link directly on the page
- No email is actually sent
- Perfect for testing the UI/UX

### 3. Verify Your Code is Working

Check these files are in place:

✅ `app/actions.ts` - Has `requestPasswordReset()` function
✅ `app/forgot-password/page.tsx` - Forgot password page
✅ `app/reset-password/page.tsx` - Reset password page
✅ `components/forgot-password-form.tsx` - Form component
✅ `components/reset-password-form.tsx` - Reset form
✅ `lib/mail.ts` - Email service with professional template
✅ `prisma/schema.prisma` - Has PasswordReset model

### 4. Run Database Migration (if not done)

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (creates demo user)
npm run db:seed
```

---

## While Waiting for DNS Propagation (15-30 min)

### Monitor DNS Propagation

Check if your DNS records are live:

1. **Resend Dashboard**: https://resend.com/domains
   - Look for green checkmark next to findbackph.com
   - Status should change from "Pending" to "Verified"

2. **DNS Checker**: https://dnschecker.org
   - Search: `findbackph.com`
   - Check TXT records for resend._domainkey

3. **MX Toolbox**: https://mxtoolbox.com/SuperTool.aspx
   - Search: `findbackph.com`
   - Verify MX records are live

### Prepare Your API Key

While waiting, generate your Resend API key:

1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name: `FindBack PH Production`
4. Permissions: "Sending emails"
5. Copy the key (starts with `re_...`)
6. Save it somewhere safe

---

## Once DNS is Verified (Green Checkmark ✓)

### Step 1: Update .env.local

```env
# Comment out dev mode
# DEV_EMAIL_MODE=true

# Uncomment Resend
RESEND_API_KEY="re_your_actual_key_here"
RESEND_FROM_EMAIL="FindBack PH <noreply@findbackph.com>"
```

### Step 2: Test with Real Email

```bash
# Restart dev server
npm run dev

# Visit
http://localhost:3000/forgot-password

# Enter YOUR real Gmail address
# Check inbox for professional email
```

### Step 3: Verify Email

Check your Gmail inbox for:
- **From**: FindBack PH <noreply@findbackph.com>
- **Subject**: Reset your FindBack PH password
- Professional HTML email with:
  - Gradient header
  - Blue CTA button
  - Expiration warning
  - Professional footer

---

## Production Deployment

### Update Environment Variables for Production

**Vercel / Railway / Render**:

```bash
# Production .env or hosting dashboard
RESEND_API_KEY="re_production_key"
RESEND_FROM_EMAIL="FindBack PH <noreply@findbackph.com>"
NEXT_PUBLIC_APP_URL="https://findbackph.com"
AUTH_SECRET="your-production-secret-32-chars"
DATABASE_URL="postgresql://..."
```

### Deploy

```bash
# Vercel
vercel --prod

# Or push to trigger auto-deploy
git add .
git commit -m "Add forgot password with Resend"
git push
```

---

## Troubleshooting During DNS Propagation

### Problem: Still shows "Not Started"

**This is normal!** DNS can take:
- Minimum: 15 minutes
- Typical: 30 minutes
- Maximum: 48 hours (rare)

**Solution**: Wait and check again

### Problem: Shows "Pending" for too long

**Check**:
1. Did you add DNS records to YOUR domain provider?
   - Namecheap, GoDaddy, Cloudflare, etc.
2. Are there any typos in the records?
3. Is the domain `findbackph.com` (not `findback.ph`)?

**Solution**: Double-check DNS records in your domain provider

### Problem: Dev mode not working

**Check**:
```bash
# Verify .env.local exists
ls -la .env.local

# Check DEV_EMAIL_MODE is set to true
grep DEV_EMAIL_MODE .env.local

# Restart dev server
npm run dev
```

---

## Quick Command Reference

```bash
# Create .env.local from example
cp .env.local.example .env.local

# Edit .env.local
notepad .env.local  # Windows
# OR
nano .env.local     # Mac/Linux

# Start dev server
npm run dev

# Test forgot password
# Visit: http://localhost:3000/forgot-password

# Check database
npm run db:studio

# Seed database
npm run db:seed
```

---

## Summary

**Current Status**:
- ✅ Code is complete and ready
- ✅ Professional email template implemented
- ⏳ DNS propagation in progress (15-30 min)

**Next Steps**:
1. Create `.env.local` with `DEV_EMAIL_MODE=true`
2. Test locally (no email needed)
3. Wait for DNS verification (green checkmark)
4. Update `.env.local` with Resend API key
5. Test with real Gmail
6. Deploy to production

**Your Domain**: findbackph.com (not findback.ph)
**Test Credentials**: demo@findback.local / DemoPass123!
