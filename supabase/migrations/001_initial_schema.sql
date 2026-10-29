-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('akuakultur', 'nutrisi', 'tanaman', 'teknologi')),
  category_label TEXT,
  icon TEXT CHECK (icon IS NULL OR icon IN ('sensor', 'fish', 'leaf', 'plant', 'cycle', 'drop')),
  status TEXT NOT NULL CHECK (status IN ('prototype', 'riset')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE projects (
  slug TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('berjalan', 'selesai')),
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cover JSONB,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  photo_note TEXT,
  partners JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schema registry for custom CMS collections
CREATE TABLE cms_collections (
  name TEXT PRIMARY KEY CHECK (name ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title TEXT NOT NULL,
  system BOOLEAN NOT NULL DEFAULT false,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generic records for custom collections
CREATE TABLE cms_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_name TEXT NOT NULL REFERENCES cms_collections(name) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cms_records_collection ON cms_records(collection_name);

-- Row Level Security: anon can read products and projects, service role can do everything
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_records ENABLE ROW LEVEL SECURITY;

-- Read-only for anon
CREATE POLICY "anon_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "anon_read_projects" ON projects FOR SELECT USING (true);

-- Service role bypasses RLS automatically, but explicit policies for clarity
CREATE POLICY "service_all_products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_cms_collections" ON cms_collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_cms_records" ON cms_records FOR ALL USING (true) WITH CHECK (true);
