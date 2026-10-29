# PLAN: Migrate data from flat-file JSON to Supabase + make CMS write to Supabase

## 1. Goal and Scope

**Task:** Replace the current flat-file JSON data store (`src/data/products.json`, `src/data/projects.json`, `src/data/_schema.json`) with a Supabase PostgreSQL database. The landing page fetches data from Supabase at build time (SSG) and the CMS admin dashboard reads/writes to Supabase instead of local JSON files.

**"Done" means:**
1. Supabase tables exist for `products` and `projects` (with gallery/cover/partners as JSONB).
2. Existing JSON data is seeded into those tables.
3. The CMS server (`scripts/cms/server.mjs`) reads from and writes to Supabase instead of `fs.readFile`/`fs.writeFile` on JSON files.
4. The build-time data layer (`src/data/content.js`, `src/data/projectPortfolio.js`) fetches from Supabase (or from a build-time script that pulls Supabase data into JSON before Vite runs).
5. The frontend renders the same output as before — zero visual regression.
6. Image uploads remain on local filesystem (or optionally Supabase Storage — decision needed).
7. Custom collections (user-created via CMS UI) still work, stored in a generic `collections` + `collection_records` table pattern.

**Out of scope:** Auth migration (CMS auth stays HMAC-based .env credentials), i18n changes, routing changes, SSR pipeline changes beyond data sourcing.

## 2. Executor Rules

- **Branch:** All work happens on the `cms` branch. Before starting, run `git checkout cms && git pull origin cms` (or just `git checkout cms` if no remote tracking). Do NOT commit to `main`.
- Follow phases and steps in order, one at a time.
- Commit after each step: `git add -A && git commit -m "<type>(<scope>): <step description>"`.
- If code does not match what the step describes, STOP and report mismatch. Do not improvise or fix adjacent things.
- Do not add dependencies, rename things, or change behavior outside the step.
- Run the step's verification before moving on. If it fails, stop and report.
- Do NOT update any skill file. Skill updates are handled by senior model after verification.

## 3. Findings

| ID | Status | File:Line | Description |
|----|--------|-----------|-------------|
| F1 | VERIFIED | `src/data/products.json` | 6 product records, flat array of objects with fields: id, name, description, image, category, categoryLabel, icon, status |
| F2 | VERIFIED | `src/data/projects.json` | 5 project records, each with slug, number, status, kind, name, description, cover (object or null), gallery (array of {title, image, alt}), photoNote, optional partners array |
| F3 | VERIFIED | `src/data/_schema.json` | Schema registry: 2 system collections (products, projects) with field definitions. Custom collections append here. |
| F4 | VERIFIED | `src/data/content.js:25-26` | Products imported via `import productsData from "./products.json" with { type: "json" }` — used at build time by Vite SSR and at client runtime |
| F5 | VERIFIED | `src/data/projectPortfolio.js:1` | Projects imported via `import projectsData from "./projects.json" with { type: "json" }` — same pattern |
| F6 | VERIFIED | `scripts/cms/server.mjs:329-408` | CMS reads/writes collection data via `fs.readFile`/`fs.writeFile` on `src/data/<collection>.json` |
| F7 | VERIFIED | `scripts/cms/server.mjs:109-119` | Schema loaded from `_schema.json`, saved with CRLF normalization |
| F8 | VERIFIED | `scripts/cms/server.mjs:360-401` | Validation: products go through `validateProduct()`, projects through `validateProject()`, custom collections validated against schema field definitions |
| F9 | VERIFIED | `scripts/cms/server.mjs:411-446` | File uploads write to `public/assets/<collection>/` with timestamped filenames, return relative URL |
| F10 | VERIFIED | `scripts/prerender.mjs:5` | SSG prerender imports `projectPortfolio` to generate `/proyek/:slug` routes — must have data available at build time |
| F11 | VERIFIED | `src/pages/HomePage.jsx:8-10` | HomePage imports `products` from `content.js`, filters for featured agricultural products |
| F12 | VERIFIED | `src/pages/ProductsPage.jsx:4` | ProductsPage imports products, categories, status labels from `content.js` |
| F13 | VERIFIED | `src/pages/ProjectsPortfolioPage.jsx:3` | ProjectsPortfolioPage imports `projectPortfolio` from `projectPortfolio.js` |
| F14 | VERIFIED | `src/pages/ProjectGalleryPage.jsx:3` | ProjectGalleryPage imports `projectPortfolio` from `projectPortfolio.js` |
| F15 | VERIFIED | `src/components/EcosystemStory.jsx:2` | EcosystemStory imports `cycleStages` from `content.js` — hardcoded data, not from JSON files |
| F16 | VERIFIED | `src/pages/AboutPage.jsx:7-92` | Team data is hardcoded in the component — not from JSON |
| F17 | VERIFIED | `package.json:12-19` | Only dependencies: lenis, react, react-dom. Dev: vite. Zero backend deps. |

