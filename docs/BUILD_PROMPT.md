# Build prompt: Sweet Munchies by Fizz

Paste this into a new coding session with `design.md` and the logo in the project root. It is written for an AI coding agent or a senior developer.

---

## 0. Your role and how to work

You are a senior creative developer. You build award-level WebGL marketing sites and also ship reliable commerce systems. Build a production website for **Sweet Munchies by Fizz**, a Pakistani dessert food truck business based on Woodville Road, Guildford, in Western Sydney.

Rules for the session:

1. Read `design.md` in full before writing code. It controls look, feel and motion.
2. Use Australian English in all copy. Never use em dashes or en dashes in any copy, comment or commit message.
3. Fetch current documentation for Next.js, Square, Supabase, GSAP and React Three Fiber before coding against them. Do not rely on memory.
4. Work through the phases in section 15 in order. Stop at the end of each phase, run it, screenshot it, and report what works.
5. Where section 16 has an unanswered question, use the stated default and keep a list in `DECISIONS.md`.
6. Never put a secret in client code. Never trust a price, stock count or role that came from the browser.

---

## 1. What we are building

Four things in one codebase:

| Part | Who | What |
| --- | --- | --- |
| **Viewer site** | Customers | Immersive loader, 3D intro, dessert shelf, dessert pages, cart |
| **Ordering** | Customers | Cart summary handed to Square for payment |
| **Notify me plus CRM** | Customers and Fizz | Waitlists for unavailable desserts, customer list, promos |
| **Admin** | Fizz | Log in, mark available or not, set dates, see orders, grab CRM data, send alerts |

**The business model that drives everything:** Fizz sells 1 or 2 hero dishes each week, growing over time. Every dessert stays visible all the time. Anything not live this week shows **Notify me**, which captures an email and phone number. When it returns, those people are told, and they come back and buy. That list also powers promos like "It's hot today, come get dessert".

**This week's hero dish is kheer.**

**The non-negotiable:** Fizz is not technical. If she cannot run the week from her phone in under two minutes, the build has failed.

---

## 2. The inspiration, analysed

Reference site: https://www.fixchocolatier.com. I inspected it on desktop in a real browser and went through a phone screen recording. This is what it actually does.

### Stack found in its production bundles

- Next.js with Turbopack builds, Tailwind utility classes
- Three.js through React Three Fiber
- GSAP including ScrollTrigger, plus Lottie and Hls.js references in the bundles
- 4 GLB models: `solo_bar`, `bar_mini`, `mini_boxes`, `bag_drop_sequence_skeleton`. The last is a skinned, animated bag
- An EXR studio environment map for reflections
- 17 full-size and 7 mini WebP wrapper textures applied to shared models
- One full-screen canvas, which rendered at 3456 x 1944 on a 1920 x 1080 viewport
- 16 `<video>` elements for ingredient loops masked on product pages, delivered through Vimeo
- `--page-bg` CSS variable changed per product, for example `#df1c25` and `#b1dffa`
- Home page body is `overflow: hidden`, so the carousel runs on captured wheel and touch input, with no native scrolling
- No video file loads during the intro, so the chocolate sheet is most likely a fragment shader. That is my inference, I did not read the shader source

### Measured intro timeline

Sampled from timed screenshots on desktop, so treat each as plus or minus 0.3 seconds. Time is from navigation start.

| Time | What happens |
| --- | --- |
| 0 to 3.3s | Flat dark brown screen, dim percentage counter |
| 3.6s | Gold foil logo fades in, sheet warms up |
| 4.2s | Glossy chocolate sheet fills the screen with moving highlights |
| 4.7s | "ORIGINAL" appears in gold foil with a script "The" across it |
| 5.1s | "DUBAI CHOCOLATE" lines stack in, drips start rising from the bottom edge |
| 5.1 to 6.5s | Drips travel up the screen, revealing the warm brown stage. The gold type gets wiped away by the drip edge |
| 6.7s | Nav and dripping logo fade in |
| 7.0s | Gift bag drops into frame, with a shadow |
| 7.7s | Camera pushes into the bag until it fills the frame |
| 8.1s | Bars burst upwards out of the bag with depth of field blur |
| 8.8 to 9.8s | One bar tumbles forward, spins edge-on, then settles with a shadow |
| 10.3s | Caption track fades in below |
| 11.0s | Neighbouring bars slide in on both sides, the carousel is live |

### Carousel

- **Desktop:** horizontal arc. Centre item large, neighbours smaller, angled, and further back.
- **Phone:** vertical. Neighbours peek above and below, heavily blurred.
- Wheel or swipe moves it. During movement, bars tilt and get motion blur. On release they snap with a small settle.
- Cursor position tilts the whole set in 3D.
- Caption track moves in sync, active name in gold.

### Product transition and page

1. Click the centre bar. An organic liquid blob in the product colour spreads from the middle.
2. The bar scales up and rises.
3. The wrapper tears away to reveal the real bar.
4. Title arrives, heavy caps with a script word overlaid.
5. Ingredients float at different depths.
6. Scroll: real hands break the bar, heading and copy appear, a giant curved text band sits behind broken pieces, ingredients list and allergens, wrapper returns, footer.

**Note:** FIX has no cart on its site, it sends people to a delivery app. Ours needs commerce on top of all this.

### Where we should beat it

- Its loader is 3 seconds of nothing. Ours is a toy.
- Its intro takes 8 seconds after loading. Ours targets 5, with a shorter repeat version.
- It loaded a lot of data on first visit. Ours has strict budgets (section 12).
- Its cookie banner covers the best moments. We avoid needing one.

---

## 3. Hard rules on the inspiration

Copy the **behaviour, pacing and level of craft**. Do not copy the **assets or expression**.

Never take FIX's models, textures, wrappers, photos, video, copy, product names, puns, logo treatment, fonts or code, and never download assets from their site. All 3D, art, photography and copy for this project must be original or owned by the client.

---

