# NikoSoko

Digital business cards, ratings and verification for Kenyan tradespeople, and a way for clients to find them nearby.

Stack: React 19 + Vite + Tailwind 4 (client), Express 5 + sql.js (server), Firebase (auth profile sync), Twilio Verify (SMS OTP), M-Pesa Daraja (STK push).

## Run locally

```sh
npm install
cp .env.example .env   # fill in Twilio and M-Pesa values, or leave blank for local dev
npm run dev            # starts the Express server with Vite middleware on port 3000
```

Other scripts: `npm run build` (client + server bundle into `dist/`), `npm start` (run the built server), `npm run lint` (type check).

## Data

The server keeps a SQLite database in `database.sqlite` in the working directory and uploaded images in `uploads/`. Both are local files: they are lost if the host's disk is not persistent. The schema in `db/migrations/001_core.sql` is the target for a move to a hosted database.

## Layout

- `server.ts`: API routes (auth, providers, catalogue, bookings, M-Pesa, check-ins) and static serving
- `App.tsx`: app shell and page routing
- `components/`: screens and modals; `components/admin/` holds the admin dashboard
- `services/`: API client, Firebase, mock data
- `utils/trustEngine.ts`: how a provider's trust score is calculated
- `public/`: manifest, service worker, icons, robots.txt, sitemap.xml
- `firestore.rules`: Firestore security rules
