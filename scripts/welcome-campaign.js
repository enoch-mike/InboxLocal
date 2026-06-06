// InboxLocal — Welcome Email Campaign Integration
// Reads the welcome sequence from content-strategy/onboarding/welcome-sequence.md
// and generates Brevo API campaign creation JSON payloads
// Integrates with onboarding.js

const fs = require('fs');
const path = require('path');

// Path to the content strategist's welcome sequence
const WELCOME_SEQUENCE_PATH = path.join(__dirname, '..', '..', 'content-strategy', 'onboarding', 'welcome-sequence.md');
const WELCOME_TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'welcome.mjml');

// InboxLocal brand colors (used for these onboarding emails)
const INBOXLOCAL_BRAND = {
  primary: '#4F46E5',     // Indigo
  accent: '#EC4899',       // Pink
  name: 'InboxLocal',
  email: 'hello@inboxlocal.co',
  logo: 'https://inboxlocal.co/logo.png',
};

// ─── Email 1: Welcome Aboard ───

function buildEmail1Payload(client) {
  const bodyHtml = `
You've made a smart move! Here's what's about to happen:

<strong>DAY 1</strong> — You'll receive an email from us with a quick list of what we need from you (photos, logo, brand colors). Takes 10 minutes.<br/><br/>

<strong>DAY 2-3</strong> — Our team researches your business and drafts your first newsletter. We'll write it, design it, and make it look great.<br/><br/>

<strong>DAY 4</strong> — You'll receive a preview of your first newsletter for approval. One click to sign off.<br/><br/>

<strong>DAY 5</strong> — Your first newsletter goes out to your customers! 🚀
  `;

  const timelineHtml = `
✅ DAY 1 — Content collection email (check your inbox)<br/>
✅ DAY 2-3 — We research & draft your newsletter<br/>
✅ DAY 4 — You approve the preview<br/>
✅ DAY 5 — Your first newsletter goes live! 🚀<br/><br/>

<strong>What We Handle Every Week:</strong><br/>
✓ Writing — Engaging copy that sounds like you<br/>
✓ Design — Mobile-responsive, on-brand, beautiful<br/>
✓ Sending — Scheduled and delivered consistently<br/>
✓ Reporting — Opens, clicks, and growth tracked

  `;

  return {
    name: `${client.name} — Welcome (Email 1)`,
    subject: `Welcome to InboxLocal 🎉 — Here's What Happens Next`,
    preheader: `Your first newsletter is just days away`,
    sender: { name: INBOXLOCAL_BRAND.name, email: INBOXLOCAL_BRAND.email },
    replyTo: INBOXLOCAL_BRAND.email,
    // Handlebars variables for the MJML template
    variables: {
      subject: `Welcome to InboxLocal 🎉 — Here's What Happens Next`,
      greeting: `WELCOME TO INBOXLOCAL! 🎉`,
      client_name: client.name,
      body_html: bodyHtml,
      show_timeline: true,
      timeline_html: timelineHtml,
      show_checklist: false,
      show_preview: false,
      cta_text: null,
      cta_url: null,
      ps_text: null,
      unsubscribe_url: '{{unsubscribe_url}}', // Brevo handles this
    },
    // Brevo API campaign options
    campaignOptions: {
      type: 'classic', // classic email campaign
      recipients: { listIds: [client.brevoListId] },
      scheduledAt: 'immediate', // send immediately
    },
    // Automation trigger: send immediately after client creation
    trigger: { type: 'immediate', delay: 0 },
  };
}

// ─── Email 2: Content Collection ───