## 4. Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** App Router, TypeScript strict | Same family as the reference. Install the newest patched release. A security release was scheduled for 3 November 2026, so check the advisory and do not pin below it |
| Styling | Tailwind CSS plus CSS variables | Tokens from `design.md` |
| 3D | **three, @react-three/fiber, @react-three/drei** | Proven by the reference, and the shelf can be data-driven |
| Animation | **GSAP** with ScrollTrigger, Observer, SplitText, CustomEase | All plugins are now free for commercial use |
| Smooth scroll | **Lenis** on dessert pages only | The home shelf uses GSAP Observer on captured input, since the reference locks native scrolling too |
| Database and auth | **Supabase**, Sydney region `ap-southeast-2` | Postgres, Row Level Security, auth. Use Pro, because free projects pause after a week idle and have no daily backups |
| Payments | **Square** Node SDK, Checkout API payment links | See section 8 |
| Email | **Resend** with React Email | Free tier caps at 100 a day, so a waitlist blast will outgrow it quickly. Plan on Pro |
| SMS | **Mobile Message** behind a provider interface | Australian, about A$0.03 to A$0.04 per SMS, no monthly fee. Twilio stays a drop-in option |
| Media | **Cloudflare R2** for video and frame sequences, Next Image for photos | Domain DNS is already at Cloudflare, and R2 has no egress fees |
| Bot protection | Cloudflare Turnstile plus Upstash rate limiting | Public forms get hit quickly |
| Analytics | Vercel Web Analytics | Cookieless, so no consent banner needed |
| Errors | Sentry | Fizz will never tell us it broke |
| Validation | Zod | On every server boundary |
| Hosting | **GitHub to Vercel Pro** | Hobby does not allow commercial use, so this has to be Pro |
| DNS | **Cloudflare, DNS only** (grey cloud) | Vercel advises against a proxy in front of it. Orange cloud can break certificate issue and renewal |
| Testing | Playwright, Vitest, axe | Section 13 |

Do not add more services than this without a reason logged in `DECISIONS.md`.

---

## 5. Architecture

```
app/
  (site)/
    page.tsx                  home: loader, intro, shelf
    this-week/page.tsx        hero page, this week's dish or dishes
    desserts/page.tsx         all desserts
    desserts/[slug]/page.tsx  dessert page with Hero Card
    locations/page.tsx        where to find the truck
    locations/[slug]/page.tsx only for real, repeating stops
    about/page.tsx            Fizz and the family
    contact/page.tsx          enquiries, catering, events
    faq, privacy, terms, unsubscribe
    order/[id]/page.tsx       confirmation, noindex
    not-found.tsx             custom 404
    error.tsx                 custom 500
    opengraph-image.tsx       generated share images
  sitemap.ts, robots.ts, manifest.ts, llms.txt/route.ts
  admin/
    login, page (this week), desserts, drops, stops, orders,
    customers, enquiries, messages, settings
  api/
    cart/quote                server-side price and stock check
    checkout                  creates Square payment link
    notify                    waitlist sign up
    unsubscribe
    webhooks/square           signature verified
    webhooks/sms              STOP handling
    cron/outbox               sends queued messages
    cron/release-holds        expires stock holds
components/
  loader/  stage/ (R3F)  shelf/  dessert/  cart/  notify/  admin/
lib/
  square/  messaging/ (email + sms adapters)  supabase/  motion/  device-tier.ts
```

**Rendering:**

- Marketing and dessert pages are static with on-demand revalidation. Saving in admin revalidates the affected paths, so Fizz sees changes within seconds without a redeploy.
- Live stock on a page is fetched client-side from a small cached endpoint, so a cached page can never oversell.
- The 3D stage lives in the root layout and persists across routes, with one canvas. The transition from shelf to dessert page must not reload it.

---

## 6. Data model

Create with SQL migrations in `supabase/migrations`. Enable RLS on every table. Public site reads go through published views or server code. Nothing with customer data is readable by the anon key, ever.

```
desserts
  id, slug, name, fun_name, short_desc, story, ingredients text,
  allergens text[], may_contain text[], portion_note, sort_order,
  price_cents, currency default 'AUD',
  vibes text[]           -- 2 or 3 short tags for the Hero Card
  rating_sweetness, rating_addiction, rating_calories  -- integer, check 1 to 5
  what_is_it             -- 40 to 60 word plain answer, see section 20
  faqs jsonb             -- question and answer pairs
  seo_title, seo_description, hero_image_alt
  world jsonb            -- pageBg, textColour, accent
  package_format         -- bag, box, can, cup, pot, tin, tray, tub, mithai_box
  wrapper_url, hero_image_url, frames_url, video_url, floating_items jsonb,
  square_catalog_id, square_variation_id,
  status                 -- live, sold_out, back_soon, kitchen, hidden
  available_from, available_until, low_stock_threshold,
  recipe_stage           -- internal only, never public
  created_at, updated_at

drops                    -- one weekly menu
  id, title, starts_at, ends_at, order_cutoff_at, notes, is_published

drop_items
  drop_id, dessert_id, quantity_total, quantity_sold, quantity_held, is_hero

locations
  id, name, address, lat, lng, notes

pickup_slots
  id, drop_id, location_id, starts_at, ends_at, capacity, booked

truck_stops              -- drives the Locations page
  id, location_id, starts_at, ends_at, note, is_public

enquiries                -- from the Contact page
  id, name, email, phone, type (general|catering|event|other), event_date,
  guests, message, status (new|replied|closed), created_at

slug_redirects           -- so a renamed page never turns into a 404
  old_path, new_path, created_at

customers
  id, email citext unique, phone_e164 unique, first_name, suburb,
  source, first_seen_at, last_order_at, order_count, total_spent_cents,
  square_customer_id, notes, tags text[]

consents                 -- append only, this is the legal record
  id, customer_id, channel (email|sms), purpose (back_in_stock|marketing),
  status (granted|withdrawn), wording_shown, form_location,
  ip_hash, user_agent, created_at

waitlist
  id, customer_id, dessert_id, created_at, notified_at, converted_order_id

orders
  id, public_ref, customer_id, drop_id, pickup_slot_id, status
  (pending|paid|ready|collected|cancelled|refunded|expired),
  subtotal_cents, tax_cents, total_cents, square_order_id,
  square_payment_id, payment_link_url, hold_expires_at, created_at

order_items
  order_id, dessert_id, name_snapshot, unit_price_cents, quantity

campaigns
  id, name, channel, purpose, segment jsonb, subject, body, status
  (draft|scheduled|sending|sent|cancelled), scheduled_at, sent_at, created_by

message_outbox
  id, campaign_id, customer_id, channel, to_address, payload jsonb, status,
  attempts, provider_id, error, created_at, sent_at
  unique (campaign_id, customer_id, channel)

site_settings            -- key value: easter egg toggles, banner, skin, hot day
admin_audit              -- who did what, including every CSV export
```

**Roles:** `owner` (Fizz) and `agency` (Nunik Co.). Store the role in Supabase `app_metadata`, which users cannot change. Disable public sign-ups.

**Stock logic:** `available = quantity_total - quantity_sold - quantity_held`. All changes happen in a single Postgres function with row locking, so two customers can never buy the last one.

---

## 7. Viewer site

### 7.1 Loader and intro

Implement exactly as `design.md` section 7 describes.

