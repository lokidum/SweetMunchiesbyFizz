# Sweet Munchies by Fizz: design.md

The design source of truth. Read this alongside `BUILD_PROMPT.md`. If the two ever disagree, the build prompt wins on behaviour and this file wins on look and feel.

---

## 1. The idea

A Pakistani dessert truck with the swagger of a luxury confectionery launch.

Most dessert sites look like a menu with nice photos. This one should feel like something is being unwrapped. Fizz only drops one or two hero dishes a week, so the whole site treats that drop as an event, and everything else in her range sits on the shelf, sealed, making you want it.

Two worlds meet here, and I think that tension is the whole brand:

- **Pakistani truck art:** painted, loud, floral, joyful, every surface decorated. It is also a lovely accident that she runs a truck.
- **The logo's glossy swirl:** soft rose cream wrapped through glossy chocolate, with petals and pistachio falling out of it. Sweet, round, a bit cheeky.

The logo leads. Truck art is the seasoning, so we use it in borders, stamps and small moments, and never as wallpaper. If a screen starts to look like a costume, pull it back.

**Taglines from the logo, use them as written:**

- Crave it, munch it, love it
- For the sweetest moments

---

## 2. Personality

| We are | We are not |
| --- | --- |
| Cheeky, warm, family-run | Corporate, "artisanal", precious |
| Generous and a little over the top | Minimal for the sake of it |
| Confident about Pakistani desserts | Explaining them like a museum label |
| Playful with Urdu and Roman Urdu | Using it as decoration nobody checked |

Voice sits somewhere between an aunty who insists you take a second helping and a friend texting you that the good stuff is back. Short lines. Real food words. Say kheer, not "rice pudding", then let the description do the explaining.

Any Urdu or Roman Urdu on the site gets proofed by Fizz before launch. No exceptions, she will spot what we cannot.

---

## 3. Colour

### Brand tokens

Sampled from the supplied logo file, then named. Anything marked "derived" was tuned by eye and is not a direct sample.

```css
:root {
  /* Paper and cream */
  --paper:        #FDF7EB;  /* logo background */
  --cream:        #F8EDD8;  /* milk, kheer, card surfaces */
  --blush:        #F5CCB1;  /* soft swirl shadow */

  /* Chocolate */
  --cocoa-950:    #3A1308;  /* main text, deepest chocolate */
  --cocoa-800:    #512011;  /* logo outline, drip body */
  --cocoa-500:    #954E2F;  /* milk chocolate, highlights */

  /* Rose */
  --rose-200:     #F6A198;  /* Munchies pink, logo ring */
  --rose-400:     #D95D61;  /* heart and "Munch it" pink */
  --petal-600:    #CF2A52;  /* bright petal, accents only */
  --petal-800:    #A60F35;  /* dark petal, safe with cream text */

  /* Pistachio and saffron */
  --pista-700:    #8A7E12;  /* pistachio shell shadow */
  --pista-500:    #A2961E;  /* pistachio body */
  --pista-300:    #B4BF5A;  /* derived, fresher green for UI */
  --saffron-300:  #EFCC6A;  /* saffron, gold moments */
}
```

### Contrast, already calculated

| Pair | Ratio | Use |
| --- | --- | --- |
| `--cocoa-950` on `--paper` | 15.4:1 | All body text |
| `--cocoa-800` on `--paper` | 12.6:1 | Headings |
| `--paper` on `--cocoa-950` | 15.4:1 | Dark screens |
| `--saffron-300` on `--cocoa-950` | 10.6:1 | Active caption on dark |
| `--rose-200` on `--cocoa-950` | 8.2:1 | Pink on dark |
| `--paper` on `--petal-800` | 7.2:1 | Buttons, sold out stamp |
| `--cocoa-950` on `--rose-400` | 4.5:1 | Bold labels only, check the rendered value |
| `--rose-400` on `--paper` | 3.5:1 | **Large display text and graphics only, never body text** |

Primary button: `--cocoa-950` fill with `--paper` text. Rose is for joy and emphasis, not for reading.

### The world colours

FIX changes `--page-bg` for each product, and that is a big part of why it feels so rich. We do the same. Clicking a dessert floods the screen with its colour. Every dessert gets its own `world`, stored in the database so Fizz never has to touch code.

