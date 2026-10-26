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
    const originalProjectsContent = await fs.readFile(PROJECTS_JSON, "utf8");

    // 2. GET /api/products
    const resGetProducts = await fetch(`http://localhost:${PORT}/api/products`);
    assert.equal(resGetProducts.status, 200, "GET /api/products status must be 200");
    const products = await resGetProducts.json();
    assert(Array.isArray(products), "Products must be an array");
    const initialCount = products.length;

    // 3. GET /api/projects
    const resGetProjects = await fetch(`http://localhost:${PORT}/api/projects`);
    assert.equal(resGetProjects.status, 200, "GET /api/projects status must be 200");
    const projects = await resGetProjects.json();
    assert(Array.isArray(projects), "Projects must be an array");
    assert(projects.length >= 5, "Projects must have at least 5 entries");

    // 4. POST /api/upload (mock 1x1 transparent PNG)
    const mockPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );
    const resUpload = await fetch(
      `http://localhost:${PORT}/api/upload?folder=products&filename=integration-test-img.png`,
      {
        method: "POST",
        headers: { "Content-Type": "image/png" },
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

    // 5. Append test product and PUT /api/products
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProducts),
    });
    assert.equal(resPut.status, 200, "PUT /api/products status must be 200");
    const putJson = await resPut.json();
    assert.equal(putJson.count, initialCount + 1, "PUT response count must reflect added item");

    // 6. Verify products.json on disk
    const diskContent = await fs.readFile(PRODUCTS_JSON, "utf8");
    const diskJson = JSON.parse(diskContent);
    assert.equal(diskJson.length, initialCount + 1, "Disk JSON must contain added item");
    assert.equal(diskJson[diskJson.length - 1].id, "integration-test-product");

    // 7. Verify theme assets & toggle markup
    const resIndex = await fetch(`http://localhost:${PORT}/index.html`);
    assert.equal(resIndex.status, 200, "GET /index.html status must be 200");
    const indexHtml = await resIndex.text();
    assert(indexHtml.includes("dataset.theme"), "index.html must contain dataset.theme early script");
    assert(indexHtml.includes('id="btn-toggle-theme"'), 'index.html must contain id="btn-toggle-theme"');

    const resCss = await fetch(`http://localhost:${PORT}/cms.css`);
    assert.equal(resCss.status, 200, "GET /cms.css status must be 200");
    const cssText = await resCss.text();
    assert(cssText.includes('html[data-theme="dark"]'), 'cms.css must contain html[data-theme="dark"]');

    const resJs = await fetch(`http://localhost:${PORT}/cms.js`);
    assert.equal(resJs.status, 200, "GET /cms.js status must be 200");
    const jsText = await resJs.text();
    assert(jsText.includes("jagofarm-cms-theme"), "cms.js must contain jagofarm-cms-theme");

    // 8. Test Dynamic Collections Builder
    // 8a. GET /api/collections
    const resGetCols = await fetch(`http://localhost:${PORT}/api/collections`);
    assert.equal(resGetCols.status, 200, "GET /api/collections status must be 200");
    const cols = await resGetCols.json();
    assert(Array.isArray(cols), "Collections must be an array");
    assert(cols.some(c => c.name === "products"), "Collections must contain products");
    assert(cols.some(c => c.name === "projects"), "Collections must contain projects");

    // 8b. Reject deletion of system collection
    const resDelSystem = await fetch(`http://localhost:${PORT}/api/collections/products`, {
      method: "DELETE",
    });
    assert.equal(resDelSystem.status, 400, "DELETE system collection must return 400");

    // 8c. POST /api/collections (create test-testimonials)
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testColPayload),
    });
    assert.equal(resPostCol.status, 200, "POST /api/collections must return 200");
    const colFileStat = await fs.stat(testColFile);
    assert(colFileStat.isFile(), "test-testimonials.json must exist on disk");

    // 8d. PUT /api/test-testimonials
    const testRecord = {
      author: "Jane Doe",
      content: "Great sustainable agritech platform!",
      rating: 5,
    };
    const resPutCol = await fetch(`http://localhost:${PORT}/api/test-testimonials`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([testRecord]),
    });
    assert.equal(resPutCol.status, 200, "PUT /api/test-testimonials must return 200");

    // 8e. GET /api/test-testimonials
    const resGetColData = await fetch(`http://localhost:${PORT}/api/test-testimonials`);
    assert.equal(resGetColData.status, 200, "GET /api/test-testimonials must return 200");
    const colData = await resGetColData.json();
    assert.equal(colData.length, 1);
    assert.equal(colData[0].author, "Jane Doe");

    // 8f. DELETE /api/collections/test-testimonials
    const resDelCol = await fetch(`http://localhost:${PORT}/api/collections/test-testimonials`, {
      method: "DELETE",
    });
    assert.equal(resDelCol.status, 200, "DELETE /api/collections/test-testimonials must return 200");

    // Verify deleted from schema and file removed
    const resGetColsAfter = await fetch(`http://localhost:${PORT}/api/collections`);
    const colsAfter = await resGetColsAfter.json();
    assert(!colsAfter.some(c => c.name === "test-testimonials"), "test-testimonials must be removed from schema");

    let fileExists = true;
    try {
      await fs.stat(testColFile);
    } catch {
      fileExists = false;
    }
    assert(!fileExists, "test-testimonials.json must be removed from disk");

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
          await fs.writeFile(SCHEMA_JSON, JSON.stringify(cleaned, null, 2) + "\n", "utf8");
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
