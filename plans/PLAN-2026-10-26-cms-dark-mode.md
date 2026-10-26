# PLAN: Implement Dark Mode in CMS Dashboard

## 1. Goal and Scope
- Implement dark mode support in the local PocketBase-inspired CMS dashboard (`scripts/cms/public/`).
- Support theme switching between light and dark modes with persistent storage in `localStorage` (`jagofarm-cms-theme`) and auto-detection fallback from `prefers-color-scheme`.
- Add an early inline script in `scripts/cms/public/index.html` head to prevent flash of wrong theme before CSS/JS renders.
- Add a theme toggle button in the sidebar system navigation area with Moon / Sun icons.
- Replace all hardcoded light background and text colors in `scripts/cms/public/cms.css` with CSS custom properties that adapt cleanly under `html[data-theme="dark"]`.
- The executor must execute all steps on branch `CMS` and commit all commits to branch `CMS`.
- Scope excludes: modifying the public landing page themes (`src/styles.css` already has light/dark mode), changing server endpoints, or modifying data schemas.

## 2. Executor Rules
- Work strictly on branch `CMS`. Verify with `git branch --show-current` before starting.
- Follow phases and steps in order, one at a time.
- Commit after each step: `git add -A && git commit -m "<type>(<scope>): <step description>"`.
- If the code does not match what a step describes, STOP and report the mismatch. Do not improvise or fix adjacent things.
- Do not add dependencies, rename things, or change behavior outside the step.
- Run the step's verification before moving on. If it fails, stop and report.
- For backend/script steps: verify with `node <script>` before committing.
- For frontend steps: verify with `npm run build` and `node src/*.test.js` before committing.
- Do NOT update any skill file. Skill updates are handled by the senior model after verification.

## 3. Findings
| ID | Status | File:Line | Description |
|---|---|---|---|
| F-01 | VERIFIED | `scripts/cms/public/cms.css:2-20` | Root CSS custom properties define light theme tokens (`--pb-bg: #f8fafc`, `--pb-surface: #ffffff`, `--pb-text: #0f172a`, `--pb-border: #e2e8f0`). No `[data-theme="dark"]` selector exists. |
| F-02 | VERIFIED | `scripts/cms/public/cms.css:583,620,688` | Several UI components (inputs, tables, cards, preview boxes) contain hardcoded `#fff`, `#f8fafc`, or `#f1f5f9` backgrounds instead of CSS variables. |
| F-03 | VERIFIED | `scripts/cms/public/index.html:46-62` | Sidebar has `.pb-nav-system` containing "Build & Logs" button and "Preview Website" link, but no theme toggle button. |
| F-04 | VERIFIED | `scripts/cms/public/cms.js` | State has no `theme` property, no listener for theme toggle, and no theme initialization logic. |

## 4. Phases and Steps

### Step 0 — Commit plan file
- **Files:** `plans/PLAN-2026-10-26-cms-dark-mode.md`
- **Change:** Ensure currently on branch `CMS` (`git checkout CMS`). Stage and commit the plan file alone.
- **Verify:** `git branch --show-current` outputs `CMS`, and `git log --oneline -1` shows commit with plan file.
- **Commit message:** `docs(plans): PLAN-2026-10-26-cms-dark-mode.md`
- **Rollback:** `git revert HEAD`

---

### Phase 1: CSS Theme Variables & Token Normalization

