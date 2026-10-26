# PLAN: Dynamic CMS Collection Builder (Approach A)

## 1. Goal and Scope
- Upgrade the local PocketBase-style CMS dashboard (`http://localhost:3333`) so users can create, configure, and manage new collections directly from the UI without modifying source code.
- Store collection schemas in `src/data/_schema.json` with initial schemas for locked system collections (`products`, `projects`) and support for custom collections.
- Dynamic data storage: Creating a collection named `<name>` generates an empty `src/data/<name>.json` file on disk. Deleting a custom collection removes the definition and file (system collections cannot be deleted).
- Generic server endpoints: `GET /api/collections`, `POST /api/collections`, `DELETE /api/collections/:name`, `GET /api/:collection`, `PUT /api/:collection`, and `POST /api/upload?folder=<collection>`.
- UI Collection Builder: "+ New Collection" button in sidebar, modal to configure collection name and fields (text, textarea, number, select, file, boolean), dynamic sidebar navigation, dynamic data tables, and dynamic slide-over editor drawers.
- Approach A contract: The CMS manages data in `src/data/<name>.json`. Public React pages import the JSON directly (`import data from "../data/<name>.json" with { type: "json" }`).
- The executor must execute all steps on branch `CMS` and commit all commits to branch `CMS`.
- Scope excludes: modifying existing public page designs, implementing client-side routing templates (Approach B), or external databases.

## 2. Executor Rules
- Work strictly on branch `CMS`. Verify with `git branch --show-current` before starting.
- Follow phases and steps in order, one at a time.
- Commit after each step: `git add -A && git commit -m "<type>(<scope>): <step description>"`.
- If code does not match what a step describes, STOP and report the mismatch. Do not improvise or fix adjacent things.
- Do not add dependencies, rename things, or change behavior outside the step.
- Run the step's verification before moving on. If it fails, stop and report.
- For backend/script steps: verify with `node <script>` before committing.
- For frontend steps: verify with `npm run build` and `node src/*.test.js` before committing.
- Do NOT update any skill file. Skill updates are handled by the senior model after verification.

## 3. Findings
| ID | Status | File:Line | Description |
|---|---|---|---|
| F-01 | VERIFIED | `scripts/cms/server.mjs:57-135` | Server hardcodes routes `/api/products` and `/api/projects`. Upload endpoint restricts `folder` strictly to `"products"` or `"projects"`. |
| F-02 | VERIFIED | `scripts/cms/public/index.html:33-52` | Sidebar hardcodes buttons for `products` and `projects`. |
| F-03 | VERIFIED | `scripts/cms/public/cms.js:296-484` | Table and drawer rendering logic branches strictly on `state.collection === 'products' ? ... : ...`. |
| F-04 | VERIFIED | `src/data/products.json`, `src/data/projects.json` | Both files exist and are currently the sole data stores. No schema catalog exists yet. |

## 4. Phases and Steps

### Step 0 — Commit plan file
- **Files:** `plans/PLAN-2026-10-26-cms-collection-builder.md`
- **Change:** Ensure currently on branch `CMS` (`git checkout CMS`). Stage and commit the plan file alone.
- **Verify:** `git branch --show-current` outputs `CMS`, and `git log --oneline -1` shows commit with plan file.
- **Commit message:** `docs(plans): PLAN-2026-10-26-cms-collection-builder.md`
- **Rollback:** `git revert HEAD`

---

### Phase 1: Dynamic Collection Engine & Schema Storage

#### Step 1 — Create `src/data/_schema.json` with system collections
- **Files:** `src/data/_schema.json` (new)
- **Change:**
  Create `src/data/_schema.json` with default definitions for system collections:
  ```json
  [
    {
      "name": "products",
      "title": "Products",
      "system": true,
      "fields": [
        { "name": "name", "label": "Name", "type": "text", "required": true },
        { "name": "id", "label": "ID / Slug", "type": "text", "required": true, "unique": true },
        { "name": "category", "label": "Category", "type": "select", "required": true, "options": ["akuakultur", "nutrisi", "tanaman", "teknologi"] },
        { "name": "categoryLabel", "label": "Category Label", "type": "text", "required": false },
        { "name": "status", "label": "Status", "type": "select", "required": true, "options": ["prototype", "riset"] },
        { "name": "icon", "label": "Icon", "type": "select", "required": false, "options": ["sensor", "fish", "leaf", "plant", "cycle", "drop"] },
        { "name": "description", "label": "Description", "type": "textarea", "required": true },
        { "name": "image", "label": "Product Image", "type": "file", "required": true }
      ]
    },
    {
      "name": "projects",
      "title": "Projects",
      "system": true,
      "fields": [
        { "name": "name", "label": "Project Name", "type": "text", "required": true },
        { "name": "slug", "label": "Slug", "type": "text", "required": true, "unique": true },
        { "name": "number", "label": "Number", "type": "text", "required": true },
        { "name": "kind", "label": "Kind / Category", "type": "text", "required": true },
        { "name": "status", "label": "Status", "type": "select", "required": true, "options": ["berjalan", "selesai"] },
        { "name": "description", "label": "Description", "type": "textarea", "required": true },
        { "name": "photoNote", "label": "Photo Note", "type": "text", "required": false },
        { "name": "cover", "label": "Cover Photo", "type": "object", "required": false },
        { "name": "gallery", "label": "Gallery Photos", "type": "gallery", "required": false }
      ]
    }
  ]
  ```
