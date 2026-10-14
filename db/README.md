# Database (PostgreSQL)

The server owns one PostgreSQL database. Clients never connect to it directly.
Design and reasoning: see the architecture doc, section 8.

## Setup

1. Create a PostgreSQL 15+ database (Supabase, Neon, Railway or your own). Choose a region close to Kenya.
2. Put its connection string in the server's `.env` as `DATABASE_URL`. Never commit it or paste it into chat.
3. Apply the schema once:

       psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_core.sql

   Re-running it is refused ("already applied"). Later changes are new numbered files (`002_...sql`).

## Tests

Run against a scratch database that has had the migration applied (never production). The test rolls back
everything it creates:

    psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/tests/001_core_test.sql

It prints `ALL TESTS PASSED`. It covers: one account holding different roles on different profiles, the
premise/door hierarchy rules, private customer doors, nearest-printer search with capability matching,
the controlled release and logging of a customer's address, rating rules, and the lockdown against
direct anonymous access.

## Rules

- Row level security is on for every table with no policies, so only the server (the table owner) can read
  or write. Keep it that way, especially on hosts that expose tables through an API key.
- A new profile kind, offering type, CTA or interaction kind is data. A new table needs an architecture review.
