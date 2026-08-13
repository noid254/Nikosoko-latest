import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const PORT = 3000;
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
      avatarUrl TEXT,
      coverImageUrl TEXT,
      role TEXT DEFAULT 'Provider',
      skills TEXT,
      hourlyRate TEXT,
      portfolio TEXT,
      password TEXT,
      isOnline INTEGER DEFAULT 1,
      contactInfo TEXT,
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
  `);

  saveDb();

  // Seed default super admin & initial trades professionals if empty
  const providerCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM providers');
  if (!providerCount || providerCount.count === 0) {
    const defaultSuperAdmin = {
      id: 'super-admin-001',
      name: 'NikoSoko Admin',
      phone: '0723119356',
      email: 'admin@nikosoko.com',
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
      password: 'admin',
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
        password: 'password123',
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
        password: 'password123',
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
        password: 'password123',
        createdAt: new Date().toISOString()
      }
    ];

    [defaultSuperAdmin, ...initialTradesPros].forEach(p => {
      runSql(
        `INSERT INTO providers (id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.phone, p.email, p.service, p.category, p.rating, p.reviewsCount, p.isVerified, p.location, p.bio, p.avatarUrl, p.coverImageUrl, p.role, p.skills, p.hourlyRate, p.password, p.createdAt]
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
          rating: 5.0,
          reviewsCount: 1,
          isVerified: 1,
          location: 'Nairobi, Kenya',
          bio: 'Verified user on NikoSoko Neighbourhood Marketplace.',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300',
          coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800',
          role: 'Member',
          skills: JSON.stringify(['General Trades']),
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

      res.json({ message: 'OTP verified successfully', provider, token: `valid-token-for-${cleanTarget}` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Authentication & Profile Persistence Routes
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, phone, email, service, category, location, bio, password, role } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and Phone number are required' });
      }

      // Check if user with phone already exists
      const existing = queryOne('SELECT * FROM providers WHERE phone = ? OR (email = ? AND email != "")', [phone, email || '']);
      if (existing) {
        // Return existing profile
        return res.json({ message: 'User profile retrieved', provider: existing });
      }

      const id = `pro-${Date.now()}`;
      const newProvider = {
        id,
        name,
        phone,
        email: email || '',
        service: service || 'General Trades Professional',
        category: category || 'GENERAL',
        rating: 5.0,
        reviewsCount: 1,
        isVerified: 1,
        location: location || 'Nairobi, Kenya',
        bio: bio || 'Skilled trades professional listed on NikoSoko Marketplace.',
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300`,
        coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800',
        role: role || 'Provider',
        skills: JSON.stringify(['Trades Specialist']),
        hourlyRate: 'Ksh 1,000/hr',
        password: password || 'password123',
        createdAt: new Date().toISOString()
      };

      runSql(
        `INSERT INTO providers (id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProvider.id, newProvider.name, newProvider.phone, newProvider.email, newProvider.service,
          newProvider.category, newProvider.rating, newProvider.reviewsCount, newProvider.isVerified,
          newProvider.location, newProvider.bio, newProvider.avatarUrl, newProvider.coverImageUrl,
          newProvider.role, newProvider.skills, newProvider.hourlyRate, newProvider.password, newProvider.createdAt
        ]
      );

      res.json({ message: 'User registered successfully', provider: newProvider });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || 'Failed to register user' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { phone, email } = req.body;
      if (!phone && !email) {
        return res.status(400).json({ error: 'Phone or Email is required' });
      }

      const user = queryOne(
        'SELECT * FROM providers WHERE (phone = ? AND phone != "") OR (email = ? AND email != "") OR (phone LIKE ?)',
        [phone || '', email || '', `%${phone}%`]
      );

      if (!user) {
        return res.status(444).json({ error: 'User profile not found. Please create an account.' });
      }

      // Parse JSON fields
      if (user.skills && typeof user.skills === 'string') {
        try { user.skills = JSON.parse(user.skills); } catch { user.skills = []; }
      }

      res.json({ message: 'Login successful', provider: user });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || 'Login failed' });
    }
  });

  // Providers Endpoints
  app.get('/api/providers', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM providers ORDER BY isVerified DESC, rating DESC');
      const formatted = rows.map(r => ({
        ...r,
        skills: typeof r.skills === 'string' ? JSON.parse(r.skills || '[]') : r.skills,
        isVerified: Boolean(r.isVerified),
        isOnline: Boolean(r.isOnline)
      }));
      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/providers/:id', (req, res) => {
    try {
      const row = queryOne('SELECT * FROM providers WHERE id = ?', [req.params.id]);
      if (!row) return res.status(404).json({ error: 'Provider not found' });
      res.json({
        ...row,
        skills: typeof row.skills === 'string' ? JSON.parse(row.skills || '[]') : row.skills,
        isVerified: Boolean(row.isVerified),
        isOnline: Boolean(row.isOnline)
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/providers', (req, res) => {
    try {
      const p = req.body;
      const id = p.id || `pro-${Date.now()}`;
      const skillsJson = JSON.stringify(p.skills || []);

      runSql(
        `INSERT OR REPLACE INTO providers (id, name, phone, email, service, category, rating, reviewsCount, isVerified, location, bio, avatarUrl, coverImageUrl, role, skills, hourlyRate, password, isOnline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, p.name || '', p.phone || '', p.email || '', p.service || '', p.category || '',
          p.rating || 5.0, p.reviewsCount || 0, p.isVerified ? 1 : 0, p.location || '',
          p.bio || '', p.avatarUrl || '', p.coverImageUrl || '', p.role || 'Provider',
          skillsJson, p.hourlyRate || '', p.password || '', p.isOnline ? 1 : 0
        ]
      );

      const saved = queryOne('SELECT * FROM providers WHERE id = ?', [id]);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/providers/:id', (req, res) => {
    try {
      const id = req.params.id;
      const p = req.body;
      const existing = queryOne('SELECT * FROM providers WHERE id = ?', [id]);
      if (!existing) return res.status(404).json({ error: 'Provider not found' });

      const updated = { ...existing, ...p };
      const skillsJson = JSON.stringify(updated.skills || []);

      runSql(
        `UPDATE providers SET name=?, phone=?, email=?, service=?, category=?, rating=?, reviewsCount=?, isVerified=?, location=?, bio=?, avatarUrl=?, coverImageUrl=?, role=?, skills=?, hourlyRate=? WHERE id=?`,
        [
          updated.name, updated.phone, updated.email, updated.service, updated.category,
          updated.rating, updated.reviewsCount, updated.isVerified ? 1 : 0, updated.location,
          updated.bio, updated.avatarUrl, updated.coverImageUrl, updated.role, skillsJson, updated.hourlyRate, id
        ]
      );

      res.json({ message: 'Provider updated', provider: updated });
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
        images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : r.images,
        isVerified: Boolean(r.isVerified)
      }));
      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/catalogue', (req, res) => {
    try {
      const item = req.body;
      const id = item.id || `cat-${Date.now()}`;
      const imagesJson = JSON.stringify(item.images || [item.imageUrl].filter(Boolean));

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

  // Gigs Endpoints
  app.get('/api/gigs', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM gigs ORDER BY createdAt DESC');
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/gigs', (req, res) => {
    try {
      const g = req.body;
      const id = g.id || `gig-${Date.now()}`;
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

  // Banners Endpoints
  app.get('/api/banners', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM special_banners');
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/banners', (req, res) => {
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

  app.delete('/api/banners/:id', (req, res) => {
    try {
      runSql('DELETE FROM special_banners WHERE id = ?', [req.params.id]);
      res.json({ success: true });
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
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} with SQLite database backend.`);
  });
}

startServer();
