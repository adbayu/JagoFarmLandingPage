// This script overwrites src/data/products.json, projects.json, and _schema.json
// with fresh data from Supabase. These files are generated at build time and
// gitignored — Supabase is the source of truth.
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

// Fetch collection schemas
const { data: schemas, error: schemaErr } = await supabase
  .from("cms_collections")
  .select("*")
  .order("created_at", { ascending: true });
if (schemaErr) { console.error("Failed to fetch schemas:", schemaErr); process.exit(1); }

const schemasJson = schemas.map(s => ({
  name: s.name,
  title: s.title,
  system: s.system,
  fields: s.fields || [],
}));
await writeFile(
  path.join(ROOT, "src/data/_schema.json"),
  JSON.stringify(schemasJson, null, 2) + "\n",
  "utf8"
);
console.log(`Fetched ${schemasJson.length} collection schemas.`);
console.log("Data files updated.");
