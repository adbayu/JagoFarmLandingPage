import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCmsServer } from "./server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../../");
const PRODUCTS_JSON = path.join(ROOT_DIR, "src/data/products.json");
const PROJECTS_JSON = path.join(ROOT_DIR, "src/data/projects.json");
const SCHEMA_JSON = path.join(ROOT_DIR, "src/data/_schema.json");
const PORT = 3334;

const ENV_PATH = path.join(ROOT_DIR, ".env");
if (existsSync(ENV_PATH)) {
  try {
    process.loadEnvFile(ENV_PATH);
  } catch {}
}

const testEmail = process.env.CMS_ADMIN_EMAIL || "test-admin@jagofarm.dev";
const testPassword = process.env.CMS_ADMIN_PASSWORD || "test-secret-2026!";

if (!process.env.CMS_ADMIN_EMAIL) process.env.CMS_ADMIN_EMAIL = testEmail;
if (!process.env.CMS_ADMIN_PASSWORD) process.env.CMS_ADMIN_PASSWORD = testPassword;

async function runTest() {
  const server = createCmsServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test CMS server listening on http://localhost:${PORT}`);

  let uploadedFilePath = null;
  let originalProductsContent = null;
  const testColFile = path.join(ROOT_DIR, "src/data/test-testimonials.json");

  try {
    // 1. Backup original products.json
    originalProductsContent = await fs.readFile(PRODUCTS_JSON, "utf8");

    // 2. Auth Gate Assertions - Unauthenticated access returns 401
    const resUnauthCols = await fetch(`http://localhost:${PORT}/api/collections`);
    assert.equal(resUnauthCols.status, 401, "GET /api/collections unauthenticated must return 401");

    const resUnauthProducts = await fetch(`http://localhost:${PORT}/api/products`);
    assert.equal(resUnauthProducts.status, 401, "GET /api/products unauthenticated must return 401");

    const resUnauthMe = await fetch(`http://localhost:${PORT}/api/auth/me`);
    assert.equal(resUnauthMe.status, 401, "GET /api/auth/me unauthenticated must return 401");

    // 3. Auth Gate Assertions - Invalid credentials return 401
    const resInvalidLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "wrongpassword!" }),
    });
    assert.equal(resInvalidLogin.status, 401, "POST /api/auth/login with wrong password must return 401");
    const invalidJson = await resInvalidLogin.json();
    assert(invalidJson.error, "Error message must be returned on invalid credentials");

    // 4. Valid Login
    const resValidLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert.equal(resValidLogin.status, 200, "POST /api/auth/login with valid credentials must return 200");
    const loginData = await resValidLogin.json();
    assert.equal(loginData.success, true);
    assert.equal(loginData.email, testEmail);
    assert(loginData.token, "Login must return session token");

    // Extract cookie from Set-Cookie header
    const setCookieHeader = resValidLogin.headers.get("set-cookie") || "";
    const cookieMatch = setCookieHeader.match(/jagofarm_cms_token=([^;]+)/);
    assert(cookieMatch, "Set-Cookie header must include jagofarm_cms_token");
    const sessionCookie = `jagofarm_cms_token=${cookieMatch[1]}`;
    const authHeaders = {
      Cookie: sessionCookie,
    };

    // 5. Assert authenticated access: GET /api/auth/me
    const resAuthMe = await fetch(`http://localhost:${PORT}/api/auth/me`, {
      headers: authHeaders,
    });
    assert.equal(resAuthMe.status, 200, "GET /api/auth/me authenticated must return 200");
    const meData = await resAuthMe.json();
    assert.equal(meData.authenticated, true);
    assert.equal(meData.email, testEmail);

    // Test Bearer token on GET /api/auth/me
    const resBearerMe = await fetch(`http://localhost:${PORT}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    assert.equal(resBearerMe.status, 200, "GET /api/auth/me with Bearer token must return 200");

    // 6. GET /api/products (authenticated)
    const resGetProducts = await fetch(`http://localhost:${PORT}/api/products`, {
      headers: authHeaders,
    });
    assert.equal(resGetProducts.status, 200, "GET /api/products status must be 200");
    const products = await resGetProducts.json();
    assert(Array.isArray(products), "Products must be an array");
    const initialCount = products.length;

    // 7. GET /api/projects (authenticated)
    const resGetProjects = await fetch(`http://localhost:${PORT}/api/projects`, {
      headers: authHeaders,
    });
    assert.equal(resGetProjects.status, 200, "GET /api/projects status must be 200");
    const projects = await resGetProjects.json();
    assert(Array.isArray(projects), "Projects must be an array");
    assert(projects.length >= 5, "Projects must have at least 5 entries");

    // 8. POST /api/upload (mock 1x1 transparent PNG)
    const mockPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );
    const resUpload = await fetch(
      `http://localhost:${PORT}/api/upload?folder=products&filename=integration-test-img.png`,
      {
        method: "POST",
        headers: {
          "Content-Type": "image/png",
          ...authHeaders,
        },
        body: mockPngBuffer,
      }
    );
    assert.equal(resUpload.status, 200, "POST /api/upload status must be 200");
    const uploadJson = await resUpload.json();
    assert(uploadJson.url && uploadJson.url.startsWith("/assets/products/"), "Uploaded URL must point to /assets/products/");
    uploadedFilePath = path.join(ROOT_DIR, "public", uploadJson.url.replace(/^\//, ""));

    // Check file exists on disk
    const fileStat = await fs.stat(uploadedFilePath);
    assert(fileStat.isFile(), "Uploaded image must exist on disk");

    // 9. Append test product and PUT /api/products
    const testProduct = {
      id: "integration-test-product",
      name: "Integration Test Product",
      description: "A temporary product created during CMS integration testing.",
      image: uploadJson.url,
      category: "teknologi",
      categoryLabel: "Teknologi",
      icon: "sensor",
      status: "prototype",
    };

    const updatedProducts = [...products, testProduct];
    const resPut = await fetch(`http://localhost:${PORT}/api/products`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(updatedProducts),
    });
    assert.equal(resPut.status, 200, "PUT /api/products status must be 200");
    const putJson = await resPut.json();
    assert.equal(putJson.count, initialCount + 1, "PUT response count must reflect added item");

    // 10. Verify products.json on disk
    const diskContent = await fs.readFile(PRODUCTS_JSON, "utf8");
    const diskJson = JSON.parse(diskContent);
    assert.equal(diskJson.length, initialCount + 1, "Disk JSON must contain added item");
    assert.equal(diskJson[diskJson.length - 1].id, "integration-test-product");

    // 11. Verify theme assets & toggle markup
    const resIndex = await fetch(`http://localhost:${PORT}/index.html`);
    assert.equal(resIndex.status, 200, "GET /index.html status must be 200");
    const indexHtml = await resIndex.text();
    assert(indexHtml.includes("dataset.theme"), "index.html must contain dataset.theme early script");
    assert(indexHtml.includes('id="btn-toggle-theme"'), 'index.html must contain id="btn-toggle-theme"');
    assert(indexHtml.includes('id="pb-login"'), 'index.html must contain id="pb-login"');
    assert(indexHtml.includes('id="pb-app"'), 'index.html must contain id="pb-app"');

    const resCss = await fetch(`http://localhost:${PORT}/cms.css`);
    assert.equal(resCss.status, 200, "GET /cms.css status must be 200");
    const cssText = await resCss.text();
    assert(cssText.includes('html[data-theme="dark"]'), 'cms.css must contain html[data-theme="dark"]');
    assert(cssText.includes(".pb-login-card"), "cms.css must contain .pb-login-card");

    const resJs = await fetch(`http://localhost:${PORT}/cms.js`);
    assert.equal(resJs.status, 200, "GET /cms.js status must be 200");
    const jsText = await resJs.text();
    assert(jsText.includes("jagofarm-cms-theme"), "cms.js must contain jagofarm-cms-theme");
    assert(jsText.includes("checkAuth"), "cms.js must contain checkAuth");

    // 12. Test Dynamic Collections Builder
    // 12a. GET /api/collections
    const resGetCols = await fetch(`http://localhost:${PORT}/api/collections`, {
      headers: authHeaders,
    });
    assert.equal(resGetCols.status, 200, "GET /api/collections status must be 200");
    const cols = await resGetCols.json();
    assert(Array.isArray(cols), "Collections must be an array");
    assert(cols.some(c => c.name === "products"), "Collections must contain products");
    assert(cols.some(c => c.name === "projects"), "Collections must contain projects");

    // 12b. Reject deletion of system collection
    const resDelSystem = await fetch(`http://localhost:${PORT}/api/collections/products`, {
      method: "DELETE",
      headers: authHeaders,
    });
    assert.equal(resDelSystem.status, 400, "DELETE system collection must return 400");

    // 12c. POST /api/collections (create test-testimonials)
    const testColPayload = {
      name: "test-testimonials",
      title: "Test Testimonials",
      fields: [
        { name: "author", label: "Author", type: "text", required: true },
        { name: "content", label: "Content", type: "textarea", required: true },
        { name: "rating", label: "Rating", type: "number", required: false },
      ],
    };
    const resPostCol = await fetch(`http://localhost:${PORT}/api/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(testColPayload),
    });
    assert.equal(resPostCol.status, 200, "POST /api/collections must return 200");
    const colFileStat = await fs.stat(testColFile);
    assert(colFileStat.isFile(), "test-testimonials.json must exist on disk");

    // 12d. PUT /api/test-testimonials
    const testRecord = {
      author: "Jane Doe",
      content: "Great sustainable agritech platform!",
      rating: 5,
    };
    const resPutCol = await fetch(`http://localhost:${PORT}/api/test-testimonials`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify([testRecord]),
    });
    assert.equal(resPutCol.status, 200, "PUT /api/test-testimonials must return 200");

    // 12e. GET /api/test-testimonials
    const resGetColData = await fetch(`http://localhost:${PORT}/api/test-testimonials`, {
      headers: authHeaders,
    });
    assert.equal(resGetColData.status, 200, "GET /api/test-testimonials must return 200");
    const colData = await resGetColData.json();
    assert.equal(colData.length, 1);
    assert.equal(colData[0].author, "Jane Doe");

    // 12f. DELETE /api/collections/test-testimonials
    const resDelCol = await fetch(`http://localhost:${PORT}/api/collections/test-testimonials`, {
      method: "DELETE",
      headers: authHeaders,
    });
    assert.equal(resDelCol.status, 200, "DELETE /api/collections/test-testimonials must return 200");

    // Verify deleted from schema and file removed
    const resGetColsAfter = await fetch(`http://localhost:${PORT}/api/collections`, {
      headers: authHeaders,
    });
    const colsAfter = await resGetColsAfter.json();
    assert(!colsAfter.some(c => c.name === "test-testimonials"), "test-testimonials must be removed from schema");

    let fileExists = true;
    try {
      await fs.stat(testColFile);
    } catch {
      fileExists = false;
    }
    assert(!fileExists, "test-testimonials.json must be removed from disk");

    // 13. Logout Assertions
    const resLogout = await fetch(`http://localhost:${PORT}/api/auth/logout`, {
      method: "POST",
      headers: authHeaders,
    });
    assert.equal(resLogout.status, 200, "POST /api/auth/logout must return 200");
    const logoutCookie = resLogout.headers.get("set-cookie") || "";
    assert(logoutCookie.includes("Max-Age=0"), "Logout must set Max-Age=0 to clear session cookie");

    // Verify session revoked / 401 after logout
    const resMeAfterLogout = await fetch(`http://localhost:${PORT}/api/auth/me`, {
      headers: { Cookie: "jagofarm_cms_token=" },
    });
    assert.equal(resMeAfterLogout.status, 401, "GET /api/auth/me after logout must return 401");

    console.log("CMS integration test passed all assertions!");
  } finally {
    // Cleanup
    if (originalProductsContent !== null) {
      await fs.writeFile(PRODUCTS_JSON, originalProductsContent, "utf8");
      console.log("Reverted products.json to original state");
    }
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        console.log("Cleaned up uploaded test image:", uploadedFilePath);
      } catch (err) {
        console.warn("Could not delete uploaded test image:", err.message);
      }
    }
    if (existsSync(testColFile)) {
      try {
        await fs.unlink(testColFile);
      } catch {}
    }
    if (existsSync(SCHEMA_JSON)) {
      try {
        const schema = JSON.parse(await fs.readFile(SCHEMA_JSON, "utf8"));
        const cleaned = schema.filter(c => c.name !== "test-testimonials");
        if (cleaned.length !== schema.length) {
          await fs.writeFile(SCHEMA_JSON, (JSON.stringify(cleaned, null, 2) + "\n").replace(/\r?\n/g, "\r\n"), "utf8");
        }
      } catch {}
    }
    await new Promise((resolve) => server.close(resolve));
    console.log("CMS test server stopped");
  }
}

runTest().catch((err) => {
  console.error("CMS integration test failed:", err);
  process.exit(1);
});
