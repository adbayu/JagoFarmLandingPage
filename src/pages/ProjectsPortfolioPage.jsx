import { Link } from "../components/navigation.jsx";
import { projectPortfolio } from "../data/projectPortfolio.js";
import "./ProjectsPortfolioPage.css";

export default function ProjectsPortfolioPage() {
  return (
    <>
      <section className="projects-hero section">
        <img className="projects-hero-image" src="/assets/startup/startup-04.jpg" alt="" loading="eager" fetchPriority="high" />
        <div className="projects-hero-shade" />
        <div className="container projects-hero-content">
          <div>
            <span className="projects-kicker">Album Proyek</span>
            <h1>Dokumentasi proyek JagoFarm.</h1>
          </div>
          <div className="projects-hero-copy">
            <p>Jelajahi dokumentasi proyek, kolaborasi, dan eksplorasi JagoFarm dalam satu tempat.</p>
            <button className="projects-scroll-link" type="button" onClick={() => document.getElementById("project-index")?.scrollIntoView({ behavior: "smooth" })}>
              Lihat album <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section project-portfolio" id="project-index">
        <div className="container">
          <header className="project-portfolio-heading">
            <div><span className="number">Album proyek</span><h2>Pilih album untuk melihat dokumentasinya.</h2></div>
            <p>Album mencakup kolaborasi, pengabdian kepada masyarakat, teknologi sensor dan IoT, serta eksplorasi ekosistem sirkular.</p>
          </header>
          <p className="project-photo-notice">Foto sampul memakai arsip dokumentasi umum JagoFarm sementara; foto-foto ini belum mewakili dokumentasi khusus tiap proyek.</p>
          <div className="project-portfolio-grid">
            {projectPortfolio.map((project) => (
              <Link className="project-portfolio-card" key={project.slug} to={`/proyek/${project.slug}`} aria-label={`Buka album ${project.name}`}>
                <img src={project.cover.image} alt="" loading="lazy" decoding="async" />
                <span className="project-card-shade" aria-hidden="true" />
                <span className="project-card-number">{project.number}</span>
                <span className="project-card-copy"><small>{project.kind}</small><strong>{project.name}</strong><span className="project-card-open">Buka album <span aria-hidden="true">↗</span></span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
