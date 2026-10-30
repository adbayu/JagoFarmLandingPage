# PLAN: UI Responsiveness and Snappy Performance Tuning

## 1. Goal and Scope
Eliminate perceived scroll latency, blank reveal animation delays, render-blocking web fonts, and unnecessary transition sluggishness on the `cms` branch to make the website feel instant and snappy.

In scope:
- Shorten Lenis smooth scroll inertia duration and curve in `src/App.jsx`.
- Accelerate section scroll-reveal transitions in `src/styles.css` and expand `IntersectionObserver` trigger margins in `src/App.jsx`.
- Shorten theme switch transition durations in `src/styles.css` and `src/App.jsx`.
- De-block render-blocking Google Font stylesheet in `index.html`.
- Remove dangling 404 test artifact from `src/data/products.json`.
- Verify build, tests, and runtime metrics.

Out of scope:
- Do not remove Lenis entirely (keep desktop smooth scroll, but make it fast and responsive).
- Do not alter visual design, colors, typography, or content structure.
- Do not modify CMS server or Supabase schema.

## 2. Executor Rules
- Follow phases and steps in order, one at a time.
- Commit after each step: `git add -A && git commit -m "<type>(<scope>): <step description>"`.
- If code does not match what step describes, STOP and report mismatch. Do not improvise or fix adjacent things.
- Do not add dependencies, rename things, or change behavior outside the step.
- Run each step's verification before moving on. If it fails, stop and report.
- Verify unit tests pass: `node src/cms.test.js && node src/team-navigation.test.js && node src/routing.test.js && node src/metadata.test.js` before committing frontend steps.
- Do NOT update any skill file. Skill updates are handled by the senior model after verification.

## 3. Findings
| ID | Status | File:Line | Description |
|---|---|---|---|
| F1 | VERIFIED | `src/App.jsx:64` | Lenis smooth scroll configured with `duration: 1.8` and quartic easing deceleration. Mouse wheel input lags by nearly 2 seconds. |
| F2 | VERIFIED | `src/styles.css:65` and `src/App.jsx:97` | `.reveal-ready` hides all sections with `opacity: 0; transform: translateY(34px)` and `.75s` transition; observer rootMargin `-8%` forces sections to stay blank until scrolled well into viewport. |
| F3 | VERIFIED | `src/styles.css:19-20` and `src/App.jsx:18` | Theme transitions use `--theme-duration: .9s`, `--hero-theme-duration: 2.4s`, and `HERO_THEME_DURATION_MS = 2400`, creating a multi-second sluggish fade. |
| F4 | VERIFIED | `index.html:9` | Synchronous `<link rel="stylesheet">` for Google Fonts blocks first paint by ~400ms. |
| F5 | VERIFIED | `src/data/products.json:51-68` | 7th product `integration-test-product` points to non-existent `/assets/products/1793364498262-integration-test-img.png`, causing 404 network failure on `/produk`. |

## 4. Phases and Steps

### Step 0 — Commit the plan file
- **Files:** `plans/PLAN-2026-10-30-snappy-performance-tuning.md`
- **Change:** Stage and commit the plan file alone.
- **Verify:** `git log --oneline -1` shows commit with plan file.
- **Commit message:** `docs(plans): PLAN-2026-10-30-snappy-performance-tuning.md`
- **Rollback:** `git revert HEAD`

---

### Phase 1: Scroll & Motion Responsiveness

#### Step 1 — Tune Lenis scroll duration and curve
- **Files:** `src/App.jsx`
- **Change:**
  In `src/App.jsx`, locate the Lenis instantiation around line 64:
  ```javascript
  // FROM:
  lenis = new Lenis({ autoRaf: true, duration: 1.8, easing: (time) => 1 - Math.pow(1 - time, 4), wheelMultiplier: 1, smoothWheel: true, syncTouch: false, respectReducedMotion: false, stopInertiaOnNavigate: true });

  // TO:
  lenis = new Lenis({ autoRaf: true, duration: 0.7, easing: (time) => 1 - Math.pow(1 - time, 3), wheelMultiplier: 1, smoothWheel: true, syncTouch: false, respectReducedMotion: false, stopInertiaOnNavigate: true });
  ```
- **Traps to avoid:** Keep `autoRaf: true` and all other options intact. Only change `duration` to `0.7` and easing power from `4` to `3`.
- **Verify:** `node src/routing.test.js` passes.
- **Commit message:** `perf(scroll): tune lenis duration from 1.8s to 0.7s for snappy response`
- **Rollback:** `git checkout HEAD~1 -- src/App.jsx`

#### Step 2 — Accelerate scroll-reveal transitions and expand trigger margin
- **Files:** `src/styles.css`, `src/App.jsx`
- **Change:**
  In `src/styles.css`, locate line 65:
  ```css
  /* FROM: */
  .reveal-ready { opacity: 0; transform: translateY(34px); transition: opacity .75s ease, transform .75s cubic-bezier(.2,.7,.2,1); }

  /* TO: */
  .reveal-ready { opacity: 0; transform: translateY(12px); transition: opacity .25s ease, transform .25s cubic-bezier(.16,1,.3,1); }
  ```

  In `src/App.jsx`, locate line 97:
  ```javascript
  // FROM:
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.08, rootMargin: "0px 0px -8%" });

  // TO:
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.02, rootMargin: "50px 0px 50px 0px" });
  ```
