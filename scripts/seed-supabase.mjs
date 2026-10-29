import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const envPath = path.join(ROOT, ".env");
if (existsSync(envPath)) process.loadEnvFile(envPath);

const { createSupabaseClient } = await import("../src/data/supabase.js");
const supabase = createSupabaseClient({ serviceRole: true });

// Seed products
const products = JSON.parse(await readFile(path.join(ROOT, "src/data/products.json"), "utf8"));
const productRows = products.map((p, i) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  image: p.image,
  category: p.category,
  category_label: p.categoryLabel || null,
  icon: p.icon || null,
  status: p.status,
  sort_order: i,
}));

const { error: prodErr } = await supabase.from("products").upsert(productRows, { onConflict: "id" });
if (prodErr) { console.error("Products seed failed:", prodErr); process.exit(1); }
console.log(`Seeded ${productRows.length} products.`);

// Seed projects
const projects = JSON.parse(await readFile(path.join(ROOT, "src/data/projects.json"), "utf8"));
const projectRows = projects.map((p, i) => ({
  slug: p.slug,
  number: p.number,
  status: p.status,
  kind: p.kind,
  name: p.name,
  description: p.description,
  cover: p.cover || null,
  gallery: p.gallery || [],
  photo_note: p.photoNote || null,
  partners: p.partners || null,
  sort_order: i,
}));

const { error: projErr } = await supabase.from("projects").upsert(projectRows, { onConflict: "slug" });
if (projErr) { console.error("Projects seed failed:", projErr); process.exit(1); }
console.log(`Seeded ${projectRows.length} projects.`);

// Seed system collection schemas
const schema = JSON.parse(await readFile(path.join(ROOT, "src/data/_schema.json"), "utf8"));
for (const col of schema) {
  const { error } = await supabase.from("cms_collections").upsert({
    name: col.name,
    title: col.title,
    system: col.system || false,
    fields: col.fields || [],
  }, { onConflict: "name" });
  if (error) { console.error(`Schema seed failed for ${col.name}:`, error); process.exit(1); }
}
console.log(`Seeded ${schema.length} collection schemas.`);
console.log("Done.");
