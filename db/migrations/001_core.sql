-- Qaribu core schema, migration 001 (PostgreSQL 15+)
--
-- Run once against an empty database:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_core.sql
--
-- Model (see the architecture doc): accounts own profiles; profiles (premise, door, person, org,
-- customer_door) offer offerings; QR tokens point at profiles or offerings; interactions record every
-- exchange and carry an audit log; ratings attach to completed interactions.
-- New kinds of profile/offering/CTA are data, not new tables. A new table needs an architecture review.

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    integer PRIMARY KEY,
  name       text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = 1) THEN
    RAISE EXCEPTION 'Migration 001 has already been applied';
  END IF;
END $$;

CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

-- ---------------------------------------------------------------- accounts
-- A verified person. One account can hold many profiles and roles.
CREATE TABLE accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone               text UNIQUE CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),   -- E.164, e.g. +254712345678
  email               text UNIQUE CHECK (email = lower(email)),
  name                text NOT NULL DEFAULT '',
  avatar_url          text,
  platform_role       text NOT NULL DEFAULT 'member' CHECK (platform_role IN ('member', 'superadmin')),
  id_verification     text NOT NULL DEFAULT 'unverified' CHECK (id_verification IN ('unverified', 'pending', 'verified', 'rejected')),
  brand_kit           jsonb NOT NULL DEFAULT '{}',        -- logo, colours, letterhead
  legacy_provider_id  text UNIQUE,                        -- id in the old SQLite providers table, for migration
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz,
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);
CREATE TRIGGER accounts_updated BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------- skills (Nikosoko)
CREATE TABLE skills (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title         text NOT NULL,
  category      text,
  verification  text NOT NULL DEFAULT 'unverified' CHECK (verification IN ('unverified', 'pending', 'verified', 'rejected')),
  verifier      jsonb NOT NULL DEFAULT '{}',              -- institution or mentor, licence number, grade
  evidence      jsonb NOT NULL DEFAULT '[]',              -- portfolio images, certificates
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX skills_account_idx ON skills (account_id);
CREATE TRIGGER skills_updated BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------- profiles
-- Anything with a page: premise, door, person, org, customer_door.
-- Hierarchy: premise -> door -> offering. A customer_door is private and is never listed.
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                text NOT NULL CHECK (kind IN ('premise', 'door', 'person', 'org', 'customer_door')),
  parent_id           uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  owner_account_id    uuid NOT NULL REFERENCES accounts(id),
  slug                text UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  name                text NOT NULL,
  tagline             text,
  about               text,
  logo_url            text,
  cover_url           text,
  contact_phone       text,
  contact_email       text,
  whatsapp            text,
  address_text        text,
  area                text,                               -- estate or neighbourhood, safe to show publicly
  county              text,
  lat                 double precision CHECK (lat BETWEEN -90 AND 90),
  lng                 double precision CHECK (lng BETWEEN -180 AND 180),
  visibility          text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private', 'backend_only')),
  hours               jsonb NOT NULL DEFAULT '{}',
  cta                 jsonb NOT NULL DEFAULT '[]',        -- ordered [{type, config}] the owner opted into
  status              text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  verification        text NOT NULL DEFAULT 'none' CHECK (verification IN ('none', 'phone', 'id', 'location', 'verified')),
  attributes          jsonb NOT NULL DEFAULT '{}',        -- kind-specific: premise amenities and vacancies, door note, etc.
  legacy_provider_id  text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz,
  CHECK (kind <> 'customer_door' OR visibility = 'backend_only'),
  CHECK (kind = 'customer_door' OR visibility <> 'backend_only')
);
CREATE INDEX profiles_parent_idx   ON profiles (parent_id);
CREATE INDEX profiles_owner_idx    ON profiles (owner_account_id);
CREATE INDEX profiles_kind_idx     ON profiles (kind);
CREATE INDEX profiles_geo_idx      ON profiles (lat, lng) WHERE visibility = 'public' AND deleted_at IS NULL;
CREATE INDEX profiles_legacy_idx   ON profiles (legacy_provider_id) WHERE legacy_provider_id IS NOT NULL;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Only a door may have a parent, and that parent must be a premise.
CREATE FUNCTION profiles_validate() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_kind text;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT kind INTO parent_kind FROM profiles WHERE id = NEW.parent_id;
    IF NEW.kind <> 'door' OR parent_kind IS DISTINCT FROM 'premise' THEN
      RAISE EXCEPTION 'Only a door may have a parent, and the parent must be a premise (% under %)', NEW.kind, parent_kind;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_validate_trg BEFORE INSERT OR UPDATE OF kind, parent_id ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_validate();