function buildEmail2Payload(client) {
  const bodyHtml = `
Ready to get your first newsletter rolling? We just need <strong>3 things</strong> from you. Should take about 10 minutes.<br/><br/>

<strong>1️⃣ YOUR LOGO & BRAND COLORS</strong><br/>
If you have a logo file (PNG or SVG preferred), please reply with it attached. Also let us know:<br/>
• Your primary brand color (hex code or name)<br/>
• Any secondary/accent colors<br/>
• Your preferred font style (if you have one)<br/><br/>
Don't have a logo? No problem — we'll use your business name in a clean text header.<br/><br/>

<strong>2️⃣ 2-3 HIGH-QUALITY PHOTOS</strong><br/>
Photos make newsletters come alive. Please send:<br/>
• Photo 1: Your best product/service shot (hero image)<br/>
• Photo 2: Your space/staff in action (atmosphere shot)<br/>
• Photo 3: Something new or seasonal<br/><br/>
<em>Tips: Natural lighting, landscape orientation, no blur, no stock photos — real is better!</em><br/><br/>

<strong>3️⃣ YOUR FIRST OFFER OR FOCUS</strong><br/>
What do you want to lead with in your first newsletter? Pick one:<br/>
• A special offer or discount<br/>
• A new product/service launch<br/>
• A spotlight story<br/>
• Your biggest upcoming event<br/><br/>
Just reply to this email with your answers and photos. Once we have them, we'll draft your first newsletter within 48 hours.
  `;

  const checklistHtml = `
<strong>1️⃣ Logo & Brand Colors</strong><br/>
• Logo file (PNG or SVG preferred)<br/>
• Primary brand color (hex code)<br/>
• Optional: accent colors, font preference<br/><br/>

<strong>2️⃣ 2-3 Photos</strong><br/>
• Hero shot: best product/service photo<br/>
• Atmosphere: your space, staff in action<br/>
• New/seasonal: something fresh<br/><br/>

<strong>3️⃣ First Newsletter Focus</strong><br/>
Choose one: offer, launch, spotlight, or event
  `;

  return {
    name: `${client.name} — Content Collection (Email 2)`,
    subject: `${client.name}, We Need 3 Things From You 📋`,
    preheader: `Send us these and we'll draft your first newsletter`,
    sender: { name: INBOXLOCAL_BRAND.name, email: INBOXLOCAL_BRAND.email },
    replyTo: INBOXLOCAL_BRAND.email,
    variables: {
      subject: `${client.name}, We Need 3 Things From You 📋`,
      greeting: `LET'S BUILD YOUR FIRST NEWSLETTER`,
      client_name: client.name,
      body_html: bodyHtml,
      show_timeline: false,
      show_checklist: true,
      checklist_html: checklistHtml,
      show_preview: false,
      cta_text: null,
      cta_url: null,
      ps_text: `Haven't had a chance yet? No rush. Just reply whenever you're ready and we'll take it from there.`,
      unsubscribe_url: '{{unsubscribe_url}}',
    },
    campaignOptions: {
      type: 'classic',
      recipients: { listIds: [client.brevoListId] },
      scheduledAt: null, // will be scheduled +24h after Email 1
    },
    trigger: { type: 'delay', afterEmail: 1, delayHours: 24 },
  };
}

// ─── Email 3: Preview & Launch ───

