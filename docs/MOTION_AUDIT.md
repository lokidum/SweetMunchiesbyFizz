# Motion audit and elevation plan

Audit of the first motion pass, measured against `docs/design.md` section 7 and `docs/BUILD_PROMPT.md` sections 7 and 12. Checked live in the dev server at 1440 x 900 and 375 x 812 on 5 November 2026.

## 1. How motion works today

There is no motion library in use. `gsap` is in `package.json` but nothing imports it, and Lenis is not installed. Motion comes from three separate clocks that do not talk to each other:

| Clock | Where | Drives |
| --- | --- | --- |
| `setTimeout` chain setting React state | `components/munchies/experience.tsx` | `data-scene` on `.cinematic-stage`: loading, pour, box, open, burst, reveal |
| CSS transitions and 17 `@keyframes` keyed off `data-scene` | `app/globals.css` | Loader orbit, pour curtain, gift box, burst packs, wipe, ratings |
| R3F `useFrame` with its own `smoothstep` timeline | `components/munchies/stage.tsx` | 3D gift box drop, lid, hero spin in, neighbours, particles, camera |

### Inventory

| Moment | File | What it does now | Spec says |
| --- | --- | --- | --- |
| Loader | `experience.tsx`, CSS `ingredientOrbit`, `emblemBreathe` | 30 CSS crumbs orbit two ellipses, logo breathes, thin bar plus `NN%`. Progress counts 3 things (logo PNG, studio PNG, fonts). Minimum 1.4s, safety 6.5s. Rendered by React after hydration | Inline SVG/CSS in the first HTML, 60 to 120 crumbs that lean to pointer and spring back, logo fills bottom up, crumbs land, burst plus heartbeat at 100 |
| Intro timeline | `experience.tsx` | Beats at 0, 1.3, 2.7, 3.8, 5.1s, ends at 6.5s. About 8s including loader. Skip button only. Repeat visits skip everything | About 5s, interruptible by tap, 1s repeat version |
| The Pour | CSS `.pour-curtain`, `liquidFold`, `glintPass` | Two border-radius blobs morph, then the whole curtain translates up 140%. "CRAVE IT. Munch it. LOVE IT." fades in as one block | Two-tone glossy shader, drips rise off the edge, type lands line by line and is wiped by the drip edge |
| Gift box | `stage.tsx` `Scene` | Procedural RoundedBox drops (0.2 to 1.4s), lid opens (1.5 to 2.8s) | Skinned bag drops with squash, camera push in |
| Burst and hero catch | `stage.tsx` | Hero scales up from 0.12 with a full 2 pi spin, neighbours slide from centre | Packages explode upward with depth of field, hero tumbles, flips, settles |
| Shelf | `shelf.tsx` | Integer index. Wheel is throttled to one step per 850ms. Vertical swipe over 65px. Arrows and keys. On change the heading remounts with CSS `rise` and the 3D hero gets a 1.2 rad damped spin | Inertial Observer input, arc layout, velocity lean and blur, snap with overshoot, cursor tilt of the whole set, caption track in sync |
| World colour | `shelf.tsx` `--world`, `stage.tsx` `Gradient` | CSS background swaps instantly, the shader lerps over about 0.5s, so they disagree for a beat | Colour floods in from the centre |
| Into a dessert | `shelf.tsx` `openDessert` | `clip-path` circle bloom 0.7s, then `window.location.href` after 650ms: a full reload, the canvas is destroyed | Organic blob, package rises, lid opens, Hero Card slides out of it, no reload |
| Dessert page | `experience.tsx` `ProductScene`, `product.tsx` | A second Canvas. Scroll listener calls `setState` on every scroll event to open the lid and dolly the camera. "Lift the lid" toggle | Hero Card first, then Spoon scrub, story, arc text, inside, What is it, package returns |
| Ratings | CSS `treatFill` | Icons pop in 90ms apart. Good, matches spec | Plus a crumb from the last icon and a wiggle on 5 out of 5 |
| Easter egg | `shelf.tsx` | Typing "meetha" rains heart glyphs | Rose petals and a small Urdu word |
| Reduced motion | `globals.css` lines 6 and 15 | Global kill switch, intro hidden | Matches spec |

## 2. Bugs found while running it

1. **The dessert name disappears on desktop once WebGL is ready.** The `Gradient` backdrop in `stage.tsx` is an opaque plane, and `.cinematic-stage` (z-index 3) sits above `.stage-heading` (z-index 2). "KHEER" is visible on phone and on the CSS fallback, and hidden on desktop.
2. **Hard edged band behind the shelf.** The same backdrop is a fixed 40 x 25 plane at z = -6, so on wide screens its top and bottom edges show as a darker rectangle.
3. ~~The page jumps about 300px when you press the next arrow.~~ Not a site bug: the test tool scrolled the element into view. A real click leaves `scrollY` at 0.
4. **Contact shadow is frozen.** `ContactShadows frames={1}` renders once at mount, so the gift box drops and the hero spins over a shadow that never moves.
5. **The lid re-renders the whole model 25 times a second.** `setLid` is called from inside `useFrame` every 40ms, which rebuilds every mesh in `DessertModel`. Same pattern in `ProductScene` scroll.
6. **Two canvases and a hard reload.** Home and dessert pages each create their own WebGL context, and the shelf to dessert move reloads the page. The brief asks for one persistent canvas in the root layout.
7. **Easing is ad hoc.** Seven hand-written `cubic-bezier` values and no shared tokens. The `ease` and `dur` tokens in `design.md` are not in code.
8. **`globals.css` is 48KB of append-only overrides.** `.stage-heading` `top` is set five times. Any motion tuning here is fragile.