## 4. Phases and Steps

### Phase 1: Supabase Setup & Data Layer Foundation

**Step 0 — Commit plan file**
- **Files:** `plans/PLAN-2026-10-29-supabase-database.md`
- **Change:** No source code changes. Stage and commit the plan file alone.
- **Verify:** `git log --oneline -1` shows commit of only the plan file.
- **Commit message:** `docs(plans): PLAN-2026-10-29-supabase-database.md`
- **Rollback:** `git revert HEAD`

**Step 1 — Install @supabase/supabase-js**
- **Files:** `package.json`
- **Change:** Run `npm install @supabase/supabase-js`. This adds a single runtime dependency.
- **Verify:** `node -e "require('@supabase/supabase-js')"` exits 0. `package.json` lists the dependency.
- **Commit message:** `build(deps): add @supabase/supabase-js`
- **Rollback:** `npm uninstall @supabase/supabase-js`

**Step 2 — Add Supabase env vars to .env.example and create client module**
- **Files:** `.env.example`, `src/data/supabase.js` (new)
- **Change:**
  1. Append to `.env.example`:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_KEY=your-service-role-key
     ```
  2. Create `src/data/supabase.js`:
     ```js
     import { createClient } from "@supabase/supabase-js";

     // For CMS server (Node.js) — uses service role key for write access
     // For build-time fetch — uses anon key (read-only via RLS)
     export function createSupabaseClient({ serviceRole = false } = {}) {
       const url = process.env.SUPABASE_URL;
       const key = serviceRole
         ? process.env.SUPABASE_SERVICE_KEY
         : process.env.SUPABASE_ANON_KEY;
       if (!url || !key) {
         throw new Error(
           `Missing Supabase config. Set SUPABASE_URL and ${serviceRole ? "SUPABASE_SERVICE_KEY" : "SUPABASE_ANON_KEY"} in .env`
         );
       }
       return createClient(url, key);
     }
     ```
- **Verify:** `node -e "process.loadEnvFile('.env'); import('./src/data/supabase.js').then(m => { const c = m.createSupabaseClient(); console.log('OK', typeof c.from); })"` prints `OK function` (requires `.env` to have real values — if not set yet, verify the file exists and exports the function).
- **Traps to avoid:** Do not hardcode any keys. The `.env` file itself is gitignored.
- **Commit message:** `feat(data): add Supabase client module and env template`
- **Rollback:** Delete `src/data/supabase.js`, revert `.env.example`

**Step 3 — Create Supabase migration SQL file**
- **Files:** `supabase/migrations/001_initial_schema.sql` (new)
- **Change:** Create the SQL migration file. This file is applied manually in Supabase SQL Editor or via `supabase db push`. Exact SQL:

  ```sql
  -- Products table
  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('akuakultur', 'nutrisi', 'tanaman', 'teknologi')),
    category_label TEXT,
    icon TEXT CHECK (icon IS NULL OR icon IN ('sensor', 'fish', 'leaf', 'plant', 'cycle', 'drop')),
    status TEXT NOT NULL CHECK (status IN ('prototype', 'riset')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Projects table
  CREATE TABLE projects (
    slug TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('berjalan', 'selesai')),
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cover JSONB,
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    photo_note TEXT,
    partners JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Schema registry for custom CMS collections
  CREATE TABLE cms_collections (
    name TEXT PRIMARY KEY CHECK (name ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    title TEXT NOT NULL,
    system BOOLEAN NOT NULL DEFAULT false,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Generic records for custom collections
  CREATE TABLE cms_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_name TEXT NOT NULL REFERENCES cms_collections(name) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX idx_cms_records_collection ON cms_records(collection_name);

  -- Row Level Security: anon can read products and projects, service role can do everything
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cms_collections ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cms_records ENABLE ROW LEVEL SECURITY;

  -- Read-only for anon
  CREATE POLICY "anon_read_products" ON products FOR SELECT USING (true);
  CREATE POLICY "anon_read_projects" ON projects FOR SELECT USING (true);

  -- Service role bypasses RLS automatically, but explicit policies for clarity
  CREATE POLICY "service_all_products" ON products FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "service_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "service_all_cms_collections" ON cms_collections FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "service_all_cms_records" ON cms_records FOR ALL USING (true) WITH CHECK (true);
  ```

- **Verify:** File exists at `supabase/migrations/001_initial_schema.sql`. SQL syntax is valid (no semicolons missing, all CHECK constraints match the current data's enum values from `_schema.json`).
- **Traps to avoid:**
  - `categoryLabel` in JSON becomes `category_label` in SQL (snake_case convention). The data layer must map this.
  - `photoNote` becomes `photo_note` in SQL. Same mapping needed.
  - `cover` and `gallery` are JSONB — they store the full nested object/array as-is.
  - `partners` is also JSONB and optional (some projects have it, some don't).
  - `sort_order` is added to preserve display ordering (JSON arrays are ordered, DB rows are not).
- **Commit message:** `feat(db): add initial Supabase migration SQL`
- **Rollback:** Delete `supabase/migrations/001_initial_schema.sql`

**Step 4 — Create seed script to populate Supabase from existing JSON**
- **Files:** `scripts/seed-supabase.mjs` (new)
- **Change:** Create a Node.js script that reads the existing JSON files and inserts them into Supabase. Exact code:

  ```js
  import { readFile } from "node:fs/promises";
  import { existsSync } from "node:fs";
  import path from "node:path";
  import { fileURLToPath } from "node:url";

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const ROOT = path.resolve(__dirname, "..");
  const envPath = path.join(ROOT, ".env");
  if (existsSync(envPath)) process.loadEnvFile(envPath);

  const { createSupabaseClient } = await import("../src/data/supabase.js");
  const supabase = createSupabaseClient({ serviceRole: true });

  // Seed products
  const products = JSON.parse(await readFile(path.join(ROOT, "src/data/products.json"), "utf8"));
  const productRows = products.map((p, i) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.image,
    category: p.category,
    category_label: p.categoryLabel || null,
    icon: p.icon || null,
    status: p.status,
    sort_order: i,
  }));

  const { error: prodErr } = await supabase.from("products").upsert(productRows, { onConflict: "id" });
  if (prodErr) { console.error("Products seed failed:", prodErr); process.exit(1); }
  console.log(`Seeded ${productRows.length} products.`);

  // Seed projects
  const projects = JSON.parse(await readFile(path.join(ROOT, "src/data/projects.json"), "utf8"));
  const projectRows = projects.map((p, i) => ({
    slug: p.slug,
    number: p.number,
    status: p.status,
    kind: p.kind,
    name: p.name,
    description: p.description,
    cover: p.cover || null,
    gallery: p.gallery || [],
    photo_note: p.photoNote || null,
    partners: p.partners || null,
    sort_order: i,
  }));

  const { error: projErr } = await supabase.from("projects").upsert(projectRows, { onConflict: "slug" });
  if (projErr) { console.error("Projects seed failed:", projErr); process.exit(1); }
  console.log(`Seeded ${projectRows.length} projects.`);

  // Seed system collection schemas
  const schema = JSON.parse(await readFile(path.join(ROOT, "src/data/_schema.json"), "utf8"));
  for (const col of schema) {
    const { error } = await supabase.from("cms_collections").upsert({
      name: col.name,
      title: col.title,
      system: col.system || false,
      fields: col.fields || [],
    }, { onConflict: "name" });
    if (error) { console.error(`Schema seed failed for ${col.name}:`, error); process.exit(1); }
  }
  console.log(`Seeded ${schema.length} collection schemas.`);
  console.log("Done.");
  ```

- **Verify:** Run `node scripts/seed-supabase.mjs` (requires Supabase project to be set up and `.env` populated). Should print "Seeded N products", "Seeded N projects", "Seeded N collection schemas", "Done." with no errors.
- **Traps to avoid:** `upsert` with `onConflict` ensures idempotency — running twice won't duplicate. Field name mapping (camelCase JSON → snake_case DB) must be exact.
- **Commit message:** `feat(scripts): add Supabase seed script`
- **Rollback:** Delete `scripts/seed-supabase.mjs`

### Phase 2: Build-Time Data Fetching

**Step 5 — Create build-time data fetcher script**
- **Files:** `scripts/fetch-data.mjs` (new)
- **Change:** Create a script that fetches data from Supabase and writes it to `src/data/products.json` and `src/data/projects.json` (same format as current files). This runs before `vite build`, keeping the SSG pipeline unchanged.

  ```js
  import { writeFile } from "node:fs/promises";
  import { existsSync } from "node:fs";
  import path from "node:path";
  import { fileURLToPath } from "node:url";

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const ROOT = path.resolve(__dirname, "..");
  const envPath = path.join(ROOT, ".env");
  if (existsSync(envPath)) process.loadEnvFile(envPath);

  const { createSupabaseClient } = await import("../src/data/supabase.js");
  const supabase = createSupabaseClient();

  // Fetch products
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (prodErr) { console.error("Failed to fetch products:", prodErr); process.exit(1); }

  // Map snake_case back to camelCase for frontend compatibility
  const productsJson = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.image,
    category: p.category,
    categoryLabel: p.category_label,
    icon: p.icon,
    status: p.status,
  }));
  await writeFile(
    path.join(ROOT, "src/data/products.json"),
    JSON.stringify(productsJson, null, 2) + "\n",
    "utf8"
  );
  console.log(`Fetched ${productsJson.length} products.`);

  // Fetch projects
  const { data: projects, error: projErr } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (projErr) { console.error("Failed to fetch projects:", projErr); process.exit(1); }

  const projectsJson = projects.map(p => ({
    slug: p.slug,
    number: p.number,
    status: p.status,
    kind: p.kind,
    name: p.name,
    description: p.description,
    cover: p.cover,
    gallery: p.gallery || [],
    photoNote: p.photo_note,
    ...(p.partners ? { partners: p.partners } : {}),
  }));
  await writeFile(
    path.join(ROOT, "src/data/projects.json"),
    JSON.stringify(projectsJson, null, 2) + "\n",
    "utf8"
  );
  console.log(`Fetched ${projectsJson.length} projects.`);
  console.log("Data files updated.");
  ```

- **Verify:** Run `node scripts/fetch-data.mjs`. The `products.json` and `projects.json` files should contain the same data as before (diff should be minimal — only formatting differences).
- **Traps to avoid:** The JSON output must match the exact field names the frontend expects (camelCase). `partners` is only present on some projects — use spread to conditionally include it.
- **Commit message:** `feat(scripts): add build-time Supabase data fetcher`
- **Rollback:** Delete `scripts/fetch-data.mjs`

**Step 6 — Update build script to fetch data before building**
- **Files:** `package.json`
- **Change:** Update the `build` script to run the data fetcher first:
  ```json
  "build": "node scripts/fetch-data.mjs && vite build --manifest && node scripts/prerender.mjs"
  ```
  Also add a convenience script:
  ```json
  "fetch-data": "node scripts/fetch-data.mjs"
  ```
- **Verify:** `npm run build` succeeds end-to-end: fetches data from Supabase, builds with Vite, prerenders all routes. Output count matches previous (18 route documents + 404.html). Run `npm run preview` and visually confirm the site renders.
- **Traps to avoid:** If Supabase is unreachable, the build fails fast with a clear error. This is intentional — the build should not proceed with stale data silently.
- **Commit message:** `build: run Supabase data fetch before vite build`
- **Rollback:** Revert `package.json` build script to original

### Phase 3: CMS Server Migration

**Step 7 — Add Supabase client to CMS server**
- **Files:** `scripts/cms/server.mjs`
- **Change:**
  1. Add import at top of file (after existing imports):
     ```js
     import { createSupabaseClient } from "../../src/data/supabase.js";
     ```
  2. After the env loading block (line ~40), add:
     ```js
     let supabase;
     try {
       supabase = createSupabaseClient({ serviceRole: true });
     } catch (err) {
       console.warn("⚠️  [CMS] Supabase not configured:", err.message);
       console.warn("⚠️  [CMS] Falling back to flat-file mode.");
     }
     ```
  3. This step ONLY adds the import and client initialization. No endpoint changes yet.
- **Verify:** `npm run cms` starts without errors. If `.env` has Supabase keys, no warning appears. If keys are missing, the fallback warning prints but server still starts.
- **Commit message:** `feat(cms): initialize Supabase client in CMS server`
- **Rollback:** Revert the added lines

**Step 8 — Migrate GET /api/:collection to read from Supabase**
- **Files:** `scripts/cms/server.mjs`
- **Change:** In the `GET` handler for collection records (currently at ~line 331-341), replace the `fs.readFile` logic with Supabase query. Keep the file fallback for when `supabase` is null.

  Replace the existing GET handler block:
  ```js
  if (method === "GET") {
    if (supabase) {
      // System collections: query their dedicated table
      if (colName === "products") {
        const { data, error } = await supabase.from("products").select("*").order("sort_order");
        if (error) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error.message })); return; }
        const mapped = data.map(p => ({
          id: p.id, name: p.name, description: p.description, image: p.image,
          category: p.category, categoryLabel: p.category_label, icon: p.icon, status: p.status,
        }));
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(mapped, null, 2));
        return;
      }
      if (colName === "projects") {
        const { data, error } = await supabase.from("projects").select("*").order("sort_order");
        if (error) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error.message })); return; }
        const mapped = data.map(p => ({
          slug: p.slug, number: p.number, status: p.status, kind: p.kind, name: p.name,
          description: p.description, cover: p.cover, gallery: p.gallery || [],
          photoNote: p.photo_note,
          ...(p.partners ? { partners: p.partners } : {}),
        }));
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(mapped, null, 2));
        return;
      }
      // Custom collections: query cms_records
      const { data, error } = await supabase.from("cms_records").select("data").eq("collection_name", colName).order("created_at");
      if (error) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error.message })); return; }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(data.map(r => r.data), null, 2));
      return;
    }
    // Flat-file fallback (original behavior)
    if (!existsSync(targetFile)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Collection "${colName}" does not exist` }));
      return;
    }
    const data = await fs.readFile(targetFile, "utf8");
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(data);
    return;
  }
  ```
- **Verify:** Start CMS (`npm run cms`), log in, navigate to Products and Projects collections. Data should load and display correctly in the dashboard table. Compare the API response `curl http://localhost:3333/api/products` with the original JSON — field names and values should match.
- **Traps to avoid:** The CMS UI expects camelCase field names (same as the JSON files). The mapping from snake_case DB columns to camelCase must be done in the server response, not left to the frontend.
- **Commit message:** `feat(cms): read collection data from Supabase`
- **Rollback:** Revert the GET handler changes

**Step 9 — Migrate PUT /api/:collection to write to Supabase**
- **Files:** `scripts/cms/server.mjs`
- **Change:** In the `PUT` handler (~line 343-408), after validation passes, write to Supabase instead of `fs.writeFile`. Keep the file fallback.

  After the validation block, replace the `fs.writeFile` call:
  ```js
  if (supabase) {
    if (colName === "products") {
      // Delete all existing and re-insert (full replace, same as file overwrite)
      const { error: delErr } = await supabase.from("products").delete().neq("id", "___impossible___");
      if (delErr) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: delErr.message })); return; }
      if (items.length > 0) {
        const rows = items.map((p, i) => ({
          id: p.id, name: p.name, description: p.description, image: p.image,
          category: p.category, category_label: p.categoryLabel || null,
          icon: p.icon || null, status: p.status, sort_order: i,
        }));
        const { error: insErr } = await supabase.from("products").insert(rows);
        if (insErr) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: insErr.message })); return; }
      }
    } else if (colName === "projects") {
      const { error: delErr } = await supabase.from("projects").delete().neq("slug", "___impossible___");
      if (delErr) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: delErr.message })); return; }
      if (items.length > 0) {
        const rows = items.map((p, i) => ({
          slug: p.slug, number: p.number, status: p.status, kind: p.kind, name: p.name,
          description: p.description, cover: p.cover || null, gallery: p.gallery || [],
          photo_note: p.photoNote || null, partners: p.partners || null, sort_order: i,
        }));
        const { error: insErr } = await supabase.from("projects").insert(rows);
        if (insErr) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: insErr.message })); return; }
      }
    } else {
      // Custom collection: delete and re-insert records
      const { error: delErr } = await supabase.from("cms_records").delete().eq("collection_name", colName);
      if (delErr) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: delErr.message })); return; }
      if (items.length > 0) {
        const rows = items.map(data => ({ collection_name: colName, data }));
        const { error: insErr } = await supabase.from("cms_records").insert(rows);
        if (insErr) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: insErr.message })); return; }
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, count: items.length }));
    return;
  }
  // Flat-file fallback (original behavior)
  await fs.writeFile(targetFile, JSON.stringify(items, null, 2) + "\n", "utf8");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, count: items.length }));
  return;
  ```
- **Verify:** In CMS UI, edit a product (change description), save. Reload the page — change should persist. Check Supabase dashboard table to confirm the row updated. Run `node scripts/fetch-data.mjs` to confirm the change propagates to the JSON files for build.
- **Traps to avoid:**
  - The delete-then-insert pattern matches the current file overwrite behavior (PUT replaces the entire array). This is simpler than diffing.
  - `delete().neq("id", "___impossible___")` is a Supabase workaround to delete all rows (`.delete()` without a filter is rejected by RLS).
  - camelCase→snake_case mapping must be exact: `categoryLabel`→`category_label`, `photoNote`→`photo_note`.
- **Commit message:** `feat(cms): write collection data to Supabase`
- **Rollback:** Revert the PUT handler changes

**Step 10 — Migrate collection schema CRUD to Supabase**
- **Files:** `scripts/cms/server.mjs`
- **Change:** Replace `loadSchema()`/`saveSchema()` calls in the collections endpoints (GET/POST/DELETE `/api/collections`) with Supabase queries.

  1. Replace `loadSchema()`:
     ```js
     async function loadSchema() {
       if (supabase) {
         const { data, error } = await supabase.from("cms_collections").select("*").order("created_at");
         if (error) throw new Error(error.message);
         return data.map(c => ({ name: c.name, title: c.title, system: c.system, fields: c.fields }));
       }
       // Flat-file fallback
       if (!existsSync(SCHEMA_JSON)) return [];
       try { return JSON.parse(await fs.readFile(SCHEMA_JSON, "utf8")); } catch { return []; }
     }
     ```

  2. Replace `saveSchema()`:
     ```js
     async function saveSchema(schema) {
       if (supabase) {
         // Schema is saved per-item elsewhere (POST/DELETE endpoints handle individual inserts/deletes)
         // This function is only called as fallback for flat-file mode
       }
       await fs.writeFile(SCHEMA_JSON, (JSON.stringify(schema, null, 2) + "\n").replace(/\r?\n/g, "\r\n"), "utf8");
     }
     ```

  3. In `POST /api/collections` handler, after creating `newCol`, add Supabase insert:
     ```js
     if (supabase) {
       const { error } = await supabase.from("cms_collections").insert({
         name: newCol.name, title: newCol.title, system: false, fields: newCol.fields,
       });
       if (error) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error.message })); return; }
     } else {
       schema.push(newCol);
       await saveSchema(schema);
       const targetFile = path.join(DATA_DIR, `${name}.json`);
       if (!existsSync(targetFile)) await fs.writeFile(targetFile, "[]\n", "utf8");
     }
     ```

  4. In `DELETE /api/collections/:name` handler, replace the splice+saveSchema with:
     ```js
     if (supabase) {
       const { error } = await supabase.from("cms_collections").delete().eq("name", targetName);
       if (error) { res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error.message })); return; }
       // cms_records cascade-delete automatically
     } else {
       schema.splice(existingIdx, 1);
       await saveSchema(schema);
       const targetFile = path.join(DATA_DIR, `${targetName}.json`);
       if (existsSync(targetFile)) { try { await fs.unlink(targetFile); } catch {} }
     }
     ```

- **Verify:** In CMS UI, create a new custom collection (e.g. "test-posts" with a "title" text field). Verify it appears in the sidebar. Delete it. Verify it disappears. Check Supabase `cms_collections` table to confirm insert/delete happened.
- **Traps to avoid:** The `cms_records` table has `ON DELETE CASCADE` on `collection_name`, so deleting a collection automatically removes its records.
- **Commit message:** `feat(cms): migrate collection schema CRUD to Supabase`
- **Rollback:** Revert changes to `loadSchema`, `saveSchema`, and the POST/DELETE handlers

### Phase 4: Cleanup & Verification

**Step 11 — Add .gitignore entry for generated JSON files (optional)**
- **Files:** `.gitignore`
- **Change:** Since `products.json` and `projects.json` are now generated at build time from Supabase, consider adding them to `.gitignore`. However, keeping them in git ensures the site can build without Supabase (offline development). **Do not gitignore them** — just add a comment at the top of each JSON file is not possible (they're JSON), so instead add a note in the README or a comment in `fetch-data.mjs`.

  Actually, no file change needed here. Add a one-line comment at the top of `scripts/fetch-data.mjs`:
  ```js
  // This script overwrites src/data/products.json and src/data/projects.json
  // with fresh data from Supabase. The JSON files remain in git as fallback
  // for offline development and to preserve the SSG build without Supabase.
  ```
- **Verify:** Comment is present in the file.
- **Commit message:** `docs(scripts): document fetch-data.mjs behavior`
- **Rollback:** Remove the comment

**Step 12 — Update existing tests to work with Supabase**
- **Files:** `src/cms.test.js`, `scripts/cms/cms-integration.test.mjs`
- **Change:** The existing tests exercise the CMS server with flat-file mode. Since the server falls back to flat-file when `SUPABASE_URL` is not set, the tests should continue to work as-is without any changes. Verify this.
- **Verify:** Run all test files:
  ```sh
  node src/cms.test.js
  node src/routing.test.js
  node src/metadata.test.js
  node src/team-navigation.test.js
  node scripts/cms/cms-integration.test.mjs
  ```
  All should pass.
- **Traps to avoid:** Do NOT set Supabase env vars during test runs — the tests should exercise the flat-file fallback path.
- **Commit message:** `test: verify existing tests pass with Supabase fallback`
- **Rollback:** N/A (no code changes, just verification)

**Step 13 — End-to-end verification**
- **Files:** No changes
- **Change:** Full integration test:
  1. Ensure `.env` has valid Supabase credentials.
  2. Run `node scripts/seed-supabase.mjs` — seeds data.
  3. Run `npm run build` — fetches from Supabase, builds, prerenders.
  4. Run `npm run preview` — verify all pages render correctly.
  5. Run `npm run cms` — open CMS, edit a product, save, verify in Supabase dashboard.
  6. Run `npm run build` again — verify the edit appears in the built site.
- **Verify:** All 6 steps complete successfully. The site content matches the Supabase data.
- **Commit message:** No commit (verification only)
- **Rollback:** N/A

## 5. Needs My Decision

1. **Image uploads:** Currently images are uploaded to `public/assets/<collection>/` on the local filesystem. Options:
   - **(A) Keep local filesystem uploads** — simplest, no migration needed. Images served by static hosting as before.
   - **(B) Migrate to Supabase Storage** — images stored in Supabase bucket, served via Supabase CDN. Adds complexity but centralizes all data.
   Recommendation: (A) for now. Migrate images later if needed.

2. **Supabase project creation:** You need to create a Supabase project at https://supabase.com and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` in `.env` before any step after Step 2 can be verified. The executor cannot do this — you must provide the credentials.

3. **Build trigger after CMS edit:** Currently the CMS has a `POST /api/build` endpoint that runs `npm run build`. With Supabase, CMS writes go to DB immediately, but the static site won't reflect changes until the next build. Options:
   - **(A) Keep manual build trigger** — CMS user clicks "Build" after editing. Same as current behavior.
   - **(B) Add auto-rebuild** — After every PUT to a collection, also trigger `npm run build`. Adds latency to saves.
   - **(C) Move to client-side Supabase fetch** — The React app fetches from Supabase at runtime instead of from pre-baked JSON. Loses SSG benefits (SEO, performance).
   Recommendation: (A) — keep the existing manual build trigger.

## 6. Risks

**Phase 1:**
- Supabase project might not exist yet — all steps after Step 2 depend on it.
- SQL migration might have CHECK constraint mismatches if data has values outside the defined enums. Mitigated by verifying constraints match `_schema.json`.

**Phase 2:**
- Build now depends on network access to Supabase. Offline builds will fail. Mitigated by keeping JSON files in git as fallback (can build from stale files by skipping fetch-data).
- If Supabase returns data in different order than `sort_order`, display could change. Mitigated by explicit `.order("sort_order")`.

**Phase 3:**
- Delete-then-insert pattern is not atomic. A crash between delete and insert would lose data. Low risk for a local CMS but noted. Could be mitigated with Supabase RPC (database function) wrapping in a transaction — out of scope for now.
- CMS server's flat-file fallback code paths will become dead code over time. Not harmful but adds maintenance surface.

**Phase 4:**
- Tests run in flat-file mode only. No automated Supabase integration tests. Manual verification is the safety net.

## 7. Noticed but Out of Scope

- `cycleStages` data in `content.js` is hardcoded (not from JSON). Could be moved to DB but low value.
- Team data in `AboutPage.jsx` is hardcoded. Could be moved to DB.
- `documentation` array in `content.js` is hardcoded. Could be moved to DB.
- The CMS UI (`scripts/cms/public/`) is a vanilla HTML/JS dashboard. No changes needed — it talks to the same API endpoints.
- Supabase real-time subscriptions could enable live preview. Out of scope.
- Supabase Auth could replace the HMAC session system. Out of scope.

## 8. After Execution

When all steps are committed, report back to senior model (not executor):
- State which plan file was executed.
- List any steps that were PARTIAL or deviated.
- Do not update the jagofarm skill or any skill file.
The senior model will run verify-plan, confirm correctness, and update the skill.
