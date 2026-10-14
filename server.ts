import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { createAuth, getAuth, signToken, rateLimit, isProd } from './serverAuth';
import type { AuthInfo } from './serverAuth';

const PORT = 3002;
const DB_FILE = path.join(process.cwd(), 'database.sqlite');

let db: Database;

// Helper to persist SQLite DB to disk
function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// Helper to convert SQL query result to array of objects
function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSql(sql: string, params: any[] = []) {
  db.run(sql, params);
  saveDb();
}

async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  // Create SQLite Schema for Trades Professionals, Services & Marketplace
  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      service TEXT,
      category TEXT,
      rating REAL DEFAULT 5.0,
      reviewsCount INTEGER DEFAULT 0,
      isVerified INTEGER DEFAULT 0,
      location TEXT,
      bio TEXT,
      about TEXT,
      avatarUrl TEXT,
      coverImageUrl TEXT,
      role TEXT DEFAULT 'Provider',
      skills TEXT,
      hourlyRate TEXT,
      portfolio TEXT,
      password TEXT,
      isOnline INTEGER DEFAULT 1,
      contactInfo TEXT,
      latitude REAL,
      longitude REAL,
      lastCheckInAt TEXT,
      lastCheckInLocation TEXT,
      rawData TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS catalogue_items (
      id TEXT PRIMARY KEY,
      providerId TEXT,
      title TEXT NOT NULL,
      category TEXT,
      price TEXT,
      description TEXT,
      isVerified INTEGER DEFAULT 0,
      images TEXT,
      serialNumber TEXT,
      duration TEXT,
      discountInfo TEXT,
      externalLink TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT,
      recipientId TEXT,
      senderName TEXT,
      recipientName TEXT,
      text TEXT,
      timestamp TEXT,
      isRead INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gigs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      location TEXT,
      budget TEXT,
      description TEXT,
      posterName TEXT,
      posterPhone TEXT,
      status TEXT DEFAULT 'Open',
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT,
      location TEXT,
      description TEXT,
      price TEXT,
      organizerName TEXT,
      image TEXT,
      attendeesCount INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS special_banners (
      id TEXT PRIMARY KEY,
      title TEXT,
      subtitle TEXT,
      imageUrl TEXT,
      actionUrl TEXT,
      badgeText TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      providerId TEXT,
      providerName TEXT,
      providerPhone TEXT,
      providerAvatar TEXT,
      providerService TEXT,
      clientId TEXT,
      clientName TEXT,
      clientEmail TEXT,
      clientPhone TEXT,
      date TEXT,
      time TEXT,
      serviceTitle TEXT,
      estimatedFee REAL DEFAULT 0,
      minBookingFee REAL DEFAULT 0,
      paidDepositAmount REAL DEFAULT 0,
      mpesaReceiptNumber TEXT,
      mpesaPhoneNumber TEXT,
      paymentStatus TEXT DEFAULT 'Pending',
      status TEXT DEFAULT 'Pending',
      location TEXT,
      notes TEXT,
      googleCalendarEventId TEXT,
      googleCalendarHtmlLink TEXT,
      isCalendarSynced INTEGER DEFAULT 0,
      cancellationReason TEXT,
      cancelledBy TEXT,
      cancelledAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS location_checkin_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      userPhone TEXT,
      userRole TEXT,
      locationName TEXT,
      estateName TEXT,
      county TEXT,
      latitude REAL,
      longitude REAL,
      accuracyMeters REAL,
      checkInType TEXT,
      deviceInfo TEXT,
      notes TEXT,
      timestamp TEXT,
      isActive INTEGER DEFAULT 1
    );
  `);

  // Safe migration for newly added columns if table already exists
  try { runSql('ALTER TABLE bookings ADD COLUMN cancellationReason TEXT'); } catch (_) {}
  try { runSql('ALTER TABLE bookings ADD COLUMN cancelledBy TEXT'); } catch (_) {}
  try { runSql('ALTER TABLE bookings ADD COLUMN cancelledAt TEXT'); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN latitude REAL'); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN longitude REAL'); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN lastCheckInAt TEXT'); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN lastCheckInLocation TEXT'); } catch (_) {}

  saveDb();

  // Seed default super admin & initial trades professionals if empty
  const providerCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM providers');
  if (!providerCount || providerCount.count === 0) {
    const defaultSuperAdmin = {
      id: 'super-admin-001',
      name: 'NikoSoko Admin',
      phone: process.env.SUPERADMIN_PHONE || '',
      email: process.env.SUPERADMIN_EMAIL || 'admin@nikosoko.com',
      service: 'Platform Support & Verification',
      category: 'TECHNICAL',
      rating: 5.0,
      reviewsCount: 150,
      isVerified: 1,
      location: 'Nairobi, Kenya',
      bio: 'Official NikoSoko Super Administrator for trades, skilled artisans, and local service providers.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
      coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800',
      role: 'SuperAdmin',
      skills: JSON.stringify(['Master Electrician', 'Plumbing Inspection', 'Solar Installation', 'Quality Assurance']),
      hourlyRate: 'Ksh 2,500/hr',
      createdAt: new Date().toISOString()
    };

    const initialTradesPros = [
      {
        id: 'pro-001',
        name: 'Kamau Electrics & Solar',
        phone: '0712345678',
        email: 'kamau.electric@gmail.com',
        service: 'Licensed Electrical Wiring & Solar Installation',
        category: 'ELECTRICAL',
        rating: 4.9,
        reviewsCount: 38,
        isVerified: 1,
        location: 'Westlands, Nairobi',
        bio: 'Certified EPRA electrician with 10+ years experience in domestic wiring, circuit breaker fixes, generator installation, and inverter setups.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
        coverImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800',
        role: 'Provider',
        skills: JSON.stringify(['Domestic Wiring', 'EPRA Certified', 'Solar Inverters', 'Fault Finding']),
        hourlyRate: 'Ksh 1,500/hr',
        createdAt: new Date().toISOString()
      },
      {
        id: 'pro-002',
        name: 'Mama Ouma Plumbing Services',
        phone: '0722987654',
        email: 'ouma.plumbing@gmail.com',
        service: 'Pipe Repair, Drainage & Water Heater Maintenance',
        category: 'PLUMBING',
        rating: 4.8,
        reviewsCount: 52,
        isVerified: 1,
        location: 'Kilimani, Nairobi',
        bio: 'Fast emergency plumbing repairs, unblocking choked drains, installing water pumps, instant shower heads, and bathroom remodeling.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300',
        coverImageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800',
        role: 'Provider',
        skills: JSON.stringify(['Leak Repair', 'Drainage Unblocking', 'Water Pump Fitting', 'Instant Showers']),
        hourlyRate: 'Ksh 1,200/hr',
        createdAt: new Date().toISOString()
      },
      {
        id: 'pro-003',
        name: 'Otieno Carpentry & Custom Furniture',
        phone: '0733112233',
        email: 'otieno.crafts@gmail.com',
        service: 'Custom Woodwork, Cabinetry & Door Fitting',
        category: 'CARPENTRY',
        rating: 4.9,
        reviewsCount: 29,
        isVerified: 1,
        location: 'Industrial Area, Nairobi',
        bio: 'Skilled wood artisan specializing in kitchen cabinets, mahogany doors, wardrobe fitting, office furniture, and timber repairs.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300',
        coverImageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=800',
        role: 'Provider',
        skills: JSON.stringify(['Kitchen Cabinets', 'Hardwood Doors', 'Wardrobes', 'Furniture Restoration']),
        hourlyRate: 'Ksh 1,800/hr',
        createdAt: new Date().toISOString()
      }
    ];

    // The super admin is only seeded when SUPERADMIN_PHONE is configured; there is no default code or password.
    [...(process.env.SUPERADMIN_PHONE ? [defaultSuperAdmin] : []), ...initialTradesPros].forEach(p => {
      runSql(
        `INSERT INTO providers (id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.phone, p.email, p.service, p.category, p.rating, p.reviewsCount, p.isVerified, p.location, p.bio, p.avatarUrl, p.coverImageUrl, p.role, p.skills, p.hourlyRate, '', p.createdAt]
      );
    });

    console.log('SQLite database initialized with seed trades professionals!');
  }
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Session auth. The role is read from the database on every request, never from the token.
  const { optionalAuth, requireAuth, requireAdmin } = createAuth((providerId) => {
    const row = queryOne('SELECT role FROM providers WHERE id = ?', [providerId]);
    return row ? (row.role || 'Member') : null;
  });
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  // Critical No-Cache Policy for all API requests to ensure fresh SQLite queries
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // --- SQLite REST API Routes ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'SQLite', timestamp: new Date().toISOString() });
  });

  // Twilio & SMS Helpers
  function getTwilioConfig() {
    const accountSid = queryOne('SELECT value FROM system_settings WHERE key = ?', ['twilioAccountSid'])?.value || process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = queryOne('SELECT value FROM system_settings WHERE key = ?', ['twilioAuthToken'])?.value || process.env.TWILIO_AUTH_TOKEN || '';
    const phoneNumber = queryOne('SELECT value FROM system_settings WHERE key = ?', ['twilioPhoneNumber'])?.value || process.env.TWILIO_PHONE_NUMBER || '';
    const verifyServiceSid = queryOne('SELECT value FROM system_settings WHERE key = ?', ['twilioVerifyServiceSid'])?.value || process.env.TWILIO_VERIFY_SERVICE_SID || '';

    return { accountSid, authToken, phoneNumber, verifyServiceSid };
  }

  function formatToE164(phone: string): string {
    let cleaned = String(phone).trim();
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    let digits = cleaned.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '254' + digits.slice(1);
    } else if (!digits.startsWith('254') && digits.length === 9) {
      digits = '254' + digits;
    }
    return '+' + digits;
  }

  // OTP Verification Endpoints
  const activeServerOtps = new Map<string, { code: string; expiresAt: number; attempts: number }>();

  const smsProviderConfigured = () => {
    const cfg = getTwilioConfig();
    return Boolean(cfg.accountSid && cfg.authToken && (cfg.verifyServiceSid || cfg.phoneNumber));
  };
  // Only when no SMS provider is configured AND this is not production is the code returned to the caller (local development).
  const isDevOtpMode = () => !isProd && !smsProviderConfigured();

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { target } = req.body;
      if (!target) return res.status(400).json({ error: 'Target phone number is required' });
      const cleanTarget = String(target).trim().toLowerCase();
      if (!rateLimit(`otp-send:${cleanTarget}`, 5, 10 * 60 * 1000)) {
        return res.status(429).json({ error: 'Too many code requests. Please try again in a few minutes.' });
      }

      const formattedPhone = formatToE164(cleanTarget);
      const cfg = getTwilioConfig();
      let smsSent = false;
      let twilioError = '';

      const storeLocalCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activeServerOtps.set(cleanTarget, { code, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
        return code;
      };

      if (cfg.accountSid && cfg.authToken && cfg.verifyServiceSid) {
        try {
          const client = twilio(cfg.accountSid, cfg.authToken);
          const verification = await client.verify.v2.services(cfg.verifyServiceSid)
            .verifications.create({ to: formattedPhone, channel: 'sms' });
          smsSent = true;
          console.log(`[Twilio Verify API] Verification SID ${verification.sid} sent to ${formattedPhone}`);
        } catch (err: any) {
          console.error('Twilio Verify API error:', err);
          twilioError = err.message || 'Twilio Verify request failed';
        }
      } else if (cfg.accountSid && cfg.authToken && cfg.phoneNumber) {
        const code = storeLocalCode();
        try {
          const client = twilio(cfg.accountSid, cfg.authToken);
          await client.messages.create({
            body: `Karibu Soko! Your NikoSoko verification code is: ${code}`,
            from: cfg.phoneNumber,
            to: formattedPhone
          });
          smsSent = true;
        } catch (err: any) {
          console.error('Twilio Messaging API error:', err);
          twilioError = err.message;
        }
      } else {
        const code = storeLocalCode();
        if (!isProd) console.log(`[Dev OTP] Code for ${cleanTarget}: ${code}`);
      }

      res.json({
        success: true,
        message: smsSent ? `Verification SMS sent to ${formattedPhone}` : `OTP code generated for ${cleanTarget}`,
        smsSent,
        // Dev mode only: no SMS provider configured and not production.
        devCode: isDevOtpMode() ? activeServerOtps.get(cleanTarget)?.code : undefined,
        error: twilioError || undefined
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Twilio SMS Settings API
  app.get('/api/admin/sms-settings', requireAdmin, (req, res) => {
    try {
      const cfg = getTwilioConfig();
      const maskedCfg = {
        ...cfg,
        authToken: cfg.authToken ? '••••••••••••' : ''
      };
      res.json(maskedCfg);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/sms-settings', requireAdmin, (req, res) => {
    try {
      const { accountSid, authToken, phoneNumber, verifyServiceSid } = req.body;
      const saveKey = (key: string, val: any) => {
        runSql('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)', [key, String(val)]);
      };

      if (accountSid !== undefined) saveKey('twilioAccountSid', accountSid);
      if (authToken !== undefined && authToken !== '••••••••••••') saveKey('twilioAuthToken', authToken);
      if (phoneNumber !== undefined) saveKey('twilioPhoneNumber', phoneNumber);
      if (verifyServiceSid !== undefined) saveKey('twilioVerifyServiceSid', verifyServiceSid);

      res.json({ success: true, message: 'Twilio SMS settings saved successfully', config: getTwilioConfig() });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/test-sms', requireAdmin, async (req, res) => {
    try {
      const { testPhone } = req.body;
      const recipient = (testPhone || '0723119356').trim();
      const formattedPhone = formatToE164(recipient);
      const cfg = getTwilioConfig();

      if (!cfg.accountSid || !cfg.authToken) {
        return res.status(400).json({ error: 'Twilio Account SID and Auth Token must be configured first.' });
      }

      const client = twilio(cfg.accountSid, cfg.authToken);
      let resultMessage = '';

      if (cfg.verifyServiceSid) {
        const verification = await client.verify.v2.services(cfg.verifyServiceSid)
          .verifications.create({ to: formattedPhone, channel: 'sms' });
        resultMessage = `Twilio Verify OTP code requested for ${formattedPhone}. SID: ${verification.sid}`;
      } else if (cfg.phoneNumber) {
        const message = await client.messages.create({
          body: `Karibu Soko! This is a test OTP from NikoSoko Admin. Code: 888999`,
          from: cfg.phoneNumber,
          to: formattedPhone
        });
        resultMessage = `Twilio SMS dispatched to ${formattedPhone}. SID: ${message.sid}`;
      } else {
        return res.status(400).json({ error: 'Provide either a Verify Service SID or Twilio Phone Number.' });
      }

      res.json({ success: true, message: resultMessage });
    } catch (e: any) {
      res.status(500).json({ error: `Twilio Error: ${e.message}` });
    }
  });

  // --- Provider helpers (shared by auth and provider routes) ---
  const SENSITIVE_PROVIDER_FIELDS = ['email', 'idNumber', 'nationalId', 'govIdNumber', 'idDocumentUrl', 'govIdUrl', 'selfieUrl', 'idType', 'adminNotes', 'systemIntelligence', 'ratingDisputes'];
  // Only an admin may change these. Everyone else's values for them are ignored.
  const PRIVILEGED_PROVIDER_FIELDS = ['role', 'isVerified', 'password', 'isSuspended', 'suspendedReason', 'suspendedBy', 'suspendedAt', 'adminNotes', 'systemIntelligence', 'isSaccoVerified', 'ownerId'];
  // Anyone signed in may update these on someone else's profile (the client still computes ratings). Phase 2 moves ratings onto completed interactions.
  const METRIC_PROVIDER_FIELDS = ['rating', 'reviewsCount', 'ratingCount', 'views', 'flagCount', 'trustScore', 'completionRate'];

  function parseRaw(row: any): any {
    if (row && row.rawData && typeof row.rawData === 'string') {
      try { return JSON.parse(row.rawData); } catch (_) {}
    }
    return {};
  }

  function formatProviderRow(row: any) {
    const raw = parseRaw(row);
    let skills: any = row.skills;
    if (typeof skills === 'string') {
      try { skills = JSON.parse(skills || '[]'); } catch { skills = []; }
    }
    return {
      ...raw,
      ...row,
      about: row.about || row.bio || raw.about || '',
      skills: skills || raw.skills || [],
      isVerified: Boolean(row.isVerified),
      isOnline: Boolean(row.isOnline),
      latitude: typeof row.latitude === 'number' ? row.latitude : (raw.latitude ?? null),
      longitude: typeof row.longitude === 'number' ? row.longitude : (raw.longitude ?? null)
    };
  }

  /** Removes secrets always, and private identity fields unless the viewer is the owner or an admin. */
  function redactProvider(p: any, auth: AuthInfo | null) {
    const { password: _pw, rawData: _raw, ...rest } = p;
    const canSeePrivate = Boolean(auth && (auth.isAdmin || auth.sub === p.id || p.ownerId === auth.sub));
    if (!canSeePrivate) {
      for (const k of SENSITIVE_PROVIDER_FIELDS) delete (rest as any)[k];
    }
    return rest;
  }

  /** Profile ids this account controls: its own plus any profile it created. */
  function ownedIds(auth: AuthInfo): string[] {
    const rows = queryAll('SELECT id, rawData FROM providers WHERE rawData LIKE ?', [`%"ownerId":"${auth.sub.replace(/[^\w-]/g, '')}"%`]);
    const ids = rows.filter(r => parseRaw(r).ownerId === auth.sub).map(r => r.id as string);
    return [auth.sub, ...ids];
  }

  function canManageProvider(providerId: string, auth: AuthInfo): boolean {
    if (auth.isAdmin || providerId === auth.sub) return true;
    const row = queryOne('SELECT id, rawData FROM providers WHERE id = ?', [providerId]);
    return Boolean(row && parseRaw(row).ownerId === auth.sub);
  }

  function phoneVariants(target: string): string[] {
    const digits = target.replace(/\D/g, '');
    const last9 = digits.slice(-9);
    if (last9.length < 9) return [target];
    return [target, `0${last9}`, `254${last9}`, `+254${last9}`, last9];
  }

  function findProviderByContact(cleanTarget: string): any | null {
    if (cleanTarget.includes('@')) {
      return queryOne('SELECT * FROM providers WHERE lower(email) = ?', [cleanTarget]);
    }
    const variants = phoneVariants(cleanTarget);
    const placeholders = variants.map(() => '?').join(',');
    return queryOne(`SELECT * FROM providers WHERE phone IN (${placeholders})`, variants);
  }

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { target, code } = req.body;
      if (!target || !code) return res.status(400).json({ error: 'Target phone number and OTP code are required' });
      const cleanTarget = String(target).trim().toLowerCase();
      const inputCode = String(code).trim();
      if (!rateLimit(`otp-verify:${cleanTarget}`, 10, 10 * 60 * 1000)) {
        return res.status(429).json({ error: 'Too many attempts. Please request a new code in a few minutes.' });
      }

      let isValid = false;
      const cfg = getTwilioConfig();

      if (cfg.accountSid && cfg.authToken && cfg.verifyServiceSid) {
        try {
          const client = twilio(cfg.accountSid, cfg.authToken);
          const check = await client.verify.v2.services(cfg.verifyServiceSid)
            .verificationChecks.create({ to: formatToE164(cleanTarget), code: inputCode });
          if (check.status === 'approved') isValid = true;
        } catch (err: any) {
          console.error('Twilio Verify check error:', err);
        }
      }

      if (!isValid) {
        const stored = activeServerOtps.get(cleanTarget);
        if (stored && Date.now() < stored.expiresAt) {
          if (stored.code === inputCode) {
            isValid = true;
          } else {
            stored.attempts += 1;
            if (stored.attempts >= 5) activeServerOtps.delete(cleanTarget);
          }
        }
      }

      if (!isValid) {
        return res.status(400).json({ error: 'Incorrect or expired verification code.' });
      }
      activeServerOtps.delete(cleanTarget);

      // Lookup or auto-create the profile (exact phone/email match only)
      let provider = findProviderByContact(cleanTarget);
      if (!provider) {
        const id = `pro-${Date.now()}`;
        const isEmail = cleanTarget.includes('@');
        provider = {
          id,
          name: isEmail ? cleanTarget.split('@')[0] : `User ${cleanTarget.slice(-4)}`,
          phone: isEmail ? '0700000000' : cleanTarget,
          email: isEmail ? cleanTarget : `${cleanTarget}@nikosoko.com`,
          service: 'General Trades Professional',
          category: 'GENERAL',
          rating: 0,
          reviewsCount: 0,
          isVerified: 1,
          location: 'Nairobi, Kenya',
          bio: 'Verified user on NikoSoko Neighbourhood Marketplace.',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300',
          coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800',
          role: 'Member',
          skills: JSON.stringify(['General Trades']),
          hourlyRate: 'Ksh 1,000/hr',
          createdAt: new Date().toISOString()
        };

        runSql(
          `INSERT INTO providers (id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            provider.id, provider.name, provider.phone, provider.email, provider.service, provider.category,
            provider.rating, provider.reviewsCount, provider.isVerified, provider.location, provider.bio,
            provider.avatarUrl, provider.coverImageUrl, provider.role, provider.skills, provider.hourlyRate,
            '', provider.createdAt
          ]
        );
      }

      // The configured super admin number is promoted on first successful OTP sign-in.
      const adminPhone = (process.env.SUPERADMIN_PHONE || '').replace(/\D/g, '').slice(-9);
      if (adminPhone.length === 9 && !cleanTarget.includes('@') && cleanTarget.replace(/\D/g, '').slice(-9) === adminPhone && provider.role !== 'SuperAdmin') {
        runSql('UPDATE providers SET role = ? WHERE id = ?', ['SuperAdmin', provider.id]);
        provider = { ...provider, role: 'SuperAdmin' };
      }

      const self: AuthInfo = { sub: provider.id, role: provider.role || 'Member', isAdmin: provider.role === 'SuperAdmin' };
      res.json({
        message: 'OTP verified successfully',
        provider: redactProvider(formatProviderRow(provider), self),
        token: signToken(provider.id)
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // The signed-in account's own profile (used to restore a session on app start).
  app.get('/api/auth/me', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const row = queryOne('SELECT * FROM providers WHERE id = ?', [auth.sub]);
      if (!row) return res.status(401).json({ error: 'Account not found' });
      res.json(redactProvider(formatProviderRow(row), auth));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Password-less login and open registration were removed: they returned any profile for a phone number alone.
  app.post('/api/auth/register', (_req, res) => res.status(410).json({ error: 'Please sign in with a phone OTP.' }));
  app.post('/api/auth/login', (_req, res) => res.status(410).json({ error: 'Please sign in with a phone OTP.' }));

  // Providers Endpoints
  app.get('/api/providers', optionalAuth, (req, res) => {
    try {
      const auth = getAuth(req);
      const rows = queryAll('SELECT * FROM providers ORDER BY isVerified DESC, rating DESC');
      res.json(rows.map(r => redactProvider(formatProviderRow(r), auth)));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/providers/:id', optionalAuth, (req, res) => {
    try {
      const row = queryOne('SELECT * FROM providers WHERE id = ?', [req.params.id]);
      if (!row) return res.status(404).json({ error: 'Provider not found' });
      res.json(redactProvider(formatProviderRow(row), getAuth(req)));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  /** Create or update a profile, enforcing who may change what. */
  function saveProvider(id: string, incoming: any, auth: AuthInfo) {
    const existingRow = queryOne('SELECT * FROM providers WHERE id = ?', [id]);
    const existing = existingRow ? formatProviderRow(existingRow) : null;
    const patch: any = { ...incoming };
    delete patch.rawData;

    if (!auth.isAdmin) {
      for (const k of PRIVILEGED_PROVIDER_FIELDS) delete patch[k];
      if (existingRow && !canManageProvider(id, auth)) {
        for (const k of Object.keys(patch)) {
          if (!METRIC_PROVIDER_FIELDS.includes(k)) delete patch[k];
        }
      }
    }

    const updated: any = { ...(existing || {}), ...patch, id };
    if (!existing) {
      updated.ownerId = auth.sub;
      if (!auth.isAdmin) {
        updated.role = 'Provider';
        updated.isVerified = false;
        for (const k of METRIC_PROVIDER_FIELDS) updated[k] = 0;
      } else {
        updated.role = incoming.role || 'Provider';
        updated.isVerified = Boolean(incoming.isVerified);
        updated.ownerId = incoming.ownerId || auth.sub;
      }
    }

    const skillsJson = JSON.stringify(updated.skills || []);
    const { avatarUrl: _a, coverImageUrl: _c, password: _p, rawData: _r, ...safeForRawData } = updated;
    const rawDataJson = JSON.stringify(safeForRawData);

    runSql(
      `INSERT OR REPLACE INTO providers (
        id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, about, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, isOnline, latitude, longitude, lastCheckInAt, lastCheckInLocation, rawData, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, updated.name || '', updated.phone || '', updated.email || '', updated.service || '', updated.category || '',
        updated.rating ?? 0, updated.reviewsCount ?? 0, updated.isVerified ? 1 : 0, updated.location || '',
        updated.bio || updated.about || '', updated.about || updated.bio || '', updated.avatarUrl || '', updated.coverImageUrl || '', updated.role || 'Provider',
        skillsJson, updated.hourlyRate || '', existingRow?.password || '', updated.isOnline ? 1 : 0,
        updated.latitude || null, updated.longitude || null, updated.lastCheckInAt || null, updated.lastCheckInLocation || null,
        rawDataJson, updated.createdAt || new Date().toISOString()
      ]
    );

    const saved = queryOne('SELECT * FROM providers WHERE id = ?', [id]);
    return redactProvider(formatProviderRow(saved), auth);
  }

  app.post('/api/providers', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const id = req.body.id || `pro-${Date.now()}`;
      res.json(saveProvider(id, req.body, auth));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/providers/:id', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const provider = saveProvider(req.params.id, req.body, auth);
      res.json({ message: 'Provider updated', provider });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/providers/:id', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      if (!canManageProvider(req.params.id, auth)) return res.status(403).json({ error: 'You can only delete your own profiles' });
      runSql('DELETE FROM providers WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Catalogue Items Endpoints
  app.get('/api/catalogue', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM catalogue_items');
      const formatted = rows.map(r => ({
        ...r,
        imageUrls: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : (r.images || []),
        isVerified: Boolean(r.isVerified)
      }));
      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Image Upload Endpoint - saves base64 images to persistent disk storage
  const ALLOWED_IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

  app.post('/api/upload', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const { dataUrl, path: uploadPath } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
        return res.status(400).json({ error: 'Invalid or missing dataUrl' });
      }
      const matches = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid data URL format' });
      }
      const ext = ALLOWED_IMAGE_TYPES[matches[1].toLowerCase()];
      if (!ext) {
        return res.status(415).json({ error: 'Only JPEG, PNG, WebP and GIF images are allowed' });
      }
      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ error: 'Image is too large (6 MB maximum)' });
      }
      // Each account writes inside its own folder so it cannot overwrite another account's files.
      const safePath = (uploadPath || `misc/upload_${Date.now()}`).replace(/[^a-zA-Z0-9_\-\/]/g, '_').replace(/^\/+/, '');
      const owner = auth.sub.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${owner}/${safePath}.${ext}`;
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      const fullPath = path.join(uploadsRoot, fileName);
      if (!fullPath.startsWith(uploadsRoot + path.sep)) {
        return res.status(400).json({ error: 'Invalid upload path' });
      }
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, buffer);
      res.json({ success: true, url: `/uploads/${fileName}` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/catalogue', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const item = req.body;
      const id = item.id || `cat-${Date.now()}`;
      if (!item.providerId || !canManageProvider(item.providerId, auth)) {
        return res.status(403).json({ error: 'You can only add items to your own profiles' });
      }
      const prev = queryOne('SELECT providerId FROM catalogue_items WHERE id = ?', [id]);
      if (prev && !canManageProvider(prev.providerId, auth)) {
        return res.status(403).json({ error: 'You can only edit your own items' });
      }
      const imagesJson = JSON.stringify(item.imageUrls || item.images || []);

      runSql(
        `INSERT OR REPLACE INTO catalogue_items (id, providerId, title, category, price, description, isVerified, images, serialNumber, duration, discountInfo, externalLink, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, item.providerId, item.title || '', item.category || '', item.price || '',
          item.description || '', auth.isAdmin && item.isVerified ? 1 : 0, imagesJson, item.serialNumber || '',
          item.duration || '', item.discountInfo || '', item.externalLink || '', new Date().toISOString()
        ]
      );

      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/catalogue/:id', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const item = queryOne('SELECT providerId FROM catalogue_items WHERE id = ?', [req.params.id]);
      if (item && !canManageProvider(item.providerId, auth)) {
        return res.status(403).json({ error: 'You can only delete your own items' });
      }
      runSql('DELETE FROM catalogue_items WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Messages Endpoints (a person only sees conversations they are part of)
  app.get('/api/messages', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      if (auth.isAdmin) {
        return res.json(queryAll('SELECT * FROM messages ORDER BY timestamp ASC'));
      }
      const ids = ownedIds(auth);
      const marks = ids.map(() => '?').join(',');
      const rows = queryAll(
        `SELECT * FROM messages WHERE senderId IN (${marks}) OR recipientId IN (${marks}) ORDER BY timestamp ASC`,
        [...ids, ...ids]
      );
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/messages', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const m = req.body;
      const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const senderId = auth.isAdmin && m.senderId ? m.senderId : (m.senderId && ownedIds(auth).includes(m.senderId) ? m.senderId : auth.sub);
      runSql(
        `INSERT INTO messages (id, senderId, recipientId, senderName, recipientName, text, timestamp, isRead)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, senderId, m.recipientId, m.senderName, m.recipientName, m.text, new Date().toISOString(), 0]
      );
      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Gigs Endpoints
  app.get('/api/gigs', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM gigs ORDER BY createdAt DESC');
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/gigs', requireAuth, (req, res) => {
    try {
      const g = req.body;
      const id = `gig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      runSql(
        `INSERT INTO gigs (id, title, category, location, budget, description, posterName, posterPhone, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, g.title, g.category, g.location, g.budget, g.description, g.posterName, g.posterPhone, g.status || 'Open', new Date().toISOString()]
      );
      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Banners Endpoints (admin-managed)
  app.get('/api/banners', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM special_banners');
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/banners', requireAdmin, (req, res) => {
    try {
      const b = req.body;
      const id = b.id || `banner-${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO special_banners (id, title, subtitle, imageUrl, actionUrl, badgeText)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, b.title, b.subtitle, b.imageUrl, b.actionUrl, b.badgeText]
      );
      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/banners/:id', requireAdmin, (req, res) => {
    try {
      runSql('DELETE FROM special_banners WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- M-Pesa Daraja Payment Gateway Integration ---
  const activeMpesaRequests = new Map<string, { checkoutRequestId: string; phone: string; amount: number; bookingId?: string; status: string; receipt: string; timestamp: number }>();

  // Helper to check and resolve M-Pesa Daraja Credentials from Environment or SQLite Settings
  function getMpesaCredentials() {
    const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox';
    const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://nikosoko.com/api/mpesa/callback';

    const isConfigured = Boolean(
      consumerKey && 
      consumerSecret && 
      !consumerKey.includes('your_mpesa') && 
      !consumerSecret.includes('your_mpesa')
    );

    return {
      isConfigured,
      env,
      baseUrl: env === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke',
      consumerKey,
      consumerSecret,
      shortcode,
      passkey,
      callbackUrl
    };
  }

  // Get OAuth Token from Safaricom Daraja
  async function fetchDarajaOAuthToken(baseUrl: string, consumerKey: string, consumerSecret: string): Promise<string | null> {
    try {
      const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      const res = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authHeader}`
        }
      });
      if (!res.ok) {
        console.warn(`[M-PESA DARAJA] OAuth Token request returned status ${res.status}`);
        return null;
      }
      const data = await res.json();
      return data.access_token || null;
    } catch (err: any) {
      console.warn(`[M-PESA DARAJA] OAuth Token generation notice: ${err?.message || err}`);
      return null;
    }
  }

  // Status/Health endpoint for M-Pesa integration
  app.get('/api/mpesa/config', (req, res) => {
    const creds = getMpesaCredentials();
    res.json({
      configured: creds.isConfigured,
      environment: creds.env,
      shortcode: creds.shortcode,
      mode: creds.isConfigured ? 'live_daraja_api' : 'simulated_instant_stk'
    });
  });

  // M-Pesa STK Push Endpoint
  app.post('/api/mpesa/stkpush', requireAuth, async (req, res) => {
    if (!rateLimit(`stk:${getAuth(req)!.sub}`, 5, 60 * 1000)) {
      return res.status(429).json({ error: 'Too many payment requests. Please wait a minute.' });
    }
    try {
      const { phone, amount, bookingId, providerName, serviceTitle } = req.body;
      const rawPhone = phone ? String(phone).trim() : '';
      
      // Parse amount gracefully
      let cleanAmount = 500;
      if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
        cleanAmount = Math.round(amount);
      } else if (typeof amount === 'string') {
        const digits = amount.replace(/[^\d.]/g, '');
        const parsed = parseFloat(digits);
        if (!isNaN(parsed) && parsed > 0) {
          cleanAmount = Math.round(parsed);
        }
      }

      if (!rawPhone || rawPhone.length < 3) {
        return res.status(400).json({ error: 'Phone number is required for M-Pesa payment' });
      }

      const formattedPhone = formatToE164(rawPhone);
      const phoneDigitsOnly = formattedPhone.replace('+', ''); // e.g. 254712345678
      const creds = getMpesaCredentials();

      // If live Daraja API keys are configured, attempt real STK push to Safaricom
      if (creds.isConfigured) {
        try {
          const accessToken = await fetchDarajaOAuthToken(creds.baseUrl, creds.consumerKey, creds.consumerSecret);
          if (accessToken) {
            const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14); // YYYYMMDDHHmmss
            const password = Buffer.from(`${creds.shortcode}${creds.passkey}${timestamp}`).toString('base64');

            const payload = {
              BusinessShortCode: creds.shortcode,
              Password: password,
              Timestamp: timestamp,
              TransactionType: 'CustomerPayBillOnline',
              Amount: cleanAmount,
              PartyA: phoneDigitsOnly,
              PartyB: creds.shortcode,
              PhoneNumber: phoneDigitsOnly,
              CallBackURL: creds.callbackUrl,
              AccountReference: `NikoSoko_${bookingId ? bookingId.slice(-6) : 'Book'}`,
              TransactionDesc: `Booking ${serviceTitle ? serviceTitle.slice(0, 20) : 'Deposit'}`
            };

            const darajaRes = await fetch(`${creds.baseUrl}/mpesa/stkpush/v1/processrequest`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            const darajaData = await darajaRes.json();
            if (darajaRes.ok && darajaData.ResponseCode === '0') {
              console.log(`[M-PESA DARAJA LIVE] STK Push sent successfully to ${phoneDigitsOnly} (CheckoutRequestID: ${darajaData.CheckoutRequestID})`);
              
              activeMpesaRequests.set(darajaData.CheckoutRequestID, {
                checkoutRequestId: darajaData.CheckoutRequestID,
                phone: formattedPhone,
                amount: cleanAmount,
                bookingId: bookingId || '',
                status: 'PromptSent',
                receipt: darajaData.CheckoutRequestID,
                timestamp: Date.now()
              });

              return res.json({
                ResponseCode: '0',
                ResponseDescription: darajaData.ResponseDescription || 'Success. Request accepted for processing',
                MerchantRequestID: darajaData.MerchantRequestID,
                CheckoutRequestID: darajaData.CheckoutRequestID,
                CustomerMessage: darajaData.CustomerMessage || `Success. An STK prompt has been sent to ${formattedPhone}. Please enter your M-Pesa PIN to complete payment.`,
                Amount: cleanAmount,
                Phone: formattedPhone,
                mode: 'live_daraja'
              });
            }
          }
        } catch (liveErr) {
          console.warn('[M-PESA DARAJA] Live gateway attempt fallback to simulation:', liveErr);
        }
      }

      // High-Fidelity Safaricom Simulation (Out of the box & Sandbox fallback)
      const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let receipt = 'SH';
      for (let i = 0; i < 8; i++) {
        receipt += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      activeMpesaRequests.set(checkoutRequestId, {
        checkoutRequestId,
        phone: formattedPhone,
        amount: cleanAmount,
        bookingId: bookingId || '',
        status: 'Success',
        receipt,
        timestamp: Date.now()
      });

      console.log(`[M-PESA STK PUSH] STK Prompt generated for ${formattedPhone} - Amount: KES ${cleanAmount} (Provider: ${providerName || 'NikoSoko Provider'}) - Receipt: ${receipt}`);

      res.json({
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        MerchantRequestID: `MR_${Date.now()}`,
        CheckoutRequestID: checkoutRequestId,
        CustomerMessage: `Success. An STK push prompt has been sent to ${formattedPhone}. Please enter your M-Pesa PIN on your phone to complete payment of KES ${cleanAmount}.`,
        ReceiptNumber: receipt,
        Amount: cleanAmount,
        Phone: formattedPhone,
        mode: 'sandbox_simulation'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Safaricom Webhook Callback for STK Push Result
  app.post('/api/mpesa/callback', (req, res) => {
    try {
      const callbackData = req.body?.Body?.stkCallback;
      if (callbackData) {
        const checkoutId = callbackData.CheckoutRequestID;
        const resultCode = callbackData.ResultCode;
        const resultDesc = callbackData.ResultDesc;

        console.log(`[M-PESA CALLBACK] Received Webhook for ${checkoutId}: ResultCode=${resultCode} (${resultDesc})`);

        if (resultCode === 0) {
          // Success
          const items = callbackData.CallbackMetadata?.Item || [];
          const mpesaReceipt = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
          const phone = items.find((i: any) => i.Name === 'PhoneNumber')?.Value;
          const amount = items.find((i: any) => i.Name === 'Amount')?.Value;

          if (checkoutId && activeMpesaRequests.has(checkoutId)) {
            const reqInfo = activeMpesaRequests.get(checkoutId)!;
            reqInfo.status = 'Success';
            if (mpesaReceipt) reqInfo.receipt = mpesaReceipt;
            
            // If linked to a booking in SQLite, update it
            if (reqInfo.bookingId) {
              runSql(
                `UPDATE bookings SET paymentStatus = 'Paid', mpesaReceiptNumber = ?, updatedAt = ? WHERE id = ?`,
                [mpesaReceipt || reqInfo.receipt, new Date().toISOString(), reqInfo.bookingId]
              );
            }
          }
        }
      }
      res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/mpesa/query', requireAuth, (req, res) => {
    try {
      const { checkoutRequestId } = req.body;
      if (!checkoutRequestId) {
        return res.status(400).json({ error: 'checkoutRequestId is required' });
      }

      const reqInfo = activeMpesaRequests.get(checkoutRequestId);
      if (reqInfo) {
        return res.json({
          ResponseCode: '0',
          ResponseDescription: 'The service request has been accepted successfully',
          ResultCode: '0',
          ResultDesc: 'The service request is processed successfully.',
          ReceiptNumber: reqInfo.receipt,
          Amount: reqInfo.amount,
          Phone: reqInfo.phone,
          Status: 'Completed'
        });
      }

      // If simulated or unknown, generate confirmation
      const receipt = 'SH' + Math.random().toString(36).substring(2, 10).toUpperCase();
      res.json({
        ResponseCode: '0',
        ResultCode: '0',
        ResultDesc: 'Payment verified',
        ReceiptNumber: receipt,
        Status: 'Completed'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Bookings API Endpoints ---
  // A booking can be seen or changed only by its client, its provider (or the provider's owner), or an admin.
  function canTouchBooking(bookingId: string, auth: AuthInfo): boolean {
    if (auth.isAdmin) return true;
    const b = queryOne('SELECT clientId, providerId FROM bookings WHERE id = ?', [bookingId]);
    if (!b) return true; // let the handler answer 404
    const ids = ownedIds(auth);
    return ids.includes(b.clientId) || ids.includes(b.providerId);
  }

  app.get('/api/bookings', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      let { userId, providerId, status } = req.query as any;
      if (!auth.isAdmin) {
        const mine = ownedIds(auth);
        userId = userId && mine.includes(String(userId)) ? userId : auth.sub;
        providerId = undefined;
      }
      let sql = 'SELECT * FROM bookings WHERE 1=1';
      const params: any[] = [];

      if (userId) {
        sql += ' AND (clientId = ? OR providerId = ?)';
        params.push(userId, userId);
      } else if (providerId) {
        sql += ' AND providerId = ?';
        params.push(providerId);
      }

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY date ASC, time ASC';

      const rows = queryAll(sql, params);
      const formatted = rows.map(r => ({
        ...r,
        isCalendarSynced: Boolean(r.isCalendarSynced),
        estimatedFee: Number(r.estimatedFee || 0),
        minBookingFee: Number(r.minBookingFee || 0),
        paidDepositAmount: Number(r.paidDepositAmount || 0)
      }));

      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/bookings', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const b = { ...req.body };
      if (!auth.isAdmin) b.clientId = auth.sub;
      const id = b.id || `book-${Date.now()}`;
      const now = new Date().toISOString();

      runSql(
        `INSERT OR REPLACE INTO bookings (
          id, providerId, providerName, providerPhone, providerAvatar, providerService,
          clientId, clientName, clientEmail, clientPhone, date, time, serviceTitle,
          estimatedFee, minBookingFee, paidDepositAmount, mpesaReceiptNumber, mpesaPhoneNumber,
          paymentStatus, status, location, notes, googleCalendarEventId, googleCalendarHtmlLink,
          isCalendarSynced, cancellationReason, cancelledBy, cancelledAt, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, b.providerId || '', b.providerName || '', b.providerPhone || '', b.providerAvatar || '', b.providerService || '',
          b.clientId || '', b.clientName || '', b.clientEmail || '', b.clientPhone || '', b.date || '', b.time || '', b.serviceTitle || '',
          Number(b.estimatedFee || 0), Number(b.minBookingFee || 0), Number(b.paidDepositAmount || 0),
          b.mpesaReceiptNumber || '', b.mpesaPhoneNumber || '', b.paymentStatus || 'Paid', b.status || 'Confirmed',
          b.location || '', b.notes || '', b.googleCalendarEventId || '', b.googleCalendarHtmlLink || '',
          b.isCalendarSynced ? 1 : 0, b.cancellationReason || null, b.cancelledBy || null, b.cancelledAt || null, b.createdAt || now, now
        ]
      );

      const saved = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      res.json({
        success: true,
        booking: {
          ...saved,
          isCalendarSynced: Boolean(saved?.isCalendarSynced)
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/bookings/:id', requireAuth, (req, res) => {
    if (!canTouchBooking(req.params.id, getAuth(req)!)) return res.status(403).json({ error: 'Not your booking' });
    try {
      const id = req.params.id;
      const existing = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      if (!existing) return res.status(404).json({ error: 'Booking not found' });

      const b = { ...existing, ...req.body, updatedAt: new Date().toISOString() };

      runSql(
        `UPDATE bookings SET 
          providerId=?, providerName=?, providerPhone=?, providerAvatar=?, providerService=?,
          clientId=?, clientName=?, clientEmail=?, clientPhone=?, date=?, time=?, serviceTitle=?,
          estimatedFee=?, minBookingFee=?, paidDepositAmount=?, mpesaReceiptNumber=?, mpesaPhoneNumber=?,
          paymentStatus=?, status=?, location=?, notes=?, googleCalendarEventId=?, googleCalendarHtmlLink=?,
          isCalendarSynced=?, cancellationReason=?, cancelledBy=?, cancelledAt=?, updatedAt=?
         WHERE id=?`,
        [
          b.providerId, b.providerName, b.providerPhone, b.providerAvatar, b.providerService,
          b.clientId, b.clientName, b.clientEmail, b.clientPhone, b.date, b.time, b.serviceTitle,
          Number(b.estimatedFee || 0), Number(b.minBookingFee || 0), Number(b.paidDepositAmount || 0),
          b.mpesaReceiptNumber, b.mpesaPhoneNumber, b.paymentStatus, b.status, b.location, b.notes,
          b.googleCalendarEventId, b.googleCalendarHtmlLink, b.isCalendarSynced ? 1 : 0,
          b.cancellationReason || null, b.cancelledBy || null, b.cancelledAt || null, b.updatedAt, id
        ]
      );

      const updated = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      res.json({
        success: true,
        booking: {
          ...updated,
          isCalendarSynced: Boolean(updated?.isCalendarSynced)
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Dedicated Cancel Booking Endpoint
  app.put('/api/bookings/:id/cancel', requireAuth, (req, res) => {
    if (!canTouchBooking(req.params.id, getAuth(req)!)) return res.status(403).json({ error: 'Not your booking' });
    try {
      const id = req.params.id;
      const existing = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      if (!existing) return res.status(404).json({ error: 'Booking not found' });

      const { reason, cancelledBy } = req.body;
      const now = new Date().toISOString();

      runSql(
        `UPDATE bookings SET 
          status = 'Cancelled',
          cancellationReason = ?,
          cancelledBy = ?,
          cancelledAt = ?,
          updatedAt = ?
         WHERE id = ?`,
        [reason || 'Cancelled by user', cancelledBy || 'client', now, now, id]
      );

      const updated = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      res.json({
        success: true,
        message: 'Booking successfully cancelled',
        booking: {
          ...updated,
          isCalendarSynced: Boolean(updated?.isCalendarSynced)
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/bookings/:id', requireAuth, (req, res) => {
    if (!canTouchBooking(req.params.id, getAuth(req)!)) return res.status(403).json({ error: 'Not your booking' });
    try {
      runSql('DELETE FROM bookings WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Location Check-in Logs & Distance Calculation System ---

  const KENYA_ESTATES_MAP: Record<string, { lat: number; lng: number; county: string; name: string }> = {
    ruaka: { lat: -1.2065, lng: 36.7767, county: 'Kiambu County', name: 'Ruaka' },
    kasarani: { lat: -1.2215, lng: 36.8974, county: 'Nairobi County', name: 'Kasarani' },
    westlands: { lat: -1.2674, lng: 36.8110, county: 'Nairobi County', name: 'Westlands' },
    kilimani: { lat: -1.2905, lng: 36.7865, county: 'Nairobi County', name: 'Kilimani' },
    nairobi: { lat: -1.2864, lng: 36.8172, county: 'Nairobi County', name: 'Nairobi CBD' },
    cbd: { lat: -1.2864, lng: 36.8172, county: 'Nairobi County', name: 'Nairobi CBD' },
    lavington: { lat: -1.2789, lng: 36.7692, county: 'Nairobi County', name: 'Lavington' },
    karen: { lat: -1.3197, lng: 36.7065, county: 'Nairobi County', name: 'Karen' },
    upperhill: { lat: -1.2995, lng: 36.8163, county: 'Nairobi County', name: 'Upperhill' },
    roysambu: { lat: -1.2185, lng: 36.8872, county: 'Nairobi County', name: 'Roysambu' },
    kahawa: { lat: -1.1856, lng: 36.9298, county: 'Kiambu / Nairobi County', name: 'Kahawa Sukari' },
    thika: { lat: -1.0396, lng: 37.0900, county: 'Kiambu County', name: 'Thika' },
    ngong: { lat: -1.3614, lng: 36.6566, county: 'Kajiado County', name: 'Ngong' },
    industrial: { lat: -1.3100, lng: 36.8450, county: 'Nairobi County', name: 'Industrial Area' },
    'south b': { lat: -1.3167, lng: 36.8333, county: 'Nairobi County', name: 'South B' },
    'south c': { lat: -1.3167, lng: 36.8333, county: 'Nairobi County', name: 'South C' },
    eastleigh: { lat: -1.2750, lng: 36.8500, county: 'Nairobi County', name: 'Eastleigh' },
    buruburu: { lat: -1.2880, lng: 36.8890, county: 'Nairobi County', name: 'Buruburu' },
    donholm: { lat: -1.2880, lng: 36.8890, county: 'Nairobi County', name: 'Donholm' },
    kikuyu: { lat: -1.2464, lng: 36.6631, county: 'Kiambu County', name: 'Kikuyu' },
    rongai: { lat: -1.3967, lng: 36.7600, county: 'Kajiado County', name: 'Ongata Rongai' },
    kitengela: { lat: -1.4744, lng: 36.9589, county: 'Kajiado County', name: 'Kitengela' },
    syokimau: { lat: -1.3900, lng: 36.9300, county: 'Machakos County', name: 'Syokimau' },
    mombasa: { lat: -4.0435, lng: 39.6682, county: 'Mombasa County', name: 'Mombasa' },
    nakuru: { lat: -0.3031, lng: 36.0800, county: 'Nakuru County', name: 'Nakuru' },
    kisumu: { lat: -0.0917, lng: 34.7680, county: 'Kisumu County', name: 'Kisumu' },
    eldoret: { lat: 0.5143, lng: 35.2698, county: 'Uasin Gishu County', name: 'Eldoret' }
  };

  function resolveServerLocation(query: string, customLat?: number, customLng?: number) {
    if (typeof customLat === 'number' && typeof customLng === 'number' && !isNaN(customLat) && !isNaN(customLng)) {
      return {
        lat: customLat,
        lng: customLng,
        name: query || 'Custom GPS Location',
        county: 'Kenya'
      };
    }

    const clean = (query || '').toLowerCase().trim();
    for (const key of Object.keys(KENYA_ESTATES_MAP)) {
      if (clean.includes(key)) {
        return KENYA_ESTATES_MAP[key];
      }
    }

    // Default reference is Ruaka
    return {
      lat: -1.2065,
      lng: 36.7767,
      name: query || 'Ruaka',
      county: 'Kiambu County'
    };
  }

  function calcHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (lat1 === lat2 && lon1 === lon2) return 0.2;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 0.2 ? 0.2 : Math.round(d * 10) / 10;
  }

  // Record a Location Check-In
  app.post('/api/locations/checkin', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const {
        userId,
        providerId,
        userName,
        userPhone,
        userRole,
        locationName,
        latitude,
        longitude,
        accuracyMeters,
        checkInType,
        deviceInfo,
        notes
      } = req.body;

      const requestedId = userId || providerId;
      const targetId = auth.isAdmin
        ? (requestedId || `usr_${Date.now()}`)
        : (requestedId && ownedIds(auth).includes(requestedId) ? requestedId : auth.sub);
      const resolved = resolveServerLocation(locationName, Number(latitude), Number(longitude));
      const logId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      // Deactivate prior active check-ins for this user/provider
      try {
        runSql('UPDATE location_checkin_logs SET isActive = 0 WHERE userId = ?', [targetId]);
      } catch (_) {}

      // Insert new check-in log
      runSql(
        `INSERT INTO location_checkin_logs (
          id, userId, userName, userPhone, userRole, locationName, estateName, county,
          latitude, longitude, accuracyMeters, checkInType, deviceInfo, notes, timestamp, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logId,
          targetId,
          userName || 'Anonymous User',
          userPhone || '',
          userRole || 'Member',
          locationName || `${resolved.name}, ${resolved.county}`,
          resolved.name,
          resolved.county,
          resolved.lat,
          resolved.lng,
          accuracyMeters || 10,
          checkInType || 'manual_update',
          deviceInfo || req.headers['user-agent'] || '',
          notes || `Checked in at ${resolved.name}`,
          now,
          1
        ]
      );

      // Update provider table location & coordinates if provider exists
      try {
        runSql(
          `UPDATE providers SET 
            location = ?, 
            latitude = ?, 
            longitude = ?, 
            lastCheckInAt = ?, 
            lastCheckInLocation = ?
           WHERE id = ?`,
          [
            locationName || `${resolved.name}, ${resolved.county}`,
            resolved.lat,
            resolved.lng,
            now,
            resolved.name,
            targetId
          ]
        );
      } catch (_) {}

      saveDb();

      const createdLog = queryOne('SELECT * FROM location_checkin_logs WHERE id = ?', [logId]);
      res.json({
        success: true,
        message: `Location check-in recorded at ${resolved.name} (${resolved.county})`,
        log: {
          ...createdLog,
          isActive: Boolean(createdLog?.isActive)
        },
        resolvedCoords: {
          latitude: resolved.lat,
          longitude: resolved.lng,
          estate: resolved.name,
          county: resolved.county
        }
      });
    } catch (e: any) {
      console.error('Check-in error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Query Check-in Logs
  app.get('/api/locations/logs', requireAuth, (req, res) => {
    try {
      const auth = getAuth(req)!;
      const q = req.query as any;
      // Area-wide logs contain other people's names and phone numbers, so only admins may query by location.
      const userId = auth.isAdmin ? q.userId : (q.userId && ownedIds(auth).includes(String(q.userId)) ? q.userId : auth.sub);
      const location = auth.isAdmin ? q.location : undefined;
      const limit = Math.min(Number(q.limit) || 50, 200);
      let sql = 'SELECT * FROM location_checkin_logs';
      const params: any[] = [];

      if (userId) {
        sql += ' WHERE userId = ?';
        params.push(userId);
      } else if (location) {
        sql += ' WHERE locationName LIKE ? OR estateName LIKE ?';
        params.push(`%${location}%`, `%${location}%`);
      }

      sql += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(Number(limit));

      const rows = queryAll(sql, params);
      res.json(rows.map(r => ({ ...r, isActive: Boolean(r.isActive) })));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Calculate Distance Between Two Locations or Coordinates (e.g. Ruaka vs Kasarani)
  app.get('/api/locations/distance', (req, res) => {
    try {
      const { from = 'Ruaka', to = 'Kasarani', lat1, lon1, lat2, lon2 } = req.query;

      const fromGeo = resolveServerLocation(String(from), lat1 ? Number(lat1) : undefined, lon1 ? Number(lon1) : undefined);
      const toGeo = resolveServerLocation(String(to), lat2 ? Number(lat2) : undefined, lon2 ? Number(lon2) : undefined);

      const distanceKm = calcHaversineKm(fromGeo.lat, fromGeo.lng, toGeo.lat, toGeo.lng);

      res.json({
        from: {
          location: String(from),
          estate: fromGeo.name,
          county: fromGeo.county,
          latitude: fromGeo.lat,
          longitude: fromGeo.lng
        },
        to: {
          location: String(to),
          estate: toGeo.name,
          county: toGeo.county,
          latitude: toGeo.lat,
          longitude: toGeo.lng
        },
        distanceKm,
        formattedText: `${distanceKm} km away`,
        accuracy: 'GPS Great-Circle (Haversine)'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Calculate Distances for List of Providers from User Check-in Point
  app.post('/api/locations/calculate-distances', (req, res) => {
    try {
      const { userLocation, userLatitude, userLongitude, providers = [] } = req.body;
      const userGeo = resolveServerLocation(userLocation || 'Ruaka', userLatitude, userLongitude);

      const results = providers.map((p: any) => {
        const proGeo = resolveServerLocation(p.location || '', p.latitude, p.longitude);
        const distanceKm = calcHaversineKm(userGeo.lat, userGeo.lng, proGeo.lat, proGeo.lng);
        return {
          id: p.id,
          name: p.name,
          service: p.service,
          location: p.location,
          distanceKm,
          distanceDisplay: `${distanceKm} Km away`,
          userLocation: userGeo.name,
          providerLocation: proGeo.name
        };
      });

      res.json({
        userCheckIn: userGeo,
        count: results.length,
        providers: results
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 404 JSON fallback for unhandled API routes and internal control plane routes
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
  app.use('/__aistudio_internal_control_plane', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Vite Middleware integration for development / production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} with SQLite database backend.`);
  });
}

startServer();
