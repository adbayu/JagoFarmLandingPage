import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCmsServer } from "./server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../../");
const PRODUCTS_JSON = path.join(ROOT_DIR, "src/data/products.json");
const PROJECTS_JSON = path.join(ROOT_DIR, "src/data/projects.json");
const PORT = 3334;

async function runTest() {
  const server = createCmsServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test CMS server listening on http://localhost:${PORT}`);

  let uploadedFilePath = null;
  let originalProductsContent = null;

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

    console.log("CMS integration test passed all assertions!");
  } finally {
    // 7. Cleanup
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
    await new Promise((resolve) => server.close(resolve));
    console.log("CMS test server stopped");
  }
}

runTest().catch((err) => {
  console.error("CMS integration test failed:", err);
  process.exit(1);
});