- The loader is inline SVG and CSS in the initial HTML, so it paints at once.
- Drive progress from real loading of the critical set only (stage model, hero dish model, its texture, environment map).
- Crumbs: use a light 2D canvas, not the WebGL scene.
- First session visit gets the full sequence. A `sessionStorage` flag gives repeats a 1 second version, wrapped in try/catch.
- Deep links to `/desserts/kheer` skip the full intro and show a short crumb loader.
- The Pour is a fragment shader on a full-screen plane: noise-driven drip height, two-tone mixing of chocolate and rose, fake specular highlights. Fall back to a pre-rendered WebM and MP4 on low tier devices.
- The carry bag is a skinned GLB with baked animation clips: `drop`, `open`, `burst`.
- Packages in the burst are instanced, using each dessert's wrapper texture.
- The hero is always read from the current drop, so changing the dish needs no code.

### 7.2 The shelf

- Horizontal on any device 768px wide and up, including iPad in either orientation. Vertical on phones. Decide with `gsap.matchMedia`.
- Input: GSAP Observer for wheel, touch and pointer. Arrow keys and swipe. Inertia with snap to index.
- Velocity drives package lean and a motion blur pass (skip the blur on mid tier).
- Cursor tilts the group. Idle sway on touch devices, using a sine wave, no gyroscope permission prompts.
- **Sort order:** hero items first, other live items next, then scheduled, sold out, back soon, kitchen.
- Under the active caption, show a stamp plus a button: **Add to box** or **Notify me**.
- Under the canvas keep a real, crawlable `<ul>` of links to every dessert. This is what screen readers, search engines and no-WebGL visitors use.

### 7.3 Dessert page

Follow the scroll storyboard in `design.md`.

**The Hero Card comes first.** Clicking a dessert plays the transition, the wrapper opens, and the Hero Card slides out of it. Direct visitors get the card straight away, already server-rendered. It holds:

- Status stamp
- Hero image of the dish
- Plain name in the page's only `<h1>`, with the fun name as a script overlay
- Vibe tags
- Description
- **Sweetness** out of 5, shown with roses
- **Addiction** out of 5, shown with chocolate chips
- **Calories** out of 5, shown with pistachios
- Price with **Add to box**, or **Notify me**

Rules for the ratings:

- Whole numbers from 1 to 5. Seed them from the table in section 18, and Fizz can change any of them in admin.
- Build one `<RatingRow>` component used 3 times, with `role="img"` and an `aria-label` such as "Sweetness: 4 out of 5".
- Show this under them: "Fizz's own taste ratings, just for fun. Not nutrition information."
- The calorie rating is a playful opinion and not a measurement. A low score must never read as "low calorie", because that wording can become a regulated nutrition claim. Keep the copy jokey, and have it checked along with the food labelling.
- **Never output these ratings as `Review`, `Rating` or `AggregateRating` structured data.** See section 20.

Other requirements:

- Scroll-scrubbed food moments use **WebP frame sequences on canvas**, not `<video>` seeking. Video seeking stutters unless every frame is a keyframe, and that makes for huge files. Budget 60 to 90 frames at 1280px on desktop and 720px on phone. Lazy load, starting from the first frames.
- Ambient loops, like milk being poured, can be normal muted looping video with `playsInline`, masked with CSS.
- Text must always be real HTML over the canvas.
- Show ingredients and allergens as text on every dessert page.
- Add the structured data listed in section 20.

### 7.4 Cart and checkout

1. **Add to box** updates a client cart stored in `localStorage`, wrapped in try/catch.
2. The drawer shows items, a pickup slot picker, notes, and the marketing tick box (unticked).
3. **Pay with Square** calls `/api/checkout`. The server re-reads prices and stock, creates an `orders` row, holds stock for 15 minutes, then creates a payment link and redirects.
4. Square hosts the payment page.
5. The Square webhook marks the order paid, converts held stock to sold, updates the customer and sends confirmation.
6. An expired hold releases stock through a cron job.

If a dessert sells out while it sits in someone's cart, tell them nicely and offer **Notify me** on the spot.

### 7.5 Notify me

A sheet opened from any unavailable dessert.

- Fields: email, mobile (Australian format, stored as E.164). Require at least one, encourage both.
- Button copy: "Tell me when it's back". The text under it states exactly what they are agreeing to.
- Separate **unticked** box: "Also send me specials and truck news by email and SMS. Unsubscribe any time."
- Validate with Zod, Turnstile and rate limiting. Upsert the customer, write a `consents` row, add to `waitlist`. Repeat sign ups must not error or reveal whether an address exists.
- Show the heart sticker success state.

### 7.6 Hero page (`/this-week`)

The page Fizz shares every week from Instagram and in every SMS. The URL never changes, the content does.

- Reads the current published drop. One dish fills the page, two sit side by side.
- Shows the Hero Card, the order cutoff countdown, and this week's truck stops.
- Includes one plain sentence near the top, built from live data: "This week Sweet Munchies by Fizz is serving kheer at [place] on [day] from [time]." It must be real server-rendered text.
- Shows "Updated [date]" from the drop's last change.
- With no drop published, it shows a holding message and Notify me, and still returns a 200.

### 7.7 All desserts (`/desserts`)

A server-rendered grid of every public dessert, grouped by status, with a real link, image and name for each. This is the main internal linking hub.

### 7.8 About (`/about`)

The family story: Fizz, the restaurants and trucks they have run, why desserts and why now. Real photos. Written from a short interview with Fizz, not made up, and each business named only with her approval.

### 7.9 Contact (`/contact`)

- Enquiry form: name, email, phone, type (general, catering, event), event date and guest count when relevant, message.
- Zod, Turnstile and rate limiting. Saves to `enquiries`, emails Fizz, and appears in the admin Enquiries screen.
- An enquiry is not marketing consent. If we want to add them to the list, use a separate unticked box.
- Tap-to-call, email and social links as real links.

### 7.10 Locations (`/locations`)

- Next stop at the top, then upcoming stops, from `truck_stops`. Past stops drop off on their own.
- **Take me there** opens the device's maps app.
- Use a lazy static map image, not a live embed, on the first screen.
- Empty state with a Notify me if there are no public stops.
- Create a `/locations/[slug]` page only for a real place the truck returns to regularly, with something useful and unique to say about it.
- Show "Updated [date]".

### 7.11 404 and error pages

- `not-found.tsx` must return a **real HTTP 404 status**, not a 200 with sorry text.
- Include links to This Week, All desserts, Locations and Contact, plus the current hero dessert.
- An unknown `/desserts/[slug]` uses `notFound()`. Check `slug_redirects` first and return a 308 when there is a match.
- Sold out and unavailable desserts stay as 200 pages. They are never 404s.
- A dessert Fizz retires for good gets a 308 redirect to `/desserts`.
- `error.tsx` and `global-error.tsx` show the design's 500 page, report to Sentry, and show the phone number and Instagram.
- `noindex` on 404 and error pages. Log 404s so broken links get found.

