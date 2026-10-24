-- Tests for migration 001. Run against a scratch database that has had 001_core.sql applied:
--   psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/tests/001_core_test.sql
-- Everything runs inside a transaction that is rolled back, so it leaves no data behind.
-- Any failed ASSERT stops the run with a message.

BEGIN;

CREATE TEMP TABLE ids (k text PRIMARY KEY, v uuid NOT NULL);
CREATE FUNCTION pg_temp.i(key text) RETURNS uuid LANGUAGE sql AS $$ SELECT v FROM ids WHERE k = key $$;

-- ------------------------------------------------------------ people
WITH a AS (INSERT INTO accounts (phone, name) VALUES ('+254700000001', 'Kamau')  RETURNING id) INSERT INTO ids SELECT 'kamau',  id FROM a;
WITH a AS (INSERT INTO accounts (phone, name) VALUES ('+254700000002', 'Mwangi') RETURNING id) INSERT INTO ids SELECT 'mwangi', id FROM a;
WITH a AS (INSERT INTO accounts (phone, name) VALUES ('+254700000003', 'Amina')  RETURNING id) INSERT INTO ids SELECT 'amina',  id FROM a;
WITH a AS (INSERT INTO accounts (phone, name) VALUES ('+254700000004', 'Wanjiru') RETURNING id) INSERT INTO ids SELECT 'wanjiru', id FROM a;

DO $$ BEGIN
  DECLARE failed boolean := false;
  BEGIN
    BEGIN INSERT INTO accounts (phone) VALUES ('0712345678'); EXCEPTION WHEN OTHERS THEN failed := true; END;
    ASSERT failed, 'a phone that is not E.164 must be rejected';
    failed := false;
    BEGIN INSERT INTO accounts (name) VALUES ('nobody'); EXCEPTION WHEN OTHERS THEN failed := true; END;
    ASSERT failed, 'an account needs a phone or an email';
  END;
END $$;

-- ------------------------------------------------------------ Kamau: landlord, IT expert, tenant elsewhere
WITH p AS (INSERT INTO profiles (kind, owner_account_id, name, lat, lng, area)
           VALUES ('premise', pg_temp.i('kamau'), 'Kamau Plaza', -1.2921, 36.8219, 'CBD') RETURNING id)
INSERT INTO ids SELECT 'kamau_premise', id FROM p;

WITH p AS (INSERT INTO profiles (kind, parent_id, owner_account_id, name)
           VALUES ('door', pg_temp.i('kamau_premise'), pg_temp.i('kamau'), 'Kamau IT Services') RETURNING id)
INSERT INTO ids SELECT 'kamau_door', id FROM p;

WITH p AS (INSERT INTO profiles (kind, owner_account_id, name) VALUES ('person', pg_temp.i('kamau'), 'Kamau, IT expert') RETURNING id)
INSERT INTO ids SELECT 'kamau_person', id FROM p;

WITH p AS (INSERT INTO profiles (kind, owner_account_id, name, lat, lng)
           VALUES ('premise', pg_temp.i('mwangi'), 'Mwangi Court', -1.2500, 36.8000) RETURNING id)
INSERT INTO ids SELECT 'mwangi_premise', id FROM p;

WITH p AS (INSERT INTO profiles (kind, parent_id, owner_account_id, name, visibility)
           VALUES ('door', pg_temp.i('mwangi_premise'), pg_temp.i('mwangi'), 'Unit B7', 'private') RETURNING id)
INSERT INTO ids SELECT 'b7', id FROM p;

INSERT INTO memberships (account_id, profile_id, role) VALUES (pg_temp.i('kamau'), pg_temp.i('b7'), 'tenant');

DO $$ BEGIN
  ASSERT (SELECT count(*) FROM memberships WHERE account_id = pg_temp.i('kamau') AND role = 'owner') = 3,
    'creating a profile must make its creator the owner (expected 3 owner memberships for Kamau)';
  ASSERT (SELECT role FROM memberships WHERE account_id = pg_temp.i('kamau') AND profile_id = pg_temp.i('b7')) = 'tenant',
    'one account holds a different role on a different profile';
  ASSERT (SELECT count(DISTINCT role) FROM memberships WHERE account_id = pg_temp.i('kamau')) = 2,
    'Kamau is both owner and tenant';
END $$;