#### Step 1 — Define dark theme variables and replace hardcoded colors in `scripts/cms/public/cms.css`
- **Files:** `scripts/cms/public/cms.css`
- **Change:**
  1. In `scripts/cms/public/cms.css`, add CSS variables for subtle surfaces and hover states to `:root`:
  ```css
  :root {
    --pb-bg: #f8fafc;
    --pb-surface: #ffffff;
    --pb-surface-alt: #f1f5f9;
    --pb-border: #e2e8f0;
    --pb-border-focus: #15803d;
    --pb-primary: #15803d;
    --pb-primary-hover: #166534;
    --pb-primary-light: #f0fdf4;
    --pb-text: #0f172a;
    --pb-text-secondary: #475569;
    --pb-muted: #64748b;
    --pb-hover: #f1f5f9;
    --pb-danger: #ef4444;
    --pb-danger-hover: #dc2626;
    --pb-danger-light: #fef2f2;
    --pb-chip-prototype-bg: #dcfce7;
    --pb-chip-prototype-text: #166534;
    --pb-chip-prototype-dot: #22c55e;
    --pb-chip-riset-bg: #f1f5f9;
    --pb-chip-riset-text: #475569;
    --pb-chip-riset-dot: #94a3b8;
    --pb-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --pb-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    --pb-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --pb-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --pb-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  html[data-theme="dark"] {
    --pb-bg: #0b1120;
    --pb-surface: #1e293b;
    --pb-surface-alt: #0f172a;
    --pb-border: #334155;
    --pb-border-focus: #22c55e;
    --pb-primary: #22c55e;
    --pb-primary-hover: #16a34a;
    --pb-primary-light: rgba(34, 197, 94, 0.16);
    --pb-text: #f8fafc;
    --pb-text-secondary: #cbd5e1;
    --pb-muted: #94a3b8;
    --pb-hover: rgba(255, 255, 255, 0.05);
    --pb-danger: #f87171;
    --pb-danger-hover: #ef4444;
    --pb-danger-light: rgba(239, 68, 68, 0.16);
    --pb-chip-prototype-bg: rgba(34, 197, 94, 0.16);
    --pb-chip-prototype-text: #4ade80;
    --pb-chip-prototype-dot: #4ade80;
    --pb-chip-riset-bg: rgba(148, 163, 184, 0.16);
    --pb-chip-riset-text: #cbd5e1;
    --pb-chip-riset-dot: #94a3b8;
    --pb-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.4);
    --pb-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
    --pb-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
  }
  ```
  2. Replace hardcoded `#fff` and `#f8fafc` on form controls and cards:
     - `.pb-input, .pb-textarea, .pb-drawer select`: change `background: #fff;` to `background: var(--pb-surface);` and add `color: var(--pb-text);`.
     - `.pb-search-box input`: change `background: #fff;` to `background: var(--pb-surface);` and `color: var(--pb-text);`.
     - `.pb-select-filter`: change `background: #fff;` to `background: var(--pb-surface);` and `color: var(--pb-text);`.
     - `.pb-btn-secondary`: change `background-color: #fff;` to `background-color: var(--pb-surface);`, `border: 1px solid var(--pb-border);`, `color: var(--pb-text);`.
     - `.pb-table-wrap`: change `background: #fff;` to `background: var(--pb-surface);`.
     - `.pb-table th`: change `background: #f8fafc;` to `background: var(--pb-surface-alt);`.
     - `.pb-table tr:hover td`: change `background: #f8fafc;` to `background: var(--pb-hover);`.
     - `.pb-table td`: ensure `color: var(--pb-text);`.
     - `.pb-drawer`: ensure `background: var(--pb-surface); color: var(--pb-text);`.
     - `.pb-drawer-header, .pb-drawer-footer`: change `background: #f8fafc;` to `background: var(--pb-surface); border-color: var(--pb-border);`.
     - `.pb-dropzone`: change `background: #f8fafc;` to `background: var(--pb-surface-alt); border-color: var(--pb-border); color: var(--pb-muted);`.
     - `.pb-image-preview-box`: change `background: #f8fafc;` to `background: var(--pb-surface-alt); border-color: var(--pb-border);`.
     - `.pb-gallery-card`: change `background: #fff;` to `background: var(--pb-surface); border-color: var(--pb-border);`.
     - `.pb-gallery-fields`: change `background: #f1f5f9;` to `background: var(--pb-surface-alt);`.
     - `.pb-gallery-fields input`: change `background: #fff;` to `background: var(--pb-surface); color: var(--pb-text); border: 1px solid var(--pb-border);`.
     - Status chips `.pb-chip.status-prototype`: `background: var(--pb-chip-prototype-bg); color: var(--pb-chip-prototype-text);`.
     - Status chips `.pb-chip.status-prototype .pb-chip-dot`: `background: var(--pb-chip-prototype-dot);`.
     - Status chips `.pb-chip.status-riset`: `background: var(--pb-chip-riset-bg); color: var(--pb-chip-riset-text);`.
     - Status chips `.pb-chip.status-riset .pb-chip-dot`: `background: var(--pb-chip-riset-dot);`.
- **Traps to avoid:** Preserve CRLF line endings. Do not alter color tokens for public site (`src/styles.css`).
- **Verify:** Open `scripts/cms/public/cms.css` and verify `html[data-theme="dark"]` exists with valid syntax.
- **Commit message:** `feat(cms): add dark mode color tokens and variables to cms.css`
- **Rollback:** `git checkout scripts/cms/public/cms.css`

---

### Phase 2: Theme Toggle UI & Persistence

