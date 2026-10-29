// Re-export hook for runtime data fetching from Supabase
export { useProjects } from "./useSupabaseData.js";

// Legacy export for prerender script (still needs the data at build time)
// This will be replaced with fetch at build time in prerender.mjs
export const projectPortfolio = [];
