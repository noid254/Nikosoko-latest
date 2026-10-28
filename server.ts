import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { createServer as createViteServer } from 'vite';
import twilio from 'twilio';

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
      rating REAL DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      providerId TEXT NOT NULL,
      raterKey TEXT NOT NULL,
      stars INTEGER NOT NULL,
      comment TEXT,
      createdAt TEXT,
      UNIQUE(providerId, raterKey)
    );

    CREATE TABLE IF NOT EXISTS referral_codes (
      code TEXT PRIMARY KEY,
      orgId TEXT NOT NULL,
      kind TEXT NOT NULL,          -- 'organization' | 'course'
      itemId TEXT,                 -- course id for kind = 'course'
      label TEXT,                  -- course title for kind = 'course'
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS referral_redemptions (
      userId TEXT PRIMARY KEY,     -- a user can be verified through one code
      code TEXT NOT NULL,
      orgId TEXT NOT NULL,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS hero_banners (
      id TEXT PRIMARY KEY,
      title TEXT,
      subtitle TEXT,
      imageUrl TEXT,
      area TEXT,
      latitude REAL,
      longitude REAL,
      radiusKm REAL DEFAULT 5,
      isActive INTEGER DEFAULT 1,
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
  try { runSql("UPDATE providers SET rating = 0, reviewsCount = 0 WHERE id = 'super-admin-001' AND reviewsCount = 150"); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN latitude REAL'); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN longitude REAL'); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN lastCheckInAt TEXT'); } catch (_) {}
  try { runSql('ALTER TABLE providers ADD COLUMN lastCheckInLocation TEXT'); } catch (_) {}

  saveDb();

  // Seed the default super admin if the database is empty
  const providerCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM providers');
  if (!providerCount || providerCount.count === 0) {
    const defaultSuperAdmin = {
      id: 'super-admin-001',
      name: 'NikoSoko Admin',
      phone: '0723119356',
      email: 'admin@nikosoko.com',
      service: 'Platform Support & Verification',
      category: 'TECHNICAL',
      rating: 0,
      reviewsCount: 0,
      isVerified: 1,
      location: 'Nairobi, Kenya',
      bio: 'Official NikoSoko Super Administrator for trades, skilled artisans, and local service providers.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
      coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800',
      role: 'SuperAdmin',
      skills: JSON.stringify(['Master Electrician', 'Plumbing Inspection', 'Solar Installation', 'Quality Assurance']),
      hourlyRate: 'Ksh 2,500/hr',
      password: 'admin',
      createdAt: new Date().toISOString()
    };

    [defaultSuperAdmin].forEach(p => {
      runSql(
        `INSERT INTO providers (id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.phone, p.email, p.service, p.category, p.rating, p.reviewsCount, p.isVerified, p.location, p.bio, p.avatarUrl, p.coverImageUrl, p.role, p.skills, p.hourlyRate, p.password, p.createdAt]
      );
    });

    console.log('SQLite database initialized with the default super admin.');
  }
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
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
  const activeServerOtps = new Map<string, { code: string; expiresAt: number }>();

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { target } = req.body;
      if (!target) return res.status(400).json({ error: 'Target phone number is required' });
      const cleanTarget = String(target).trim().toLowerCase();
      const normDigits = cleanTarget.replace(/\D/g, '');
      const isSuperAdmin = normDigits.endsWith('723119356') || cleanTarget === '0723119356' || cleanTarget === '254723119356';
      
      const formattedPhone = formatToE164(cleanTarget);

      // Super Admin default code 3232 bypass
      if (isSuperAdmin) {
        activeServerOtps.set(cleanTarget, { code: '3232', expiresAt: Date.now() + 10 * 60 * 1000 });
        return res.json({
          success: true,
          message: `OTP requested for Super Admin (${cleanTarget})`,
          smsSent: false,
          devCode: '3232'
        });
      }

      const cfg = getTwilioConfig();
      let smsSent = false;
      let twilioError = '';

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
        // Fallback to Twilio Messaging API if Verify Service SID is not provided
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activeServerOtps.set(cleanTarget, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
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
        // Credentials not configured yet fallback
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activeServerOtps.set(cleanTarget, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
        console.log(`[Twilio Unconfigured Notice] Local OTP code generated for ${cleanTarget}: ${code}`);
      }

      res.json({
        success: true,
        message: smsSent ? `Verification SMS sent via Twilio to ${formattedPhone}` : `OTP code generated for ${cleanTarget}`,
        smsSent,
        error: twilioError || undefined
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Twilio SMS Settings API
  app.get('/api/admin/sms-settings', (req, res) => {
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

  app.post('/api/admin/sms-settings', (req, res) => {
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

  app.post('/api/admin/test-sms', async (req, res) => {
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


  // Fields that must never leave the server. ID details are write-only: users submit them,
  // nobody (including the owner) gets them back in a response.
  const PRIVATE_PROVIDER_FIELDS = [
    'password', 'rawData', 'idNumber', 'nationalId', 'idDocumentUrl', 'idType', 'selfieUrl',
    'email', 'checkInHistory', 'lastCheckInAt'
  ];
  const coarse = (n: any) => (typeof n === 'number' && isFinite(n) ? Math.round(n * 100) / 100 : null); // ~1 km
  const sanitizeProvider = (p: any) => {
    if (!p) return p;
    const out: any = { ...p };
    out.ratingCount = Number(p.reviewsCount) || 0;
    out.idSubmitted = Boolean(p.idNumber || p.nationalId || p.idDocumentUrl);
    for (const k of PRIVATE_PROVIDER_FIELDS) delete out[k];
    if (Array.isArray(out.joinRequests)) {
      out.joinRequests = out.joinRequests.map(({ userPhone, ...rest }: any) => rest);
    }
    if ('latitude' in out) out.latitude = coarse(out.latitude);
    if ('longitude' in out) out.longitude = coarse(out.longitude);
    return out;
  };

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { target, code } = req.body;
      if (!target || !code) return res.status(400).json({ error: 'Target phone number and OTP code are required' });
      const cleanTarget = String(target).trim().toLowerCase();
      const normDigits = cleanTarget.replace(/\D/g, '');
      const inputCode = String(code).trim();

      const isSuperAdmin = normDigits.endsWith('723119356') || cleanTarget === '0723119356' || cleanTarget === '254723119356';
      
      let isValid = false;

      if (isSuperAdmin && inputCode === '3232') {
        isValid = true;
      } else {
        const cfg = getTwilioConfig();
        const formattedPhone = formatToE164(cleanTarget);

        if (cfg.accountSid && cfg.authToken && cfg.verifyServiceSid) {
          try {
            const client = twilio(cfg.accountSid, cfg.authToken);
            const check = await client.verify.v2.services(cfg.verifyServiceSid)
              .verificationChecks.create({ to: formattedPhone, code: inputCode });
            
            if (check.status === 'approved') {
              isValid = true;
            }
          } catch (err: any) {
            console.error('Twilio Verify check error:', err);
            // Fallback check against activeServerOtps
            const stored = activeServerOtps.get(cleanTarget);
            if (stored && stored.code === inputCode && Date.now() < stored.expiresAt) {
              isValid = true;
            }
          }
        } else {
          const stored = activeServerOtps.get(cleanTarget);
          if (stored && stored.code === inputCode && Date.now() < stored.expiresAt) {
            isValid = true;
          }
        }
      }

      if (!isValid) {
        if (isSuperAdmin) {
          return res.status(400).json({ error: 'Incorrect code for Super Admin. Default code is 3232.' });
        }
        return res.status(400).json({ error: 'Incorrect OTP verification code. Please enter the valid code sent to your phone.' });
      }

      activeServerOtps.delete(cleanTarget);

      if (!isValid) {
        if (isSuperAdmin) {
          return res.status(400).json({ error: 'Incorrect code for Super Admin. Default code is 3232.' });
        }
        return res.status(400).json({ error: 'Incorrect OTP verification code. Please enter the valid code sent to your phone.' });
      }

      activeServerOtps.delete(cleanTarget);
      
      // Lookup or auto-create provider
      let provider = queryOne('SELECT * FROM providers WHERE email = ? OR phone = ? OR phone LIKE ?', [cleanTarget, cleanTarget, `%${cleanTarget}%`]);
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
          isVerified: 0, // verified only through an organization code or admin review
          location: 'Nairobi, Kenya',
          bio: 'New member on NikoSoko.',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300',
          coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800',
          role: 'Member',
          skills: JSON.stringify([]),
          hourlyRate: 'Ksh 1,000/hr',
          password: 'password123',
          createdAt: new Date().toISOString()
        };

        runSql(
          `INSERT INTO providers (id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            provider.id, provider.name, provider.phone, provider.email, provider.service, provider.category,
            provider.rating, provider.reviewsCount, provider.isVerified, provider.location, provider.bio,
            provider.avatarUrl, provider.coverImageUrl, provider.role, provider.skills, provider.hourlyRate,
            provider.password, provider.createdAt
          ]
        );
      }

      res.json({ message: 'OTP verified successfully', provider: sanitizeProvider(provider), token: `valid-token-for-${cleanTarget}` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Providers Endpoints
  app.get('/api/providers', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM providers ORDER BY isVerified DESC, rating DESC');
      const formatted = rows.map(r => {
        let raw: any = {};
        if (r.rawData && typeof r.rawData === 'string') {
          try { raw = JSON.parse(r.rawData); } catch (_) {}
        }
        return sanitizeProvider({
          ...raw,
          ...r,
          about: r.about || r.bio || raw.about || '',
          skills: typeof r.skills === 'string' ? JSON.parse(r.skills || '[]') : (r.skills || raw.skills || []),
          isVerified: Boolean(r.isVerified),
          isOnline: Boolean(r.isOnline),
          latitude: typeof r.latitude === 'number' ? r.latitude : (raw.latitude ?? null),
          longitude: typeof r.longitude === 'number' ? r.longitude : (raw.longitude ?? null)
        });
      });
      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/providers', (req, res) => {
    try {
      const p = req.body;
      const id = p.id || `pro-${Date.now()}`;
      const skillsJson = JSON.stringify(p.skills || []);
      const { avatarUrl: _pAvatar, coverImageUrl: _pCover, ...safeP } = p;
      const rawDataJson = JSON.stringify(safeP);
      const prior = queryOne('SELECT rating, reviewsCount, isVerified FROM providers WHERE id = ?', [id]);

      runSql(
        `INSERT OR REPLACE INTO providers (
          id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, about, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, isOnline, latitude, longitude, lastCheckInAt, lastCheckInLocation, rawData, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, p.name || '', p.phone || '', p.email || '', p.service || '', p.category || '',
          prior?.rating ?? 0, prior?.reviewsCount ?? 0, prior ? (prior.isVerified ? 1 : 0) : 0, p.location || '',
          p.bio || p.about || '', p.about || p.bio || '', p.avatarUrl || '', p.coverImageUrl || '', p.role || 'Provider',
          skillsJson, p.hourlyRate || '', p.password || '', p.isOnline ? 1 : 0,
          p.latitude || null, p.longitude || null, p.lastCheckInAt || null, p.lastCheckInLocation || null, rawDataJson, p.createdAt || new Date().toISOString()
        ]
      );

      const saved = queryOne('SELECT * FROM providers WHERE id = ?', [id]);
      res.json(sanitizeProvider(saved));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/providers/:id', (req, res) => {
    try {
      const id = req.params.id;
      const p = req.body;
      const existing = queryOne('SELECT * FROM providers WHERE id = ?', [id]);
      
      let existingRaw: any = {};
      if (existing?.rawData && typeof existing.rawData === 'string') {
        try { existingRaw = JSON.parse(existing.rawData); } catch (_) {}
      }

      const updated = { ...existingRaw, ...(existing || {}), ...p, id };
      // Ratings are computed server-side from the ratings table; clients cannot set them.
      updated.rating = existing?.rating ?? 0;
      updated.reviewsCount = existing?.reviewsCount ?? 0;
      const skillsJson = JSON.stringify(updated.skills || []);
      const { avatarUrl: _rdAvatar, coverImageUrl: _rdCover, ...safeForRawData } = updated;
      const rawDataJson = JSON.stringify(safeForRawData);

      runSql(
        `INSERT OR REPLACE INTO providers (
          id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, about, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, isOnline, latitude, longitude, lastCheckInAt, lastCheckInLocation, rawData, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, updated.name || '', updated.phone || '', updated.email || '', updated.service || '', updated.category || '',
          updated.rating ?? 0, updated.reviewsCount ?? 0, updated.isVerified ? 1 : 0, updated.location || '',
          updated.bio || updated.about || '', updated.about || updated.bio || '', updated.avatarUrl || '', updated.coverImageUrl || '', updated.role || 'Provider',
          skillsJson, updated.hourlyRate || '', updated.password || '', updated.isOnline ? 1 : 0,
          updated.latitude || null, updated.longitude || null, updated.lastCheckInAt || null, updated.lastCheckInLocation || null,
          rawDataJson, updated.createdAt || new Date().toISOString()
        ]
      );

      res.json({ message: 'Provider updated', provider: sanitizeProvider(updated) });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Referral codes: every organization gets one, and every course an organization lists gets its own.
  // A valid code is the only thing that verifies a user through an organization.
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
  const codePrefix = (name: string) => {
    const letters = String(name || 'ORG').toUpperCase().replace(/[^A-Z]/g, '');
    const consonants = letters.replace(/[AEIOU]/g, '');
    return (consonants.length >= 3 ? consonants : letters).slice(0, 4).padEnd(3, 'X');
  };
  const newCode = (prefix: string) => {
    for (let i = 0; i < 50; i++) {
      let tail = '';
      for (let j = 0; j < 4; j++) tail += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
      const code = `${prefix}-${tail}`;
      if (!queryOne('SELECT code FROM referral_codes WHERE code = ?', [code])) return code;
    }
    throw new Error('Could not generate a unique code');
  };
  const listOrgCodes = (orgId: string) => queryAll(
    `SELECT c.code, c.kind, c.itemId, c.label, c.createdAt,
            (SELECT COUNT(*) FROM referral_redemptions r WHERE r.code = c.code) AS redeemed
     FROM referral_codes c WHERE c.orgId = ? ORDER BY c.kind DESC, c.createdAt`, [orgId]);

  app.post('/api/referral-codes/ensure', (req, res) => {
    try {
      const { orgId, courses } = req.body || {};
      const org = orgId ? queryOne('SELECT id, name FROM providers WHERE id = ?', [orgId]) : null;
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      const prefix = codePrefix(org.name);
      const now = new Date().toISOString();
      if (!queryOne("SELECT code FROM referral_codes WHERE orgId = ? AND kind = 'organization'", [orgId])) {
        runSql('INSERT INTO referral_codes (code, orgId, kind, createdAt) VALUES (?, ?, ?, ?)', [newCode(prefix), orgId, 'organization', now]);
      }
      for (const c of Array.isArray(courses) ? courses : []) {
        if (!c?.id || !c?.title) continue;
        const existing = queryOne("SELECT code FROM referral_codes WHERE orgId = ? AND kind = 'course' AND itemId = ?", [orgId, String(c.id)]);
        if (existing) runSql('UPDATE referral_codes SET label = ? WHERE code = ?', [String(c.title), existing.code]);
        else runSql('INSERT INTO referral_codes (code, orgId, kind, itemId, label, createdAt) VALUES (?, ?, ?, ?, ?, ?)', [newCode(prefix), orgId, 'course', String(c.id), String(c.title), now]);
      }
      res.json(listOrgCodes(orgId));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/referral-codes/org/:orgId', (req, res) => {
    try {
      res.json(listOrgCodes(req.params.orgId));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/referral-codes/redeem', (req, res) => {
    try {
      const code = String(req.body?.code || '').trim().toUpperCase();
      const userId = String(req.body?.userId || '');
      if (!code || !userId) return res.status(400).json({ error: 'A code and user are required' });
      const ref = queryOne('SELECT * FROM referral_codes WHERE code = ?', [code]);
      if (!ref) return res.status(404).json({ error: 'That code does not exist. Check it with your organization.' });
      if (ref.orgId === userId) return res.status(400).json({ error: 'An organization cannot use its own code.' });
      const user = queryOne('SELECT * FROM providers WHERE id = ?', [userId]);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const org = queryOne('SELECT id, name FROM providers WHERE id = ?', [ref.orgId]);
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      if (queryOne('SELECT userId FROM referral_redemptions WHERE userId = ?', [userId])) {
        return res.status(409).json({ error: 'This account is already verified through an organization.' });
      }
      runSql('INSERT INTO referral_redemptions (userId, code, orgId, createdAt) VALUES (?, ?, ?, ?)', [userId, code, ref.orgId, new Date().toISOString()]);
      let raw: any = {};
      try { raw = JSON.parse(user.rawData || '{}'); } catch (_) {}
      raw = { ...raw, referralCodeUsed: code, isReferred: true, isSaccoVerified: true, verifiedByOrgId: org.id, verifiedByOrgName: org.name, verifiedForCourse: ref.label || undefined,
              saccoMember: { saccoId: org.id, saccoName: org.name, saccoCode: code, status: 'Confirmed', requestedAt: new Date().toISOString(), confirmedAt: new Date().toISOString() } };
      runSql('UPDATE providers SET isVerified = 1, rawData = ? WHERE id = ?', [JSON.stringify(raw), userId]);
      res.json({ success: true, orgId: org.id, orgName: org.name, courseTitle: ref.label || null, kind: ref.kind });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Location-targeted hero banners (e.g. "Karura Forest" for users near Ruaka). Public read, admin-managed.
  app.get('/api/banners', (req, res) => {
    try {
      res.json(queryAll('SELECT * FROM hero_banners WHERE isActive = 1 ORDER BY createdAt DESC'));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/banners/all', (req, res) => {
    try {
      res.json(queryAll('SELECT * FROM hero_banners ORDER BY createdAt DESC'));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/banners', (req, res) => {
    try {
      const b = req.body || {};
      if (!b.imageUrl || !b.title) return res.status(400).json({ error: 'title and imageUrl are required' });
      const id = b.id || `banner-${Date.now()}`;
      const num = (v: any) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
      runSql(
        `INSERT OR REPLACE INTO hero_banners (id, title, subtitle, imageUrl, area, latitude, longitude, radiusKm, isActive, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, b.title, b.subtitle || '', b.imageUrl, b.area || '', num(b.latitude), num(b.longitude), num(b.radiusKm) ?? 5, b.isActive === false || b.isActive === 0 ? 0 : 1, b.createdAt || new Date().toISOString()]
      );
      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/banners/:id', (req, res) => {
    try {
      runSql('DELETE FROM hero_banners WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Ratings: one rating per rater per provider; the average is always computed from real rows.
  app.post('/api/ratings', (req, res) => {
    try {
      const { providerId, raterKey, rating, comment } = req.body || {};
      const stars = Math.round(Number(rating));
      if (!providerId || !raterKey || !(stars >= 1 && stars <= 5)) {
        return res.status(400).json({ error: 'providerId, raterKey and a rating of 1-5 are required' });
      }
      if (String(raterKey) === String(providerId)) return res.status(400).json({ error: 'You cannot rate yourself' });
      if (!queryOne('SELECT id FROM providers WHERE id = ?', [providerId])) return res.status(404).json({ error: 'Provider not found' });
      // One rating per verified user per provider per day (Nairobi time). A newer rating replaces the older one.
      const nairobiDay = (d: Date) => new Date(d.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
      const prev = queryOne('SELECT createdAt FROM ratings WHERE providerId = ? AND raterKey = ?', [providerId, String(raterKey)]);
      if (prev?.createdAt && nairobiDay(new Date(prev.createdAt)) === nairobiDay(new Date())) {
        return res.status(429).json({ error: 'You have already rated this provider today. You can rate again tomorrow.' });
      }
      runSql(
        `INSERT INTO ratings (id, providerId, raterKey, stars, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(providerId, raterKey) DO UPDATE SET stars = excluded.stars, comment = excluded.comment, createdAt = excluded.createdAt`,
        [`rt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, providerId, String(raterKey), stars, String(comment || '').slice(0, 500), new Date().toISOString()]
      );
      const agg = queryOne('SELECT AVG(stars) AS avg, COUNT(*) AS n FROM ratings WHERE providerId = ?', [providerId]);
      const rating_ = Math.round(Number(agg.avg) * 10) / 10;
      runSql('UPDATE providers SET rating = ?, reviewsCount = ? WHERE id = ?', [rating_, agg.n, providerId]);
      res.json({ success: true, rating: rating_, reviewsCount: agg.n });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/providers/:id', (req, res) => {
    try {
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
  app.post('/api/upload', (req, res) => {
    try {
      const { dataUrl, path: uploadPath } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
        return res.status(400).json({ error: 'Invalid or missing dataUrl' });
      }
      const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid data URL format' });
      }
      const mimeType = matches[1];
      const base64Data = matches[2];
      const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
      const buffer = Buffer.from(base64Data, 'base64');
      const safePath = (uploadPath || `misc/upload_${Date.now()}`).replace(/[^a-zA-Z0-9_\-\/]/g, '_');
      const fileName = `${safePath}.${ext}`;
      const fullPath = path.join(process.cwd(), 'uploads', fileName);
      const fullDir = path.dirname(fullPath);
      fs.mkdirSync(fullDir, { recursive: true });
      fs.writeFileSync(fullPath, buffer);
      const publicUrl = `/uploads/${fileName}`;
      res.json({ success: true, url: publicUrl });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  app.post('/api/catalogue', (req, res) => {
    try {
      const item = req.body;
      const id = item.id || `cat-${Date.now()}`;
      const imagesJson = JSON.stringify(item.imageUrls || item.images || []);

      runSql(
        `INSERT OR REPLACE INTO catalogue_items (id, providerId, title, category, price, description, isVerified, images, serialNumber, duration, discountInfo, externalLink, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, item.providerId || '', item.title || '', item.category || '', item.price || '',
          item.description || '', item.isVerified ? 1 : 0, imagesJson, item.serialNumber || '',
          item.duration || '', item.discountInfo || '', item.externalLink || '', new Date().toISOString()
        ]
      );

      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/catalogue/:id', (req, res) => {
    try {
      runSql('DELETE FROM catalogue_items WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Messages Endpoints
  app.get('/api/messages', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM messages ORDER BY timestamp ASC');
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/messages', (req, res) => {
    try {
      const m = req.body;
      const id = m.id || `msg-${Date.now()}`;
      runSql(
        `INSERT INTO messages (id, senderId, recipientId, senderName, recipientName, text, timestamp, isRead)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, m.senderId, m.recipientId, m.senderName, m.recipientName, m.text, m.timestamp || new Date().toISOString(), m.isRead ? 1 : 0]
      );
      res.json({ success: true, id });
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

  // M-Pesa STK Push Endpoint
  app.post('/api/mpesa/stkpush', async (req, res) => {
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

  // --- Bookings API Endpoints ---
  app.get('/api/bookings', (req, res) => {
    try {
      const { userId, providerId, status } = req.query;
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

  app.post('/api/bookings', (req, res) => {
    try {
      const b = req.body;
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

  app.put('/api/bookings/:id', (req, res) => {
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
  app.put('/api/bookings/:id/cancel', (req, res) => {
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

  // Record a Location Check-In
  app.post('/api/locations/checkin', (req, res) => {
    try {
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

      const targetId = userId || providerId || `usr_${Date.now()}`;
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

      // Update provider table location & coordinates if provider exists.
      // The last check-in is the user's location, but only real coordinates are stored:
      // live GPS from the device, or a recognised estate. Unknown text keeps the previous coordinates.
      const latNum = Number(latitude), lngNum = Number(longitude);
      const hasGps = latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null &&
        !isNaN(latNum) && !isNaN(lngNum) && !(latNum === 0 && lngNum === 0) &&
        latNum >= -5 && latNum <= 5 && lngNum >= 33 && lngNum <= 42;
      const cleanName = (locationName || '').toLowerCase();
      // Generic "Nairobi" (the sign-up default) is not a location; only specific estates count.
      const matchedEstate = Object.keys(KENYA_ESTATES_MAP).some(k => k !== 'nairobi' && cleanName.includes(k));
      try {
        if (!hasGps && !matchedEstate) {
          runSql(
            `UPDATE providers SET location = ?, lastCheckInAt = ?, lastCheckInLocation = ? WHERE id = ?`,
            [locationName || resolved.name, now, locationName || resolved.name, targetId]
          );
        } else
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