function buildEmail3Payload(client, previewDetails = {}) {
  const previewHtml = `
<strong>Subject:</strong> ${previewDetails.subject || '[Subject line]'}<br/>
<strong>Featured content:</strong> ${previewDetails.summary || '[Brief summary of newsletter content]'}<br/><br/>
${previewDetails.previewLink ? `<a href="${previewDetails.previewLink}">📄 Click here to view the full preview</a>` : ''}
  `;

  const bodyHtml = `
Great news — your first newsletter is drafted and ready for your eyes!

We've written and designed it based on the assets and preferences you shared. Here's a quick preview:

${previewHtml}

<strong>✅ APPROVED? JUST REPLY "SEND IT!"</strong>

If everything looks good, simply reply to this email with <strong>"Send it!"</strong> and we'll schedule it for ${previewDetails.proposedSendDate || 'this Friday'}.

↻ Need changes? Just let us know what to adjust and we'll update it right away.

<strong>What Happens After Launch:</strong><br/>
• You'll receive a performance report (opens, clicks, unsubscribes)<br/>
• We'll reach out to plan your next newsletter<br/>
• You'll settle into our weekly rhythm:<br/>
  → Monday: You send us a photo + any updates<br/>
  → Wednesday: We send you a draft to approve<br/>
  → Friday: Newsletter goes out to your list
  `;

  return {
    name: `${client.name} — Preview & Launch (Email 3)`,
    subject: `Preview: Your First Newsletter Is Ready! 🎯`,
    preheader: `Take a look and let us know what you think`,
    sender: { name: INBOXLOCAL_BRAND.name, email: INBOXLOCAL_BRAND.email },
    replyTo: INBOXLOCAL_BRAND.email,
    variables: {
      subject: `Preview: Your First Newsletter Is Ready! 🎯`,
      greeting: `YOUR FIRST NEWSLETTER IS READY! 🎉`,
      client_name: client.name,
      body_html: bodyHtml,
      show_timeline: false,
      show_checklist: false,
      show_preview: true,
      preview_html: previewHtml,
      cta_text: 'Reply "Send it!" to Approve',
      cta_url: null, // No link - they reply by email
      ps_text: `Want to add more subscribers? Send us any customer email addresses you have (collected with permission) and we'll import them before launch.`,
      unsubscribe_url: '{{unsubscribe_url}}',
    },
    campaignOptions: {
      type: 'classic',
      recipients: { listIds: [client.brevoListId] },
      scheduledAt: null, // manual trigger
    },
    trigger: { type: 'manual', note: 'Triggered by strategist when first newsletter is drafted' },
  };
}

// ─── Main Generator ───

function generateWelcomeCampaignPayloads(client, previewDetails) {
  console.log(`\n📧 Generating welcome campaign payloads for ${client.name}...`);

  const payloads = [
    buildEmail1Payload(client),
    buildEmail2Payload(client),
    buildEmail3Payload(client, previewDetails),
  ];

  console.log(`   → Email 1: "Welcome" (immediate)`);
  console.log(`   → Email 2: "Content Collection" (+24h)`);
  console.log(`   → Email 3: "Preview & Launch" (manual)`);
  console.log(`   └─ Total: 3 campaigns ready for Brevo API\n`);

  return payloads;
}

// ─── Brevo API Campaign Creator ───

async function createBrevoCampaign(brevoClient, payload) {
  // brevoClient is the brevoRequest function from onboarding.js
  // Payload maps to Brevo's /emailCampaigns endpoint

  const brevoBody = {
    name: payload.name,
    subject: payload.subject,
    preheader: payload.preheader,
    sender: payload.sender,
    replyTo: payload.replyTo,
    // The HTML content needs to be rendered from MJML + Handlebars first
    htmlContent: `<!-- Rendered from welcome.mjml template with variables: ${JSON.stringify(payload.variables)} -->`,
    recipients: payload.campaignOptions.recipients,
    type: payload.campaignOptions.type,
  };

  if (payload.campaignOptions.scheduledAt && payload.campaignOptions.scheduledAt !== 'immediate') {
    brevoBody.scheduledAt = payload.campaignOptions.scheduledAt;
  }

  console.log(`   Creating Brevo campaign: "${payload.name}"`);
  return await brevoClient('POST', '/emailCampaigns', brevoBody);
}

// ─── Export ───

module.exports = {
  generateWelcomeCampaignPayloads,
  buildEmail1Payload,
  buildEmail2Payload,
  buildEmail3Payload,
  createBrevoCampaign,
  INBOXLOCAL_BRAND,
};

// ─── CLI Usage ───
if (require.main === module) {
  const exampleClient = {
    name: "Joe's Pizza",
    brevoListId: 12345,
  };

  const previewDetails = {
    subject: "New Spicy Honey Pepperoni + 15% Off Weekend Deal",
    summary: "Introducing our new Spicy Honey Pepperoni slice, plus a weekend special for your customers.",
    previewLink: "https://preview.inboxlocal.co/joes-pizza-001",
    proposedSendDate: "this Friday",
  };

  const payloads = generateWelcomeCampaignPayloads(exampleClient, previewDetails);
  console.log(JSON.stringify(payloads, null, 2));
}