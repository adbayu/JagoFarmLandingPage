# PLAN: Local Flat-File CMS for Products and Projects (PocketBase-Style UI)

## 1. Goal and Scope
- Build a zero-dependency, local-only CMS from scratch for managing JagoFarm products and project portfolios.
- Implement a modern, user-friendly UI inspired by PocketBase: sidebar collection navigation, searchable/filterable data table, right slide-over edit drawer, drag-and-drop file upload, toast notifications, and build logs console.
- Store content in flat JSON files (`src/data/products.json`, `src/data/projects.json`) so the static SSG prerender pipeline (`npm run build`) consumes them directly without external database costs or runtime API requirements.
- Store media assets locally in `public/assets/products/` and `public/assets/projects/`.
- Provide a lightweight local desktop admin dashboard served at `http://localhost:3333` via `npm run cms`.
- Preserve existing consumer contracts: `src/data/content.js` and `src/data/projectPortfolio.js` re-export from the JSON files, ensuring zero breakage in `routing.js`, `metadata.js`, `prerender.mjs`, or existing tests.
- Scope excludes: authentication servers, cloud database connections, modifying site styles or page layout components.

## 2. Executor Rules
- Follow phases and steps in order, one at a time.
- Commit after each step: `git add -A && git commit -m "<type>(<scope>): <step description>"`.
- If code does not match what step describes, STOP and report mismatch. Do not improvise or fix adjacent things.
- Do not add dependencies, rename things, or change behavior outside step.
- Run step's verification before moving on. If fails, stop and report.
- For backend/script steps: verify with `node <script>` before committing.
- For frontend/SSG steps: verify with `npm run build` and `node src/*.test.js` before committing.
- Do NOT update any skill file. Skill updates handled by senior model after verification.

## 3. Findings
| ID | Status | File:Line | Description |
|---|---|---|---|
| F-01 | VERIFIED | `src/data/content.js:25` | Products array hardcoded in JS file; consumed by `HomePage.jsx` and `ProductsPage.jsx`. |
| F-02 | VERIFIED | `src/data/projectPortfolio.js:30` | Project portfolio array hardcoded with inline photo lists; consumed by router, metadata, prerender, and project pages. |
| F-03 | VERIFIED | `scripts/prerender.mjs:16` | Prerender imports `projectPortfolio` to dynamically generate 18 static HTML files. |
| F-04 | VERIFIED | `src/routing.test.js`, `src/metadata.test.js` | Zero-dependency Node test suites import `projectPortfolio` and assert route paths and SEO metadata. |

## 4. Phases and Steps

### Step 0 — Commit plan file
- **Files:** `plans/PLAN-2026-10-26-local-flat-file-cms.md`
- **Change:** No source code changes. Stage and commit plan file alone.
- **Verify:** `git log --oneline -1` shows commit only plan file.
- **Commit message:** `docs(plans): PLAN-2026-10-26-local-flat-file-cms.md`
- **Rollback:** `git revert HEAD`

---

### Phase 1: Data Extraction & Compatibility Layer

