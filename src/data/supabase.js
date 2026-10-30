import { createClient } from "@supabase/supabase-js";

// For CMS server (Node.js) — uses service role key for write access
// For build-time fetch — uses anon key (read-only via RLS)
export function createSupabaseClient({ serviceRole = false } = {}) {
  const url = process.env.SUPABASE_URL;
  const key = serviceRole
    ? process.env.SUPABASE_SERVICE_KEY
    : process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      `Missing Supabase config. Set SUPABASE_URL and ${serviceRole ? "SUPABASE_SERVICE_KEY" : "SUPABASE_ANON_KEY"} in .env`
    );
  }
  return createClient(url, key);
}
