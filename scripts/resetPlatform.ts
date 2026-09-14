// One-off script: wipes all user accounts and their data, leaving only the
// SuperAdmin account and the app's own configuration (Twilio/M-Pesa
// settings, special banners, categories) intact.
//
// IMPORTANT: this app persists its sql.js database by exporting the entire
// in-memory copy back to disk after every write. If the live server (pm2)
// is still running while this script writes to database.sqlite, the
// server's stale in-memory copy can later overwrite this script's changes.
// Stop the server first:
//
//   pm2 stop nikosoko
//   npx tsx scripts/resetPlatform.ts            # prints a plan, changes nothing
//   npx tsx scripts/resetPlatform.ts --confirm   # actually deletes
//   pm2 start nikosoko

import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

const DB_FILE = path.join(process.cwd(), 'database.sqlite');
const CONFIRM = process.argv.includes('--confirm');

function isSuperAdmin(row: any): boolean {
  const phone = String(row.phone || '');
  const email = String(row.email || '').toLowerCase();
  const last9 = phone.replace(/\D/g, '').slice(-9);
  return (
    last9 === '723119356' ||
    email === 'noid254@gmail.com' ||
    email === 'admin@nikosoko.com' ||
    row.role === 'SuperAdmin'
  );
}

async function main() {
  if (!fs.existsSync(DB_FILE)) {
    console.error(`Database file not found at ${DB_FILE}`);
    process.exit(1);
  }

  // Always take a fresh backup before touching anything, confirm or not.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${DB_FILE}.before-reset-${stamp}`;
  fs.copyFileSync(DB_FILE, backupPath);
  console.log(`Backup written to ${backupPath}`);

  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_FILE));

  const stmt = db.prepare('SELECT id, name, phone, email, role FROM providers');
  const providers: any[] = [];
  while (stmt.step()) providers.push(stmt.getAsObject());
  stmt.free();

  const keep = providers.filter(isSuperAdmin);
  const remove = providers.filter(p => !isSuperAdmin(p));

  const countRow = (table: string) => {
    const r = db.exec(`SELECT COUNT(*) as c FROM ${table}`);
    return r[0]?.values[0][0] ?? 0;
  };

  console.log(`\nAccounts to KEEP (SuperAdmin): ${keep.length}`);
  keep.forEach(k => console.log(`  ${k.name} — ${k.email || k.phone} (role: ${k.role})`));
  console.log(`\nAccounts to DELETE: ${remove.length}`);
  console.log(`catalogue_items to delete: ${countRow('catalogue_items')}`);
  console.log(`bookings to delete: ${countRow('bookings')}`);
  console.log(`messages to delete: ${countRow('messages')}`);
  console.log(`gigs to delete: ${countRow('gigs')}`);
  console.log(`events to delete: ${countRow('events')}`);
  console.log(`location_checkin_logs to delete: ${countRow('location_checkin_logs')}`);
  console.log('\nPreserved untouched: system_settings, special_banners, categories');

  if (keep.length === 0) {
    console.error('\nNo SuperAdmin account was found to preserve — aborting to avoid wiping everyone. Check the matching criteria in this script.');
    process.exit(1);
  }

  if (!CONFIRM) {
    console.log('\nDry run only (no --confirm flag). Nothing was changed.');
    return;
  }

  const keepIds = keep.map(k => `'${k.id.replace(/'/g, "''")}'`).join(',');
  db.run(`DELETE FROM providers WHERE id NOT IN (${keepIds})`);
  db.run('DELETE FROM catalogue_items');
  db.run('DELETE FROM bookings');
  db.run('DELETE FROM messages');
  db.run('DELETE FROM gigs');
  db.run('DELETE FROM events');
  db.run('DELETE FROM location_checkin_logs');

  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));

  console.log('\nDone. Database wiped and saved.');
  console.log('Now run: pm2 start nikosoko');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