-- ------------------------------------------------------------ structure rules
DO $$ DECLARE failed boolean;
BEGIN
  failed := false;
  BEGIN INSERT INTO profiles (kind, parent_id, owner_account_id, name) VALUES ('door', pg_temp.i('kamau_door'), pg_temp.i('kamau'), 'door under door');
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'a door cannot sit under a door';

  failed := false;
  BEGIN INSERT INTO profiles (kind, parent_id, owner_account_id, name) VALUES ('person', pg_temp.i('kamau_premise'), pg_temp.i('kamau'), 'person under premise');
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'only a door may have a parent';

  failed := false;
  BEGIN INSERT INTO profiles (kind, owner_account_id, name, visibility) VALUES ('customer_door', pg_temp.i('amina'), 'home', 'public');
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'a customer door can never be public';

  failed := false;
  BEGIN INSERT INTO profiles (kind, owner_account_id, name, visibility) VALUES ('door', pg_temp.i('kamau'), 'hidden shop', 'backend_only');
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'only a customer door may be backend_only';

  failed := false;
  BEGIN INSERT INTO qr_tokens (token, target_type, target_id, purpose) VALUES ('short', 'profile', pg_temp.i('kamau_door'), 'view');
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'a guessable short QR token must be rejected';
END $$;

INSERT INTO qr_tokens (token, target_type, target_id, purpose, created_by)
VALUES ('k7Qm2xR9vTpL', 'profile', pg_temp.i('kamau_door'), 'view', pg_temp.i('kamau'));

-- ------------------------------------------------------------ printers and nearby search
WITH p AS (INSERT INTO profiles (kind, owner_account_id, name, lat, lng) VALUES ('door', pg_temp.i('wanjiru'), 'Cyber B', -1.3021, 36.8219) RETURNING id)
INSERT INTO ids SELECT 'cyber_b', id FROM p;
WITH p AS (INSERT INTO profiles (kind, owner_account_id, name, lat, lng) VALUES ('door', pg_temp.i('wanjiru'), 'Far Cyber', -1.4721, 36.8219) RETURNING id)
INSERT INTO ids SELECT 'far_cyber', id FROM p;
WITH p AS (INSERT INTO profiles (kind, owner_account_id, name, lat, lng, visibility) VALUES ('door', pg_temp.i('wanjiru'), 'Unlisted Cyber', -1.2925, 36.8220, 'unlisted') RETURNING id)
INSERT INTO ids SELECT 'unlisted_cyber', id FROM p;

-- P1 at Kamau's door has no pin of its own, so it uses the premise's pin.
WITH o AS (INSERT INTO offerings (profile_id, kind, type, title, capabilities, price_from)
           VALUES (pg_temp.i('kamau_door'), 'machine', 'printer', 'Epson L3250', '{"colour": true, "sizes": ["A4", "A3"]}', 20) RETURNING id)
INSERT INTO ids SELECT 'p1', id FROM o;
WITH o AS (INSERT INTO offerings (profile_id, kind, type, title, capabilities, price_from)
           VALUES (pg_temp.i('cyber_b'), 'machine', 'printer', 'HP LaserJet', '{"colour": false, "sizes": ["A4"]}', 5) RETURNING id)
INSERT INTO ids SELECT 'p2', id FROM o;
WITH o AS (INSERT INTO offerings (profile_id, kind, type, title, capabilities, price_from)
           VALUES (pg_temp.i('far_cyber'), 'machine', 'printer', 'Far printer', '{"colour": true, "sizes": ["A4", "A3"]}', 15) RETURNING id)
INSERT INTO ids SELECT 'p3', id FROM o;
WITH o AS (INSERT INTO offerings (profile_id, kind, type, title, capabilities, availability_status)
           VALUES (pg_temp.i('kamau_door'), 'machine', 'printer', 'Broken A3', '{"colour": true, "sizes": ["A3"]}', 'out_of_service') RETURNING id)
INSERT INTO ids SELECT 'p4', id FROM o;
WITH o AS (INSERT INTO offerings (profile_id, kind, type, title, capabilities)
           VALUES (pg_temp.i('unlisted_cyber'), 'machine', 'printer', 'Unlisted A3', '{"colour": true, "sizes": ["A3"]}') RETURNING id)
INSERT INTO ids SELECT 'p5', id FROM o;