-- ---------------------------------------------------------------- memberships
-- Roles belong to the relationship between an account and a profile, not to the account.
CREATE TABLE memberships (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'gateman', 'tenant_admin', 'tenant')),
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'revoked')),
  invited_by  uuid REFERENCES accounts(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, profile_id, role)
);
CREATE INDEX memberships_profile_idx ON memberships (profile_id, role) WHERE status = 'active';
CREATE INDEX memberships_account_idx ON memberships (account_id)       WHERE status = 'active';

-- Creating a profile makes its creator the owner.
CREATE FUNCTION profiles_owner_membership() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO memberships (account_id, profile_id, role) VALUES (NEW.owner_account_id, NEW.id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_owner_membership_trg AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_owner_membership();

-- ---------------------------------------------------------------- offerings
-- Anything a profile gives: a service, a machine (printer, washer), a menu item, a vacancy, a pass type.
-- capabilities and rate_card are validated per type in the application and stored as JSON.
--   capabilities e.g. {"colour": true, "sizes": ["A4", "A3"], "duplex": true}
--   rate_card    e.g. {"currency": "KES", "items": [{"key": "bw_a4", "label": "B&W A4", "unit": "page", "price": 5}]}
CREATE TABLE offerings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind                text NOT NULL CHECK (kind IN ('service', 'machine', 'menu_item', 'product', 'vacancy', 'pass_type')),
  type                text NOT NULL,                      -- printer, washing_machine, laundry, it_repair, ...
  title               text NOT NULL,
  description         text,
  images              jsonb NOT NULL DEFAULT '[]',
  capabilities        jsonb NOT NULL DEFAULT '{}',
  rate_card           jsonb NOT NULL DEFAULT '{}',
  price_from          numeric(12, 2) CHECK (price_from >= 0),   -- lowest price, kept up to date by the app for sorting
  cta                 jsonb,                              -- optional override of the profile's CTAs
  fulfilment          text[] NOT NULL DEFAULT '{in_store}' CHECK (fulfilment <@ ARRAY['in_store', 'pickup', 'delivery']),
  availability_mode   text NOT NULL DEFAULT 'manual' CHECK (availability_mode IN ('manual', 'live')),
  availability_status text NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'out_of_service')),
  skill_id            uuid REFERENCES skills(id) ON DELETE SET NULL,
  asset_id            uuid,                               -- links to the assets ledger once that table exists
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, profile_id)
);
CREATE INDEX offerings_profile_idx ON offerings (profile_id);
CREATE INDEX offerings_type_idx    ON offerings (type) WHERE is_active;
CREATE INDEX offerings_caps_idx    ON offerings USING gin (capabilities jsonb_path_ops);
CREATE TRIGGER offerings_updated BEFORE UPDATE ON offerings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------- qr_tokens
-- A sticker or key. The token is random and generated by the app (at least 10 characters).
-- QR images encode only the URL that contains the token, so a sticker can be revoked or retargeted.
CREATE TABLE qr_tokens (
  token        text PRIMARY KEY CHECK (length(token) >= 10),
  target_type  text NOT NULL CHECK (target_type IN ('profile', 'offering', 'interaction')),
  target_id    uuid NOT NULL,
  purpose      text NOT NULL CHECK (purpose IN ('view', 'scan_to_use', 'gatepass_issue', 'gatepass_key', 'setup_role')),
  role         text,                                      -- for setup_role tokens
  created_by   uuid REFERENCES accounts(id),
  expires_at   timestamptz,
  single_use   boolean NOT NULL DEFAULT false,
  used_at      timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX qr_tokens_target_idx ON qr_tokens (target_type, target_id);

-- ---------------------------------------------------------------- interactions
-- Any exchange between an account and a profile: enquiry, booking, pickup request, order, gate pass request, chat.
-- Payment status is separate from job status so Express (M-Pesa STK) can plug in later.
CREATE TABLE interactions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                 text NOT NULL CHECK (kind IN ('enquiry', 'booking', 'pickup_request', 'order', 'gatepass_request', 'chat')),
  from_account_id      uuid NOT NULL REFERENCES accounts(id),
  from_profile_id      uuid REFERENCES profiles(id),      -- which profile the sender was acting as
  to_profile_id        uuid NOT NULL REFERENCES profiles(id),
  offering_id          uuid,
  customer_door_id     uuid REFERENCES profiles(id),      -- private address for pickup/delivery; never exposed directly
  status               text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled', 'expired')),
  payload              jsonb NOT NULL DEFAULT '{}',
  payment_status       text NOT NULL DEFAULT 'none' CHECK (payment_status IN ('none', 'unpaid', 'pending', 'paid', 'failed', 'refunded')),
  amount               numeric(12, 2) CHECK (amount >= 0),
  currency             text NOT NULL DEFAULT 'KES',
  scheduled_at         timestamptz,
  address_released_at  timestamptz,
  closed_at            timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (offering_id, to_profile_id) REFERENCES offerings (id, profile_id)   -- the offering must belong to the profile
);
CREATE INDEX interactions_to_idx       ON interactions (to_profile_id, status);
CREATE INDEX interactions_from_idx     ON interactions (from_account_id, created_at DESC);
CREATE INDEX interactions_offering_idx ON interactions (offering_id) WHERE offering_id IS NOT NULL;
CREATE TRIGGER interactions_updated BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE interaction_events (
  id               bigserial PRIMARY KEY,
  interaction_id   uuid NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  event            text NOT NULL,                         -- created, accepted, address_released, address_viewed, completed, ...
  actor_account_id uuid REFERENCES accounts(id),
  data             jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interaction_events_idx ON interaction_events (interaction_id, created_at);

-- ---------------------------------------------------------------- ratings
-- A rating targets exactly one thing: a profile (the door) or an offering (the machine).
-- It can only come from a completed interaction, so a good shop can still have a bad printer.
CREATE TABLE ratings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id      uuid NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  rater_account_id    uuid NOT NULL REFERENCES accounts(id),
  target_profile_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  target_offering_id  uuid REFERENCES offerings(id) ON DELETE CASCADE,
  score               smallint NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment             text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(target_profile_id, target_offering_id) = 1),
  UNIQUE NULLS NOT DISTINCT (interaction_id, rater_account_id, target_profile_id, target_offering_id)
);
CREATE INDEX ratings_profile_idx  ON ratings (target_profile_id)  WHERE target_profile_id IS NOT NULL;
CREATE INDEX ratings_offering_idx ON ratings (target_offering_id) WHERE target_offering_id IS NOT NULL;

