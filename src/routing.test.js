import assert from "node:assert/strict";
import { projectPortfolio } from "./data/projectPortfolio.js";
import { legacyHashToPath, localizedHref, parseRoute } from "./routing.js";

const baseRoutes = ["/", "/tentang", "/produk", "/proyek"];
const projectRoutes = projectPortfolio.map(({ slug }) => `/proyek/${slug}`);

for (const path of [...baseRoutes, ...projectRoutes]) {
  for (const language of ["id", "en"]) {
    const prefix = language === "en" ? "/en" : "";
    const pathname = `${prefix}${path === "/" ? "/" : `${path}/`}`;
    assert.deepEqual(parseRoute(pathname), {
      path,
      language,
      albumSlug: path.startsWith("/proyek/") ? path.slice("/proyek/".length) : null,
    });
  }
}

assert.deepEqual(parseRoute("/en/produk"), { path: "/produk", language: "en", albumSlug: null });
assert.deepEqual(parseRoute("/missing/route/"), { path: "/", language: "id", albumSlug: null });
assert.equal(localizedHref("/", "id"), "/");
assert.equal(localizedHref("/", "en"), "/en/");
assert.equal(localizedHref("/produk", "id"), "/produk/");
assert.equal(localizedHref("/produk", "en"), "/en/produk/");
assert.equal(localizedHref("/proyek/bestari", "en"), "/en/proyek/bestari/");

assert.equal(legacyHashToPath("#/"), "/");
assert.equal(legacyHashToPath("#/produk"), "/produk/");
assert.equal(legacyHashToPath("#/proyek/bestari"), "/proyek/bestari/");
assert.equal(legacyHashToPath("#/proyek/not-a-project"), null);

console.log("routing checks passed");
