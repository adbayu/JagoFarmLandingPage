# PLAN: Revert Runtime Supabase Fetching to Build-Time SSG Prerendering

## 1. Goal and Scope
Revert client-side dynamic Supabase data fetching introduced in commit `8c5c3ff` back to pure build-time static site generation (SSG).

In scope:
- Revert `src/pages/HomePage.jsx`, `src/pages/ProductsPage.jsx`, `src/pages/ProjectsPortfolioPage.jsx`, and `src/pages/ProjectGalleryPage.jsx` to render directly from static data exports (`products` and `projectPortfolio`).
- Remove `useProducts` and `useProjects` runtime hooks and delete `src/data/useSupabaseData.js`.
- Clean up `src/data/content.js` and `src/data/projectPortfolio.js` to only export static build-time data.
- Remove browser-side Supabase initialization from `src/main.jsx` and browser client helpers from `src/data/supabase.js`.
- Simplify `scripts/prerender.mjs` to read `projectPortfolio` directly from `src/data/projectPortfolio.js`.
- Verify full static HTML prerendering and all tests passing.

Out of scope:
- Do not modify `scripts/fetch-data.mjs` (it remains the build-time fetcher from Supabase).
- Do not modify CMS server (`scripts/cms/server.mjs`) or admin UI.
- Do not add new dependencies.

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
| F1 | VERIFIED | `src/data/useSupabaseData.js:5-102` | Client-side hooks `useProducts` and `useProjects` initialize with `loading: true` and empty array. During SSR (`renderToString`), `useEffect` never runs, resulting in empty prerendered HTML skeletons. |
| F2 | VERIFIED | `src/pages/ProductsPage.jsx:24-34` | Renders `<p>Loading products...</p>` during SSR and initial browser paint, destroying instant page load. |
| F3 | VERIFIED | `src/pages/ProjectsPortfolioPage.jsx:21-31` | Renders `<p>Loading projects...</p>` during SSR and initial browser paint. |
| F4 | VERIFIED | `src/pages/ProjectGalleryPage.jsx:28-38` | Renders `<p>Loading project...</p>` during SSR and initial browser paint. |
| F5 | VERIFIED | `src/pages/HomePage.jsx:15` | `featuredProducts` evaluates to `[]` during SSR because `loading` is true, producing empty card slots in pre-baked HTML. |
| F6 | VERIFIED | `src/main.jsx:9-13` | Injects `@supabase/supabase-js` into client bundle, adding bundle transfer and execution overhead to purely static routes. |
| F7 | VERIFIED | `scripts/prerender.mjs:16-41` | Redundantly fetches projects from Supabase in Node.js instead of importing `projectPortfolio` from `src/data/projectPortfolio.js` (which is already populated by `scripts/fetch-data.mjs`). |

## 4. Phases and Steps

### Step 0 — Commit the plan file
- **Files:** `plans/PLAN-2026-10-30-static-render-revert.md`
- **Change:** Stage and commit the plan file alone.
- **Verify:** `git log --oneline -1` shows commit with plan file.
- **Commit message:** `docs(plans): PLAN-2026-10-30-static-render-revert.md`
- **Rollback:** `git revert HEAD`

---

### Phase 1: Revert Pages to Static Data

#### Step 1 — Clean up static data modules
- **Files:** `src/data/content.js`, `src/data/projectPortfolio.js`
- **Change:**
  In `src/data/content.js`:
  Remove line 26:
  ```javascript
  export { useProducts } from "./useSupabaseData.js";
  ```
  Ensure static `products` export remains:
  ```javascript
  import productsData from "./products.json" with { type: "json" };
  export const products = productsData;
  ```

  In `src/data/projectPortfolio.js`:
  Remove line 2:
  ```javascript
  export { useProjects } from "./useSupabaseData.js";
  ```
  Ensure static `projectPortfolio` export remains:
  ```javascript
  import projectsData from "./projects.json" with { type: "json" };

  export const projectPortfolio = projectsData.map((project) => ({
    ...project,
    photoNote: project.photoNote ?? "Belum ada foto untuk proyek ini.",
  }));
  ```
- **Traps to avoid:** Do not touch the static imports of `products.json` or `projects.json`.
- **Verify:** `node -e 'import("./src/data/content.js").then(m => console.log(m.products.length)); import("./src/data/projectPortfolio.js").then(m => console.log(m.projectPortfolio.length));'` prints product count and project count without errors.
- **Commit message:** `refactor(data): remove runtime hook exports from content and projectPortfolio`
- **Rollback:** `git checkout HEAD~1 -- src/data/content.js src/data/projectPortfolio.js`

#### Step 2 — Restore HomePage static rendering
- **Files:** `src/pages/HomePage.jsx`
- **Change:**
  Change import at line 8:
  ```javascript
  // FROM:
  import { isAgriculturalProduct, useProducts } from "../data/content.js";
  // TO:
  import { isAgriculturalProduct, products } from "../data/content.js";
  ```
  In `HomePage()`:
  Remove:
  ```javascript
  const { products, loading } = useProducts();
  
  // Filter for featured products (first 3 agricultural products)
  const featuredProducts = loading ? [] : products.filter(isAgriculturalProduct).slice(0, 3);
  ```
  Replace with module-level or top-of-component constant:
  ```javascript
  const featuredProducts = products.filter(isAgriculturalProduct).slice(0, 3);
  ```