- **Traps to avoid:** Ensure valid JSON formatting and CRLF line endings.
- **Verify:** Run `node -e 'JSON.parse(require("fs").readFileSync("src/data/_schema.json", "utf8"))'` with no errors.
- **Commit message:** `feat(cms): create _schema.json for system collections`
- **Rollback:** `rm src/data/_schema.json`

#### Step 2 — Implement dynamic collection REST endpoints in `scripts/cms/server.mjs`
- **Files:** `scripts/cms/server.mjs`
- **Change:**
  1. Add schema helper constants and functions in `scripts/cms/server.mjs`:
  ```javascript
  const DATA_DIR = path.join(ROOT_DIR, "src/data");
  const SCHEMA_JSON = path.join(DATA_DIR, "_schema.json");

  async function loadSchema() {
    if (!existsSync(SCHEMA_JSON)) return [];
    return JSON.parse(await fs.readFile(SCHEMA_JSON, "utf8"));
  }

  async function saveSchema(schema) {
    await fs.writeFile(SCHEMA_JSON, JSON.stringify(schema, null, 2) + "\n", "utf8");
  }
  ```
  2. Add endpoints:
     - `GET /api/collections`: returns `_schema.json`.
     - `POST /api/collections`:
       Reads JSON body `{ name, title, fields }`.
       Validates `name` is kebab-case `^[a-z0-9]+(?:-[a-z0-9]+)*$` and does not collide with existing collections.
       Creates `src/data/<name>.json` with empty array `[]`.
       Appends new collection object `{ name, title, system: false, fields: fields || [] }` to `_schema.json`.
       Returns `{ success: true, collection: newCol }`.
     - `DELETE /api/collections/:name`:
       Extracts `:name` from URL.
       Loads schema. Rejects if collection is `system: true` with status 400 (`Cannot delete system collection`).
       Filters out collection from schema and saves.
       Deletes `src/data/<name>.json` file if it exists.
       Returns `{ success: true }`.
     - Dynamic collection records:
       Matches any `/api/:collection` where `:collection` exists in `_schema.json`:
       - `GET /api/:collection`: reads and returns `src/data/<collection>.json`.
       - `PUT /api/:collection`:
         Parses JSON array body.
         If `:collection === "products"`, run `validateProduct`.
         If `:collection === "projects"`, run `validateProject`.
         For custom collections, validate that each item is an object and required fields from schema are present.
         Writes formatted JSON to `src/data/<collection>.json`.
         Returns `{ success: true, count: items.length }`.
     - Update `POST /api/upload`:
       Check if `folder` matches any collection `name` in `_schema.json` (replacing the strict `products` or `projects` check).
- **Traps to avoid:** Sanitize collection names using regex to prevent directory traversal (`..`). Keep existing system validations intact.
- **Verify:** Start server or run test script: `curl -s http://localhost:3333/api/collections` returns the schema array.
- **Commit message:** `feat(cms): implement dynamic collection endpoints and upload routing in server.mjs`
- **Rollback:** `git checkout scripts/cms/server.mjs`

---

### Phase 2: UI Collection Builder & Dynamic Forms

