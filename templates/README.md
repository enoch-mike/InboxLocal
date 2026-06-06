# Email Templates — Usage Guide

This directory contains the base email template for InboxLocal newsletters.

## Template: `newsletter.mjml`

Built with **MJML** (responsive email framework) + **Handlebars** (variable injection).

### Prerequisites

```bash
npm install -g mjml
```

### Rendering

```bash
# Render to HTML (for testing)
mjml templates/newsletter.mjml -o output.html

# Preview in browser
open output.html
```

### Variables (filled per-client per-send)

| Variable | Description | Example |
|----------|-------------|---------|
| `{{newsletter_title}}` | Email subject line | "Spring Menu Update" |
| `{{primary_color}}` | Client's brand color | "#E11D48" |
| `{{accent_color}}` | Client's accent color | "#F97316" |
| `{{logo_url}}` | Client logo URL | "https://joespizza.com/logo.png" |
| `{{client_name}}` | Business name | "Joe's Pizza" |
| `{{client_address}}` | Business address | "123 Main St, City" |
| `{{headline}}` | Hero headline | "New Spicy Honey Pepperoni!" |
| `{{subheadline}}` | Hero subheadline | "Available all weekend" |
| `{{content_title_1..3}}` | Section titles | |
| `{{content_body_1..3}}` | Section content | |
| `{{promo_title}}` | Promo offer title (optional) | "15% Off Your Next Order" |
| `{{promo_description}}` | Offer details | |
| `{{promo_code}}` | Discount code | "WEEKEND15" |
| `{{promo_url}}` | Landing page URL | |
| `{{promo_cta}}` | Button text | "Order Now" |
| `{{event_title}}` | Event name (optional) | |
| `{{event_description}}` | Event details | |
| `{{event_date}}` | Date/time | "Saturday, June 14" |
| `{{event_url}}` | Event page | |
| `{{social_links}}` | Array of {name, url} | |
| `{{unsubscribe_url}}` | Unsubscribe link | |

### Rendering Pipeline

```
Content Strategist fills template
       ↓
Operations injects variables via Handlebars
       ↓
MJML compiles to responsive HTML
       ↓
HTML uploaded to Brevo campaign
       ↓
Sent to client's contact list
```