import { createClient } from "@supabase/supabase-js";

// For CMS server (Node.js) — uses service role key for write access
// For build-time fetch — uses anon key (read-only via RLS)
// For browser runtime — uses anon key from window env (set in index.html)
export function createSupabaseClient({ serviceRole = false } = {}) {
  // Browser environment
  if (typeof window !== "undefined") {
    const url = window.__SUPABASE_URL__;
    const key = window.__SUPABASE_ANON_KEY__;
    if (!url || !key) {
      throw new Error("Supabase env vars not set in window. Check index.html script.");
    }
    return createClient(url, key);
  }
  
  // Node.js environment (CMS server / build scripts)
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
