import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { setBrowserClient } from "./data/supabase.js";
import App from "./App.jsx";
import { legacyHashToPath } from "./routing.js";

// Initialize Supabase browser client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseAnonKey) {
  setBrowserClient(createClient(supabaseUrl, supabaseAnonKey));
}

const legacyPath = legacyHashToPath(window.location.hash);
if (legacyPath) window.history.replaceState(null, "", legacyPath);

// Replace prerendered markup rather than hydrating against client-only theme state.
createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