---

## 8. Square integration

**Use the Checkout API (`CreatePaymentLink`) for version one, not the embedded Web Payments SDK.**

Why: Square hosts the card form, so card details never touch us. Wallet buttons appear based on the buyer's device. Square sends receipts automatically with this route, whereas an embedded Orders and Payments flow does not. The online rate is the same either way, 2.2 percent in Australia, compared with 1.6 percent in person.

Facts to design around:

- You cannot pass an existing order to `CreatePaymentLink`. Send the order in the request body and let Square create it. Use `reference_id` to tie it to our `orders.public_ref`.
- A payment link is for one buyer, so create one per checkout.
- **Turn tipping off explicitly**, or decide it with Fizz. Do not leave it to the default.
- Sandbox only tests cards. Apple Pay, Google Pay and Afterpay must be checked in production with a small real payment.
- Afterpay eligibility depends on seller category and purchase range, so do not promise it in copy until confirmed.

Requirements:

- Keep each dessert mapped to a Square catalog item. Saving a dessert in admin upserts it to Square, so Fizz edits in one place only and Square reporting stays clean.
- Verify webhook signatures. Make handlers idempotent, Square can send the same event twice.
- Listen for payment and order updates. Confirm the exact current event names in Square's docs.
- Prefill buyer details where the API allows it.
- Use pickup fulfilment so orders show correctly in Square Point of Sale on the truck. Confirm the field shape in the docs, the page I checked did not cover it.
- Keep sandbox and production credentials separate in Vercel environments.

---

## 9. Messaging

Everything goes through `message_outbox`, sent in small batches by cron, with retries. A failed send must never break a page.

### Automated

| Trigger | Email | SMS |
| --- | --- | --- |
| Order paid | Confirmation with pickup details | Short confirmation |
| Order marked ready | Optional | "Your box is ready" |
| Back in stock | When Fizz approves | When Fizz approves |

**Back in stock is never fully automatic.** Going live in admin shows "27 people are waiting for Kheer. Tell them now?" with a preview and a single button. She might want to wait until the truck is parked.

### Campaigns

Fizz picks an audience, writes or picks a template, sees how many people it will reach and what it costs, sends a test to herself, then sends or schedules.

Segments: everyone with marketing consent, waiting on dessert X, ordered dessert X, ordered in the last 30 days, not ordered in 60 days, suburb.

Templates: Hot day, Back in stock, New dessert, Truck location, Eid special.

### Hot day prompt

A daily cron checks the forecast for her location. At or above her threshold (default 32 degrees), it creates a **draft** campaign and shows a card in admin: "It's 36 tomorrow. Send the hot day message?" It never sends by itself. Check the licence terms of whichever weather API you choose, since this is a commercial use.

---

## 10. Australian compliance

Build these in from the start. This is engineering guidance rather than legal advice, so have the privacy policy and terms reviewed.

**Spam Act 2003**, which applies to every promo email and SMS and carries real penalties:

- **Consent:** express opt-in, stored in `consents` with exact wording, time and place. Never prefill the marketing tick box. Someone joining a waitlist has agreed to that alert, not to promos.
- **Identify:** every message names Sweet Munchies by Fizz with a way to contact the business.
- **Unsubscribe:** every commercial message has a working opt-out, processed automatically and immediately, even though the law allows up to 5 working days.
- Back in stock alerts promote a product, so treat them as commercial and include an unsubscribe. Only pure order updates skip it.
- The send function must check consent at send time, not at campaign creation.

**SMS Sender ID Register:** since 1 July 2026, alphanumeric sender IDs must be registered with the ACMA, otherwise messages show as "Unverified". Alphanumeric senders generally cannot receive replies, so "Reply STOP" will not work on them. **Default to a dedicated numeric number** so STOP works, or include a short unsubscribe link. Handle STOP through the provider webhook.

**Privacy:** publish a privacy policy, collect only what is used, offer deletion, keep customer data in Sydney, and log exports. Treat it as if the Privacy Act applies, whatever the business's turnover.

**Food:**

- Each dessert must show ingredients and allergens in plain English. Use the plain terms from the PEAL rules (milk, tree nuts, peanut, egg, wheat, soy, sesame).
- The publish check in admin blocks a dessert from going live with empty allergen fields.
- Allergen and ingredient data must come from Fizz. **Never invent it, including in seed data.**
- Do not write "halal" anywhere until Fizz confirms exactly what can be claimed.
- Fizz needs to confirm food business notification and any council approvals on her side.

**Trade marks:** Biscoff and Bueno are other companies' brands. Use them as plain ingredient descriptions at most, with no logos or look-alike packaging. Ask Fizz about names like "Bueno cups" before launch.

---

## 11. Admin

Mobile first. She will use this on her phone, next to a hot stove. Big buttons, few words. Use the brand lightly: cream background, cocoa type, painted header.

Login: email and password through Supabase Auth, with an authenticator app as a second factor for the agency account and offered to Fizz. Password reset by email. Admin routes are protected in middleware and again in every server action. Add `noindex`.

### Home: This Week

The screen she lands on.

- Big card: **This week: Kheer**, number sold, number left.
- Every dessert as a row with a thumbnail and one big control:

  `Live` / `Sold out` / `Back soon` / `In the kitchen` / `Hidden`

- Tapping a row opens stock quantity, available from date, available until date, and hero toggle.
- Save is instant with a clear confirmation. Undo stays available for a few seconds.
- If people are waiting, the prompt appears as soon as she flips something live.

### Other screens

| Screen | Does |
| --- | --- |
| Desserts | Add or edit name, photos, description, price, ingredients, allergens, colour, package format, vibes and the 3 ratings (tap 1 to 5 roses, chips and pistachios). Includes "What is it?", questions and image alt text. Live Hero Card preview |
| Drops | Set the week: dishes, quantities, order cutoff, locations, pickup slots. "Copy last week" button |
| Stops | Add where the truck will be, with date and time. "Copy last week" button |
| Enquiries | Contact form messages, marked new, replied or closed. Catering enquiries shown first |
| Orders | Today's list grouped by pickup slot. Mark ready, mark collected. Printable packing list |
| Customers | Search, filter, tags, order history, consent status. **Export CSV**, which is logged and includes consent status |
| Messages | Campaigns, templates, sends, delivered, unsubscribes, SMS cost |
| Waitlists | Who is waiting per dessert, ranked, so she can see what to make next |
| Dashboard | Sales this week, conversion from notify to order, top desserts, list growth |
| Settings | Truck strip text, hot day threshold, easter egg toggles, seasonal skin, staff accounts |

A dessert cannot go live until it has a price, allergens, a hero image with alt text, a description, vibes and all 3 ratings. Show her exactly what is missing, in plain words, with a link to fix it.