- **Traps to avoid:** Keep `featuredProducts` variable name exact; lines 132-159 reference `featuredProducts.map(...)`.
- **Verify:** `node src/routing.test.js` passes.
- **Commit message:** `refactor(home): restore static products rendering`
- **Rollback:** `git checkout HEAD~1 -- src/pages/HomePage.jsx`

#### Step 3 — Restore ProductsPage static rendering
- **Files:** `src/pages/ProductsPage.jsx`
- **Change:**
  Change import at line 4:
  ```javascript
  // FROM:
  import { isAgriculturalProduct, productCategories, useProducts, productStatusLabels } from "../data/content.js";
  // TO:
  import { isAgriculturalProduct, productCategories, products, productStatusLabels } from "../data/content.js";
  ```
  In `ProductsPage()`:
  Remove:
  ```javascript
  const { products, loading, error } = useProducts();
  ```
  Remove loading guard block:
  ```javascript
  if (loading) {
    return (
      <div className="products-page">
        <section className="product-hero section">
          <div className="container">
            <p>Loading products...</p>
          </div>
        </section>
      </div>
    );
  }
  ```
  Remove error guard block:
  ```javascript
  if (error) {
    return (
      <div className="products-page">
        <section className="product-hero section">
          <div className="container">
            <p>Error loading products: {error}</p>
          </div>
        </section>
      </div>
    );
  }
  ```
- **Traps to avoid:** Keep `if (!dialogRef.current) return;` inside the modal `useEffect` to avoid null reference on unmount.
- **Verify:** `node src/routing.test.js` passes.
- **Commit message:** `refactor(products): restore static products rendering and remove loading guards`
- **Rollback:** `git checkout HEAD~1 -- src/pages/ProductsPage.jsx`

#### Step 4 — Restore ProjectsPortfolioPage and ProjectGalleryPage static rendering
- **Files:** `src/pages/ProjectsPortfolioPage.jsx`, `src/pages/ProjectGalleryPage.jsx`
- **Change:**
  In `src/pages/ProjectsPortfolioPage.jsx`:
  Change import at line 3:
  ```javascript
  // FROM:
  import { useProjects } from "../data/projectPortfolio.js";
  // TO:
  import { projectPortfolio } from "../data/projectPortfolio.js";
  ```
  In `ProjectsPortfolioPage()`:
  Remove:
  ```javascript
  const { projects: projectPortfolio, loading, error } = useProjects();
  ```
  Remove `if (loading) { ... }` and `if (error) { ... }` guard blocks.

  In `src/pages/ProjectGalleryPage.jsx`:
  Change import at line 3:
  ```javascript
  // FROM:
  import { useProjects } from "../data/projectPortfolio.js";
  // TO:
  import { projectPortfolio } from "../data/projectPortfolio.js";
  ```
  In `ProjectGalleryPage({ albumSlug })`:
  Remove:
  ```javascript
  const { projects: projectPortfolio, loading } = useProjects();
  const project = loading ? null : (projectPortfolio.find((item) => item.slug === slug) ?? projectPortfolio[0]);
  ```
  Replace with:
  ```javascript
  const project = projectPortfolio.find((item) => item.slug === slug) ?? projectPortfolio[0];
  ```
  Restore line 16:
  ```javascript
  const selectedPhoto = selectedPhotoIndex === null ? null : project.gallery[selectedPhotoIndex];
  ```
  Remove `if (loading || !project) { ... }` guard block.
- **Traps to avoid:** `projectPortfolio.find((item) => item.slug === slug) ?? projectPortfolio[0]` must fallback to `projectPortfolio[0]` to match previous stable behavior.
- **Verify:** `node src/routing.test.js && node src/metadata.test.js` pass.
- **Commit message:** `refactor(projects): restore static project and gallery rendering`
- **Rollback:** `git checkout HEAD~1 -- src/pages/ProjectsPortfolioPage.jsx src/pages/ProjectGalleryPage.jsx`

---

### Phase 2: Client Bundle & Prerender Cleanup

