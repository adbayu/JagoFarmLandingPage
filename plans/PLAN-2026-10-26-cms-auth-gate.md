# PLAN: Implement Production Authentication Gate for CMS

## 1. Goal and Scope
- Secure the JagoFarm CMS dashboard and REST APIs behind an authentication gate so unauthorized public internet visitors cannot view, create, edit, or delete records.
- Zero-dependency authentication engine implemented using Node.js standard library `node:crypto`.
- Credential management:
  - `CMS_ADMIN_EMAIL` (env variable, default: `admin@jagofarm.dev`)
  - `CMS_ADMIN_PASSWORD` (env variable, default: `jagofarm2026!`)
  - `CMS_SESSION_SECRET` (env variable, default: crypto-random or fallback secret)
- Session mechanism: Signed HMAC-SHA256 tokens transported via `HttpOnly`, `SameSite=Lax`, `Path=/` session cookie (`jagofarm_cms_token`) with optional `Authorization: Bearer <token>` support for API testing.
- Server endpoints:
  - `POST /api/auth/login`: verifies email & password, sets signed cookie, returns `{ success: true, email, token }`.
  - `POST /api/auth/logout`: clears session cookie, returns `{ success: true }`.
  - `GET /api/auth/me`: validates session and returns current user info (`{ authenticated: true, email }`) or 401.
- Route protection: All `/api/*` routes (collections, CRUD, file uploads, builds) require valid session; unauthenticated requests return `401 Unauthorized`.
- PocketBase-inspired Login UI in `scripts/cms/public/`:
  - Centered clean login card displayed when unauthenticated (email & password inputs, show/hide password toggle, error alert, submit spinner).
  - Main dashboard hidden until authenticated.
  - Sidebar user session badge showing admin email and "Sign Out" button.
  - Global 401 interceptor that transitions back to login view on expired sessions.
- The executor must execute all steps on branch `CMS` and commit all commits to branch `CMS`.
- Scope excludes: third-party OAuth providers (Google/GitHub), database user tables, multi-tenant RBAC permissions.

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
| F-01 | VERIFIED | `scripts/cms/server.mjs:71-299` | All `/api/*` endpoints are currently unauthenticated and open to anyone reaching the port. |
| F-02 | VERIFIED | `scripts/cms/public/index.html` | Dashboard HTML loads immediately into the DOM with no login view or session gate. |
| F-03 | VERIFIED | `scripts/cms/public/cms.js` | CMS JS immediately invokes `loadCollections()` and fetches `/api/*` without authentication headers or checks. |

## 4. Phases and Steps

### Step 0 — Commit plan file
- **Files:** `plans/PLAN-2026-10-26-cms-auth-gate.md`
- **Change:** Ensure currently on branch `CMS` (`git checkout CMS`). Stage and commit the plan file alone.
- **Verify:** `git branch --show-current` outputs `CMS`, and `git log --oneline -1` shows commit with plan file.
- **Commit message:** `docs(plans): PLAN-2026-10-26-cms-auth-gate.md`
- **Rollback:** `git revert HEAD`

---

### Phase 1: Zero-Dependency Server Auth Engine & Middleware