#### Step 1 — Extract products into `src/data/products.json` and adapt `content.js`
- **Files:** `src/data/products.json` (new), `src/data/content.js`
- **Change:**
  1. Create `src/data/products.json` with the existing 6 products:
  ```json
  [
    {
      "id": "iot",
      "name": "Platform sensor dan keputusan budidaya",
      "description": "Sensor ESP32 membaca pH, TDS, dan suhu air, sementara dashboard sudah dibangun dan rekomendasi AI sedang diintegrasikan dengan Claude API.",
      "image": "/assets/products/iot.webp",
      "category": "teknologi",
      "categoryLabel": "Teknologi",
      "icon": "sensor",
      "status": "prototype"
    },
    {
      "id": "ikan-nila",
      "name": "Ikan nila",
      "description": "Hasil budidaya ikan yang sedang diamati dalam ekosistem awal.",
      "image": "/assets/products/nila.webp",
      "category": "akuakultur",
      "categoryLabel": "Akuakultur",
      "icon": "fish",
      "status": "riset"
    },
    {
      "id": "ikan-gurame",
      "name": "Ikan gurame",
      "description": "Komoditas ikan kedua dalam pengamatan budidaya JagoFarm.",
      "image": "/assets/products/gurame.webp",
      "category": "akuakultur",
      "categoryLabel": "Akuakultur",
      "icon": "fish",
      "status": "riset"
    },
    {
      "id": "pupuk-azolla",
      "name": "Pupuk azolla",
      "description": "Gagasan pemanfaatan biomassa azolla sebagai bahan bernilai guna.",
      "image": "/assets/products/azolla.webp",
      "category": "nutrisi",
      "categoryLabel": "Nutrisi & Pupuk",
      "icon": "leaf",
      "status": "riset"
    },
    {
      "id": "kangkung",
      "name": "Kangkung",
      "description": "Tanaman cepat panen yang potensial dalam ekosistem budidaya terpadu.",
      "image": "/assets/products/kangkung.webp",
      "category": "tanaman",
      "categoryLabel": "Tanaman",
      "icon": "plant",
      "status": "riset"
    },
    {
      "id": "sorgum",
      "name": "Sorgum",
      "description": "Tanaman serbaguna yang dieksplorasi sebagai sumber pangan dan pakan.",
      "image": "/assets/products/sorgum.webp",
      "category": "tanaman",
      "categoryLabel": "Tanaman",
      "icon": "plant",
      "status": "riset"
    }
  ]
  ```
  2. In `src/data/content.js`, import `products` from `./products.json` and export it:
  ```js
  import productsData from "./products.json" with { type: "json" };
  export const products = productsData;
  ```
- **Traps to avoid:** Preserve UTF-8 encoding and keys. Do not alter `categoryLabel` or `status` values.
- **Verify:** Run `npm run build` and ensure `dist/produk/index.html` renders all 6 products.
- **Rollback:** `git checkout src/data/content.js && rm src/data/products.json`

#### Step 2 — Extract projects into `src/data/projects.json` and adapt `projectPortfolio.js`
- **Files:** `src/data/projects.json` (new), `src/data/projectPortfolio.js`
- **Change:**
  1. Create `src/data/projects.json` containing the 5 projects (`bestari`, `pkm`, `sensor-ph-air`, `iot`, `ekosistem-sirkular`) with their full attributes (`slug`, `number`, `status`, `kind`, `name`, `description`, `photoNote`, `cover`, `gallery`, `partners`).
  2. In `src/data/projectPortfolio.js`, replace the hardcoded photo arrays and portfolio array with:
  ```js
  import projectsData from "./projects.json" with { type: "json" };

  export const projectPortfolio = projectsData.map((project) => ({
    ...project,
    photoNote: project.photoNote ?? "Belum ada foto untuk proyek ini.",
  }));
  ```
- **Traps to avoid:** Ensure `gallery` array item objects preserve `{ title, image, alt }` shape. Cover can be `null` or a photo object.
- **Verify:** Run `node src/routing.test.js && node src/metadata.test.js && npm run build`. All 18 routes must generate with zero errors.
- **Rollback:** `git checkout src/data/projectPortfolio.js && rm src/data/projects.json`

#### Step 3 — Add CMS Data Validation Script & Tests
- **Files:** `src/data/cmsValidation.js` (new), `src/cms.test.js` (new)
- **Change:**
  1. Create `src/data/cmsValidation.js` exporting validation functions `validateProduct(product)` and `validateProject(project)`:
     - `validateProduct`: asserts non-empty `id`, `name`, `description`, `image`, valid `category` in `["akuakultur", "nutrisi", "tanaman", "teknologi"]`, valid `status` in `["prototype", "riset"]`.
     - `validateProject`: asserts non-empty `slug` (kebab-case), `number`, `name`, `description`, valid `status` in `["berjalan", "selesai"]`, valid `gallery` array where each photo has `title`, `image`, `alt`.
  2. Create `src/cms.test.js` using Node stdlib `assert` to validate every entry in `src/data/products.json` and `src/data/projects.json`.
- **Verify:** `node src/cms.test.js` exits with code 0 and prints `cms data validation passed`.
- **Rollback:** `rm src/data/cmsValidation.js src/cms.test.js`