An honest note on art: the pre-rendered `public/renders/packaging-studio.png` (used by the CSS fallback, see phone screenshot) looks more premium than the procedural Three.js models. Until real GLBs exist, the procedural meshes are pulling the 3D path down.

## 3. Elevation plan

Ordered so each step is shippable on its own and later steps build on earlier ones.

### Step A: fix what is broken (done 5 November 2026)

- Backdrop is now a screen-space quad at the far plane (`stage.tsx` `Gradient`). It is opaque during the intro and fades out from 4.6s to 5.6s of the 3D timeline, so on the shelf the canvas is transparent and the CSS world colour and HTML title show through. It is transparent, so it keeps the depth test on to stay behind the models.
- Lid and scroll progress are refs read in `useFrame` (`DessertModel` lid group, `heroLid`, `ProductScene` `progress`). The scroll handler is rAF throttled and writes `--scroll` directly. The hero lid now eases open instead of snapping.
- `ContactShadows frames={Infinity}` so the shadow follows the bob, spin and box drop.
- `--world` and `--ink` are registered with `@property` and transition over 0.65s on `.shelf`, so changing dessert blends the colour instead of cutting.
- Checked headless in Chrome at 1440 x 900 and 375 x 812: intro beats, reveal, shelf switch, dessert page lid and scroll.
### Step B: one motion system (1 to 2 days)

- `lib/motion/tokens.ts` with the `ease` and `dur` tokens from `design.md`, registered as GSAP `CustomEase` names, and the same values as CSS custom properties.
- `lib/device-tier.ts` (high, mid, low, calm) as the brief describes.
- One GSAP master timeline for the intro with labels (`pour`, `type`, `lift`, `drop`, `push`, `burst`, `catch`, `reveal`). It tweens DOM directly and writes a single `progress` value into a ref that the R3F scene reads. One clock, no drift.
- Tap anywhere: `timeline.timeScale(4)` once assets are ready. Skip: `seek('reveal')`. Repeat visit: same timeline at `timeScale(5)` for the 1s version.
- Retarget beats to the design table: pour 0.2, type 0.8, lift 1.8, nav 2.4, drop 2.6, push 3.4, burst 3.8, catch 4.4, reveal 5.0.

### Step C: the signature moments (1 to 2 weeks)

1. **Loader in the first HTML.** Inline SVG logo plus a 2D canvas of about 90 crumbs on the swirl path, with a spring toward pointer or finger. Real progress tightens the orbit and fills the logo bottom up through `clip-path`. At 100: crumbs burst, one heartbeat, hand off to the timeline.
2. **The Pour shader.** Full-screen fragment shader, noise driven drip height, chocolate first with rose folded through, fake specular. `uProgress` comes from the master timeline. Type lands line by line with SplitText, then the drip edge wipes it (draw the sheet above the type and let the rising edge cover it). Low tier gets a short WebM.
3. **The shelf.** Replace the integer index with a continuous float position fed by GSAP Observer (wheel, touch, pointer) with inertia and snap on `expo.out` plus a small overshoot. Lay packages on an arc (`x = sin`, `z = -cos`), lean by velocity, add blur on high tier only. Horizontal at 768px and up, vertical below, via `gsap.matchMedia`. Caption track reads the same float.
4. **Into a dessert without a reload.** Move the Canvas into the root layout, route with the App Router, and play: world colour blob from the click point (SVG gooey filter or a shader circle with noise edge), package scales and rises, lid opens, the server-rendered Hero Card slides out from the package's screen position.
5. **Dessert page storyboard.** Lenis plus ScrollTrigger, pinned sections for Spoon (frame sequence placeholder on canvas), story, arc text on an SVG `textPath` rotating with scroll, inside, What is it, package returns.
6. **Micro moments.** Swirl underline on links, button arrow fill with a falling drip, Add to box arc into the cart with crumbs and a cart wiggle, lagging chocolate cursor dot, rating crumb and 5 out of 5 wiggle.

### Step D: art that matches the motion

Real GLBs (bag with `drop`, `open`, `burst` clips, pot, can, cup), KTX2 wrapper textures, Draco or Meshopt compression. Until then, use the studio renders as textured cards in the 3D scene rather than procedural meshes.

## 4. Order against the build phases

`BUILD_PROMPT.md` puts business logic (phases 1 to 5) before motion (phases 6 to 9), and `DECISIONS.md` lists commerce gates still open. Step A is cheap and fixes visible bugs, so it is worth doing now. Steps B to D map onto phases 6, 7 and 9.