#### Step 3 — Add Collection Builder Modal & Sidebar UI in `scripts/cms/public/index.html` and `cms.css`
- **Files:** `scripts/cms/public/index.html`, `scripts/cms/public/cms.css`
- **Change:**
  1. In `scripts/cms/public/index.html`:
     - In `<aside class="pb-sidebar">`, update the collections section:
     ```html
     <div class="pb-nav-section-header">
       <div class="pb-nav-section-label">Collections</div>
       <button class="pb-add-collection-btn" id="btn-add-collection" type="button" title="Create new collection">+ New</button>
     </div>
     <div class="pb-collections-list" id="collections-list">
       <!-- Dynamically rendered collection buttons -->
     </div>
     ```
     - Add Collection Builder Modal (`#modal-collection`):
     ```html
     <dialog id="modal-collection" class="pb-modal">
       <div class="pb-modal-card">
         <div class="pb-modal-header">
           <h3 id="modal-collection-title">New Collection</h3>
           <button type="button" class="pb-modal-close" id="modal-collection-close">&times;</button>
         </div>
         <div class="pb-modal-body">
           <div class="pb-form-group">
             <label for="col-title">Collection Display Name *</label>
             <input type="text" id="col-title" class="pb-input" placeholder="e.g. Partners, Team, Testimonials" required>
           </div>
           <div class="pb-form-group">
             <label for="col-name">Collection ID (Identifier / File name) *</label>
             <input type="text" id="col-name" class="pb-input mono" placeholder="e.g. partners" required>
             <div class="pb-help">Saves to src/data/&lt;name&gt;.json. Lowercase, kebab-case.</div>
           </div>
           <div class="pb-form-group">
             <label>Fields Schema</label>
             <div class="pb-fields-builder" id="fields-builder-list">
               <!-- Field items rendered here -->
             </div>
             <button type="button" class="pb-btn pb-btn-secondary" id="btn-builder-add-field" style="margin-top: 10px;">+ Add Field</button>
           </div>
         </div>
         <div class="pb-modal-footer">
           <button type="button" class="pb-btn pb-btn-secondary" id="btn-cancel-collection">Cancel</button>
           <button type="button" class="pb-btn pb-btn-primary" id="btn-submit-collection">Create Collection</button>
         </div>
       </div>
     </dialog>
     ```
  2. In `scripts/cms/public/cms.css`:
     - Add styles for `.pb-nav-section-header`, `.pb-add-collection-btn`, `.pb-modal`, `.pb-modal-card`, `.pb-fields-builder`, `.pb-field-row`:
     ```css
     .pb-nav-section-header {
       display: flex;
       align-items: center;
       justify-content: space-between;
       padding: 8px 12px 4px;
     }
     .pb-add-collection-btn {
       background: transparent;
       border: 1px solid var(--pb-border);
       color: var(--pb-primary);
       font-size: 11px;
       font-weight: 700;
       padding: 2px 8px;
       border-radius: 4px;
       cursor: pointer;
       transition: all 0.15s ease;
     }
     .pb-add-collection-btn:hover {
       background: var(--pb-primary);
       color: #fff;
       border-color: var(--pb-primary);
     }
     .pb-modal {
       position: fixed;
       inset: 0;
       width: 100vw;
       height: 100vh;
       background: rgba(15, 23, 42, 0.6);
       border: none;
       display: none;
       place-items: center;
       z-index: 100;
       padding: 20px;
     }
     .pb-modal[open] { display: grid; }
     .pb-modal-card {
       background: var(--pb-surface);
       color: var(--pb-text);
       border: 1px solid var(--pb-border);
       border-radius: 12px;
       width: min(640px, 100%);
       max-height: 90vh;
       display: flex;
       flex-direction: column;
       box-shadow: var(--pb-shadow-lg);
     }
     .pb-modal-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 16px 20px;
       border-bottom: 1px solid var(--pb-border);
     }
     .pb-modal-body {
       padding: 20px;
       overflow-y: auto;
       display: flex;
       flex-direction: column;
       gap: 16px;
     }
     .pb-modal-footer {
       display: flex;
       justify-content: flex-end;
       gap: 10px;
       padding: 14px 20px;
       border-top: 1px solid var(--pb-border);
     }
     .pb-field-row {
       display: grid;
       grid-template-columns: 2fr 2fr 1.5fr auto auto;
       gap: 8px;
       align-items: center;
       padding: 8px 10px;
       background: var(--pb-surface-alt);
       border: 1px solid var(--pb-border);
       border-radius: 6px;
       margin-bottom: 8px;
     }
     ```
- **Traps to avoid:** Preserve CRLF line endings in CSS. Ensure modal uses CSS variables so it supports dark mode automatically.
- **Verify:** Open dashboard in browser, verify "+ New" button renders next to Collections header and clicking it opens the modal dialog.
- **Commit message:** `feat(cms): add collection builder modal and sidebar controls`
- **Rollback:** `git checkout scripts/cms/public/index.html scripts/cms/public/cms.css`

