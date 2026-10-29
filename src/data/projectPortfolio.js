// Re-export hook for runtime data fetching from Supabase
export { useProjects } from "./useSupabaseData.js";

// Static data for build-time use (routing, metadata, prerender)
// This is populated by fetch-data.mjs before build
import projectsData from "./projects.json" with { type: "json" };

export const projectPortfolio = projectsData.map((project) => ({
  ...project,
  photoNote: project.photoNote ?? "Belum ada foto untuk proyek ini.",
}));