Show a plain-English empty state on every screen. Write a 1 page guide for Fizz with phone screenshots at `docs/fizz-guide.md`.

---

## 12. Performance

Set up these budgets in CI.

| Metric | Target |
| --- | --- |
| Loader first paint | Under 1 second on 4G |
| LCP (Lighthouse mobile, measured on content page) | Under 2.5 seconds |
| INP | Under 200ms |
| Initial JS on dessert page, before 3D | Under 200KB |
| 3D critical set on phone | Under 4MB |
| 3D critical set on desktop | Under 8MB |
| Frame rate on iPhone 12 or newer | Steady 60fps on the shelf |

Requirements:

- Dynamic import of the whole 3D layer, with `ssr: false`.
- GLB: Draco or Meshopt compression. Textures: KTX2. Reuse geometry between desserts and swap only the textures.
- Cap device pixel ratio at 2, or 1.5 on mid tier.
- Pause rendering when the tab is hidden or the stage is off screen.
- Dispose of geometry and textures on unmount. Test for leaks by moving between 20 pages.
- Replace the EXR with a small compressed environment map if it saves weight without looking worse.

**Device tiers** in `device-tier.ts`:

| Tier | Who | Gets |
| --- | --- | --- |
| High | Recent phones, laptops | Everything |
| Mid | Older devices, weak GPU | No motion blur, no real-time shadows, fewer particles |
| Low | No WebGL, Save-Data, low memory | Pre-rendered video and images, a plain CSS carousel |
| Calm | `prefers-reduced-motion` | Static layouts, no scrubbing, no parallax |

Each tier must still sell a dessert and capture a waitlist sign up.

---

## 13. Testing and acceptance

Automated:

- Unit: stock function under concurrency, consent checks, cart totals, webhook idempotency.
- Playwright: buy a dessert in Square sandbox, join waitlist, flip to live, send alert, unsubscribe, confirm blocked from the next send.
- RLS tests proving the anon key cannot read customers, orders or consents.
- axe on all main pages.

Done means every item below is true:

- [ ] Loader plays with crumbs that respond to pointer and finger
- [ ] Intro runs on a real iPhone in Safari, not just an emulator
- [ ] Horizontal on laptop and iPad, vertical on phone
- [ ] Hero dish on the shelf and in the intro changes from admin with no deploy
- [ ] Fizz changes a dessert to Live on her phone and the site updates within 30 seconds
- [ ] Unavailable desserts stay browsable and show Notify me
- [ ] Clicking a dessert opens the wrapper and the Hero Card slides out
- [ ] Hero Card shows image, description, vibes and all 3 ratings with roses, chocolate chips and pistachios
- [ ] Fizz can change all 3 ratings from admin on her phone
- [ ] This Week, About, Contact, Locations and All desserts pages are live
- [ ] A made-up URL returns a real 404 status and the designed page
- [ ] Every item in the section 20 launch checklist passes
- [ ] Waitlist sign up stores email, phone and a consent record
- [ ] Waitlist alert sends only after approval
- [ ] A real payment appears in Square and in admin, stock drops
- [ ] Last-item race test: two buyers, one gets it, one gets a kind message
- [ ] Every marketing message has a working unsubscribe
- [ ] CSV export works and is logged
- [ ] Site works with WebGL turned off
- [ ] Reduced motion mode works
- [ ] Nothing from FIX is in the repository
- [ ] No em dashes or en dashes in user-facing copy

---

## 14. Deployment runbook

1. Create a private GitHub repo, with `main` as production and preview deployments on pull requests.
2. Create the Vercel Pro project and link the repo. Client ownership of accounts should be agreed first, see section 16.
3. Create the Supabase Sydney project and run migrations.
4. Add environment variables per environment. Only values prefixed `NEXT_PUBLIC_` are visible to browsers, so Square access tokens and the Supabase service role key must never have that prefix.

   ```
   NEXT_PUBLIC_SITE_URL
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   SQUARE_ENV, SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID
   SQUARE_WEBHOOK_SIGNATURE_KEY
   RESEND_API_KEY
   SMS_PROVIDER, SMS_API_KEY, SMS_SENDER
   NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
   CRON_SECRET
   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
   SENTRY_DSN
   ```

5. **Domain.** Confirm the nameservers at the registrar point to Cloudflare. Add the domain in Vercel, then create the DNS records Vercel displays in Cloudflare, set to **DNS only**. Wait for the certificate before going further. Redirect `www` to the root, or the reverse.
6. **Email DNS.** Add Resend's SPF and DKIM records in Cloudflare, plus a DMARC record. Use a sending subdomain such as `mail.` so transactional mail stays reputable.
7. Register the Square webhook URL in production.
8. Set up the SMS number or sender ID and allow time for approval.
9. Add cron jobs in `vercel.json`.
10. Add Fizz's account. Delete any test users.
11. Do a real A$1 test payment, including Apple Pay on an iPhone, then refund it.

---

## 15. Phases

| Phase | Deliverable | Check |
| --- | --- | --- |
| 1 | Foundations: repo, tokens, fonts, Supabase schema, RLS, seed, admin login | Fizz role logs in |
| 2 | Admin This Week and Desserts | Status change updates the public page |
| 3 | Plain public site with no 3D: all pages, Hero Card, real content, Notify me, 404, all of section 20 | Works fully as a basic site and passes the SEO tests, this is the Low tier |
| 4 | Square: cart, checkout, webhooks, orders | Sandbox purchase end to end |
| 5 | Messaging and CRM, consent, unsubscribe | Waitlist to alert to purchase |
| 6 | Loader and the Pour | Plays smoothly on iPhone |
| 7 | 3D stage, shelf, intro with placeholder boxes | Motion feels right before any art goes in |
| 8 | Real packaging art and dessert page scroll scenes | Kheer page finished as the template |
| 9 | Transition, hover details, easter eggs | Signature moments done |
| 10 | Performance, accessibility, tests, launch | Section 13 checklist clear |

Business logic goes in before the fancy layer on purpose. If the art is late, the kheer can still sell.

---

## 16. Open questions

Use the default if there is no answer yet, and list it in `DECISIONS.md`.

