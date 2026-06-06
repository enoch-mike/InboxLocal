# Tech Architecture

## ESP Recommendation: Brevo (Sendinblue)

**Selected** after comparing 5 providers against 6 criteria relevant to our 60-client model.

### Comparison Summary

| ESP | Pricing (60 clients) | Sub-accounts | API | Templates | SMS |
|-----|---------------------|--------------|-----|-----------|-----|
| **Brevo** ⭐ | **~$90/mo** ($1.50/client) | ✅ Enterprise | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Built-in |
| SendGrid | ~$90/mo ($1.50/client) | ✅ Sub-users | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ Separate |
| MailerLite | ~$159/mo ($2.65/client) | ✅ Advanced | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ None |
| Mailchimp | ~$350+/mo ($5.83+/client) | ✅ Premium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| AWS SES | ~$12/mo ($0.20/client) | ❌ Custom build | ⭐⭐⭐ | ❌ None | ❌ SNS |

### Why Brevo
- **Per-email pricing** (not per-contact) — best value as client lists grow
- **Sub-accounts** via Enterprise plan for per-client isolation
- **Built-in SMS** for our $200/mo upsell
- **REST API** with Node.js SDK for full automation
- **Good deliverability** with dedicated IP options

---

## System Architecture

```
┌──────────────────────────────────────────────┐
│               InboxLocal Platform              │
├──────────────────────────────────────────────┤
│                                               │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Landing │  │  Client  │  │Analytics │     │
│  │  Page   │  │ Dashboard│  │Dashboard │     │
│  └────┬────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │           │
│  ┌────┴─────────────┴─────────────┴──────┐   │
│  │         Backend API (Node.js)          │   │
│  │  Client CRUD / Scheduling / Content    │   │
│  └────────────────┬───────────────────────┘   │
│                   │                            │
│  ┌────────────────┴───────────────────────┐   │
│  │          Brevo API (REST/SMTP)          │   │
│  │  Campaigns / Contacts / Templates/SMS   │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │     SQLite (Turso)                      │   │
│  │  Client config / Schedule / Analytics  │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Landing Page | Static HTML/CSS |
| Backend | Node.js (Express) |
| Database | SQLite via Turso |
| Templates | MJML + Handlebars |
| ESP | Brevo |
| Scheduler | node-cron |
| CI/CD | GitHub Actions |

## Template Pipeline

```
Content (Markdown) → Handlebars injection → MJML render → HTML → Brevo campaign
```

## Development Phases

| Phase | Scope |
|-------|-------|
| 1 | Brevo account, API keys, base templates ✅ |
| 2 | Landing page, onboarding flow ✅ |
| 3 | Admin dashboard |
| 4 | Full automation, first client live |