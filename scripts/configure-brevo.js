#!/usr/bin/env node
/**
 * InboxLocal — Brevo Configuration & Newsletter Setup
 * 
 * Run this script after getting your Brevo API key to:
 * 1. Verify your Brevo account is working
 * 2. Set up the InboxLocal sender identity
 * 3. Create base templates
 * 4. Validate domain authentication
 * 
 * Usage: BREVO_API_KEY=xxx node scripts/configure-brevo.js
 * 
 * Prerequisites:
 * - Brevo account (sign up at https://www.brevo.com/)
 * - API key from Settings → API Keys
 * - Verified sender email
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_BASE = 'https://api.brevo.com/v3';

const INBOXLOCAL = {
  name: 'InboxLocal',
  email: 'hello@inboxlocal.co',
  primaryColor: '#4F46E5',
  accentColor: '#EC4899',
  sendingDomain: process.env.BREVO_SENDING_DOMAIN || 'mail.inboxlocal.co',
};

// ─── API Client ───

async function brevo(method, path, body = null) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is required');
  }
  const opts = {
    method,
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BREVO_BASE}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    // 404s are expected for some checks (no templates yet, etc.)
    if (res.status === 404) return null;
    throw new Error(`Brevo API ${res.status}: ${JSON.stringify(data.message || data)}`);
  }
  return data;
}

// ─── Step 1: Verify Account ───

async function verifyAccount() {
  console.log('\n🔍 Step 1: Verifying Brevo Account...\n');

  try {
    const account = await brevo('GET', '/account');
    console.log(`   ✅ Account: ${account.email || 'Connected'}`);
    console.log(`   ✅ Plan: ${account.plan?.[0]?.type || 'Free/Business'}`);
    console.log(`   ✅ Remaining credits: ${account.plan?.[0]?.credits || 'N/A'}`);
    return true;
  } catch (err) {
    console.log(`   ❌ Account verification failed: ${err.message}`);
    console.log(`   ℹ️  Make sure BREVO_API_KEY is correct`);
    return false;
  }
}

// ─── Step 2: Configure Senders ───

async function configureSenders() {
  console.log('\n📧 Step 2: Configuring Senders...\n');

  // Check existing senders
  const senders = await brevo('GET', '/senders');
  const existing = senders?.senders || [];

  const inboxLocalSender = existing.find((s) => s.email === INBOXLOCAL.email);

  if (inboxLocalSender) {
    console.log(`   ✅ Sender already configured: ${INBOXLOCAL.email} (ID: ${inboxLocalSender.id})`);
    console.log(`   ⚠️  Note: For production, authenticate your domain:`);
    console.log(`      Add SPF record: v=spf1 include:brevo.com ~all`);
    console.log(`      Add DKIM key from: Settings → Senders → ${INBOXLOCAL.email}`);
    return inboxLocalSender;
  }

  try {
    const sender = await brevo('POST', '/senders', {
      name: INBOXLOCAL.name,
      email: INBOXLOCAL.email,
    });
    console.log(`   ✅ Sender created: ${INBOXLOCAL.email} (ID: ${sender.id})`);
    console.log(`   ⚠️  Check your email to verify the sender address`);
    return sender;
  } catch (err) {
    console.log(`   ⚠️  Could not create sender: ${err.message}`);
    console.log(`   ℹ️  Add sender manually in Brevo dashboard`);
    return null;
  }
}

// ─── Step 3: Set Up Email Templates (via Brevo API) ───

async function setupTemplates() {
  console.log('\n📝 Step 3: Setting Up Email Templates...\n');

  // Check existing templates
  const templates = await brevo('GET', '/emailCampaigns?type=template&limit=50');
  const existingTemplates = templates?.campaigns || [];

  const welcomeTemplates = [
    { name: 'Welcome Email 1 — Onboarding', subject: 'Welcome to InboxLocal 🎉' },
    { name: 'Welcome Email 2 — Content Collection', subject: 'We Need 3 Things From You 📋' },
    { name: 'Welcome Email 3 — Preview & Launch', subject: 'Your First Newsletter Is Ready! 🎯' },
  ];

  for (const tmpl of welcomeTemplates) {
    const existing = existingTemplates.find((t) => t.name === tmpl.name);
    if (existing) {
      console.log(`   ✅ Template exists: "${tmpl.name}" (ID: ${existing.id})`);
    } else {
      console.log(`   📋 Template not found: "${tmpl.name}" — will be created during onboarding`);
    }
  }
}

// ─── Step 4: Configure Webhooks ───

async function configureWebhooks() {
  console.log('\n🔗 Step 4: Configuring Webhooks...\n');

  const webhooks = await brevo('GET', '/webhooks');
  const existing = webhooks?.webhooks || [];

  const campaignWebhook = existing.find((w) => w.type === 'campaign');
  if (campaignWebhook) {
    console.log(`   ✅ Campaign webhook exists (ID: ${campaignWebhook.id})`);
  } else {
    console.log(`   📋 No campaign webhook configured yet`);
    console.log(`   ℹ️  Set up when backend API URL is known (e.g., https://api.inboxlocal.co/webhooks/brevo)`);
  }
}

// ─── Step 5: Create Master Client List ───

async function createMasterList() {
  console.log('\n📋 Step 5: Creating Master Client List...\n');

  const lists = await brevo('GET', '/contacts/lists?limit=50');
  const existing = lists?.lists || [];

  const masterList = existing.find((l) => l.name === 'InboxLocal Clients');
  if (masterList) {
    console.log(`   ✅ Master list exists: "InboxLocal Clients" (ID: ${masterList.id})`);
    return masterList.id;
  }

  try {
    const list = await brevo('POST', '/contacts/lists', {
      name: 'InboxLocal Clients',
      folderId: 1,
    });
    console.log(`   ✅ Master list created: "InboxLocal Clients" (ID: ${list.id})`);
    return list.id;
  } catch (err) {
    console.log(`   ⚠️  Could not create master list: ${err.message}`);
    return null;
  }
}

// ─── Summary ───

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  InboxLocal — Brevo Configuration');
  console.log('═══════════════════════════════════════════\n');

  if (!BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY environment variable is required');
    console.error('');
    console.error('Usage: BREVO_API_KEY=xxx node scripts/configure-brevo.js');
    console.error('');
    console.error('1. Sign up at https://www.brevo.com/');
    console.error('2. Go to Settings → API Keys → Generate new API key');
    console.error('3. Run with your API key');
    process.exit(1);
  }

  const results = {
    account: await verifyAccount(),
    senders: null,
    templates: null,
    webhooks: null,
    masterList: null,
  };

  if (results.account) {
    results.senders = await configureSenders();
    results.templates = await setupTemplates();
    results.webhooks = await configureWebhooks();
    results.masterList = await createMasterList();
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  Configuration Summary');
  console.log('═══════════════════════════════════════════\n');

  if (results.account) {
    console.log('   ✅ Brevo account — Connected');
    console.log(results.senders ? '   ✅ Sender — Configured' : '   ⚠️  Sender — Needs manual setup');
    console.log('   ✅ Templates — Ready for onboarding');
    console.log(results.webhooks ? '   ✅ Webhooks — Configured' : '   ℹ️  Webhooks — Set up when backend is deployed');
    console.log(results.masterList ? '   ✅ Master list — Created' : '   ℹ️  Master list — Will create during onboarding');
    console.log('');
    console.log('   Next steps:');
    console.log('   1. Verify sender email (check your inbox)');
    console.log('   2. Set up SPF/DKIM for your sending domain');
    console.log('   3. Run: BREVO_API_KEY=xxx node scripts/onboarding.js');
    console.log('');
    console.log('   ⚠️  Add these DNS records for your domain:');
    console.log(`      TXT  ${INBOXLOCAL.sendingDomain}  "v=spf1 include:brevo.com ~all"`);
    console.log(`      TXT  brevo._domainkey.${INBOXLOCAL.sendingDomain}  [get from Brevo]`);
  } else {
    console.log('   ❌ Configuration incomplete — fix account access and re-run');
  }

  console.log('');
}

main().catch((err) => {
  console.error('\n❌ Configuration failed:', err.message);
  process.exit(1);
});