#### Step 5 — Clean up client entry and delete useSupabaseData.js
- **Files:** `src/main.jsx`, `src/data/supabase.js`, `src/data/useSupabaseData.js`
- **Change:**
  In `src/main.jsx`:
  Remove `@supabase/supabase-js` and `setBrowserClient` imports and browser client init block:
  ```javascript
  // REMOVE:
  import { createClient } from "@supabase/supabase-js";
  import { setBrowserClient } from "./data/supabase.js";

  // Initialize Supabase browser client
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    setBrowserClient(createClient(supabaseUrl, supabaseAnonKey));
  }
  ```
  The complete `src/main.jsx` must be:
  ```javascript
  import { StrictMode } from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App.jsx";
  import { legacyHashToPath } from "./routing.js";

  const legacyPath = legacyHashToPath(window.location.hash);
  if (legacyPath) window.history.replaceState(null, "", legacyPath);

  // Replace prerendered markup rather than hydrating against client-only theme state.
  createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
  ```

  In `src/data/supabase.js`:
  Remove browser-only client state and functions (`let browserClient`, `setBrowserClient`, `getBrowserClient`).
  Keep only `createSupabaseClient` for Node.js scripts (CMS and build fetcher).

  Delete `src/data/useSupabaseData.js`:
  ```sh
  rm src/data/useSupabaseData.js
  ```
- **Traps to avoid:** Do not remove `createSupabaseClient` from `src/data/supabase.js`; `scripts/fetch-data.mjs` and `scripts/cms/server.mjs` depend on it.
- **Verify:** `node src/routing.test.js && node src/cms.test.js` pass.
- **Commit message:** `refactor(client): remove supabase client from browser bundle and delete useSupabaseData`
- **Rollback:** `git checkout HEAD~1 -- src/main.jsx src/data/supabase.js src/data/useSupabaseData.js`

#### Step 6 — Simplify scripts/prerender.mjs
- **Files:** `scripts/prerender.mjs`
- **Change:**
  Replace the dynamic Supabase fetch block at the top of `scripts/prerender.mjs` with direct import of `projectPortfolio`:
  ```javascript
  // Replace lines 5-41 with:
  import { projectPortfolio } from "../src/data/projectPortfolio.js";
  ```
  Ensure `routePaths` uses the imported `projectPortfolio`:
  ```javascript
  const routePaths = [
    "/",
    "/tentang",
    "/produk",
    "/proyek",
    ...projectPortfolio.map(({ slug }) => `/proyek/${slug}`),
  ];
  ```
- **Traps to avoid:** `scripts/fetch-data.mjs` runs before `scripts/prerender.mjs` in `npm run build`, so `src/data/projects.json` is always refreshed before prerendering.
- **Verify:** Run `npm run build`. Build must complete with 0 errors and output:
  `Prerendered 18 route documents and dist/404.html.`
- **Commit message:** `refactor(prerender): import projectPortfolio from static data module`
- **Rollback:** `git checkout HEAD~1 -- scripts/prerender.mjs`

---

### Phase 3: Verification & Output Assertions

#### Step 7 — Verify prerendered HTML content and test suite
- **Files:** None (verification step)
- **Change:**
  Run the full test suite and verify build artifacts:
  1. `node src/cms.test.js`
  2. `node src/team-navigation.test.js`
  3. `node src/routing.test.js`
  4. `node src/metadata.test.js`
  5. `npm run build`
  6. Assert static HTML content:
     - Check `dist/produk/index.html`: Must NOT contain `Loading products...`. Must contain product card markup (`editorial-card` or product titles).
     - Check `dist/proyek/index.html`: Must NOT contain `Loading projects...`. Must contain project portfolio markup (`projects-index-item`).
     - Check `dist/index.html`: Must contain featured product items.
- **Verify:**
  ```sh
  node -e '
  const fs = require("fs");
  const p = fs.readFileSync("dist/produk/index.html", "utf8");
  if (p.includes("Loading products...")) throw new Error("dist/produk still has loading placeholder!");
  console.log("dist/produk verification passed.");
  const prj = fs.readFileSync("dist/proyek/index.html", "utf8");
  if (prj.includes("Loading projects...")) throw new Error("dist/proyek still has loading placeholder!");
  console.log("dist/proyek verification passed.");
  '
  ```
- **Commit message:** None (no code change).

## 5. Needs My Decision
None. All data shapes, build pipelines, and SSR rendering paths are fully verified against the git history prior to commit `8c5c3ff`.

## 6. Risks
- **Risk:** Build fails if `SUPABASE_URL` or `SUPABASE_ANON_KEY` is missing during `npm run build`.
  - **Mitigation:** `scripts/fetch-data.mjs` requires valid `.env`. `src/data/products.json` and `projects.json` are present locally and updated at each build.
- **Risk:** Content updates in CMS will not reflect on live site without rebuild.
  - **Mitigation:** This is the expected SSG architecture. Cloudflare Pages deploy hook or webhook triggers automated rebuild on CMS save.

## 7. Noticed but Out of Scope
- `scripts/cms/cms-integration.test.mjs` tests disk write fallback that was removed during database migration; should be updated in a separate CMS testing plan.
- CMS save action does not yet have an automated trigger to call Cloudflare Pages Deploy Hook (manual rebuild or webhook to be added in deployment plan).

## 8. After Execution
When all steps are committed, report back to the senior model (not the executor):
- State the plan file executed (`plans/PLAN-2026-10-30-static-render-revert.md`).
- List any steps that were PARTIAL or had to deviate.
- Do not update the jagofarm skill or any skill file. The senior model will run verify-plan, confirm correctness, and update the skill.