---

### Phase 2: Local CMS Server (REST API & Uploads)

#### Step 4 — Implement zero-dependency CMS HTTP server
- **Files:** `scripts/cms/server.mjs` (new)
- **Change:**
  Create standalone HTTP server running on `http://localhost:3333` using `node:http`, `node:fs/promises`, `node:path`, `node:child_process`:
  - Static file server for `scripts/cms/public/`.
  - `GET /api/products`: returns parsed `src/data/products.json`.
  - `PUT /api/products`: validates array with `validateProduct`, writes formatted JSON to `src/data/products.json`.
  - `GET /api/projects`: returns parsed `src/data/projects.json`.
  - `PUT /api/projects`: validates array with `validateProject`, writes formatted JSON to `src/data/projects.json`.
  - `POST /api/upload?folder=<products|projects>&filename=<name>`:
    Reads raw binary stream from request body (`Buffer.concat`), verifies folder is strictly `"products"` or `"projects"`, generates safe filename (`${Date.now()}-${sanitized}`), writes to `public/assets/<folder>/<safe_filename>`, returns `{ "url": "/assets/<folder>/<safe_filename>" }`.
  - `POST /api/build`: executes `npm run build`, returns `{ "success": boolean, "output": string }`.
- **Traps to avoid:** Sanitize filename and directory traversal via `path.basename` and whitelist checking. Never allow arbitrary file writes.
- **Verify:** Run `node scripts/cms/server.mjs --test-port 3333` and test `GET /api/products` via `curl -s http://localhost:3333/api/products`.
- **Rollback:** `rm -rf scripts/cms/server.mjs`

#### Step 5 — Add `cms` npm script
- **Files:** `package.json`
- **Change:** Add `"cms": "node scripts/cms/server.mjs"` to `scripts` in `package.json`.
- **Verify:** `npm run cms` starts the server without syntax errors.
- **Rollback:** `git checkout package.json`

---

### Phase 3: PocketBase-Style CMS Desktop UI

#### Step 6 — Implement PocketBase-Inspired Admin Dashboard
- **Files:** `scripts/cms/public/index.html` (new), `scripts/cms/public/cms.css` (new), `scripts/cms/public/cms.js` (new)
- **Change:**
  Create a single-page reactive application with the look, feel, and ergonomics of PocketBase:
  
  1. **Layout Structure (`index.html`)**:
     - **Left Sidebar Navigation** (`.pb-sidebar`):
       - App branding: `JagoFarm CMS` with `v1.0 (local)` pill badge.
       - Collections Nav Group:
         - `Products` (with package icon and live count badge).
         - `Projects` (with folder icon and live count badge).
       - System Nav Group (bottom):
         - `Build & Logs` (terminal icon).
         - `Preview Website` (opens `http://localhost:4173/` or `http://localhost:5173/` in new tab).
     - **Main Content Pane** (`.pb-main`):
       - Header Bar: Collection title, search bar (instant client-side filtering by name, id, category), category/status filter dropdowns, and `+ New record` primary green button.
       - Data Table (`.pb-table`):
         - Sticky header with sortable columns: `Thumbnail`, `Name`, `Category / Kind`, `Status Badge`, `ID / Slug`, `Actions`.
         - Rows: Click row to open slide-over editor; quick actions for edit, duplicate, and delete.
         - Status Badges: Styled as PocketBase chips (green dot for `prototype` / `berjalan`, gray dot for `riset` / `selesai`).
     - **Slide-over Record Drawer** (`.pb-drawer`):
       - Slides in smoothly from right edge (`transform: translateX(100%) -> 0`) with backdrop overlay.
       - Header: Record title (e.g., `New Product` or `Edit: Ikan nila`), close button (X), Esc key listener.
       - Body / Fields:
         - Labeled input fields with subtle borders and helper text.
         - For Products: `Name`, `ID / Slug` (monospace, auto-generated from name on creation), `Category` (select), `Category Label`, `Status` (select), `Icon` (select with icon preview), `Description` (textarea).
         - For Projects: `Name`, `Slug`, `Number` (e.g. `01`), `Status`, `Kind`, `Description`, `Photo Note`.
         - **PocketBase-style File Dropzone**:
           - Drag-and-drop zone or "Choose file" button.
           - Image preview container showing current image thumbnail, path, and clear button.
           - Instant upload via `POST /api/upload`, updating field value with returned URL.
         - **Project Gallery Manager** (for projects):
           - Multi-image dropzone to add photos in bulk.
           - Grid of gallery items with thumbnail, title input, alt text input, "Set as cover" button, and delete photo button.
       - Sticky Footer Actions:
         - `Delete` button (red, with confirm prompt).
         - `Cancel` button.
         - `Save changes` button (primary green, shows spinner while saving).
     - **Toast Notification Manager** (`.pb-toast-container`):
       - Fixed bottom-right corner.
       - Notifications for: "Record created successfully", "Changes saved", "Image uploaded", "Build finished".
     - **Slide-up Build & Logs Terminal** (`.pb-logs-drawer`):
       - Slides up from bottom.
       - Dark monospace terminal view displaying stdout/stderr of `npm run build` with "Trigger Build" button.
  
  2. **Styling Tokens (`cms.css`)**:
     - Neutral dark/light palette inspired by PocketBase: `--pb-bg: #f8fafc`, `--pb-surface: #ffffff`, `--pb-border: #e2e8f0`, `--pb-primary: #15803d` (forest green), `--pb-text: #0f172a`, `--pb-muted: #64748b`.
     - Monospace font for IDs, slugs, and logs.
  
  3. **Interaction Script (`cms.js`)**:
     - State management: `state = { collection: 'products', records: [], activeRecord: null, filter: '', statusFilter: 'all' }`.
     - Zero build dependencies (pure browser vanilla ES modules).
