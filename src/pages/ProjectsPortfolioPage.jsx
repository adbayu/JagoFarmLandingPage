import { useState } from "react";
import { Link } from "../components/navigation.jsx";
import { projectPortfolio } from "../data/projectPortfolio.js";
import "./ProjectsPortfolioPage.css";

import { useLanguage } from "../i18n.jsx";

export default function ProjectsPortfolioPage() {
  const { language, t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("semua");
  const filteredProjects = statusFilter === "semua"
    ? projectPortfolio
    : projectPortfolio.filter((project) => project.status === statusFilter);
  const statusFilters = [
    { value: "semua", label: "Semua", count: projectPortfolio.length },
    { value: "berjalan", label: "Berjalan", count: projectPortfolio.filter((project) => project.status === "berjalan").length },
    { value: "selesai", label: "Selesai", count: projectPortfolio.filter((project) => project.status === "selesai").length },
  ];

  return (
    <>
      <section className="projects-hero section">
        <img className="projects-hero-image" src="/assets/projects/bestari/ega-di-saung-bestari.svg" alt={t("Ega di area saung pada proyek Bestari.")} loading="eager" fetchPriority="high" />
        <div className="projects-hero-shade" />
        <div className="container projects-hero-content">
          <div>
            <span className="projects-kicker">{t("Album Proyek")}</span>
            <h1>{t("Dokumentasi proyek JagoFarm.")}</h1>
          </div>
          <div className="projects-hero-copy">
            <p>{t("Jelajahi dokumentasi proyek, kolaborasi, dan eksplorasi JagoFarm dalam satu tempat.")}</p>
            <button className="projects-scroll-link" type="button" onClick={() => document.getElementById("project-index")?.scrollIntoView({ behavior: "smooth" })}>
              {t("Lihat album")} <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section project-portfolio" id="project-index">
        <div className="container">
          <header className="project-portfolio-heading">
            <div><span className="number">{t("Album proyek")}</span><h2>{t("Pilih album untuk melihat dokumentasinya.")}</h2></div>
            <p>{t("Album mencakup kolaborasi, pengabdian kepada masyarakat, teknologi sensor dan IoT, serta eksplorasi ekosistem sirkular.")}</p>
          </header>
          <p className="project-photo-notice">{t("Foto dokumentasi tersedia di album Bestari dan IoT untuk Budidaya.")}</p>
          <div className="project-status-filters" role="group" aria-label={t("Filter status proyek")}>
            {statusFilters.map((filter) => (
              <button
                className="project-status-filter"
                key={filter.value}
                type="button"
                aria-pressed={statusFilter === filter.value}
                onClick={() => setStatusFilter(filter.value)}
              >
                {t(filter.label)}<span>{filter.count}</span>
              </button>
            ))}
          </div>
          {filteredProjects.length > 0 ? (
            <div className="project-portfolio-grid">
            {filteredProjects.map((project) => (
              <Link className="project-portfolio-card" key={project.slug} to={`/proyek/${project.slug}`} aria-label={language === "en" ? `Open ${t(project.name)} album. Status: ${t(project.status === "selesai" ? "Selesai" : "Berjalan")}` : `Buka album ${t(project.name)}. Status: ${t(project.status === "selesai" ? "Selesai" : "Berjalan")}`}>
                {project.cover && <img className={project.slug === "bestari" ? "is-bestari" : ""} src={project.cover.image} alt={t(project.cover.alt)} loading="lazy" decoding="async" />}
                <span className="project-card-shade" aria-hidden="true" />
                <span className={`project-card-status project-card-status--${project.status}`}><span aria-hidden="true" />{t(project.status === "selesai" ? "Selesai" : "Berjalan")}</span>
                <span className="project-card-number">{project.number}</span>
                <span className="project-card-copy"><small>{t(project.kind)}</small><strong>{t(project.name)}</strong>{project.gallery.length === 0 && <span>{t("Belum ada foto untuk proyek ini.")}</span>}<span className="project-card-open">{t("Buka album")} <span aria-hidden="true">↗</span></span></span>
              </Link>
            ))}
            </div>
          ) : (
            <p className="project-status-empty" role="status">{t("Belum ada proyek selesai. Semua proyek saat ini masih berjalan.")}</p>
          )}
        </div>
      </section>

    </>
  );
}