#### Step 1 — Implement HMAC session token creation, verification, and auth routes in `scripts/cms/server.mjs`
- **Files:** `scripts/cms/server.mjs`
- **Change:**
  1. Import `crypto` from `"node:crypto"`.
  2. Define auth configuration and token helpers at top of `scripts/cms/server.mjs`:
  ```javascript
  const ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL || "admin@jagofarm.dev";
  const ADMIN_PASSWORD = process.env.CMS_ADMIN_PASSWORD || "jagofarm2026!";
  const SESSION_SECRET = process.env.CMS_SESSION_SECRET || "jagofarm-local-session-secret-change-in-prod-2026";
  const TOKEN_COOKIE_NAME = "jagofarm_cms_token";
  const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  function createSessionToken(email) {
    const expiresAt = Date.now() + TOKEN_MAX_AGE_MS;
    const payload = `${email}.${expiresAt}`;
    const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    return `${payload}.${hmac}`;
  }

  function verifySessionToken(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [email, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

    const payload = `${email}.${expiresAtStr}`;
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    
    // Constant time comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedHmac);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    return { email, expiresAt };
  }

  function extractTokenFromRequest(req) {
    // 1. Check Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
    // 2. Check Cookie: jagofarm_cms_token=<token>
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${TOKEN_COOKIE_NAME}=([^;]+)`));
      if (match) return decodeURIComponent(match[1]);
    }
    return null;
  }
  ```
  3. Add auth endpoints in request handler before other `/api/` endpoints:
     - `POST /api/auth/login`:
       - Parse `{ email, password }` from body.
       - Validate password using constant-time check:
       ```javascript
       const validEmail = email && email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
       const passBuf = Buffer.from(password || "");
       const targetPassBuf = Buffer.from(ADMIN_PASSWORD);
       const validPass = passBuf.length === targetPassBuf.length && crypto.timingSafeEqual(passBuf, targetPassBuf);

       if (!validEmail || !validPass) {
         res.writeHead(401, { "Content-Type": "application/json" });
         res.end(JSON.stringify({ error: "Invalid email or password" }));
         return;
       }

       const token = createSessionToken(ADMIN_EMAIL);
       const isSecure = (req.headers["x-forwarded-proto"] === "https");
       const cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isSecure ? "; Secure" : ""}`;
       res.writeHead(200, {
         "Content-Type": "application/json",
         "Set-Cookie": cookie,
       });
       res.end(JSON.stringify({ success: true, email: ADMIN_EMAIL, token }));
       return;
       ```
     - `POST /api/auth/logout`:
       ```javascript
       res.writeHead(200, {
         "Content-Type": "application/json",
         "Set-Cookie": `${TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
       });
       res.end(JSON.stringify({ success: true }));
       return;
       ```
     - `GET /api/auth/me`:
       ```javascript
       const token = extractTokenFromRequest(req);
       const session = verifySessionToken(token);
       if (!session) {
         res.writeHead(401, { "Content-Type": "application/json" });
         res.end(JSON.stringify({ authenticated: false }));
         return;
       }
       res.writeHead(200, { "Content-Type": "application/json" });
       res.end(JSON.stringify({ authenticated: true, email: session.email }));
       return;
       ```
- **Traps to avoid:** Ensure constant-time password comparison (`crypto.timingSafeEqual`) handles differing buffer lengths cleanly without throwing.
- **Verify:** Run `node --check scripts/cms/server.mjs`.
- **Commit message:** `feat(cms): implement HMAC session tokens and auth endpoints in server.mjs`
- **Rollback:** `git checkout scripts/cms/server.mjs`

#### Step 2 — Secure all `/api/*` data and upload routes behind auth middleware in `scripts/cms/server.mjs`
- **Files:** `scripts/cms/server.mjs`
- **Change:**
  Add auth middleware gate right after the auth routes:
  ```javascript
  // Protected API Gateway: check session for all other /api/* routes
  if (pathname.startsWith("/api/")) {
    const token = extractTokenFromRequest(req);
    const session = verifySessionToken(token);
    if (!session) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized. Please sign in to access the CMS." }));
      return;
    }
  }
  ```
- **Traps to avoid:** Ensure public assets (`/assets/*`) and static CMS files (`/`, `/index.html`, `/cms.css`, `/cms.js`) remain accessible so the browser can display the login screen and load scripts.
- **Verify:** Start server or curl `http://localhost:3333/api/collections` without cookies/headers and verify it returns HTTP 401 with `Unauthorized`.
- **Commit message:** `feat(cms): protect all /api/ endpoints with session auth middleware`
- **Rollback:** `git checkout scripts/cms/server.mjs`

---

### Phase 2: PocketBase-Style Login Screen & Client Session Handling

#### Step 3 — Add Login screen markup & User session controls to `scripts/cms/public/index.html` and `cms.css`
- **Files:** `scripts/cms/public/index.html`, `scripts/cms/public/cms.css`
- **Change:**
  1. In `scripts/cms/public/index.html`:
     - Wrap current dashboard inside `<div class="pb-app" id="pb-app" style="display:none;">...</div>`.
     - Add `#pb-login` view right before `#pb-app`:
     ```html
     <div class="pb-login-wrapper" id="pb-login">
       <div class="pb-login-card">
         <div class="pb-login-brand">
           <div class="pb-brand-logo" style="width:44px; height:44px; border-radius:10px;">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
           </div>
           <h2>JagoFarm Admin</h2>
           <p class="pb-login-subtitle">Sign in to manage farm products and project records</p>
         </div>
         <form id="form-login" class="pb-login-form">
           <div class="pb-alert pb-alert-danger" id="login-error" style="display:none;"></div>
           <div class="pb-form-group">
             <label for="input-email">Email Address</label>
             <input type="email" id="input-email" class="pb-input" placeholder="admin@jagofarm.dev" required autocomplete="username">
           </div>
           <div class="pb-form-group">
             <label for="input-password">Password</label>
             <div class="pb-password-wrap">
               <input type="password" id="input-password" class="pb-input" placeholder="••••••••••••" required autocomplete="current-password">
               <button type="button" class="pb-pw-toggle" id="btn-toggle-pw" title="Show/Hide password">👁</button>
             </div>
           </div>
           <button type="submit" class="pb-btn pb-btn-primary pb-btn-block" id="btn-submit-login">
             <span id="login-btn-text">Sign In</span>
             <span class="pb-spinner" id="login-spinner" style="display:none;"></span>
           </button>
         </form>
       </div>
     </div>
     ```
     - In `scripts/cms/public/index.html` inside `<aside class="pb-sidebar">` -> `<div class="pb-nav-system">`, add the user session info and sign out button:
     ```html
     <div class="pb-user-session">
       <div class="pb-user-info">
         <div class="pb-user-avatar">A</div>
         <div class="pb-user-email" id="user-display-email">admin@jagofarm.dev</div>
       </div>
       <button class="pb-nav-item pb-logout-btn" id="btn-logout" type="button" title="Sign out">
         <svg class="pb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
         </svg>
         <span class="pb-nav-label">Sign out</span>
       </button>
     </div>
     ```
  2. In `scripts/cms/public/cms.css`:
     - Add styling for `.pb-login-wrapper`, `.pb-login-card`, `.pb-login-brand`, `.pb-login-subtitle`, `.pb-password-wrap`, `.pb-pw-toggle`, `.pb-btn-block`, `.pb-user-session`, `.pb-user-avatar`, `.pb-user-email`:
     ```css
     .pb-login-wrapper {
       min-height: 100vh;
       width: 100vw;
       display: grid;
       place-items: center;
       background-color: var(--pb-bg);
       padding: 24px;
     }
     .pb-login-card {
       width: min(420px, 100%);
       background: var(--pb-surface);
       border: 1px solid var(--pb-border);
       border-radius: 14px;
       padding: 36px 32px;
       box-shadow: var(--pb-shadow-lg);
     }
     .pb-login-brand {
       text-align: center;
       display: flex;
       flex-direction: column;
       align-items: center;
       margin-bottom: 24px;
     }
     .pb-login-brand h2 {
       font-size: 20px;
       font-weight: 700;
       margin-top: 12px;
       color: var(--pb-text);
     }
     .pb-login-subtitle {
       font-size: 13px;
       color: var(--pb-muted);
       margin-top: 4px;
     }
     .pb-login-form {
       display: flex;
       flex-direction: column;
       gap: 16px;
     }
     .pb-password-wrap {
       position: relative;
       display: flex;
       align-items: center;
     }
     .pb-password-wrap input {
       padding-right: 36px;
     }
     .pb-pw-toggle {
       position: absolute;
       right: 8px;
       background: transparent;
       border: none;
       cursor: pointer;
       color: var(--pb-muted);
       padding: 4px;
     }
     .pb-btn-block {
       width: 100%;
       justify-content: center;
       padding: 10px;
       font-size: 14px;
     }
     .pb-user-session {
       border-top: 1px solid var(--pb-border);
       padding-top: 10px;
       margin-top: 6px;
       display: flex;
       flex-direction: column;
       gap: 4px;
     }
     .pb-user-info {
       display: flex;
       align-items: center;
       gap: 8px;
       padding: 6px 10px;
     }
     .pb-user-avatar {
       width: 24px;
       height: 24px;
       border-radius: 50%;
       background: var(--pb-primary);
       color: #fff;
       font-size: 11px;
       font-weight: 700;
       display: flex;
       align-items: center;
       justify-content: center;
     }
     .pb-user-email {
       font-size: 12px;
       color: var(--pb-muted);
       overflow: hidden;
       text-overflow: ellipsis;
       white-space: nowrap;
     }
     ```
- **Traps to avoid:** Ensure CRLF line endings. Check that the login screen adapts cleanly to dark mode tokens.
- **Verify:** Open dashboard in browser, observe the login card centered with styled inputs.
- **Commit message:** `feat(cms): add PocketBase-style login card and user session UI`
- **Rollback:** `git checkout scripts/cms/public/index.html scripts/cms/public/cms.css`

#### Step 4 — Implement client authentication state, login/logout handlers, and 401 interceptors in `scripts/cms/public/cms.js`
- **Files:** `scripts/cms/public/cms.js`
- **Change:**
  1. Add session state in `scripts/cms/public/cms.js`:
  ```javascript
  state.user = null;
  ```
  2. Implement `checkAuth()`:
     - Calls `fetch('/api/auth/me')`.
     - If response is 200:
       - Sets `state.user = data.email`.
       - Updates `#user-display-email` text.
       - Hides `#pb-login`, shows `#pb-app`.
       - Calls `loadCollections()`.
     - If response is 401:
       - Shows `#pb-login`, hides `#pb-app`.
  3. Implement Login Form submission:
     - On `#form-login` submit:
       - Read email and password.
       - Display spinner, disable submit button, hide previous error alert.
       - Send `POST /api/auth/login` with `{ email, password }`.
       - If failed: show error message in `#login-error`.
       - If successful:
         - Clear password field.
         - Update user state.
         - Transition from `#pb-login` to `#pb-app`.
         - Call `loadCollections()`.
         - Show welcome toast: `"Signed in as " + email`.
  4. Implement Logout handler:
     - On `#btn-logout` click:
       - Send `POST /api/auth/logout`.
       - Clear `state.user`.
       - Transition from `#pb-app` to `#pb-login`.
       - Show toast: `"Signed out successfully"`.
  5. Password visibility toggle:
     - Clicking `#btn-toggle-pw` toggles password input type between `"password"` and `"text"`.
  6. Interceptor for 401 responses:
     - Wrap all API `fetch` calls or check `res.status === 401`.
     - When a 401 is encountered, immediately call `showLoginScreen()` with error toast: `"Session expired. Please sign in again."`.
- **Traps to avoid:** Prevent duplicate initialization of event listeners if login occurs multiple times.
- **Verify:** Run server, open `http://localhost:3333`, attempt login with wrong password (shows error), login with `admin@jagofarm.dev` / `jagofarm2026!` (transitions to dashboard), and click Sign out (returns to login screen).
- **Commit message:** `feat(cms): implement client authentication flow and session gate in cms.js`
- **Rollback:** `git checkout scripts/cms/public/cms.js`

---

### Phase 3: Automated Verification

#### Step 5 — Update `scripts/cms/cms-integration.test.mjs` to test auth gate, token verification, and protected routes
- **Files:** `scripts/cms/cms-integration.test.mjs`
- **Change:**
  In `scripts/cms/cms-integration.test.mjs`:
  1. Assert unauthenticated access:
     - `fetch('http://localhost:3334/api/collections')` returns status 401.
     - `fetch('http://localhost:3334/api/products')` returns status 401.
  2. Assert invalid credentials:
     - `POST /api/auth/login` with wrong password returns 401 and error string.
  3. Assert valid login:
     - `POST /api/auth/login` with `admin@jagofarm.dev` and `jagofarm2026!` returns 200, returns token, and sets `jagofarm_cms_token` cookie.
  4. Assert authenticated access:
     - `GET /api/auth/me` with session cookie or Bearer token returns 200 with `{ authenticated: true, email: "admin@jagofarm.dev" }`.
     - `GET /api/collections` with session cookie returns 200 and schema array.
  5. Update existing test suite steps (upload, collection creation, data PUT) to include session cookie or Bearer token header in all requests.
  6. Assert logout:
     - `POST /api/auth/logout` returns 200 and clears cookie (`Max-Age=0`).
- **Verify:** Run `node scripts/cms/cms-integration.test.mjs` and ensure it exits with code 0 and prints `CMS integration test passed all assertions!`.
- **Commit message:** `test(cms): verify authentication gate and protected routes in integration test`
- **Rollback:** `git checkout scripts/cms/cms-integration.test.mjs`

---

## 5. Needs My Decision
None. All security designs (HMAC-SHA256 session tokens, HttpOnly cookies, zero-dependency `node:crypto`, default credentials with env overrides) are established.

## 6. Risks
- **Brute Force on Production**: If exposed directly to the public internet, password guessing attacks could be attempted.
  *Mitigation:* Keep a strong default password, encourage setting `CMS_ADMIN_PASSWORD` in production environment variables, and use constant-time string comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
- **FOUC / Dashboard Leak Before Auth Check**: The browser could momentarily flash dashboard content before `GET /api/auth/me` resolves.
  *Mitigation:* The `#pb-app` container has inline `style="display:none;"` in `index.html` by default. It is only revealed via JavaScript after auth verification completes.

## 7. Noticed but Out of Scope
- Rate-limiting middleware (can be added in the production unified server step).

## 8. After Execution
Once all steps are committed, report back to the senior model (do not execute on your own):
- State the plan file executed (`plans/PLAN-2026-10-26-cms-auth-gate.md`).
- Confirm that all commits were made to branch `CMS`.
- List any steps that were PARTIAL or had to deviate.
- Do not update any skill file.
The senior model will run verification, confirm correctness, and update the skill.
