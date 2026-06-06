// InboxLocal — Newsletter Scheduler
// Cron-based weekly dispatch system
// Run: node scripts/scheduler.js
// Cron: 0 9 * * 1 node /path/to/scheduler.js

const fs = require('fs');
const path = require('path');

const CONFIG = {
  contentDir: path.join(__dirname, '..', 'content'),
  templatesDir: path.join(__dirname, '..', 'templates'),
  outputDir: path.join(__dirname, '..', 'dist'),
};

/**
 * Weekly schedule:
 * Mon — Send newsletters
 * Tue — Review analytics
 * Wed — Strategist drafts next content
 * Thu — Send previews to clients
 * Fri — Finalize & queue next sends
 */

function getClientSchedule() {
  // Read from database in production
  return [];
}

async function processScheduledSends() {
  console.log(`\n📬 InboxLocal Newsletter Scheduler`);
  console.log(`   ${new Date().toLocaleString()}\n`);

  const schedule = getClientSchedule();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySends = schedule.filter(s => s.day === today);

  if (todaySends.length === 0) {
    console.log(`   No newsletters scheduled for ${today}.`);
    return;
  }

  console.log(`   Sending ${todaySends.length} newsletter(s) today...\n`);

  for (const send of todaySends) {
    console.log(`   → ${send.name}`);
    // TODO: render template, inject content, send via Brevo API
  }

  console.log(`\n✅ Done.`);
}

if (require.main === module) {
  processScheduledSends();
}

module.exports = { processScheduledSends, getClientSchedule };