CREATE FUNCTION ratings_validate() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE i interactions%ROWTYPE;
BEGIN
  SELECT * INTO i FROM interactions WHERE id = NEW.interaction_id;
  IF i.status <> 'completed' THEN
    RAISE EXCEPTION 'Only a completed interaction can be rated';
  END IF;

  IF NEW.rater_account_id = i.from_account_id THEN
    -- the customer rates what they used
    IF NOT (NEW.target_profile_id = i.to_profile_id OR (NEW.target_offering_id IS NOT NULL AND NEW.target_offering_id = i.offering_id)) THEN
      RAISE EXCEPTION 'A customer can only rate the profile or offering they dealt with';
    END IF;
  ELSIF EXISTS (SELECT 1 FROM memberships m WHERE m.profile_id = i.to_profile_id AND m.account_id = NEW.rater_account_id AND m.status = 'active') THEN
    -- the provider rates the customer's own profile
    IF NEW.target_profile_id IS NULL OR NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = NEW.target_profile_id AND p.owner_account_id = i.from_account_id) THEN
      RAISE EXCEPTION 'A provider can only rate the customer they served';
    END IF;
  ELSE
    RAISE EXCEPTION 'Only a party to the interaction can rate it';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER ratings_validate_trg BEFORE INSERT ON ratings FOR EACH ROW EXECUTE FUNCTION ratings_validate();

-- Displayed score pulls toward a neutral 4.0 until there are enough ratings (prior weight 5), as in the app's trust engine.
CREATE VIEW profile_ratings WITH (security_invoker = true) AS
  SELECT target_profile_id AS profile_id,
         count(*)::int AS rating_count,
         round(avg(score), 2) AS avg_score,
         round((5 * 4.0 + sum(score)) / (5 + count(*)), 1) AS display_rating
  FROM ratings WHERE target_profile_id IS NOT NULL GROUP BY target_profile_id;

CREATE VIEW offering_ratings WITH (security_invoker = true) AS
  SELECT target_offering_id AS offering_id,
         count(*)::int AS rating_count,
         round(avg(score), 2) AS avg_score,
         round((5 * 4.0 + sum(score)) / (5 + count(*)), 1) AS display_rating
  FROM ratings WHERE target_offering_id IS NOT NULL GROUP BY target_offering_id;

-- ---------------------------------------------------------------- proximity search
CREATE FUNCTION haversine_km(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT 2 * 6371 * asin(sqrt(least(1.0,
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2))))
$$;