- **Traps to avoid:** Expanding `rootMargin` to `50px 0px 50px 0px` ensures elements reveal slightly before they hit the viewport edge, eliminating the blank space sensation during fast scrolling.
- **Verify:** `node src/routing.test.js` passes.
- **Commit message:** `perf(reveal): shorten reveal transition to 0.25s and trigger proactively`
- **Rollback:** `git checkout HEAD~1 -- src/styles.css src/App.jsx`

#### Step 3 — Accelerate theme transition duration
- **Files:** `src/styles.css`, `src/App.jsx`
- **Change:**
  In `src/styles.css`, locate lines 19-20:
  ```css
  /* FROM: */
    --theme-duration: .9s;
    --hero-theme-duration: 2.4s;

  /* TO: */
    --theme-duration: .25s;
    --hero-theme-duration: .4s;
  ```

  In `src/App.jsx`, locate line 18:
  ```javascript
  // FROM:
  const HERO_THEME_DURATION_MS = 2400;

  // TO:
  const HERO_THEME_DURATION_MS = 400;
  ```
- **Traps to avoid:** `HERO_THEME_DURATION_MS` in JS must match `--hero-theme-duration` in CSS (400ms = 0.4s).
- **Verify:** `node src/team-navigation.test.js` passes.
- **Commit message:** `perf(theme): reduce theme transition duration from 2.4s to 400ms`
- **Rollback:** `git checkout HEAD~1 -- src/styles.css src/App.jsx`

---

### Phase 2: Asset & Loading Optimization

#### Step 4 — De-block Google Font stylesheet
- **Files:** `index.html`
- **Change:**
  In `index.html`, locate line 9:
  ```html
  <!-- FROM: -->
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

  <!-- TO: -->
      <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600;700;800&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'" />
      <noscript>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600;700;800&display=swap" />
      </noscript>
  ```
- **Traps to avoid:** Keep `preconnect` links for `fonts.googleapis.com` and `fonts.gstatic.com` on lines 7-8 above this block.
- **Verify:** `npm run build` succeeds and `dist/index.html` contains the non-blocking font tags.
- **Commit message:** `perf(fonts): load Google Fonts asynchronously to prevent render-blocking`
- **Rollback:** `git checkout HEAD~1 -- index.html`

#### Step 5 — Clean up non-existent test product in products.json
- **Files:** `src/data/products.json`
- **Change:**
  Remove the 7th test item (`id: "integration-test-product"`) with non-existent image from `src/data/products.json`:
  ```json
  // REMOVE:
    {
      "id": "integration-test-product",
      "name": "Integration Test Product",
      "description": "A temporary product created during CMS integration testing.",
      "image": "/assets/products/1793364498262-integration-test-img.png",
      "category": "teknologi",
      "categoryLabel": "Teknologi",
      "icon": "sensor",
      "status": "prototype"
    }
  ```
  `src/data/products.json` must contain exactly the 6 genuine products: `iot`, `ikan-nila`, `ikan-gurame`, `pupuk-azolla`, `kangkung`, `sorgum`.
- **Traps to avoid:** Ensure valid JSON trailing commas are removed when deleting the final object.
- **Verify:**
  ```sh
  node -e 'const p = JSON.parse(require("fs").readFileSync("src/data/products.json")); assert = require("assert"); assert.equal(p.length, 6);'
  ```
- **Commit message:** `fix(data): remove dangling test product with missing image`
- **Rollback:** `git checkout HEAD~1 -- src/data/products.json`

---

### Phase 3: Verification & Performance Benchmark

#### Step 6 — Run build, test suite, and verify snappiness
- **Files:** None (verification step)
- **Change:**
  Run the full test suite and build:
  1. `node src/cms.test.js`
  2. `node src/team-navigation.test.js`
  3. `node src/routing.test.js`
  4. `node src/metadata.test.js`
  5. `npm run build`
- **Verify:**
  Run `npm run build` and confirm all 18 routes prerender successfully with zero errors.
- **Commit message:** None (no code change).

## 5. Needs My Decision
None. All parameter adjustments are bounded, standard performance tuning values.

## 6. Risks
- **Risk:** Font flash (FOUT) while asynchronous Google Fonts load.
  - **Mitigation:** CSS already defines fallback sans-serif font stack (`font: 16px/1.6 Manrope, Arial, sans-serif`); fallback renders immediately and swaps cleanly via `font-display: swap`.
- **Risk:** Re-running CMS integration test in the future may re-add `integration-test-product`.
  - **Mitigation:** Integration test cleanup in `scripts/cms/cms-integration.test.mjs` should be updated in a subsequent testing cleanup plan to prune added test records on completion.

## 7. Noticed but Out of Scope
- Large bitmaps (`public/assets/ecosystem-illustration.png` at 2.6 MB) could be converted to WebP (~200 KB) in an image asset pipeline optimization plan.

## 8. After Execution
When all steps are committed, report back to the senior model (not the executor):
- State the plan file executed (`plans/PLAN-2026-10-30-snappy-performance-tuning.md`).
- List any steps that were PARTIAL or had to deviate.
- Do not update the jagofarm skill or any skill file. The senior model will run verify-plan, confirm correctness, and update the skill.