| Dessert | `--page-bg` | Text on it | Floating ingredients | Package |
| --- | --- | --- | --- | --- |
| Kheer | `#F3C969` saffron | cocoa-950 | Cardamom pods, pistachio slivers, almonds, rose petals, rice grains | Clay pot with paper sleeve |
| Rasmalai | `#F6A198` rose | cocoa-950 | Saffron threads, pistachio, milk splashes, petals | Dessert can |
| Biscoff cups | `#C8843C` caramel | cocoa-950 | Biscuit shards, crumbs, cream dollops | Cup with dome lid |
| Cookies and Cream cups | `#2B2320` charcoal | paper | Cookie chunks, cream ribbons | Cup with dome lid |
| Bueno cups | `#B9793F` hazelnut | cocoa-950 | Hazelnuts, wafer shards, chocolate curls | Cup with dome lid |
| Mango cups | `#F7A600` mango | cocoa-950 | Mango cubes, cream, cardamom | Cup with dome lid |
| Brown butter brownies | `#5B2A12` dark brown | paper | Sea salt flakes, chocolate shards, butter curls | Flat box |
| Scoopable choc chip cookies | `#E8B96A` dough | cocoa-950 | Chocolate chips, dough scoops | Tub |
| Pakistani mithai | `#A60F35` deep petal | paper | Silver leaf, pistachio, rose | Mithai box |
| Pakistani biscuits | `#2F6F73` truck teal | paper | Biscuit crumbs, sesame, tea steam | Round tin |
| Pakistani cake slices | `#F7C6C7` pale pink | cocoa-950 | Sponge crumbs, icing swirls | Cake box |
| Tres leches slabs | `#FBE6C8` milk | cocoa-950 | Milk drops, strawberry, cinnamon | Slab tray |
| Peanut butter caramel milk cake | `#A2581A` caramel | paper | Peanuts, caramel threads | Slab tray |

These are starting points, not gospel. Run the contrast check against whichever text colour each world ends up with.

### Texture

Real paper grain sits over every flat background, the same way FIX's backgrounds have a soft felt quality. Use one tiling WebP at 4 to 6 percent opacity with `mix-blend-mode: multiply`. No visible banding on the dark gradients.

---

## 4. Typography

FIX pairs a very heavy geometric sans with a thin handwritten script laid across it. That script-over-caps move is worth keeping because it feels hand-finished. Our letterforms need to be rounder to sit with the logo.

| Role | Font | Notes |
| --- | --- | --- |
| Display | **Fredoka** 600 to 700, uppercase | Round, friendly, heavy enough to fill with icing |
| Script overlay | **Sacramento** | Thin monoline, laid over display words at an angle |
| Body and UI | **Nunito** 400 to 800 | Soft, very readable at small sizes |
| Urdu accents | **Noto Nastaliq Urdu** | Short decorative words only, give it generous line height |

Serve all four through `next/font` so they self-host. Subset Noto Nastaliq Urdu hard, or load it only where used, because it is a heavy font.

```css
--step-display: clamp(3rem, 11vw, 9rem);
--step-h1:      clamp(2.25rem, 6vw, 5rem);
--step-h2:      clamp(1.75rem, 4vw, 3rem);
--step-body:    clamp(1rem, 1.1vw, 1.125rem);
```

Display tracking at `-0.01em`, line height `0.95`. Script overlays around `-6deg`.

**Do not use the logo's lettering as a font.** It is artwork. If a page needs it, use the logo.

---

## 5. Motifs

These are the things that make it this website and not any other dessert site.

**The Swirl.** The two-tone ribbon from the logo, rose cream wrapped around chocolate. It is our signature, the same way FIX has its drip. It shows up in the loader, section wipes, the cart icon and hover states. Keep it as one reusable SVG path plus a shader version.

**The Pour.** Our version of the drip curtain. Chocolate pours first and rose cream folds through it, so the edge is two-tone and glossy. FIX's sheet is one colour. This single change makes it ours.

**Crumbs.** Petals, pistachio slivers, chocolate crumbs and saffron threads. Small, physical, a little messy. They orbit the logo in the loader, trail behind the cursor, and scatter when something is added to the cart.

**Truck art trim (Phool Patti).** Flat painted florals, chamak patti style reflective stripes, and scalloped borders. Use for section dividers, the sold out stamp, the footer frame and the admin header. Commission or draw originals, do not trace real truck paintings.

**Tailgate Lines.** Pakistani trucks carry painted one-liners on the back. We steal that tradition properly, as short painted slogans dotted around the site. Example: *Dekh magar pyar se* (look, but with love), which is perfect on a sealed dessert you cannot buy yet. Fizz will know better ones.

