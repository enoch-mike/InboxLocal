# Credentials Setup

## Brevo (Sendinblue) API

### Account Setup Steps

1. **Sign up** → Go to https://www.brevo.com/ and click "Sign up free"
2. **Verify email** → Check your inbox and click the verification link
3. **Generate API key** → Settings (gear icon) → API Keys → "Generate a new API key"
4. **Save the key** → Store it securely — needed for all automation scripts

### Verify Sender

1. Go to **Senders → Domain Authentication** (or just add a sender)
2. Add `hello@inboxlocal.co` as a sender
3. Check your email and click the verification link
4. Once verified, you can send emails via the API

### DNS Records (for production sending)

Once verified, add these to your domain's DNS:

| Type | Name | Value |
|------|------|-------|
| TXT | `mail.inboxlocal.co` | `"v=spf1 include:brevo.com ~all"` |
| TXT | `brevo._domainkey.mail.inboxlocal.co` | *(copy from Brevo dashboard)* |

### Environment Variables

```bash
export BREVO_API_KEY="your-api-key-here"
export BREVO_SENDING_DOMAIN="mail.inboxlocal.co"
```

### Quick Test

```bash
# Configure Brevo account
BREVO_API_KEY=your-key node scripts/configure-brevo.js
```

### Re-generating Credentials

If the API key needs to be reset:
1. Go to Brevo → Settings → API Keys
2. Delete old key → Generate new key
3. Update `BREVO_API_KEY` everywhere

### Service Pricing

| Plan | Cost | When to Use |
|------|------|-------------|
| **Free** | 300 emails/day | Testing & development |
| **Business** | ~$65/mo | 1-20 clients (unlimited contacts, 20k emails/day) |
| **Enterprise** | Custom | 20+ clients (sub-accounts, dedicated IP) |

---

## GitHub

| Detail | Value |
|--------|-------|
| **Repo URL** | https://github.com/enoch-mike/InboxLocal.git |
| **Branch** | `main` |
| **Status** | ✅ All code pushed |

To contribute:
```bash
git clone https://github.com/enoch-mike/InboxLocal.git
cd InboxLocal
# Make changes, then:
git add -A && git commit -m "Your message"
git push origin main
```