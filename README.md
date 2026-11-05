# Sweet Munchies by Fizz

A deployable first build of the Sweet Munchies storefront and administration foundation. Read `DECISIONS.md` for exact scope and outstanding launch gates. This is not yet a live ordering system.

## Run

Node 22.13 or later, pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The hosted review build uses Vinext. For the client's Vercel deployment, `vercel.json` selects the standard Next.js App Router build:

```sh
pnpm exec next build
pnpm exec next start
```

## Check

```sh
pnpm exec tsc --noEmit
node --test tests/core.test.mjs
node tests/http-smoke.mjs http://localhost:4173
```

## Data and auth

1. Create a client-owned Supabase project in Sydney. Execute `supabase/migrations/001_foundations.sql`, then `002_seed.sql`.
2. Admin login: run `node scripts/hash-admin-password.mjs <email>`, type the password, and add the three printed lines (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`) to the hosting environment. Locally they go in `.env.local`. Restart the server after changing them.
3. Add server environment variables from `.env.example` through the hosting dashboard. Do not commit credentials.
4. Configure Upstash. Public writes and login fail closed without rate limiting.
5. Review RLS and execute integration tests using a separate sandbox database. No customer table is directly exposed to anonymous/authenticated browser users.
6. Visit `/admin` and sign in. Without a database the signed-in panel is a clearly labelled preview that edits only in-memory data.

## Vercel handoff

Create a private GitHub repository under the agreed owner, push this source, import into the client's commercial Vercel plan, and retain `vercel.json`. Configure environment variables for each deployment environment. Add the exact domain in Vercel, then copy the records Vercel supplies into Cloudflare as DNS-only records. Do not invent DNS values. Keep `PUBLIC_LAUNCH=false` until the launch gates are complete. Set the real `NEXT_PUBLIC_SITE_URL` before production indexing.

See `docs/fizz-guide.md` for daily menu editing, `docs/BUILD_PROMPT.md` for the original requested scope and `docs/design.md` for the supplied visual system.
