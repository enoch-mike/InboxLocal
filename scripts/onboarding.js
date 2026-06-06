// InboxLocal — Client Onboarding Automation
// Brevo (Sendinblue) API integration
// Usage: BREVO_API_KEY=xxx node scripts/onboarding.js

const BREVO_API_KEY = process.env.BREVO_API_KEY || 'YOUR_BREVO_API_KEY_HERE';
const BREVO_BASE = 'https://api.brevo.com/v3';

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
  constructor({ id, name, email, businessType, primaryColor, accentColor, logoUrl, contactListId }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.businessType = businessType; // 'restaurant' | 'gym' | 'salon'
    this.primaryColor = primaryColor || '#4F46E5';
    this.accentColor = accentColor || '#EC4899';
    this.logoUrl = logoUrl || '';
    this.contactListId = contactListId || null;
  }
}

async function createBrevoContactList(client) {
  console.log(`Creating contact list for ${client.name}...`);
  const list = await brevoRequest('POST', '/contacts/lists', {
    name: `${client.name} — Newsletter`,
    folderId: 1,
  });
  client.contactListId = list.id;
  console.log(`  → List created: ID ${list.id}`);
  return list.id;
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

async function createWelcomeCampaign(client) {
  console.log(`Creating welcome campaign for ${client.name}...`);
  const campaign = await brevoRequest('POST', '/emailCampaigns', {
    name: `${client.name} — Welcome Series`,
    subject: `Welcome to ${client.name}!`,
    htmlContent: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
    sender: { name: client.name, email: client.email },
    recipients: { listIds: [client.contactListId] },
    scheduledAt: new Date().toISOString(),
  });
  console.log(`  → Campaign created: ID ${campaign.id}`);
  return campaign;
}

async function onboardClient(clientData) {
  console.log('\n========================================');
  console.log('  InboxLocal — Client Onboarding');
  console.log('========================================\n');

  const client = new Client(clientData);

  try {
    await createBrevoContactList(client);
    await setupWebhook(client);
    await createWelcomeCampaign(client);

    console.log(`\n✅ Client "${client.name}" onboarded successfully!`);
    console.log(`   Contact List ID: ${client.contactListId}`);
    console.log('\nNext steps:');
    console.log('   1. Import existing contacts');
    console.log('   2. Set up weekly newsletter schedule');
    console.log('   3. Create first newsletter campaign');

    return { success: true, client };
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

// Uncomment to run:
// onboardClient(exampleClient);

module.exports = { onboardClient, Client, brevoRequest, createBrevoContactList, createWelcomeCampaign };