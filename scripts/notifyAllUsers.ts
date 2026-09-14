// One-off script: texts every registered account (except the SuperAdmin) to
// tell them the platform is resetting. Read-only against the database — it
// never modifies anything, so it's safe to run while the live server (pm2)
// is still up.
//
// Usage (from the app root, on the server):
//   npx tsx scripts/notifyAllUsers.ts            # sends for real
//   npx tsx scripts/notifyAllUsers.ts --dry-run   # prints who/what without sending

import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import twilio from 'twilio';

const DB_FILE = path.join(process.cwd(), 'database.sqlite');
const DRY_RUN = process.argv.includes('--dry-run');

const MESSAGE =
  "NikoSoko: Nearby, Skilled and Ready. We're resetting all accounts for a fresh start — please re-register soon with an updated profile photo and enabled location. Thank you!";

function formatToE164(phone: string): string {
  let cleaned = String(phone || '').trim();
  if (cleaned.startsWith('+')) return cleaned;
  let digits = cleaned.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '254' + digits.slice(1);
  } else if (!digits.startsWith('254') && digits.length === 9) {
    digits = '254' + digits;
  }
  return '+' + digits;
}

// Matches resetPlatform.ts: only the one confirmed real SuperAdmin account
// is skipped from the text blast, not the other duplicate rows sharing the
// same phone number.
function isSuperAdmin(row: any): boolean {
  const phone = String(row.phone || '');
  const last9 = phone.replace(/\D/g, '').slice(-9);
  return last9 === '723119356' && String(row.name || '').trim() === 'Alex Kiprop (Super Admin)';
}

async function main() {
  if (!fs.existsSync(DB_FILE)) {
    console.error(`Database file not found at ${DB_FILE}`);
    process.exit(1);
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_FILE));

  const stmt = db.prepare('SELECT id, name, phone, email, role FROM providers');
  const providers: any[] = [];
  while (stmt.step()) providers.push(stmt.getAsObject());
  stmt.free();

  const targets = providers.filter(p => !isSuperAdmin(p) && p.phone);
  const skippedAdmin = providers.filter(isSuperAdmin);
  const skippedNoPhone = providers.filter(p => !isSuperAdmin(p) && !p.phone);

  console.log(`Total accounts: ${providers.length}`);
  console.log(`SuperAdmin accounts preserved (not texted): ${skippedAdmin.length}`);
  console.log(`Accounts with no phone on file (skipped): ${skippedNoPhone.length}`);
  console.log(`Accounts to text: ${targets.length}`);
  console.log(`\nMessage:\n"${MESSAGE}"\n`);

  if (DRY_RUN) {
    console.log('--dry-run set: not sending anything. Sample recipients:');
    targets.slice(0, 5).forEach(t => console.log(`  ${t.name} — ${formatToE164(t.phone)}`));
    if (targets.length > 5) console.log(`  ...and ${targets.length - 5} more`);
    return;
  }

  const settingsStmt = db.prepare('SELECT key, value FROM system_settings WHERE key IN (?, ?, ?)');
  settingsStmt.bind(['twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber']);
  const settings: Record<string, string> = {};
  while (settingsStmt.step()) {
    const row = settingsStmt.getAsObject() as any;
    settings[row.key] = row.value;
  }
  settingsStmt.free();

  const accountSid = settings.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = settings.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN || '';
  const phoneNumber = settings.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER || '';

  if (!accountSid || !authToken || !phoneNumber) {
    console.error('Twilio is not fully configured (need account SID, auth token, and a sending phone number).');
    console.error(`  accountSid: ${accountSid ? 'set' : 'MISSING'}`);
    console.error(`  authToken: ${authToken ? 'set' : 'MISSING'}`);
    console.error(`  phoneNumber: ${phoneNumber ? 'set' : 'MISSING'}`);
    process.exit(1);
  }

  const client = twilio(accountSid, authToken);

  let sent = 0;
  let failed = 0;
  const failures: { name: string; phone: string; error: string }[] = [];

  for (const p of targets) {
    const to = formatToE164(p.phone);
    try {
      await client.messages.create({ body: MESSAGE, from: phoneNumber, to });
      sent++;
      console.log(`Sent to ${p.name} (${to})`);
    } catch (e: any) {
      failed++;
      failures.push({ name: p.name, phone: to, error: e.message });
      console.error(`FAILED for ${p.name} (${to}): ${e.message}`);
    }
    // Gentle pacing to avoid hammering Twilio's rate limits.
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach(f => console.log(`  ${f.name} (${f.phone}): ${f.error}`));
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