| # | Question | Default |
| --- | --- | --- |
| 1 | Exact domain? Which registrar? The note said "Pro", which may be a dictation error | Placeholder `sweetmunchies.example`, DNS at Cloudflare |
| 2 | Does she already have a Square account? Australian seller? | Assume yes, AU |
| 3 | How do people get the food: pre-order for pickup, walk up, delivery? | Pre-order for pickup at the truck |
| 4 | Exact street number on Woodville Road, and the weekly schedule? | Seed one location, Woodville Road, Guildford NSW 2161, editable in admin. Listings show 290 for BBQ Walla, so confirm that is the same site |
| 5 | Prices, portion sizes and weekly quantities, starting with kheer | Mark `TBC`, block publishing until filled |
| 6 | Ingredients and allergens per dessert | Empty, block publishing until filled |
| 7 | Does the kitchen handle nuts, milk, gluten and so on together? This affects "may contain" wording | Ask Fizz, do not assume |
| 8 | Halal status | Claim nothing |
| 9 | GST registration, and how Square should tax items | Check with her accountant, Square tax settings |
| 10 | Refund and cancellation policy | Draft for Fizz to approve |
| 11 | Should the 8 desserts still in development be public yet? | Show as In the kitchen with Notify me |
| 12 | Who owns the Vercel, Square, Supabase and domain accounts? | Fizz owns, Nunik Co. has access |
| 13 | Which BBQ Walla details can we mention? | Mention nothing until approved |
| 14 | Instagram, TikTok and contact details | Placeholder links |
| 15 | Photo and video shoot, who and when? | Placeholder renders until shoot |
| 16 | Do the seeded ratings suit Fizz's actual recipes? Vibes for each dessert? | Use section 18 ratings, vibes empty until she supplies them |
| 17 | Is the Woodville Road base open to the public, and is it shared with BBQ Walla? | Show suburb only until confirmed, this decides the Google Business Profile setup |
| 18 | Do people order and collect at the Woodville Road base, or only at truck stops? | Pre-order and collect at the base |
| 19 | Allow AI training crawlers, or only AI search crawlers? | Allow search, allow training, Fizz can change it |
| 20 | Is Fizz happy to be named and pictured? | Use "Fizz" only until she approves more |

---

## 17. Assets needed

The code is the smaller part of this. The site lives or dies on this list.

**Brand:**

- `logo-primary`: crop box `(165, 0, 935, 770)` from `IMG_4168.png`
- `logo-tagline`: crop box `(975, 0, 1745, 770)` from the same file
- Those crops are around 770px, with a cream background. **We need a clean vector or high-resolution transparent version** before it goes on 3D packaging.

**3D, built in Blender and exported as GLB:**

Carry bag with skinned open and burst animation, cake box with lid, dessert can, dome cup, clay pot with sleeve, flat box, tub, mithai box, round tin, slab tray, stage floor. Simple shapes, high quality textures. Start with the bag, the can and the pot.

**Packaging art:** one wrapper per dessert per `design.md`, supplied at 2048px with a template so future desserts are quick.

**Food shoot, for each hero dessert at launch:**

- Hero shot on seamless colour matching its world
- Top-down ingredient flat lay, then individual ingredients cut out with transparency for the floating layer
- Spoon or hand action on a locked-off camera against the same background, 120fps if possible, for the frame sequences
- Broken-open shot
- Slow pour or drizzle loop

**Audio:** a truck horn for the easter egg. License it or record a real one.

---

## 18. Seed data

Seed these 13 desserts. Put the working name in `name`, use `Kheer` as the hero of the current drop, and keep `recipe_stage` private.

| Dessert | Public status | `recipe_stage` |
| --- | --- | --- |
| Kheer | **live, hero** | Confirm with Fizz, not on the supplied list |
| Brown butter brownies | back_soon | Perfected |
| Biscoff cups | back_soon | Perfected or Recipe made, see note |
| Cookies and Cream cups | back_soon | Perfected or Recipe made, see note |
| Scoopable chocolate chip cookies | back_soon | Perfected or Recipe made, see note |
| Rasmalai | kitchen | Refining |
| Pakistani mithai | kitchen | Recipe obtained or Testing |
| Pakistani biscuits | kitchen | Recipe obtained or Testing |
| Pakistani cake slices | kitchen | Recipe obtained or Testing |
| Tres leches slabs | kitchen | Recipe obtained or Testing |
| Peanut butter caramel milk cake | kitchen | Idea developed |
| Bueno cups | kitchen | Pending or To make |
| Mango cups | kitchen | Pending or To make |

**Notes on this list:**

- The two supplied screenshots disagree on some statuses, which is why some rows show two values. Ask Fizz which is current.
- Both screenshots are cut off, so the list may have more desserts.
- Kheer is not on either screenshot.

Leave price, ingredients and allergens empty. Do not fill them in with guesses.

### Seed ratings

Seed these exactly. They are an editor's critical first pass, judged from each dish type as it is usually made and compared across this menu. Nobody has tasted these recipes for this list, and several do not exist yet, so Fizz should adjust them after tasting.

Calories are relative to the rest of this menu and are not measured. Nothing scores a 1 because no dessert here is genuinely light. Mixed scores are deliberate, a card that says 5, 5, 5 for everything stops meaning anything.

| Dessert | Sweetness (roses) | Addiction (chips) | Calories (pistachios) | Why |
| --- | --- | --- | --- | --- |
| Kheer | 3 | 3 | 3 | Gentle, milky, cardamom-led comfort, one bowl satisfies |
| Rasmalai | 4 | 4 | 3 | Sweet milk soak, soft and light in the mouth, easy to take a second |
| Biscoff cups | 5 | 5 | 4 | Caramelised biscuit on cream, very hard to stop eating |
| Cookies and Cream cups | 4 | 4 | 4 | Familiar and rich, the cookie bitterness keeps it in check |
| Bueno cups | 4 | 4 | 5 | Hazelnut, chocolate and cream make it heavy |
| Mango cups | 3 | 3 | 3 | Fruit acidity lifts it, the lightest of the cups |
| Brown butter brownies | 4 | 4 | 5 | Deep and nutty, dense enough that a slab slows you down |
| Scoopable chocolate chip cookies | 4 | 5 | 5 | Warm, soft dough straight from the tub is dangerous |
| Pakistani mithai | 5 | 3 | 3 | Very sweet and rich, usually small pieces |
| Pakistani biscuits | 2 | 3 | 2 | The least sweet here, built for chai, one at a time |
| Pakistani cake slices | 3 | 2 | 3 | Nostalgic, simple bakery sponge, the calmest on the menu |
| Tres leches slabs | 4 | 4 | 4 | Milk-soaked and cold, lighter to eat than it really is |
| Peanut butter caramel milk cake | 5 | 5 | 5 | Sugar, fat and salt all at full volume, the menu's big one |

---

## 19. Business context

Fizz and her family have run multiple restaurants, food trucks and businesses, including BBQ Walla. The business is based on **Woodville Road, Guildford**, confirmed by the client. Spell the suburb "Guildford" everywhere. A halal listing site gives BBQ Walla's address as 290 Woodville Road, Guildford NSW 2161, so confirm the street number before publishing it. The same listing describes it as certified halal Pakistani BBQ. That description belongs to BBQ Walla and does not automatically apply to Sweet Munchies.

---

