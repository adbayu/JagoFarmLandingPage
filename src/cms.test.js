import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateProduct, validateProject } from "./data/cmsValidation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/products.json"), "utf8")
);
const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/projects.json"), "utf8")
);

assert(Array.isArray(products), "Products must be an array");
assert(products.length > 0, "Products array must not be empty");

for (const product of products) {
  assert.doesNotThrow(() => validateProduct(product), `Product ${product.id} failed validation`);
}

assert(Array.isArray(projects), "Projects must be an array");
assert(projects.length > 0, "Projects array must not be empty");

for (const project of projects) {
  assert.doesNotThrow(() => validateProject(project), `Project ${project.slug} failed validation`);
}

// Check invalid inputs throw
assert.throws(() => validateProduct({ id: "" }));
assert.throws(() => validateProject({ slug: "INVALID SLUG" }));

console.log("cms data validation passed");