**Bite marks.** A clean scalloped bite taken out of edges and corners. Used on the 404 page, image masks and the footer.

**Stamps.** Every state gets a hand-inked stamp, slightly rotated and unevenly inked, never a boring pill badge.

| State | Stamp | Colour |
| --- | --- | --- |
| Live this week | **THIS WEEK** | Saffron on cocoa |
| Sold out | **ALL MUNCHED** | Paper on petal-800 |
| Back soon | **BACK SOON** | Cocoa on rose |
| In the kitchen | **IN THE KITCHEN** | Cocoa on cream |

---

## 6. Packaging family

The logo lives on real objects in 3D: a cake box, a can of dessert, different vibes. This is the cast. They need to look like one family on a shelf.

| Format | Used for |
| --- | --- |
| Carry bag | Intro hero, it drops in like the FIX bag does |
| Cake box | Cake slices, intro alternate |
| Dessert can | Rasmalai, future drinks and layered desserts |
| Dome cup | All the cups |
| Clay pot with sleeve | Kheer |
| Flat box | Brownies |
| Tub | Scoopable cookies |
| Mithai box | Mithai |
| Round tin | Biscuits |
| Slab tray | Tres leches, milk cake |

**Shared wrapper layout.** Paper-cream base, big colour blocks in the dessert's world colour, the logo roundel top centre, a painted illustration of the dessert in one corner, a line drawing motif behind (lantern, rickshaw, chai glass, jasmine), and a chocolate drip falling from the top edge into the swirl. FIX's wrappers do this colour-block collage beautifully, so ours should reach the same level of craft with entirely original art.

**Technique to copy:** one 3D model per format, then swap a texture per dessert. FIX loads a shared bar model and a stack of `wrappers_new/*.webp` textures. It keeps downloads small and means a new dessert is a new texture, not a new model.

**Fallback:** if a dessert has no custom art yet, the box auto-generates a label on a canvas texture from its name and world colour. A new dessert should never look broken.

---

## 7. Motion

### Principles

1. **Everything has weight.** Boxes drop and settle. Chocolate is heavy. Nothing floats without a reason.
2. **Scroll is the director.** The user controls the pace on product pages.
3. **It responds to speed.** Fast scroll gives motion blur and tilt, slow scroll gives calm.
4. **Always interruptible.** Nobody is ever stuck watching an animation.

### Easing and timing tokens

```js
export const ease = {
  drop:  'back.out(1.4)',      // packages landing
  pour:  'power2.inOut',       // liquid moving
  snap:  'expo.out',           // carousel settling
  soft:  'sine.inOut',         // idle sway
  bite:  'steps(3)',           // playful chomp moments
}
export const dur = { micro: .18, base: .45, slow: .9, scene: 1.4 }
```

### Loader (fixing what is wrong with FIX's)

FIX shows a dim percentage counter on flat brown for about three seconds. Love the concept, not the execution, because nothing is happening. Ours should make the wait itself the first treat.

- **Background:** `--cocoa-950` with a soft radial glow in `--cocoa-800`.
- **Centre:** the logo roundel as a faint outline.
- **Crumbs:** around 60 to 120 petals, pistachio slivers and chocolate crumbs drift in from the screen edges and orbit the logo along the swirl path.
- **Following:** the crumbs lean towards the cursor or finger, then spring back, so people play with it without being told.
- **Progress:** real asset loading drives it. As progress climbs, the orbit tightens, the crumbs land on the logo and it fills in with colour from the bottom up. No big number. A tiny `64%` under the logo is fine for honesty.
- **Teaser line:** one rotating line under the logo, such as "Warming the milk", "Crushing pistachios", "Tell mum we said salaam". Written with Fizz.
- **At 100:** crumbs burst outwards, the logo gives one heartbeat pulse, then the Pour begins.

Rules: the loader must be CSS and inline SVG only so it paints before anything else loads. First visit runs for at least 1.6 seconds even on fast wifi. Tapping skips ahead once the critical assets are ready.

### The intro sequence

Timings are our targets, based on what I measured on FIX (see the build prompt for the raw timeline).

