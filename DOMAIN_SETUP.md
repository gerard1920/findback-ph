# Domain Setup Guide

## Overview
This guide covers setting up your custom domain (e.g., findback.ph) for production.

---

## Option 1: Use Vercel Nameservers (Recommended)

### Why This Method?
- ✅ Easiest setup
- ✅ Automatic SSL
- ✅ No additional DNS records needed
- ✅ Vercel manages everything

### Steps

1. **Buy a domain** (if you don't have one):
   - Namecheap: https://namecheap.com (~$10/year)
   - GoDaddy: https://godaddy.com
   - Google Domains: https://domains.google.com

2. **Get Vercel nameservers:**
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

3. **Update at your registrar:**
   - Log into your domain registrar
   - Find "Nameservers" or "DNS Settings"
   - Change to custom nameservers
   - Enter Vercel nameservers above
   - Save changes

4. **Wait for propagation:**
   - Takes 5-30 minutes
   - Check: `nslookup findback.ph`

---

## Option 2: Keep Current Nameservers

### Why This Method?
- ✅ Keep existing DNS management
- ✅ Add only needed records

### Steps

1. **Add A Record (for root domain):**
   ```
   Type: A
   Name: @ or blank
   Value: 76.76.21.21
   TTL: 3600 (or Auto)
   ```

2. **Add CNAME Record (for www):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

3. **Wait for propagation:**
   - Takes 5-30 minutes

---

## Option 3: Cloudflare (Advanced)

### Why Use Cloudflare?
- ✅ Free CDN
- ✅ DDoS protection
- ✅ Faster DNS
- ✅ Analytics

### Steps

1. **Sign up at https://cloudflare.com**

2. **Add your domain**

3. **Update nameservers at registrar:**
   ```
   Your Cloudflare nameservers will be shown
   (e.g., luke.ns.cloudflare.com)
   ```

4. **Add DNS records in Cloudflare:**
   ```
   Type: A
   Name: @
   Content: 76.76.21.21
   Proxy: ✅ (orange cloud)

   Type: CNAME
   Name: www
   Content: cname.vercel-dns.com
   Proxy: ✅ (orange cloud)
   ```

5. **Configure SSL/TLS:**
   - Go to SSL/TLS → Overview
   - Set to "Full (strict)"

6. **Wait for activation:**
   - Usually 5-15 minutes

---

## Verify Domain Setup

### Check DNS Propagation
```bash
# Windows PowerShell
nslookup findback.ph

# Or use online tool
https://dnschecker.org
```

### Expected Result
```
Address: 76.76.21.21
```

### Check SSL
Visit `https://findback.ph` - should show padlock icon ✅

---

## Resend Domain Verification

### Important!
Your email domain must be verified in Resend.

### Steps

1. **Check status at https://resend.com/domains**

2. **If not verified, add DNS records:**
   
   **DKIM Record:**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNA... (from Resend)
   ```

   **SPF Record:**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:send.aws.im include:resend.com ~all
   ```

   **DMARC Record:**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none;
   ```

3. **Wait for verification** (5-30 minutes)

4. **Test email:**
   - Use forgot password feature
   - Check that email comes from `noreply@findback.ph`

---

## Common Registrars

### Namecheap
1. Log in → Domain List → Manage
2. Go to "Advanced DNS"
3. Update nameservers or add records

### GoDaddy
1. Log in → DNS Management
2. Update nameservers or add records

### Google Domains
1. Log in → DNS
2. Update nameservers or add records

### Cloudflare
1. Log in → DNS
2. Add records as shown above

---

## Troubleshooting

### Domain not resolving
**Check:**
1. DNS propagation complete? (use dnschecker.org)
2. Correct nameservers/DNS records?
3. Domain is registered and active?

### SSL not working
**Check:**
1. DNS fully propagated
2. Domain added correctly in Vercel
3. Wait 10-15 minutes after DNS change

### Emails not sending
**Check:**
1. Domain verified in Resend
2. DNS records added correctly
3. Using `noreply@findback.ph` as from address

---

## After Setup

1. ✅ Domain points to Vercel
2. ✅ SSL certificate active
3. ✅ Resend domain verified
4. ✅ All emails working
5. ✅ App accessible at your domain

---

## Test Everything

```bash
# Test domain resolution
nslookup findback.ph

# Test HTTPS
curl https://findback.ph

# Test email
# Use forgot password feature
```

---

Your domain is now live! 🎉