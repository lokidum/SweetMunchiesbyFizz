# Implementation decisions and launch status

This is the first deployable build, not an approved live commerce launch.

## Resolved contradictions
- Kheer is the featured hero, but stays `featured` rather than purchasable `live`. The supplied brief forbids publishing incomplete food details, and prices, portions, allergens and photos were not supplied.
- The two address references disagree. Only Guildford, Western Sydney is public. No invented street number, pickup slot, phone, social link or opening time.
- Food imagery is original CSS/Three.js packaging concept artwork. It is labelled on dessert pages. It is not a photograph of Fizz's food.
- No unapproved Urdu or family business references appear.
- The Sites preview uses Vinext with the supplied hosting integration. Source follows Next App Router and includes a separate Vercel build configuration using Next.js 16.4.5.
- Next.js 16.4.5 and its exact platform package versions were explicitly allowed past the installer's seven-day age delay to satisfy the requested patched release. The general age policy remains intact.
- Fonts are downloaded and self-hosted via CSS. Font source is Google Fonts; no reference-site font or asset was used.
- No persistent browser storage contains customer details or credentials. The cart uses localStorage; admin tokens are in memory.

## Admin access (changed 5 November 2026)
- At the client's request the admin uses one email and password account instead of ChatGPT sign-in or Supabase Auth roles. This replaces the brief's owner and agency roles and its authenticator-app second factor; revisit if more staff need access.
- The account lives only in server environment variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (PBKDF2-SHA256, 210,000 iterations) and `ADMIN_SESSION_SECRET`. Generate them with `node scripts/hash-admin-password.mjs <email>`. Never commit them; locally they sit in the gitignored `.env.local`.
- Sessions are an HMAC-signed, HttpOnly, SameSite=Strict cookie lasting 12 hours. Admin writes also check the request origin. Login attempts are limited per IP on each server instance.
- `/admin` is checked on the server and shows only the login form until signed in. Without a database the signed-in panel stays in preview mode.
- The Sites host's own ChatGPT sign-in wall is a hosting setting, not site code. It does not exist on Vercel.

## Implemented
- Responsive 13-dessert shelf, next/previous, keyboard, wheel and touch navigation; per-dessert colours.
- Branded loading screen driven by logo/font readiness, repeated-visit skip and reduced-motion handling.
- Procedural 3D packaging with CSS fallback, floating ingredients, hover movement and `meetha` petal easter egg.
- Menu takeover, cart drawer and quantity controls, notification sheet with separate unticked marketing consent.
- Server-rendered public pages and dessert details, sitemap, robots, real 404 handling, preview noindex.
- Admin preview, Supabase-backed login and server-side role checks, dessert editing and publish-field validation, orders/customer/waitlist/enquiry read views, audited CSV export.
- Supabase SQL migrations, seed, RLS and service-role-only functions for transactional waitlist/consent creation and unsubscribe.
- Server validation, payload limits and Upstash rate limiting for public form writes and login.
- Square payment-link adapter and cryptographic signature verification utility, not wired into checkout yet.

## Still required before commerce launch
- Supabase and Upstash provisioning; execute migrations; create owner/agency accounts with app_metadata roles; disable public signup; add MFA and reset-password flows.
- Confirm all prices, allergens, portions, stock, date/time, pickup location, contact details and policies with Fizz.
- Square stock reservations, pickup slot booking, webhook persistence/idempotency, cancellation-safe hold expiry, confirmation and sandbox race testing. Checkout intentionally returns 503 until this is complete. Supplying Square keys alone will not open checkout.
- Square catalog synchronisation, POS fulfilment verification, GST treatment and a real authorised test payment.
- Resend/SMS delivery adapters, outbox worker, retries, consent-at-send check, STOP webhook, campaign preview/approval/test-send UI, delivery webhooks. No marketing or alert messages are sent by this build.
- Stops/drops editor and connection to public locations, order status actions, dashboard reporting and customer detail editing.
- Turnstile front-end and server validation before public form launch. Upstash gate prevents writes without rate limiting but is not a CAPTCHA replacement.
- Real food photos, video/frame sequences, skinned bag open/burst model, shader Pour, package opening transition and scroll-scrubbed food action. The current loader and procedural stage are a first motion pass, not the full storyboard.
- Product media upload pipeline, nutrition icon artwork, final approved copy and per-product FAQs/schema/share images.
- Production device QA, accessibility audit, Lighthouse budgets, payment tests, schema tests and Search Console setup.
- GitHub/Vercel project connection, custom domain, DNS, sender domain, production service credentials. Private Sites hosting is a review destination, not the client's Vercel deployment.