## 20. SEO, GEO and AEO

Build this in from Phase 3. It is not a clean-up job for launch week.

- **SEO:** ranking in normal search and Google Maps.
- **AEO (answer engine optimisation):** being the direct answer to a question.
- **GEO (generative engine optimisation):** being named and cited by ChatGPT, Claude, Perplexity, Gemini and Google's AI answers.

All three rely on the same base: **a fast site, real text in the HTML, clear facts, and the same business details everywhere.**

### 20.1 The WebGL trap

This is the biggest risk on the whole build. The main text on FIX's home page came back as little more than product names, repeated 4 times. We must not copy that.

- Every page must be fully readable in the raw server HTML, with JavaScript off.
- The loader, intro and canvas are **visual layers on top of real content**. They never replace it.
- Add `<noscript>` CSS that hides the loader, so no-JS visitors and basic crawlers see the page.
- Show crawlers exactly what people get. Do not detect bots and serve them something different, that is cloaking.
- The home shelf locks native scrolling, so give the home page a normal content section that people reach after the shelf or from a "More about us" link. It holds the intro copy, this week's dish, next stop, dessert links and top questions. Text nobody can reach does not count.
- Set `aria-hidden="true"` on repeated marquee and caption clones, so each name only appears once to crawlers.
- The animated intro words ("CRAVE IT") are decorative `<span>`s, not headings.
- Canvas frame sequences need a real `<img>` of the dish in the HTML.
- Check every page type with Search Console URL Inspection to see what Google actually rendered.

### 20.2 Heading rules

- **Exactly one `<h1>` on every page**, in the server HTML, and it must make sense read alone.
- Never skip a level, `h2` follows `h1`, `h3` follows `h2`.
- Choose heading levels by document structure. Size comes from CSS.
- Use one `<main>`, plus `<header>`, `<nav>`, `<footer>`, with `<section>` and `<article>` where they fit.
- `<html lang="en-AU">`.
- A real `<a href>` for all navigation, including every shelf item. Crawlers do not click `<div>`s.

### 20.3 Page by page

The primary location is **Guildford**, with **Western Sydney** and **Sydney** as wider terms in body copy. `areaServed` should list Guildford and Western Sydney. Titles under 60 characters, descriptions under 155, every one unique.

| URL | Title | H1 | Structured data |
| --- | --- | --- | --- |
| `/` | Sweet Munchies by Fizz: Pakistani Desserts, Guildford | Pakistani desserts from a Guildford food truck | `Organization`, `FoodEstablishment`, `WebSite` |
| `/this-week` | This Week's Dessert: [Dish] \| Sweet Munchies by Fizz | This week: [Dish] | `WebPage`, `Product`, `BreadcrumbList` |
| `/desserts` | Our Desserts: Kheer, Rasmalai, Mithai \| Sweet Munchies | Our desserts | `Menu`, `CollectionPage`, `BreadcrumbList` |
| `/desserts/kheer` | Kheer in Guildford: Pakistani Rice Pudding \| Sweet Munchies | Kheer | `Product`, `BreadcrumbList`, `FAQPage` |
| `/about` | About Fizz and Family \| Sweet Munchies by Fizz | Meet Fizz | `AboutPage`, `Organization`, `BreadcrumbList` |
| `/contact` | Contact and Catering \| Sweet Munchies by Fizz | Say salaam | `ContactPage`, `BreadcrumbList` |
| `/locations` | Where to Find the Truck \| Sweet Munchies by Fizz | Find the truck | `FoodEvent` per real stop, `BreadcrumbList` |
| `/faq` | Questions and Answers \| Sweet Munchies by Fizz | Your questions, answered | `FAQPage`, `BreadcrumbList` |

Write meta descriptions by hand from Fizz's real details. Generate dessert page titles and descriptions from a template, and let `seo_title` and `seo_description` override it.

### 20.4 Meta and technical checklist

Use the Next.js Metadata API, with shared defaults in `lib/seo.ts`.

**Every indexable page:**

