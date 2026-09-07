# ClickLens

A focused URL shortener with a private workspace and click analytics. Built with Next.js 16 App Router, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma 6, and Recharts.

## Run locally

Requires Node.js 22 or newer and npm.

```sh
npm install
npm run db:local
```

Keep that terminal open. The development helper starts a **real PostgreSQL server**, bound to `127.0.0.1:55432`, with its own database and newly generated credentials. It creates `.env` only if that file does not exist. Database files and credentials live in ignored `.local/`; restarting preserves your data. No Tracebit credentials are read or reused. The helper is for local development only.

In a second terminal:

```sh
npm run db:generate
npm run db:migrate
npm run dev
```

Open <http://localhost:3000> and create an account. The workspace starts empty; all displayed data comes from PostgreSQL.

### Use an existing PostgreSQL server

Instead of `db:local`, copy `.env.example` to `.env`, provide a **dedicated ClickLens database** in `DATABASE_URL`, generate a fresh `AUTH_SECRET`, and set `APP_URL` to your application's public origin. Then run the migration and application commands above. Do not copy an environment file from another project.

Generate a secret:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Features

- Registration, login, logout, and seven-day database sessions.
- Automatic or custom short slugs; validated HTTP(S) destinations.
- Public `/<slug>` redirects with a timestamp and referrer origin recorded for every successful GET.
- Overview with total links, total clicks, seven-day activity, and recent links.
- Searchable, paginated link library with copy, edit, and confirmed deletion.
- Aggregate and per-link analytics: all-time totals, 7/30-day stats, zero-filled daily chart, referrers, and latest 15 clicks in the selected period.
- Responsive pages, loading skeletons, empty states, inline validation, retryable errors, and success feedback.

## Authentication adapted from Tracebit

Inspected Tracebit's `src/lib/auth.ts`, `password.ts`, `prisma.ts`, `workspace.ts`, authentication actions, protected layout, and Prisma schema before implementation.

ClickLens preserves its approach: per-password random salts with Node's asynchronous scrypt and timing-safe comparison; random session tokens signed with HMAC-SHA256; only token hashes stored in PostgreSQL; HTTP-only, SameSite=Lax cookies with seven-day expiration and Secure enabled in production; server actions for login/registration/logout; server-side session checks and protected layouts.

ClickLens uses its own `clicklens_session` cookie and requires a dedicated `AUTH_SECRET` of at least 32 characters, with no database-URL fallback. Login rotates the current session, logout removes the database session, expired sessions cannot authorize access, and safe user projections exclude password hashes. Next.js Server Actions enforce same-origin requests. Every protected page and mutation authenticates independently; edit/delete predicates and all analytics queries are scoped to the authenticated owner. Unknown and unowned link IDs both produce a not-found response. Passwords are 8�128 characters; emails are normalized; duplicate emails and slugs are handled without uncaught database errors.

No Tracebit secrets, environment files, credentials, or issue/project logic were copied.

## Data and click behavior

`User` has many `Link` and `Session` records. `Link` belongs to one `User` and has many `Click` records. Foreign keys cascade on deletion. Indexes support owner queries, session expiry, and click histories.

Slugs are globally unique, lowercase, 3�48 characters when customized; application paths are reserved. Automatic slugs use 6 random bytes. Editing a slug retires its previous URL; click history stays attached to the link ID. Deleting a link also deletes its clicks.

Redirects return **302** with `Cache-Control: no-store`. Click persistence is awaited before returning the redirect; a database failure returns 503 with a retry hint rather than silently dropping analytics. HEAD requests return 405 without counting a click. Counts represent GET requests, including repeat visits and bots, not unique visitors. Link scanners may therefore contribute clicks.

Referrers are normalized to their HTTP(S) origin to avoid retaining paths, query parameters, or embedded credentials. Missing/invalid referrers appear as Direct / Unknown. No IP, location, or device information is collected. Day buckets use UTC, including today and the preceding 6 or 29 calendar days. No sample data is served by the application.

## Checks

With the configured PostgreSQL database running:

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser test launches a development server if needed. It creates isolated temporary accounts, runs registration/login/logout and session-expiry checks, creates custom/automatic links, checks collisions and redirects, verifies real click counts and date ranges, copies/searches/edits/deletes links, and replays mutation requests under another account to test server-side authorization. Its records are removed afterward. Screenshots are written to ignored `.local/` for visual review. Run against a development or test database.

The `deepmerge-ts` override selects the patched 8.x release for Prisma's configuration dependency.

## Production

Set a dedicated PostgreSQL `DATABASE_URL`, a fresh `AUTH_SECRET`, and an HTTPS `APP_URL` in your hosting environment. Run `npm run db:migrate`, `npm run build`, and `npm start`. Secure session cookies require HTTPS. Use the Node.js runtime, not a static export. Apply appropriate database backups and infrastructure-level rate limits before opening registration to the public. The local PostgreSQL helper is not a production service.

Geographic/device tracking, QR codes, subscriptions, and other advanced features are deliberately outside this MVP.
