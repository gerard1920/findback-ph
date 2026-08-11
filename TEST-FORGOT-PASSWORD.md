# Quick Test - Forgot Password Feature

## Your Implementation is Complete!

All code is already in place:
✅ Server actions (requestPasswordReset, resetPassword)
✅ Professional email template
✅ Frontend pages (/forgot-password, /reset-password)
✅ Database schema (PasswordReset model)
✅ Security features (rate limiting, token hashing)

---

## Test Right Now (Dev Mode)

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Visit Forgot Password Page

Open browser:
```
http://localhost:3000/forgot-password
```

### Step 3: Test the Flow

1. **Enter email**: `demo@findback.local`
2. **Click**: "Send reset link"
3. **What happens**:
   - You'll be redirected directly to reset page (dev mode)
   - Reset link shown in console
   - No email actually sent

### Step 4: Reset Password

1. **Enter new password** (8-72 characters)
2. **Confirm password**
3. **Click**: "Set new password"
4. **Success**: Redirected to login

### Step 5: Login with New Password

```
Email: demo@findback.local
Password: [your new password]
```

---

## What to Expect in Dev Mode

### Forgot Password Page

You'll see:
- ✅ Form with email input
- ✅ Success message: "We sent a password-reset link..."
- ✅ Direct redirect to reset page
- ✅ Reset link shown in console/URL

### Reset Password Page

You'll see:
- ✅ Token validation (from URL parameter)
- ✅ Password fields with show/hide toggle
- ✅ Success confirmation
- ✅ Link to login page

---

## When DNS is Verified (After 15-30 min)

### Update .env.local

```env
# Comment out dev mode
# DEV_EMAIL_MODE=true

# Uncomment Resend
RESEND_API_KEY="re_your_key_here"
RESEND_FROM_EMAIL="FindBack PH <noreply@findbackph.com>"
```

### Test with Real Email

1. Restart dev server: `npm run dev`
2. Visit: http://localhost:3000/forgot-password
3. Enter YOUR real Gmail address
4. Check inbox for professional email
5. Click button to reset password

---

## Verify Database

### Check PasswordReset Table

```bash
# Open Prisma Studio
npm run db:studio

# Navigate to PasswordReset table
# You should see:
# - id (UUID)
# - tokenHash (SHA-256)
# - userId (linked to user)
# - expiresAt (1 hour from creation)
# - createdAt (timestamp)
# - usedAt (null until used)
```

### Check Users Table

```bash
# In Prisma Studio
# Navigate to User table
# Find demo@findback.local
# Verify passwordHash is set (bcrypt hash)
```

---

## Code Files Reference

### Server Actions (app/actions.ts)

```typescript
// Request password reset (line ~381)
export async function requestPasswordReset(_: FormState, fd: FormData): Promise<ResetState>

// Reset password (line ~347)
export async function resetPassword(_: FormState, fd: FormData): Promise<FormState>
```

### Email Service (lib/mail.ts)

```typescript
// Professional HTML email template
function buildResetEmailHtml(username: string, link: string): string

// Send via Resend
async function sendViaResend({ to, username, link }: ResetEmailPayload)

// Send via SMTP
async function sendViaSmtp({ to, username, link }: ResetEmailPayload)
```

### Frontend Pages

```
app/forgot-password/page.tsx      # Request reset link
app/reset-password/page.tsx       # Set new password
components/forgot-password-form.tsx   # Form component
components/reset-password-form.tsx    # Reset form
```

---

## Security Features Verified

✅ **Email Enumeration Prevention**: Generic message for unknown emails
✅ **Secure Tokens**: UUID v4 + SHA-256 hashing
✅ **Time-Limited**: 1-hour expiration
✅ **Rate Limiting**: 15-minute cooldown between requests
✅ **One-Time Use**: usedAt timestamp tracking
✅ **Input Validation**: Zod schema validation

---

## Production Checklist

When ready to deploy:

- [ ] DNS verified (green checkmark in Resend)
- [ ] RESEND_API_KEY set in production env
- [ ] RESEND_FROM_EMAIL = noreply@findbackph.com
- [ ] NEXT_PUBLIC_APP_URL = https://findbackph.com
- [ ] AUTH_SECRET set (32+ chars)
- [ ] DATABASE_URL set (PostgreSQL)
- [ ] Test with real Gmail address
- [ ] Check spam folder
- [ ] Verify email branding

---

## Quick Troubleshooting

### Dev mode not showing reset link

```bash
# Check .env.local has DEV_EMAIL_MODE=true
grep DEV_EMAIL_MODE .env.local

# Restart dev server
npm run dev
```

### Email not sending after DNS verified

```bash
# Check API key is set
grep RESEND_API_KEY .env.local

# Check FROM email
grep RESEND_FROM_EMAIL .env.local

# Check dev server console for errors
npm run dev
```

### Invalid/expired token

```bash
# Token expired (> 1 hour)
# Token already used
# Token hash doesn't match

# Solution: Request new reset link
```

---

## Next Steps

1. **Now**: Test in dev mode (no email needed)
2. **Wait**: DNS propagation (15-30 min)
3. **Verify**: Check Resend dashboard for green checkmark
4. **Update**: Switch from DEV_EMAIL_MODE to Resend
5. **Test**: Send real email to your Gmail
6. **Deploy**: Push to production

---

## Your Credentials

**Demo Account**:
- Email: demo@findback.local
- Password: DemoPass123!

**Admin Account** (after seed):
- Email: admin@findback.ph
- Password: Admin@2024!

**Test Your Own**:
- Use any Gmail address
- Request reset link
- Check inbox

---

## Summary

Your forgot password feature is **100% complete**!

✅ All code implemented
✅ Professional email template
✅ Security best practices
✅ Ready to test NOW in dev mode
✅ Ready for production after DNS verification

**Start testing**:
```bash
npm run dev
# Visit http://localhost:3000/forgot-password
```