- Unique `title` and `description`
- Self-referencing absolute `canonical` with no query strings
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale` set to `en_AU`
- `twitter:card` set to `summary_large_image`
- `robots` with `max-image-preview:large`
- `theme-color`, updated to the dessert's world colour on dessert pages
- Generated 1200 x 630 share image per dessert with `opengraph-image.tsx`, using its name, photo and world colour

**Site-wide:**

- `sitemap.ts` built from the database, covering indexable pages only, with real `lastModified` values and image entries
- `robots.ts`, see 20.8
- Favicon set, apple-touch-icon, and web manifest from the logo
- One domain version only, with 308 redirects for `www`, trailing slashes and uppercase paths
- HTTPS everywhere
- Slugs use the plain dish name and never change. `/desserts/kheer`, never `/desserts/kheer-me-out`
- Filter or tracking parameters never create new indexable URLs
- Breadcrumbs shown on the page as well as in the markup
- Internal links: home to This Week, every dessert to All desserts and Locations, and footer links to every main page
- Saving in admin revalidates affected pages and the sitemap
- `noindex`: `/admin`, `/order/*`, `/unsubscribe`, cart and checkout states, 404 and error pages. Also send `X-Robots-Tag: noindex` on admin routes
- Preview deployments must be `noindex`, so `*.vercel.app` copies never compete with the real site

**Images:**

- Descriptive file names such as `kheer-pakistani-rice-pudding-sweet-munchies.webp`
- Alt text that describes the actual dish, editable in admin, required before publishing
- `next/image` with sizes set, AVIF or WebP, and `priority` on the hero only

**Speed:** the targets in section 12 are also SEO requirements. Measure Core Web Vitals on real phones, because a heavy 3D layer is the most likely way to fail them. 3D must load after the main content.

### 20.5 Structured data

Output JSON-LD from one typed helper in `lib/schema.ts`, with stable `@id` values so pages reference one business entity. Every value must match what is visible on the page.

- **`Organization`:** name, logo, url, `sameAs` (Instagram, TikTok, Google Business Profile), contact details.
- **`FoodEstablishment`:** `servesCuisine` set to Pakistani and Desserts, `areaServed`, `priceRange`, `menu`, and a street `address` **only if it is real and public**.
- **`Product`:** only when a dessert has a real price. Name, description, image, brand, and `Offer` with `priceCurrency` AUD. Add `allergens` wording in the description, not in made-up fields.
- **`Offer.availability` mapping:**

| Status | `availability` |
| --- | --- |
| live | `InStock` |
| low stock | `LimitedAvailability` |
| sold_out | `SoldOut` |
| back_soon, scheduled | `OutOfStock` |
| kitchen | No `Product`, plain `WebPage` only |

- **`Menu`, `MenuSection`, `MenuItem`:** on `/desserts`.
- **`FoodEvent`:** only for real, dated public stops with a real place. Never for invented or vague dates.
- **`BreadcrumbList`:** everywhere except home.
- **`FAQPage`:** keep it where real questions are visible on the page. Google stopped showing FAQ rich results on 7 May 2026, so expect no special Google result. Other engines may still use it and it does no harm.
- **`NutritionInformation`:** only if Fizz supplies real measured data.

**Do not:**

- Mark up the sweetness, addiction or calorie ratings as `Rating`, `Review` or `AggregateRating`. They are the seller's opinion of her own product, and marking them up that way risks a manual penalty.
- Fake reviews, or paste Google reviews into `Review` markup to get stars.
- Add a `halal` claim to markup or copy before question 8 is answered.
- Add a marked-up address for a place the truck is not.

Validate with Google's Rich Results Test and the Schema.org validator. Fail CI on invalid JSON-LD.

### 20.6 Local SEO

For a food truck, Google Maps can matter more than the website.

- **Google Business Profile.** Set this up before launch. With no permanent public location, the guidance from Google's product experts is a service-area style listing with the home address hidden, so there is no map pin. Google's own guidelines do not address food trucks directly, so confirm eligibility at setup. Use the real business name, with no keywords added.
- Post every week's dish and location as Google Posts, because the profile cannot show a moving truck by itself.
- **Apple Business Connect** and **Bing Places:** claim both.
- **Shared premises:** if the Woodville Road base is also BBQ Walla's address, Sweet Munchies needs to qualify as its own business at that address, so check Google's rules before adding a second listing there.
- **Same details everywhere:** name, phone and website must match exactly across the site, Google, Apple, Bing, Instagram, TikTok and directories.
- Link to the site from every social bio, using `/this-week`.
- List on real relevant directories such as halal listings (if the claim is confirmed), food truck directories, and local Sydney guides.
- Ask happy customers for Google reviews with a QR code on the truck and on the box. Never pay for reviews or offer rewards for them.
- **No doorway pages.** Do not build "Desserts in [Suburb]" pages for suburbs the truck does not actually serve. Google penalises those, and they are useless to people.

### 20.7 AEO and GEO content

AI tools quote pages that state clear facts plainly. Keep all the personality in the design, and put the facts in simple sentences that can stand alone.

**Every dessert page gets:**

- **A "What is [dessert]?" section**, in a real `<h2>`, with a 40 to 60 word answer as the first thing under it. Example structure: "Kheer is a Pakistani rice pudding made by slow-cooking rice in milk with sugar and cardamom. Sweet Munchies by Fizz serves it [how]." Fizz confirms the wording, since recipes differ.
- 3 to 5 real questions as `h3`s, with direct answers: How is it served? Does it contain nuts? Is it served hot or cold? How long does it keep?
- A factual ingredients and allergens block.

**Site-wide:**

- `/faq` answers real questions in one or two sentences each: Where is the truck this week? Do you take pre-orders? Do you cater events? What desserts do you sell? Do you deliver?
- Use the business's full name often in plain sentences, not only "we".
- Show "Updated [date]" on This Week and Locations, with real dates.
- Keep original details that no one else has: Fizz's family story, what makes her recipes different, in her own words. AI tools favour unique information, and generic filler gets ignored.
- Use real lists and tables for facts. Do not put facts inside images, canvas or video.
- Aim to get mentioned on sites other than our own, such as local food writers, Sydney food pages and Instagram food creators. AI tools lean heavily on what other sources say.
- Target searches like "Pakistani desserts Guildford", "desserts Woodville Road", "Pakistani desserts Western Sydney", "Pakistani desserts Sydney", "kheer Sydney", "rasmalai Sydney", "mithai Sydney" and "dessert food truck Sydney". These are starting ideas and have not been volume-checked, so validate them in a keyword tool and Search Console.

### 20.8 Crawlers

`robots.ts` allows normal search engines, and explicitly allows AI search and user-fetch crawlers.

| Purpose | Agents | Setting |
| --- | --- | --- |
| Search | Googlebot, Bingbot, Applebot | Allow |
| AI search and citation | OAI-SearchBot, Claude-SearchBot, PerplexityBot | Allow |
| User-triggered fetches | ChatGPT-User, Claude-User | Allow |
| AI model training | GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot | Allow by default, see question 19 |

- Disallow `/admin` and `/api/` for all agents. Leave `/order/` crawlable and rely on its `noindex`, because a crawler blocked by robots.txt never sees the tag.
- Crawler names change, so check each company's current documentation before launch.
- Check that Vercel's firewall bot settings are not blocking the crawlers you allow. Cloudflare's AI bot blocking only applies to proxied traffic, so it should not affect a DNS-only domain, but confirm it.
- Add a short `/llms.txt` generated from the database: business summary, this week's dish, and key page links. It is cheap to add, but treat it as optional, because there is no proof it improves visibility.

### 20.9 Measuring it

- Verify **Google Search Console** and **Bing Webmaster Tools**, and submit the sitemap to both.
- Track AI referrals in analytics, such as `chatgpt.com`, `perplexity.ai`, `claude.ai` and `gemini.google.com`.
- Once a month, ask the main AI tools "Where can I get Pakistani desserts in Western Sydney?" and "Who sells kheer near Guildford?" and record the results.
- Add an SEO card to the admin dashboard later, with top searches from Search Console.

### 20.10 Automated checks

Add a Playwright suite that crawls every public URL in the sitemap and fails the build if:

- A page does not have exactly one `<h1>`, or heading levels skip
- Title or description is missing, duplicated or too long
- Canonical is missing or does not match the URL
- JSON-LD fails to parse or fails the helper's types
- An image has no `alt`, unless it is marked decorative
- An internal link returns 404
- An indexable page has `noindex`, or a private page lacks it
- A made-up URL returns anything except a 404 status
- The raw HTML, with no JavaScript, lacks the dessert name, description or allergens
- Lighthouse SEO scores below 100, or accessibility below 95

### 20.11 Launch checklist

- [ ] Real domain in canonicals, sitemap and Open Graph tags, with no placeholder or `vercel.app` links
- [ ] Preview deployments are `noindex`, production is not
- [ ] Sitemap submitted to Google and Bing
- [ ] Rich Results Test passes on Home, a dessert, Locations and FAQ
- [ ] Search Console URL Inspection shows content on a dessert page and home
- [ ] Share images tested by pasting links into iMessage, WhatsApp and Instagram DMs
- [ ] Google Business Profile, Apple Business Connect and Bing Places claimed
- [ ] Business details match on every profile
- [ ] Real Core Web Vitals checked on a mid-range Android and an iPhone over 4G

---

Start by reading `design.md`, then give me a short plan for Phase 1 and list anything in this brief that contradicts itself.
