import assert from "node:assert/strict";
import { projectPortfolio } from "./data/projectPortfolio.js";
import { getOrganizationSchema, getRouteMetadata, renderMetadataHead } from "./metadata.js";
import { localizedHref, parseRoute } from "./routing.js";

const englishPairs = new Map([
  ["JagoFarm | Platform keputusan budidaya berbasis sensor", "JagoFarm | Sensor-based farming decision platform"],
  ["Platform JagoFarm untuk akuaponik, hidroponik, dan budidaya ikan. ESP32 membaca pH, TDS, dan suhu air. Rekomendasi AI sedang diintegrasikan dengan Claude API.", "JagoFarm's platform serves aquaponics, hydroponics, and fish farms. ESP32 reads pH, TDS, and water temperature. Claude API recommendations are being integrated."],
  ["Katalog JagoFarm mencakup ikan, azolla, tanaman, dan platform sensor untuk budidaya.", "JagoFarm's catalog includes fish, azolla, crops, and a sensor platform for farming."],
  ["JagoFarm adalah startup di bawah naungan Kolab Creative Hub. Tim melakukan riset dan pengembangan ekosistem budidaya sirkular serta teknologi pemantauan, dibantu AI.", "JagoFarm is a startup under the umbrella of Kolab Creative Hub. The team researches and develops a circular farming ecosystem and monitoring technology with AI assistance."],
  ["Bestari", "Bestari"],
]);
const translateForTest = (text) => englishPairs.get(text) ?? text;

const homeId = getRouteMetadata(parseRoute("/"));
assert.equal(homeId.title, "JagoFarm | Platform keputusan budidaya berbasis sensor");
assert.equal(homeId.description.length, 158);
assert.equal(homeId.canonical, "https://jagofarm.dev/");
assert.deepEqual(homeId.alternates, {
  id: "https://jagofarm.dev/",
  en: "https://jagofarm.dev/en/",
  "x-default": "https://jagofarm.dev/",
});

const homeEn = getRouteMetadata(parseRoute("/en/"), translateForTest);
assert.equal(homeEn.title, "JagoFarm | Sensor-based farming decision platform");
assert.equal(homeEn.description.length, 160);
assert.equal(homeEn.canonical, "https://jagofarm.dev/en/");
assert.equal(homeEn.ogLocale, "en_US");
assert.match(renderMetadataHead(homeEn), /name="twitter:card" content="summary_large_image"/);

const productsId = getRouteMetadata(parseRoute("/produk/"));
const productsEn = getRouteMetadata(parseRoute("/en/produk/"), translateForTest);
assert.equal(productsId.description, "Katalog JagoFarm mencakup ikan, azolla, tanaman, dan platform sensor untuk budidaya.");
assert.equal(productsEn.description, "JagoFarm's catalog includes fish, azolla, crops, and a sensor platform for farming.");

const aboutEn = getRouteMetadata(parseRoute("/en/tentang/"), translateForTest);
assert.equal(aboutEn.description, "JagoFarm is a startup under the umbrella of Kolab Creative Hub. The team researches and develops a circular farming ecosystem and monitoring technology with AI assistance.");

const routes = ["/", "/tentang", "/produk", "/proyek", ...projectPortfolio.map(({ slug }) => `/proyek/${slug}`)];
const localizedRoutes = routes.flatMap((route) => [localizedHref(route, "id"), localizedHref(route, "en")]);
assert.equal(localizedRoutes.length, 18);
assert.equal(new Set(localizedRoutes).size, 18);

for (const route of routes) {
  const idMetadata = getRouteMetadata(parseRoute(localizedHref(route, "id")));
  const enMetadata = getRouteMetadata(parseRoute(localizedHref(route, "en")), translateForTest);
  assert.equal(idMetadata.canonical, `https://jagofarm.dev${localizedHref(route, "id")}`);
  assert.equal(enMetadata.canonical, `https://jagofarm.dev${localizedHref(route, "en")}`);
  assert.equal(idMetadata.alternates.id, `https://jagofarm.dev${localizedHref(route, "id")}`);
  assert.equal(idMetadata.alternates.en, `https://jagofarm.dev${localizedHref(route, "en")}`);
  assert.equal(idMetadata.organization !== null, route === "/");
  assert.equal(enMetadata.organization !== null, route === "/");
}

const schema = getOrganizationSchema();
assert.deepEqual(Object.keys(schema), ["@context", "@type", "name", "url", "logo", "email", "foundingDate", "sameAs"]);
assert.equal(schema.sameAs.length, 5);
assert.equal((renderMetadataHead(homeId).match(/type="application\/ld\+json"/g) ?? []).length, 1);
assert.equal((renderMetadataHead(getRouteMetadata(parseRoute("/produk"))).match(/type="application\/ld\+json"/g) ?? []).length, 0);

console.log("metadata checks passed");
