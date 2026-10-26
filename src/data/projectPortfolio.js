import projectsData from "./projects.json" with { type: "json" };

export const projectPortfolio = projectsData.map((project) => ({
  ...project,
  photoNote: project.photoNote ?? "Belum ada foto untuk proyek ini.",
}));