-- "Nearest open printer that can do A3 colour": search_offerings(lat, lng, 5, 'printer', '{"colour": true, "sizes": ["A3"]}')
-- Only public, active, non-deleted profiles are returned. A door without its own pin uses its premise's pin.
CREATE FUNCTION search_offerings(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision DEFAULT 10,
  p_type text DEFAULT NULL,
  p_required jsonb DEFAULT '{}'::jsonb,
  p_limit integer DEFAULT 20
) RETURNS TABLE (
  offering_id uuid, profile_id uuid, title text, type text, price_from numeric,
  availability_status text, distance_km double precision, rating numeric, rating_count integer
) LANGUAGE sql STABLE AS $$
  WITH located AS (
    SELECT o.id AS offering_id, p.id AS profile_id, o.title, o.type, o.price_from, o.availability_status,
           COALESCE(p.lat, pp.lat) AS lat, COALESCE(p.lng, pp.lng) AS lng
    FROM offerings o
    JOIN profiles p ON p.id = o.profile_id
    LEFT JOIN profiles pp ON pp.id = p.parent_id
    WHERE o.is_active
      AND o.availability_status <> 'out_of_service'
      AND p.visibility = 'public' AND p.status = 'active' AND p.deleted_at IS NULL
      AND (p_type IS NULL OR o.type = p_type)
      AND o.capabilities @> p_required
  )
  SELECT l.offering_id, l.profile_id, l.title, l.type, l.price_from, l.availability_status,
         haversine_km(p_lat, p_lng, l.lat, l.lng) AS distance_km,
         r.display_rating, COALESCE(r.rating_count, 0)
  FROM located l
  LEFT JOIN offering_ratings r ON r.offering_id = l.offering_id
  WHERE l.lat IS NOT NULL AND l.lng IS NOT NULL
    AND haversine_km(p_lat, p_lng, l.lat, l.lng) <= p_radius_km
  ORDER BY distance_km, l.price_from NULLS LAST
  LIMIT p_limit
$$;

-- ---------------------------------------------------------------- controlled address release
-- A customer's door is never readable directly. The provider sees the exact address only after the request is
-- accepted and the address is released, only while the request is open, and each view is logged.
CREATE FUNCTION release_address(p_interaction uuid, p_actor uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE i interactions%ROWTYPE;
BEGIN
  SELECT * INTO i FROM interactions WHERE id = p_interaction FOR UPDATE;
  IF NOT FOUND OR i.customer_door_id IS NULL THEN RAISE EXCEPTION 'No address on this request'; END IF;
  IF i.status NOT IN ('accepted', 'in_progress') THEN RAISE EXCEPTION 'The request must be accepted first'; END IF;
  IF NOT EXISTS (SELECT 1 FROM memberships m WHERE m.profile_id = i.to_profile_id AND m.account_id = p_actor
                 AND m.status = 'active' AND m.role IN ('owner', 'manager', 'staff')) THEN
    RAISE EXCEPTION 'Not allowed to release this address';
  END IF;
  UPDATE interactions SET address_released_at = COALESCE(address_released_at, now()) WHERE id = p_interaction;
  INSERT INTO interaction_events (interaction_id, event, actor_account_id) VALUES (p_interaction, 'address_released', p_actor);
END $$;

CREATE FUNCTION get_released_address(p_interaction uuid, p_actor uuid)
RETURNS TABLE (address_text text, lat double precision, lng double precision, notes jsonb) LANGUAGE plpgsql AS $$
DECLARE i interactions%ROWTYPE;
BEGIN
  SELECT * INTO i FROM interactions WHERE id = p_interaction;
  IF NOT FOUND OR i.customer_door_id IS NULL OR i.address_released_at IS NULL OR i.closed_at IS NOT NULL
     OR i.status NOT IN ('accepted', 'in_progress') THEN
    RETURN;                                                -- nothing is revealed
  END IF;
  IF NOT EXISTS (SELECT 1 FROM memberships m WHERE m.profile_id = i.to_profile_id AND m.account_id = p_actor
                 AND m.status = 'active' AND m.role IN ('owner', 'manager', 'staff')) THEN
    RETURN;
  END IF;
  INSERT INTO interaction_events (interaction_id, event, actor_account_id) VALUES (p_interaction, 'address_viewed', p_actor);
  RETURN QUERY SELECT p.address_text, p.lat, p.lng, p.attributes FROM profiles p WHERE p.id = i.customer_door_id;
END $$;

-- ---------------------------------------------------------------- lock down direct access
-- Row level security with no policies denies every role that does not own the tables. The server connects as the
-- owner. This matters on hosts (such as Supabase) that expose tables through an anonymous API key.
ALTER TABLE accounts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships        ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings            ENABLE ROW LEVEL SECURITY;

INSERT INTO schema_migrations (version, name) VALUES (1, 'core');

COMMIT;