- **Traps to avoid:**
  - Prevent accidental loss of unsaved changes by checking `drawerForm.isDirty` before closing.
  - Image paths must be relative to root (e.g. `/assets/products/...`), matching Vite public asset resolution.
- **Verify:** Start `npm run cms`, open `http://localhost:3333`, click between Products and Projects collections, open drawer, test search filtering, and test saving a record.
- **Rollback:** `rm -rf scripts/cms/public/`

---

### Phase 4: End-to-End Verification

#### Step 7 — End-to-End CMS integration test
- **Files:** `scripts/cms/cms-integration.test.mjs` (new)
- **Change:**
  Create automated test that:
  1. Starts CMS server on test port `3334`.
  2. Fetches products and projects via HTTP.
  3. Uploads a mock test image (1x1 transparent PNG) via `/api/upload`.
  4. Appends a temporary test product, saves via `/api/products`.
  5. Verifies `products.json` updated on disk.
  6. Reverts test product and deletes test image.
  7. Shuts down test server.
- **Verify:** `node scripts/cms/cms-integration.test.mjs` passes with exit code 0.
- **Rollback:** `rm scripts/cms/cms-integration.test.mjs`

---

## 5. Needs My Decision
None. All specifications (PocketBase UI pattern, flat JSON storage, local assets, zero external dependencies) are established.

## 6. Risks
- **JSON Syntax / Merge Conflicts**: If multiple team members edit content simultaneously on git, JSON arrays may produce merge conflicts.
  *Mitigation:* Schema validation script (`node src/cms.test.js`) runs before every build and commit.
- **Missing or Orphaned Images**: Deleting a product/project without deleting its uploaded image leaves unused assets in `public/assets/`.
  *Mitigation:* CMS UI flags unreferenced images or leaves them harmlessly in `public/assets/` without breaking builds.

## 7. Noticed but Out of Scope
- `src/pages/DocumentationPage.jsx` is unused/unrouted. Can be cleaned up in a future maintenance pass.
- Missing media assets in `TODO_ASSETS.md` (ESP32 hardware photos, demo video).

## 8. After Execution
Once all steps are committed, report back to the senior model (do not execute on your own):
- State the plan file executed (`plans/PLAN-2026-10-26-local-flat-file-cms.md`).
- List any steps that were PARTIAL or had to deviate.
- Do not update `jagofarm` skill or any skill file.
The senior model will run verification, confirm correctness, and update the skill.