| Time | Beat | Detail |
| --- | --- | --- |
| 0.0s | Crumb burst | Loader hands off |
| 0.2s | The Pour | Glossy chocolate and rose sheet fades up full screen, logo in glossy icing centre |
| 0.8s | Type lands | "CRAVE IT," then "MUNCH IT," then "LOVE IT", pink icing fill, script word over the top |
| 1.8s | The Pour lifts | Two-tone drips rise off the screen, revealing the warm 3D stage underneath, type is wiped away by the drip edge |
| 2.4s | Nav arrives | Menu icon and small logo fade in at top |
| 2.6s | Carry bag drops | Bag lands with a real shadow, slight squash |
| 3.4s | Push in | Camera moves in close, the bag fills the frame |
| 3.8s | Burst | Boxes, cans and cups explode upwards out of the bag with depth of field, slow rotation |
| 4.4s | Hero catches | This week's dish tumbles towards camera, flips, settles on the stage |
| 5.0s | Reveal | Caption track fades in, neighbouring desserts slide in |

Total around 5 seconds, a touch quicker than FIX's 8. The bag and burst run in real-time 3D so the hero is always this week's actual dish.

Returning visitors in the same session get a 1 second short version. Respect `prefers-reduced-motion` with a simple cross-fade.

### The shelf (home carousel)

Modelled closely on FIX.

- Packages sit in a shallow arc on a warm stage. The centre item is large, the neighbours step back in size, rotation and focus.
- **Laptop and iPad:** moves horizontally, caption track along the bottom.
- **Phone:** moves vertically, neighbours peek above and below, blurred.
- Moving the cursor tilts the whole shelf slightly towards it. On touch, the centre item idly sways left and right.
- While moving, packages lean into the direction of travel and pick up motion blur. On release they snap and settle with a small overshoot.
- Caption track moves in sync: active item in saffron, neighbours fade out.
- **Addition that FIX does not have:** a stamp and a button under the active caption, **Add to box** or **Notify me**.

### Going into a dessert (the signature transition)

1. Click. The world colour spreads from the centre in an organic liquid blob over the brown, not a straight wipe. About 0.5 seconds.
2. The package grows and rises to fill the frame, neighbours slide away.
3. Title arrives over the package, display word with a script word across it.
4. The wrapper peels or the lid lifts, and **the Hero Card slides out of it**, like pulling a prize out of a sleeve.
5. Ingredients float in around the card at different depths.

### The Hero Card

This is the moment the whole unwrap builds to. Every dessert has one. It should feel like a collectible card you would want to keep, so think trading card crossed with a hand-painted truck panel.

**Layout, top to bottom:**

1. Stamp (THIS WEEK, BACK SOON and so on), slightly rotated, overlapping the top edge
2. Hero image of the dish, big, with a bite mark taken out of one corner
3. Dessert name, plain name large, fun name in script across it
4. Vibe tags, 2 or 3 hand-inked words: *Cosy*, *Nostalgic*, *Eid at nani's*
5. Two or three lines of description
6. The three ratings
7. Price and **Add to box**, or **Notify me**

**The three ratings, always 1 to 5, always in this order:**

| Rating | Icon | Colour when filled | 1 out of 5 | 5 out of 5 |
| --- | --- | --- | --- | --- |
| **Sweetness** | Rose | `--petal-600` | "Barely sweet" | "Call your dentist" |
| **Addiction** | Chocolate chip | `--cocoa-800` | "One's enough" | "Hide the spoon" |
| **Calories** | Pistachio | `--pista-500` | "Light-ish" | "Worth every one" |

Middle scores need their own lines, since most desserts land there:

| Score | Sweetness | Addiction | Calories |
| --- | --- | --- | --- |
| 2 | "Gently sweet" | "You'll probably stop" | "Have another" |
| 3 | "Just right" | "One more spoon" | "Fair enough" |
| 4 | "Properly sweet" | "Don't share it" | "A proper treat" |

Each row is the label, five icons, then a short line of copy for that score. Empty icons are thin outlines in the same shape, never a grey blob. Draw all three as original SVGs in the logo's illustration style, so a rose on the card looks like it fell out of the logo.

**How the ratings animate:** icons fill left to right, 90ms apart, as the card lands. Each one pops with a little squash, and the last filled icon drops a crumb. A 5 out of 5 gets one extra wiggle. On reduced motion they are simply already filled.

**Card styling:** `--paper` surface with grain, scalloped truck-art border in the dessert's world colour, soft shadow, about 2 degrees of tilt that follows the cursor. On hover the foil edge catches the light.

| Screen | Placement |
| --- | --- |
| Laptop | Dessert package on the left, card on the right at around 420px wide |
| iPad | Same as laptop, card around 380px wide |
| Phone | Card fills the width with a 16px gutter, the package peeks out behind the top |

