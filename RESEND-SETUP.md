# Resend Setup Guide - Send to Any Gmail Address

## The Problem

Your screenshot shows "Resend Test Mode" with `onboarding@resend.dev`:
- Emails ONLY go to YOUR Resend account email
- CANNOT send to arbitrary Gmail addresses
- This is normal for testing

## Solution: Verify Your Domain

### Step 1: Add Domain in Resend

1. Go to https://resend.com/domains
2. Click **Add Domain**
3. Enter: `findback.ph`
4. Resend provides 5 DNS records

### Step 2: Add DNS Records to Your Provider

1. TXT: `resend._domainkey.findback.ph` = [value from Resend]
2. MX: `findback.ph` = [value from Resend]
3. TXT (SPF): `v=spf1 include:resend.com ~all`
4. TXT (DKIM): [value from Resend]
5. TXT (DMARC): `v=DMARC1; p=none; pct=100`

### Step 3: Wait for Verification (15-30 min)

Resend shows green checkmark = you can send to ANY email address

### Step 4: Generate API Key

1. Resend → API Keys → Create API Key
2. Name: `FindBack PH Production`
3. Copy key (starts with `re_...`)

---

## Environment Variables

### Production
```bash
RESEND_API_KEY="re_your_actual_key"
RESEND_FROM_EMAIL="FindBack PH <noreply@findback.ph>"
NEXT_PUBLIC_APP_URL="https://findback.ph"
```

### Local Development
```bash
DEV_EMAIL_MODE=true  # No email needed
# OR
RESEND_API_KEY="re_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Your Implementation (Already Complete!)

### Server Actions
- `requestPasswordReset()` - Generates token, sends email
- `resetPassword()` - Validates token, updates password

### Email Template
- Professional responsive HTML
- Gradient header, CTA button, expiration warning
- Fallback link, security notice, footer

### Database
- `PasswordReset` model with SHA-256 hashing
- 1-hour expiration, one-time use

### Frontend
- `/forgot-password` - Request link
- `/reset-password?token=XYZ` - Set new password

---

## Testing

### Local (No Email)
```bash
DEV_EMAIL_MODE=true
npm run dev
# Visit /forgot-password
# Demo: demo@findback.local / DemoPass123!
```

### Production (Real Email)
```bash
# 1. Verify domain in Resend
# 2. Set env vars
# 3. Deploy
vercel --prod
# 4. Test with real Gmail
```

---

## Why Test Mode?

**Now**: `onboarding@resend.dev` → only your Resend email
**After domain verify**: `noreply@findback.ph` → any Gmail/Yahoo/Outlook

---

## Quick Setup Checklist

- [ ] Verify domain `findback.ph` in Resend
- [ ] Add 5 DNS records
- [ ] Wait 15-30 min
- [ ] Generate API key
- [ ] Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- [ ] Set `NEXT_PUBLIC_APP_URL`
- [ ] Deploy

---

## Summary

✅ Implementation complete
✅ Professional email template
✅ Secure tokens and rate limiting

**To send to any Gmail**:
1. Verify domain in Resend (5 DNS records)
2. Generate API key
3. Update env vars
4. Deploy

Test: demo@findback.local / DemoPass123!