DO $$ DECLARE r record; n int;
BEGIN
  -- colour A3 within 5 km: only P1 qualifies (P2 has no colour, P3 is too far, P4 is out of service, P5 is unlisted)
  SELECT count(*) INTO n FROM search_offerings(-1.2921, 36.8219, 5, 'printer', '{"colour": true, "sizes": ["A3"]}');
  ASSERT n = 1, format('expected exactly 1 colour A3 printer nearby, got %s', n);
  SELECT * INTO r FROM search_offerings(-1.2921, 36.8219, 5, 'printer', '{"colour": true, "sizes": ["A3"]}');
  ASSERT r.offering_id = pg_temp.i('p1'), 'the match should be the printer at Kamau''s door';
  ASSERT r.distance_km < 0.01, 'a door without its own pin should use its premise pin (distance ~0)';

  -- no requirement: P1 and P2 within 5 km, nearest first
  SELECT array_agg(offering_id ORDER BY distance_km) INTO STRICT r FROM search_offerings(-1.2921, 36.8219, 5, 'printer');
  ASSERT (SELECT count(*) FROM search_offerings(-1.2921, 36.8219, 5, 'printer')) = 2, 'expected 2 printers within 5 km';
  ASSERT (SELECT offering_id FROM search_offerings(-1.2921, 36.8219, 5, 'printer') ORDER BY distance_km LIMIT 1) = pg_temp.i('p1'), 'nearest first';

  -- a larger radius reaches the far printer
  ASSERT (SELECT count(*) FROM search_offerings(-1.2921, 36.8219, 30, 'printer', '{"colour": true, "sizes": ["A3"]}')) = 2,
    'within 30 km the far printer should also match';
END $$;

-- ------------------------------------------------------------ laundry pickup with a private address
WITH p AS (INSERT INTO profiles (kind, owner_account_id, name, lat, lng) VALUES ('door', pg_temp.i('wanjiru'), 'Wanjiru Laundry', -1.2950, 36.8200) RETURNING id)
INSERT INTO ids SELECT 'laundry', id FROM p;
WITH o AS (INSERT INTO offerings (profile_id, kind, type, title, fulfilment)
           VALUES (pg_temp.i('laundry'), 'service', 'laundry', 'Wash and fold', '{pickup,delivery}') RETURNING id)
INSERT INTO ids SELECT 'laundry_offer', id FROM o;
WITH p AS (INSERT INTO profiles (kind, owner_account_id, name, visibility, address_text, lat, lng, attributes)
           VALUES ('customer_door', pg_temp.i('amina'), 'Amina home', 'backend_only', 'House 12, Green Estate', -1.3000, 36.8100, '{"gate": "blue gate"}') RETURNING id)
INSERT INTO ids SELECT 'amina_home', id FROM p;
WITH p AS (INSERT INTO profiles (kind, owner_account_id, name) VALUES ('person', pg_temp.i('amina'), 'Amina') RETURNING id)
INSERT INTO ids SELECT 'amina_person', id FROM p;

WITH x AS (INSERT INTO interactions (kind, from_account_id, to_profile_id, offering_id, customer_door_id)
           VALUES ('pickup_request', pg_temp.i('amina'), pg_temp.i('laundry'), pg_temp.i('laundry_offer'), pg_temp.i('amina_home')) RETURNING id)
INSERT INTO ids SELECT 'req1', id FROM x;
-- a second request that never gets completed, for the rating rule
WITH x AS (INSERT INTO interactions (kind, from_account_id, to_profile_id, offering_id)
           VALUES ('booking', pg_temp.i('amina'), pg_temp.i('laundry'), pg_temp.i('laundry_offer')) RETURNING id)
INSERT INTO ids SELECT 'req_pending', id FROM x;

DO $$ DECLARE failed boolean := false;
BEGIN
  -- before acceptance nothing is revealed and release is refused
  ASSERT (SELECT count(*) FROM get_released_address(pg_temp.i('req1'), pg_temp.i('wanjiru'))) = 0, 'no address before acceptance';
  BEGIN PERFORM release_address(pg_temp.i('req1'), pg_temp.i('wanjiru')); EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'release must be refused before the request is accepted';

  UPDATE interactions SET status = 'accepted' WHERE id = pg_temp.i('req1');
  ASSERT (SELECT count(*) FROM get_released_address(pg_temp.i('req1'), pg_temp.i('wanjiru'))) = 0, 'accepted but not yet released shows nothing';

  failed := false;
  BEGIN PERFORM release_address(pg_temp.i('req1'), pg_temp.i('mwangi')); EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'someone who does not work for the provider cannot release the address';

  PERFORM release_address(pg_temp.i('req1'), pg_temp.i('wanjiru'));
  ASSERT (SELECT address_text FROM get_released_address(pg_temp.i('req1'), pg_temp.i('wanjiru'))) = 'House 12, Green Estate',
    'the provider sees the address once released';
  ASSERT (SELECT count(*) FROM get_released_address(pg_temp.i('req1'), pg_temp.i('mwangi'))) = 0, 'an outsider still sees nothing';
  ASSERT (SELECT count(*) FROM interaction_events WHERE interaction_id = pg_temp.i('req1') AND event = 'address_released') = 1, 'the release is logged';
  ASSERT (SELECT count(*) FROM interaction_events WHERE interaction_id = pg_temp.i('req1') AND event = 'address_viewed') >= 1, 'each view is logged';

  UPDATE interactions SET status = 'completed', closed_at = now() WHERE id = pg_temp.i('req1');
  ASSERT (SELECT count(*) FROM get_released_address(pg_temp.i('req1'), pg_temp.i('wanjiru'))) = 0, 'the address is hidden again once the request closes';

  -- the offering must belong to the profile it is requested from
  failed := false;
  BEGIN INSERT INTO interactions (kind, from_account_id, to_profile_id, offering_id)
        VALUES ('booking', pg_temp.i('amina'), pg_temp.i('cyber_b'), pg_temp.i('laundry_offer'));
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'an offering from another profile must be rejected';
END $$;