#### Step 4 — Implement dynamic collection rendering and generic CRUD in `scripts/cms/public/cms.js`
- **Files:** `scripts/cms/public/cms.js`
- **Change:**
  1. Add schema and collections state:
     - `state.collections = []`
     - `state.schema = null`
     - `state.records = []` (holds current collection's items)
  2. Implement `loadCollections()`:
     - Fetches `GET /api/collections`.
     - Populates `state.collections` array.
     - Renders collection buttons in `#collections-list`:
       System collections (`products`, `projects`) keep their specific package and folder icons.
       Custom collections display a generic database icon.
       If active collection is not set, defaults to `'products'`.
       If active collection is custom and non-system, display a "Delete collection" button in the header toolbar.
  3. Implement Collection Builder Logic:
     - `openCollectionModal()`: resets form with 2 default fields (`name` [text], `description` [textarea]).
     - Auto-slug generator on `col-title` -> `col-name`.
     - Field Row item: Name input, Label input, Type select (`text`, `textarea`, `number`, `select`, `file`, `bool`), Required checkbox, Remove button.
     - `btn-submit-collection.onclick`: sends `POST /api/collections` with `{ name, title, fields }`, updates collections, switches to new collection, shows toast.
     - `deleteCollection(colName)`: prompts confirmation, sends `DELETE /api/collections/:name`, switches to `products`.
  4. Make `renderTable()` dynamic for custom collections:
     - For `products` and `projects`: keep existing bespoke rich table views.
     - For custom collections:
       Table headers: derived from first 4 fields in `collection.fields` + `Actions`.
       Table rows: render cell values based on field type (text, thumbnail preview if type is `file`, boolean pill, number). Click row to open edit drawer.
  5. Make `buildDrawerForm()` dynamic for custom collections:
     - For custom collections, generate input fields dynamically based on `collection.fields`:
       - `text`: `<input type="text" id="f-${field.name}" class="pb-input">`
       - `textarea`: `<textarea id="f-${field.name}" class="pb-textarea"></textarea>`
       - `number`: `<input type="number" id="f-${field.name}" class="pb-input mono">`
       - `select`: `<select id="f-${field.name}" class="pb-select">` with options.
       - `bool`: `<input type="checkbox" id="f-${field.name}">` checkbox toggle.
       - `file`: input path + dropzone with upload target set to `state.collection` + preview thumbnail.
  6. Update `saveRecord()` to save custom collections:
     - Collects field values into an object.
     - Validates required fields with `markFieldError`.
     - Appends or updates record in `state.records`.
     - Sends `PUT /api/${state.collection}`.
     - Calls `renderTable()`, `updateCounts()`, `closeDrawer(true)`, and shows toast.
- **Traps to avoid:** Ensure existing `products` and `projects` behavior, image upload, and validations remain 100% backward compatible without changes to their data structures.
- **Verify:** Run CMS server, open `http://localhost:3333`, create a new collection named `partners` with fields `name`, `website`, and `logo`, add a record, save it, and verify `src/data/partners.json` is created with valid JSON on disk.
- **Commit message:** `feat(cms): implement dynamic collection management and form builder in cms.js`
- **Rollback:** `git checkout scripts/cms/public/cms.js`

---

### Phase 3: Automated Verification

#### Step 5 — Add automated collection creation and dynamic CRUD test to `scripts/cms/cms-integration.test.mjs`
- **Files:** `scripts/cms/cms-integration.test.mjs`
- **Change:**
  In `scripts/cms/cms-integration.test.mjs`, add tests for dynamic collections:
  1. Test `GET /api/collections`: asserts status 200 and returns array containing `products` and `projects`.
  2. Test `POST /api/collections`: creates temporary collection `test-testimonials` with schema fields `author` (text), `content` (textarea), `rating` (number).
  3. Verify `src/data/test-testimonials.json` exists on disk.
  4. Test `PUT /api/test-testimonials`: writes 1 test record, verifies file updated.
  5. Test `GET /api/test-testimonials`: verifies saved record returned.
  6. Test `DELETE /api/collections/test-testimonials`: deletes test collection.
  7. Verify `test-testimonials` removed from `_schema.json` and file cleaned up.
  8. Assert `DELETE /api/collections/products` returns 400 (system collection protection).
- **Verify:** Run `node scripts/cms/cms-integration.test.mjs` and ensure it exits with code 0 and prints `CMS integration test passed all assertions!`.
- **Commit message:** `test(cms): add automated dynamic collection builder integration test`
- **Rollback:** `git checkout scripts/cms/cms-integration.test.mjs`

---

## 5. Needs My Decision
None. All design choices (Approach A file-based contract, PocketBase UI modal, system collections protection) are established.

## 6. Risks
- **Invalid Collection Names / Directory Traversal**: Malformed names like `../../evil` could attempt to access paths outside `src/data`.
  *Mitigation:* Strict kebab-case regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` enforced on both client and server.
- **Accidental Deletion of System Data**: Deleting `products` or `projects` would break SSG prerender and existing website pages.
  *Mitigation:* Server explicitly rejects deletion requests for any collection with `system: true`.

## 7. Noticed but Out of Scope
- Code generator for React boilerplate (e.g. CLI snippet generator like `npm run gen-component <collection>`) can be added later if needed.

## 8. After Execution
Once all steps are committed, report back to the senior model (do not execute on your own):
- State the plan file executed (`plans/PLAN-2026-10-26-cms-collection-builder.md`).
- Confirm that all commits were made to branch `CMS`.
- List any steps that were PARTIAL or had to deviate.
- Do not update any skill file.
The senior model will run verification, confirm correctness, and update the skill.