#### Step 2 — Add early head script & theme toggle button to `scripts/cms/public/index.html`
- **Files:** `scripts/cms/public/index.html`
- **Change:**
  1. In `<head>`, immediately after `<title>JagoFarm CMS</title>`, add inline theme initialization script:
  ```html
  <script>
    try {
      const savedTheme = localStorage.getItem('jagofarm-cms-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = savedTheme;
    } catch {
      document.documentElement.dataset.theme = 'light';
    }
  </script>
  ```
  2. Inside `<aside class="pb-sidebar">` -> `<div class="pb-nav-system">`, add the theme toggle button before the `btn-open-logs` button:
  ```html
        <button class="pb-nav-item" id="btn-toggle-theme" type="button" title="Toggle theme (Light / Dark)">
          <svg class="pb-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg class="pb-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span class="pb-nav-label" id="theme-toggle-label">Dark mode</span>
        </button>
  ```
- **Traps to avoid:** Place the script before external stylesheet or before body paint to eliminate Flash of Unstyled Content (FOUC).
- **Verify:** Inspect `scripts/cms/public/index.html` and verify `#btn-toggle-theme` exists inside `.pb-nav-system`.
- **Commit message:** `feat(cms): add theme initial script and sidebar toggle button to index.html`
- **Rollback:** `git checkout scripts/cms/public/index.html`

#### Step 3 — Implement theme state management and event binding in `scripts/cms/public/cms.js`
- **Files:** `scripts/cms/public/cms.js`
- **Change:**
  1. Add theme DOM references and update function in `scripts/cms/public/cms.js`:
  ```javascript
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const themeToggleLabel = document.getElementById('theme-toggle-label');

  function updateThemeUI(theme) {
    const isDark = theme === 'dark';
    const moonIcon = btnToggleTheme?.querySelector('.theme-icon-moon');
    const sunIcon = btnToggleTheme?.querySelector('.theme-icon-sun');
    if (moonIcon && sunIcon) {
      moonIcon.style.display = isDark ? 'none' : 'block';
      sunIcon.style.display = isDark ? 'block' : 'none';
    }
    if (themeToggleLabel) {
      themeToggleLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem('jagofarm-cms-theme', nextTheme);
    } catch {}
    updateThemeUI(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
  }
  ```
  2. In initialization block (`init()` or event listener setup), bind the click handler and call `updateThemeUI`:
  ```javascript
  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', toggleTheme);
    updateThemeUI(document.documentElement.dataset.theme || 'light');
  }
  ```
- **Traps to avoid:** Handle exceptions if `localStorage` is blocked in restricted browser contexts. Ensure `dataset.theme` is updated atomically.
- **Verify:** Start `npm run cms` or check `cms.js` syntax via `node --check scripts/cms/public/cms.js` (or run integration tests).
- **Commit message:** `feat(cms): implement theme toggle handler and persistence in cms.js`
- **Rollback:** `git checkout scripts/cms/public/cms.js`

---

### Phase 3: Automated Verification

#### Step 4 — Add theme asset & markup checks to `scripts/cms/cms-integration.test.mjs`
- **Files:** `scripts/cms/cms-integration.test.mjs`
- **Change:**
  In `scripts/cms/cms-integration.test.mjs`, add assertions verifying:
  1. `GET /index.html` returns 200, contains `dataset.theme`, and contains `id="btn-toggle-theme"`.
  2. `GET /cms.css` returns 200 and contains `html[data-theme="dark"]`.
  3. `GET /cms.js` returns 200 and contains `jagofarm-cms-theme`.
- **Verify:** Run `node scripts/cms/cms-integration.test.mjs` and ensure it exits with code 0 and prints `CMS integration test passed all assertions!`.
- **Commit message:** `test(cms): verify dark mode assets and toggle markup in integration test`
- **Rollback:** `git checkout scripts/cms/cms-integration.test.mjs`

---

## 5. Needs My Decision
None. All design specifications (PocketBase-matching dark palette, sidebar toggle placement, localStorage key `jagofarm-cms-theme`) are established.

## 6. Risks
- **Flash of White in Dark Mode**: If theme is applied late, page will flash white.
  *Mitigation:* Handled via inline `<script>` in `<head>` of `index.html` before any CSS or DOM rendering.
- **Low Contrast on Inputs or Chips in Dark Mode**: Dark backgrounds on text inputs or chips could become illegible.
  *Mitigation:* Explicit color variables (`--pb-chip-prototype-bg`, `--pb-chip-riset-bg`, `--pb-surface`, `--pb-text`) specified verbatim in Step 1.

## 7. Noticed but Out of Scope
- Build logs terminal in CMS dashboard is already dark (`#0f172a`), so it blends naturally into both themes.

## 8. After Execution
Once all steps are committed, report back to the senior model (do not execute on your own):
- State the plan file executed (`plans/PLAN-2026-10-26-cms-dark-mode.md`).
- Confirm that all commits were made to branch `CMS`.
- List any steps that were PARTIAL or had to deviate.
- Do not update any skill file.
The senior model will run verification, confirm correctness, and update the skill.
