# Resend Configuration Status & Next Steps

## Current Status (From Your Screenshot)

❌ **Domain Status**: Not Started (not verified)
📧 **Current Domain**: send.resend.co (test domain)
⚠️ **Limitation**: Can ONLY send to your Resend account email
✅ **Goal**: Send to ANY Gmail address

---

## What You Need to Do

### Step 1: Add YOUR Domain to Resend

You need to add `findback.ph` (your domain), not use Resend's test domain.

**Action**:
1. In Resend dashboard, click **Domains**
2. Click **Add Domain**
3. Enter: `findback.ph`
4. Resend will show you NEW DNS records

---

### Step 2: Add DNS Records to Your Domain Provider

You need to add these records to WHEREVER you bought your domain (Namecheap, GoDaddy, Cloudflare, etc.):

```
Record 1 (TXT - DKIM):
Name: resend._domainkey.findback.ph
Value: [Copy from Resend dashboard]
TTL: Auto

Record 2 (MX):
Name: findback.ph
Value: [Copy from Resend dashboard - usually feedback-smtp.resend.com]
Priority: 10
TTL: Auto

Record 3 (TXT - SPF):
Name: findback.ph
Value: v=spf1 include:resend.com ~all
TTL: Auto

Record 4 (TXT - DKIM):
Name: [Copy from Resend - usually 202409031...]
Value: [Copy from Resend dashboard]
TTL: Auto

Record 5 (TXT - DMARC):
Name: _dmarc.findback.ph
Value: v=DMARC1; p=none; pct=100
TTL: Auto
```

---

### Step 3: Wait for DNS Propagation

⏱️ **Time**: 15-30 minutes

**Check Status**:
1. Resend dashboard → Domains
2. Look for green checkmark next to `findback.ph`
3. Status should change from "Not Started" to "Verified"

**Verify DNS Propagation**:
Visit: https://dnschecker.org
Search: `findback.ph` TXT records

---

### Step 4: Generate Production API Key

1. Resend → **API Keys** → **Create API Key**
2. Name: `FindBack PH Production`
3. Permissions: **Sending emails**
4. Copy the key (starts with `re_...`)
5. **Save this key securely!**

---

## Environment Variables Update

### Update Your `.env` File

**BEFORE** (test mode):
```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="FindBack PH <onboarding@resend.dev>"
```

**AFTER** (production):
```bash
RESEND_API_KEY="re_your_actual_production_key"
RESEND_FROM_EMAIL="FindBack PH <noreply@findback.ph>"
NEXT_PUBLIC_APP_URL="https://findback.ph"
```

### Update Vercel/Railway Environment Variables

If deployed, update in hosting dashboard:
1. Vercel → Settings → Environment Variables
2. Update `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
3. Redeploy

---

## Testing the Setup

### Test 1: Verify Domain

After adding DNS records, check:
```
Resend Dashboard → Domains → findback.ph
```

Should show:
- ✅ SPF: Verified
- ✅ DKIM: Verified
- ✅ DMARC: Verified

### Test 2: Send Test Email

1. Restart your dev server:
```bash
npm run dev
```

2. Visit: http://localhost:3000/forgot-password

3. Enter ANY Gmail address (e.g., your-email@gmail.com)

4. Check inbox for professional email

### Test 3: Verify Sender

Email should show:
- **From**: FindBack PH <noreply@findback.ph>
- **NOT**: via resend.dev
- Professional inbox presentation

---

## Troubleshooting

### Problem: "Not Started" Status

**Cause**: DNS records not propagated

**Solution**:
1. Verify you added records to YOUR domain provider (Namecheap/GoDaddy/Cloudflare)
2. Wait 15-30 minutes
3. Check: https://dnschecker.org
4. Refresh Resend dashboard

### Problem: Still Using onboarding@resend.dev

**Cause**: Haven't updated RESEND_FROM_EMAIL env var

**Solution**:
1. Update `.env` file
2. Restart dev server
3. Redeploy if in production

### Problem: "Domain not verified" Error

**Cause**: DNS propagation incomplete

**Solution**:
1. Wait longer (up to 1 hour)
2. Double-check DNS records
3. Ensure no typos in domain name
4. Try: https://mxtoolbox.com/SuperTool.aspx

---

## Quick Command Checklist

```bash
# 1. Check current env vars
cat .env.local | grep RESEND

# 2. Verify DNS (use external tool)
# Visit: https://dnschecker.org
# Search: TXT resend._domainkey.findback.ph

# 3. Check Resend domain status
# Visit: https://resend.com/domains

# 4. Test locally
DEV_EMAIL_MODE=true  # For testing without email
npm run dev

# 5. Test with real email (after domain verification)
npm run dev
# Visit /forgot-password
```

---

## Summary

**Current**: Using test domain (can only send to your email)
**Goal**: Use custom domain (can send to any Gmail)

**Steps**:
1. Add `findback.ph` domain in Resend
2. Add 5 DNS records to your domain provider
3. Wait 15-30 minutes for verification
4. Update env vars with production API key
5. Restart dev server / redeploy
6. Test with real Gmail address

**Test Credentials**:
Email: demo@findback.local
Password: DemoPass123!