-- ------------------------------------------------------------ ratings
DO $$ DECLARE failed boolean := false;
BEGIN
  BEGIN INSERT INTO ratings (interaction_id, rater_account_id, target_offering_id, score) VALUES (pg_temp.i('req_pending'), pg_temp.i('amina'), pg_temp.i('laundry_offer'), 5);
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'an interaction that is not completed cannot be rated';

  INSERT INTO ratings (interaction_id, rater_account_id, target_offering_id, score) VALUES (pg_temp.i('req1'), pg_temp.i('amina'), pg_temp.i('laundry_offer'), 5);
  INSERT INTO ratings (interaction_id, rater_account_id, target_profile_id, score)  VALUES (pg_temp.i('req1'), pg_temp.i('amina'), pg_temp.i('laundry'), 2);
  ASSERT (SELECT display_rating FROM offering_ratings WHERE offering_id = pg_temp.i('laundry_offer')) = 4.2,
    'one 5-star rating displays as 4.2 (pulled toward the neutral 4.0)';
  ASSERT (SELECT display_rating FROM profile_ratings WHERE profile_id = pg_temp.i('laundry')) = 3.7,
    'the door and the machine are rated separately (a good machine, a weaker shop)';

  failed := false;
  BEGIN INSERT INTO ratings (interaction_id, rater_account_id, target_offering_id, score) VALUES (pg_temp.i('req1'), pg_temp.i('amina'), pg_temp.i('laundry_offer'), 1);
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'rating the same thing twice must be rejected';

  failed := false;
  BEGIN INSERT INTO ratings (interaction_id, rater_account_id, target_profile_id, score) VALUES (pg_temp.i('req1'), pg_temp.i('amina'), pg_temp.i('cyber_b'), 1);
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'a customer cannot rate a shop they never dealt with';

  failed := false;
  BEGIN INSERT INTO ratings (interaction_id, rater_account_id, target_profile_id, score) VALUES (pg_temp.i('req1'), pg_temp.i('mwangi'), pg_temp.i('laundry'), 1);
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'someone outside the interaction cannot rate it';

  failed := false;
  BEGIN INSERT INTO ratings (interaction_id, rater_account_id, target_profile_id, target_offering_id, score)
        VALUES (pg_temp.i('req1'), pg_temp.i('amina'), pg_temp.i('laundry'), pg_temp.i('laundry_offer'), 3);
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'a rating must target exactly one thing';

  -- the provider can rate the customer
  INSERT INTO ratings (interaction_id, rater_account_id, target_profile_id, score) VALUES (pg_temp.i('req1'), pg_temp.i('wanjiru'), pg_temp.i('amina_person'), 5);

  failed := false;
  BEGIN INSERT INTO ratings (interaction_id, rater_account_id, target_profile_id, score) VALUES (pg_temp.i('req1'), pg_temp.i('wanjiru'), pg_temp.i('kamau_person'), 5);
  EXCEPTION WHEN OTHERS THEN failed := true; END;
  ASSERT failed, 'a provider can only rate the customer they served';
END $$;

-- ------------------------------------------------------------ direct access is locked down
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname <> 'schema_migrations' AND NOT c.relrowsecurity) = 0,
    'every table must have row level security enabled';
END $$;

CREATE ROLE qaribu_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO qaribu_anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO qaribu_anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO qaribu_anon;
SET LOCAL ROLE qaribu_anon;
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM accounts) = 0,            'an anonymous role must not read accounts';
  ASSERT (SELECT count(*) FROM profiles) = 0,            'an anonymous role must not read profiles (including customer addresses)';
  ASSERT (SELECT count(*) FROM interactions) = 0,        'an anonymous role must not read interactions';
  ASSERT (SELECT count(*) FROM profile_ratings) = 0,     'views must respect the lockdown too';
  ASSERT (SELECT count(*) FROM search_offerings(-1.2921, 36.8219, 5, 'printer')) = 0, 'search through an anonymous role returns nothing';
END $$;
RESET ROLE;

-- ------------------------------------------------------------ bookkeeping
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM schema_migrations WHERE version = 1) = 1, 'migration 001 is recorded';
END $$;

SELECT 'ALL TESTS PASSED' AS result;

ROLLBACK;