The whole card is real HTML. It is the first thing on the dessert page, so it also holds the page's only `<h1>`, and it loads straight in for anyone arriving from Google.

**Small print under the ratings:** "Fizz's own taste ratings, just for fun. Not nutrition information."

### Dessert page scroll

Same rhythm as FIX's product pages, using real food. Scrolling carries you on from the Hero Card.

1. **Hero Card:** as above, ingredients drifting with parallax at 3 depth layers.
2. **The Spoon:** where FIX has hands snapping the bar, we get a hand with a spoon or fingers breaking it, scrubbed by scroll.
3. **The story:** big display heading on the left, 2 or 3 lines of copy.
4. **Arc text:** the dessert name in a huge curved band, tone on tone, rotating with scroll, sitting behind the food.
5. **Inside:** the dessert broken open, cross-section with ingredients, description at right and allergens beneath.
6. **What is it?** A short plain-English answer and a few questions, for people and for search.
7. **Package returns:** the box slides in, with **Add to box** or **Notify me**.
8. **Footer:** menu links, socials, tagline, painted border.

### Hover and tap

| Element | Behaviour |
| --- | --- |
| Links | A hand-drawn swirl underline draws on left to right |
| Primary button | Pill plus a separate round arrow, like FIX. On hover the arrow circle fills and a small drip falls from it |
| Package on shelf | Lifts slightly, tilts to cursor, shadow softens |
| Add to box | The dessert icon arcs into the cart icon, crumbs scatter, the cart wiggles |
| Cursor (desktop) | Default cursor stays. A small chocolate dot lags behind it, and 3 crumbs trail on fast movement |

---

## 8. Components

**Header:** menu icon top left, logo roundel top centre with a small drip hanging off it, cart top right. The logo in the header drips slightly on scroll.

**Menu:** full screen takeover in `--cocoa-950` with a painted border. Links are huge display type, each with a small package preview on hover. The current week's drop is pinned at the top.

**Cart ("Your box"):** slides in from the right, phone rises from the bottom. Looks like the inside of a box lid. Lines, pickup slot, total, then **Pay with Square**.

**Notify me sheet:** see 9 below. Soft, quick, one screen.

**Where's the truck strip:** a small persistent line, "Find us Saturday at ...", driven by the database.

**Footer:** a giant "Crave it, munch it, love it", painted truck border, socials, legal links, and a small truck that drives along the bottom edge at random.

### Pages

Same world, calmer pace. These are normal scrolling pages, so they load fast and read well. No 3D stage needed beyond a small accent.

**This Week (the hero page).** The one link Fizz shares every week. One big dish, or two side by side, on its world colour. Hero Card front and centre, a plain sentence saying what is on and where, a countdown to the order cutoff, then the truck stops. If she has not set a drop yet, show "Fizz is cooking something up" with a Notify me.

**All desserts.** A wall of packages in a grid, grouped by Live, Coming back and In the kitchen. Hover lifts a package. Stamps do the talking.

**About.** Warm, personal and photo-led. Opens on a big portrait of Fizz with a script note across it. Then the family story as a painted timeline running down the page, restaurant by restaurant, truck by truck, each stop like a tailgate panel. Closes with a quote from Fizz in her own words and a link to This Week. Real family photos beat any graphic here.

**Contact.** Feels like the back of a truck. Painted panel with the big three: message form, Instagram, phone. A catering and events callout sits beside the form, because that is probably where the bigger orders come from. Success state: the form folds into a box and drives off.

**Locations.** Practical first, because people are standing on a footpath checking this on their phone. Next stop in huge type at the top: place, day, time, a **Take me there** button. Below it the coming stops as a painted route with dots along a road. A small static map, not a heavy embed. If no stops are set: "The truck's having a rest. Join the list and we'll tell you where it pops up next."

**404.** "Someone ate this page." The whole page has a giant bite taken out of it, an empty spoon lying in the gap, then links to This Week, All desserts, Locations and Contact, plus the current hero dessert so nobody leaves empty-handed. Tap the spoon and it scrapes the plate.

**500.** "We dropped the tray." Same look, one button to try again, phone and Instagram below so an order is never lost.

**Cookie banner:** we do not need one, because the analytics are cookieless. FIX's large banner sits over its nicest moments, so skipping it is a quiet win.

---

## 9. Availability design

This is the most important commercial part of the site, so it needs to feel good rather than like an error state.

Unavailable desserts stay beautiful. They appear **sealed**: package closed, a ribbon or wax seal across it, a stamp, and a little less saturation. You can still go in, read about it and want it. Never grey it out.

