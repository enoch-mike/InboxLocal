// InboxLocal — Client Onboarding Automation + Welcome Email Integration
// Brevo (Sendinblue) API integration
// Usage: BREVO_API_KEY=xxx node scripts/onboarding.js
//
// Integrates with:
//   - content-strategy/onboarding/welcome-sequence.md (content source)
//   - scripts/welcome-campaign.js (campaign payload generation)
//   - templates/welcome.mjml (email template)

const BREVO_API_KEY = process.env.BREVO_API_KEY || 'YOUR_BREVO_API_KEY_HERE';
const BREVO_BASE = 'https://api.brevo.com/v3';

// Import the welcome campaign module
const {
  generateWelcomeCampaignPayloads,
  createBrevoCampaign,
  INBOXLOCAL_BRAND,
} = require('./welcome-campaign');

async function brevoRequest(method, path, body = null) {
  const options = {
    method,
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BREVO_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(`Brevo API error: ${res.status} — ${JSON.stringify(data)}`);
  return data;
}

class Client {
  constructor({ id, name, email, businessType, primaryColor, accentColor, logoUrl, contactListId, brevoListId }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.businessType = businessType; // 'restaurant' | 'gym' | 'salon'
    this.primaryColor = primaryColor || '#4F46E5';
    this.accentColor = accentColor || '#EC4899';
    this.logoUrl = logoUrl || '';
    this.contactListId = contactListId || null;
    // Alias for welcome-campaign compatibility
    this.brevoListId = brevoListId || this.contactListId;
  }
}

async function createBrevoContactList(client) {
  console.log(`Creating contact list for ${client.name}...`);
  const list = await brevoRequest('POST', '/contacts/lists', {
    name: `${client.name} — Newsletter`,
    folderId: 1,
  });
  client.contactListId = list.id;
  client.brevoListId = list.id;
  console.log(`  → List created: ID ${list.id}`);
  return list.id;
}

async function createClientContact(client) {
  console.log(`Creating contact in InboxLocal Clients list for ${client.name}...`);

  // First ensure the "InboxLocal Clients" master list exists
  let inboxLocalListId = 2; // Default folder, second list
  try {
    const lists = await brevoRequest('GET', '/contacts/lists?limit=50');
    const existingList = lists.lists.find(l => l.name === 'InboxLocal Clients');
    if (existingList) {
      inboxLocalListId = existingList.id;
    } else {
      const newList = await brevoRequest('POST', '/contacts/lists', {
        name: 'InboxLocal Clients',
        folderId: 1,
      });
      inboxLocalListId = newList.id;
    }
  } catch (e) {
    console.log(`  → Note: Could not find/create master list: ${e.message}`);
  }

  // Add client as a contact to the master list with attributes
  try {
    const contact = await brevoRequest('POST', '/contacts', {
      email: client.email,
      attributes: {
        FIRSTNAME: client.name,
        CLIENT_NAME: client.name,
        BUSINESS_TYPE: client.businessType,
        PRIMARY_COLOR: client.primaryColor,
        ACCENT_COLOR: client.accentColor,
        CONTACT_LIST_ID: client.contactListId,
      },
      listIds: [inboxLocalListId],
      updateEnabled: true,
    });
    console.log(`  → Contact created/updated in InboxLocal Clients list`);
    return contact;
  } catch (e) {
    console.log(`  → Note: Contact creation skipped: ${e.message}`);
  }
}

async function setupWebhook(client) {
  console.log(`Setting up webhook for ${client.name}...`);
  const webhook = await brevoRequest('POST', '/webhooks', {
    type: 'campaign',
    url: `https://api.inboxlocal.co/webhooks/brevo/campaign/${client.id}`,
    events: ['sent', 'delivered', 'clicked', 'opened', 'unsubscribed'],
  });
  console.log(`  → Webhook created: ID ${webhook.id}`);
  return webhook;
}

// ─── Welcome Campaign Integration ───
// Generates and creates 3 welcome emails via Brevo API
// Content sourced from: content-strategy/onboarding/welcome-sequence.md

async function createWelcomeCampaigns(client, previewDetails = {}) {
  console.log(`\n📧 Setting up welcome email sequence for ${client.name}...`);
  console.log(`   Content source: content-strategy/onboarding/welcome-sequence.md`);
  console.log(`   Template: templates/welcome.mjml\n`);

  // Generate campaign payloads from the welcome sequence
  const payloads = generateWelcomeCampaignPayloads(
    { name: client.name, brevoListId: client.brevoListId },
    previewDetails
  );

  const createdCampaigns = [];

  for (const payload of payloads) {
    try {
      const campaign = await createBrevoCampaign(brevoRequest, payload);
      createdCampaigns.push({ name: payload.name, id: campaign.id, trigger: payload.trigger });
      console.log(`   ✅ Campaign created: "${payload.name}" → ID: ${campaign.id}`);
    } catch (err) {
      console.log(`   ⚠️  Campaign skipped (API not live): "${payload.name}" — ${err.message}`);
      // Store the payload for later use when API is live
      createdCampaigns.push({ name: payload.name, payload, status: 'pending' });
    }
  }

  return createdCampaigns;
}

async function onboardClient(clientData, previewDetails) {
  console.log('\n========================================');
  console.log('  InboxLocal — Client Onboarding');
  console.log('========================================\n');

  const client = new Client(clientData);

  try {
    // Step 1: Create Brevo contact list for the client's customers
    await createBrevoContactList(client);
    console.log();

    // Step 2: Register client as Brevo contact with attributes
    await createClientContact(client);
    console.log();

    // Step 3: Set up webhooks for analytics
    await setupWebhook(client);
    console.log();

    // Step 4: Create the 3-email welcome sequence
    // Emails: Welcome → Content Collection (+24h) → Preview & Launch (manual)
    console.log('   ─────────────────────────────────────────');
    console.log('   Welcome Sequence (from welcome-sequence.md):');
    console.log('   Email 1: Welcome Aboard → Immediate');
    console.log('   Email 2: Content Collection → +24h');
    console.log('   Email 3: Preview & Launch → Manual\n');
    const campaigns = await createWelcomeCampaigns(client, previewDetails);

    console.log(`\n✅ Client "${client.name}" onboarded successfully!`);
    console.log(`   Contact List ID: ${client.contactListId}`);
    console.log(`   Welcome Emails Created: ${campaigns.filter(c => c.id).length}/3`);
    console.log(`   Next: Import existing contacts and schedule first newsletter`);

    return { success: true, client, campaigns };
  } catch (err) {
    console.error(`\n❌ Onboarding failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Example usage
const exampleClient = {
  id: 'client-001',
  name: "Joe's Pizza",
  email: 'joe@joespizza.com',
  businessType: 'restaurant',
  primaryColor: '#E11D48',
  accentColor: '#F97316',
  logoUrl: 'https://joespizza.com/logo.png',
};

// Example preview details (populated when first newsletter is drafted)
const examplePreview = {
  subject: "New Spicy Honey Pepperoni + Weekend Special",
  summary: "Introducing our new Spicy Honey Pepperoni slice, available all weekend with 15% off.",
  previewLink: "https://preview.inboxlocal.co/joes-pizza-001",
  proposedSendDate: "this Friday",
};

// Uncomment to run:
// onboardClient(exampleClient, examplePreview);

module.exports = {
  onboardClient,
  Client,
  brevoRequest,
  createBrevoContactList,
  createClientContact,
  createWelcomeCampaigns,
  generateWelcomeCampaignPayloads,
};