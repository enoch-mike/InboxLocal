# InboxLocal 🎯

**Done-for-you newsletters for local businesses.**

We write, design, and send weekly newsletters for restaurants, gyms, and salons — turning casual customers into repeat regulars. Business owners focus on running their business; we handle the email.

## Quick Start

```bash
# Clone
git clone https://github.com/enoch-mike/InboxLocal.git
cd InboxLocal

# Install dependencies (when backend is ready)
cd api && npm install

# Set up Brevo API credentials
cp docs/credentials.md .env
# Fill in your BREVO_API_KEY
```

## Project Structure

```
InboxLocal/
├── landing-page/          # Static marketing site
│   └── index.html         # InboxLocal business landing page
├── templates/             # Email templates
│   ├── newsletter.mjml    # MJML base template with Handlebars vars
│   └── README.md          # Template usage guide
├── scripts/               # Automation & infrastructure
│   ├── onboarding.js      # Client onboarding via Brevo API
│   └── scheduler.js       # Weekly newsletter scheduling
├── docs/                  # Documentation
│   ├── credentials.md     # API key setup instructions
│   └── tech-architecture.md  # Full ESP research & architecture
└── README.md              # This file
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **ESP** | [Brevo](https://www.brevo.com/) (Sendinblue) | Per-email pricing, not per-contact. Best for 60+ client model. |
| **Templates** | MJML + Handlebars | Responsive email HTML with dynamic client variable injection |
| **Backend** | Node.js | Brevo SDK, scheduler, onboarding API |
| **Database** | SQLite (Turso) | Lightweight, team-synced config & scheduling |
| **Landing Page** | Static HTML | No server needed, deploy anywhere |

## Key Features

- ✅ **Done-for-you service** — we write, design, and send
- ✅ **Weekly consistency** — never miss a send
- ✅ **Custom branding** — per-client colors, logos, fonts
- ✅ **Promo codes & offers** — drive repeat business
- ✅ **SMS add-on** — $200/mo upsell for text promotions
- ✅ **Detailed analytics** — open rates, clicks, engagement

## ESP Recommendation

**Brevo (Sendinblue)** is our primary ESP. Key advantages:
- **Pricing:** ~$65-90/mo for 60 clients → ~$1.50/client (vs $5.83/client for Mailchimp)
- **Sub-accounts:** Enterprise plan for per-client isolation
- **SMS built-in:** Perfect for our $200/mo SMS upsell
- **API-first:** REST API with Node.js SDK for automation

See `docs/tech-architecture.md` for the full comparison.

## Client Onboarding Flow

```
1. Sales team signs client
2. Run onboarding script → creates Brevo contact list & webhooks
3. Content strategist creates content using template
4. Operations renders newsletter with client branding
5. Client approves preview
6. Newsletter scheduled & sent via Brevo
7. Analytics tracked and reported
```

## Development Roadmap

- ⬜ **Phase 1** — Set up Brevo account & domain auth ✅ *(documented)*
- ⬜ **Phase 2** — Deploy landing page
- ⬜ **Phase 3** — Build client admin dashboard
- ⬜ **Phase 4** — Implement onboarding automation
- ⬜ **Phase 5** — First client live

---

*Built by the InboxLocal team.*