| State | Shelf look | Button |
| --- | --- | --- |
| Live | Full colour, lid slightly ajar, idle sway | Add to box |
| Low stock | Same, plus "Only 8 left", shown when stock is at or below the admin threshold | Add to box |
| Sold out | Empty box, crumbs inside, ALL MUNCHED stamp | Notify me |
| Back soon | Sealed, BACK SOON stamp | Notify me |
| In the kitchen | Sealed, IN THE KITCHEN stamp | Notify me |
| Scheduled | Sealed, "Drops Friday 5pm" with countdown | Notify me |

The Notify me sheet: dessert image at left, "We'll tell you the second it's back", email and mobile, one tick box for specials (unticked by default), a button. On success, the sealed box gets a little heart sticker that stays on it for that visitor.

---

## 10. Easter eggs

Hidden, quick, never in the way. Each one is switchable in admin.

1. **Dekh magar pyar se.** Hover or tap a sealed dessert 5 times and a painted tailgate line appears.
2. **Truck honk.** Tap the footer truck and it does a Pakistani truck horn, then drives off. Sound only plays on that tap.
3. **Bite the logo.** Click the footer logo and it loses a bite each time. After the last bite the tagline appears underneath, then it regrows.
4. **Type "meetha".** Rose petals rain down and a small Urdu میٹھا appears. Add a discount code only if Fizz wants one.
5. **Chai o'clock.** Between 4pm and 5pm Sydney time, the loader line changes and a small steaming chai glass sits in the corner.
6. **Hot day mode.** When the forecast is 32 degrees or above, the logo melts a bit more and a line appears: "Too hot to cook. Come get something cold."
7. **Crumb collector.** Each visit leaves a few crumbs in the footer. After 5 visits they spell out a thank you.
8. **404: all munched.** A page with a giant bite out of it and an empty spoon. Copy: "Someone ate this page."
9. **Console note.** A small ASCII swirl and "Made with love by Fizz and family. Site by Nunik Co."
10. **Family nod.** A tiny line in the footer about the family behind BBQ Walla, only with Fizz's blessing.
11. **Seasonal skins.** Eid, Ramadan after-iftar hours and 14 August. Admin toggles rather than automatic dates, because moon sighting does not run on a cron job.

---

## 11. Copy

Button language: **Add to box**, **Notify me**, **Pay with Square**, **Find the truck**, **Take me there**.

Keep the fun in the display copy, and keep the plain facts plain. Dish names, places, days, times and allergens are always written so a stranger, a screen reader or a search engine understands them first time.

Fun dessert names are a big part of FIX's charm, but theirs are theirs. Here are some ideas of our own for Fizz to accept or laugh at:

| Dessert | Idea |
| --- | --- |
| Kheer | Kheer Me Out |
| Mango cups | Aam Ready |
| Pakistani mithai | Mithai Way or the Highway |
| Pakistani biscuits | Chai's Best Friend |
| Tres leches slabs | Tres Bien |
| Scoopable cookies | The Big Scoop |
| Brown butter brownies | Brown Town |
| Cookies and Cream cups | Cookie Monsoon |

Always show the plain dessert name beneath the fun one. People search for "kheer", not "Kheer Me Out".

---

## 12. Accessibility

- All content works without WebGL. The 3D layer is decoration over a real, semantic list of links.
- `prefers-reduced-motion`: no intro, no parallax, carousel becomes a plain scrollable list.
- Full keyboard use on the shelf with arrow keys, and visible focus rings in `--saffron-300` or `--cocoa-950`.
- Allergens are always real text, never only inside an image.
- Hero Card ratings read out properly, for example "Sweetness: 4 out of 5", with the icons hidden from screen readers.
- Tap targets at least 44px.
- Sound is off unless the user deliberately taps something that makes noise.

---

## 13. Do not

- Do not reuse any FIX artwork, wrappers, models, photography, copy, product names, puns or code. We are copying how it behaves and how good it feels, not what it is.
- Do not use Sharp Sans or Sydney, those are FIX's licensed type choices.
- Do not put truck art behind body text.
- Do not use `--rose-400` for body text on cream.
- Do not grey out unavailable desserts.
- Do not use stock photos of desserts. The food needs to be Fizz's own, the moment it looks generic the whole illusion falls apart.
- Do not make Biscoff or Bueno look like official packaging. No third-party logos or their brand colours as a look-alike.
