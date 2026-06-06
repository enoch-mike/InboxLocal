# Credentials Setup

## Brevo (Sendinblue) API

### 1. Create Account
1. Go to https://www.brevo.com/
2. Click "Sign up free"
3. Verify your email address

### 2. Generate API Keys
1. Navigate to **API & Integrations → API Keys**
2. Click "Generate a new API key"
3. Copy the key and save it securely

### 3. Configure Sender Authentication
1. Go to **Senders → Domain Authentication**
2. Add your sending domain (e.g., `mail.inboxlocal.co`)
3. Add these DNS records to your domain provider:

| Record Type | Host | Value |
|-------------|------|-------|
| TXT | `mail.inboxlocal.co` | `"v=spf1 include:brevo.com ~all"` |
| TXT | `brevo._domainkey.mail.inboxlocal.co` | *(provided by Brevo)* |
| CNAME | `mail._domainkey.mail.inboxlocal.co` | *(provided by Brevo)* |

### 4. Environment Variables

```env
BREVO_API_KEY=your_api_key_here
BREVO_SMTP_KEY=your_smtp_key_here
BREVO_SENDING_DOMAIN=mail.inboxlocal.co
```

### 5. Verify Sending
Send a test email using the Brevo dashboard before using the API.

---

## Service Pricing

| Plan | Cost | When |
|------|------|------|
| **Brevo Business** | ~$65/mo | Start (1-20 clients) |
| **Brevo Enterprise** | Custom ~$200/mo | Scale (20+ clients, sub-accounts) |