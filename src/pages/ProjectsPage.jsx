import { cycleStages } from "../data/content.js";
import { ButtonLink } from "../components/navigation.jsx";
import "./ProjectsPage.css";

const collaborations = [
  {
    number: "01",
    kind: "Kolaborasi eksternal",
    name: "Bestari",
    description: "Proyek eksternal JagoFarm bersama Bestari.",
  },
  {
    number: "02",
    kind: "Pengabdian kepada masyarakat",
    name: "PKM",
    description: "Program JagoFarm dalam ranah pengabdian kepada masyarakat.",
  },
];

const technologyProjects = [
  {
    number: "03",
    kind: "Sensor & instrumentasi",
    name: "Sensor pH air",
    description: "Eksplorasi pengukuran pH air sebagai bagian dari pengamatan kondisi budidaya.",
    tags: ["pH air", "TDS", "Suhu"],
    theme: "sensor",
  },
  {
    number: "04",
    kind: "Sistem informasi",
    name: "IoT untuk budidaya",
    description: "Menghubungkan perangkat pengukuran dengan informasi yang dapat ditinjau dalam konteks pertanian dan budidaya.",
    tags: ["Pengukuran", "Data", "Informasi"],
    theme: "iot",
  },
];

export default function ProjectsPage() {
  return (
    <>
      <section className="projects-hero section">
        <img
          className="projects-hero-image"
          src="/assets/startup/startup-04.jpg"
          alt="Tim JagoFarm mengamati kolam berisi ikan dan azolla"
          loading="eager"
          fetchPriority="high"
        />
        <div className="projects-hero-shade" />
        <div className="container projects-hero-content">
          <div>
            <span className="projects-kicker">Portofolio JagoFarm</span>
            <h1>Menjelajahi pertanian dan pangan lewat sistem informasi.</h1>
          </div>
          <div className="projects-hero-copy">
            <p>Berbagai proyek menjadi ruang untuk menghubungkan teknologi, praktik budidaya, kolaborasi, dan ekosistem pangan.</p>
            <button
              className="projects-scroll-link"
              type="button"
              onClick={() => document.getElementById("projects-index")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
            >
              Jelajahi proyek <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section projects-intro" id="projects-index">
        <div className="container projects-intro-grid">
          <div>
            <span className="number">Satu visi, banyak jalur</span>
            <h2>Setiap proyek membuka sudut pandang baru.</h2>
          </div>
          <p>JagoFarm mengeksplorasi pertanian dan pangan melalui sistem informasi. Bentuknya beragam: bekerja bersama pihak lain, mengembangkan teknologi pengamatan, dan mempelajari hubungan antarkomponen dalam ekosistem.</p>
        </div>
      </section>

      <section className="section projects-group projects-collaboration">
        <div className="container">
          <header className="projects-section-heading">
            <div><span className="number">01 — Kolaborasi</span><h2>Bertumbuh bersama.</h2></div>
            <p>Proyek kolaborasi dan pengabdian memperluas cara JagoFarm bertemu dengan konteks pertanian di masyarakat.</p>
          </header>
          <div className="projects-collaboration-grid">
            {collaborations.map((project) => (
              <article className="projects-collaboration-card" key={project.number}>
                <div className="projects-card-top"><span>{project.number}</span><small>{project.kind}</small></div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="projects-card-mark" aria-hidden="true">J<span>F</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section projects-group projects-technology">
        <div className="container">
          <header className="projects-section-heading">
            <div><span className="number">02 — Teknologi</span><h2>Mengubah pengamatan menjadi informasi.</h2></div>
            <p>Sensor dan perangkat terhubung membuka kemungkinan untuk membaca kondisi budidaya dengan lebih terstruktur.</p>
          </header>
          <div className="projects-technology-grid">
            {technologyProjects.map((project) => (
              <article className={`projects-technology-card is-${project.theme}`} key={project.number}>
                <div className="projects-card-top"><span>{project.number}</span><small>{project.kind}</small></div>
                <div className="projects-tech-visual" aria-hidden="true">
                  {project.theme === "sensor" ? (
                    <div className="projects-sensor-symbol"><span>pH</span><i /></div>
                  ) : (
                    <div className="projects-network-symbol"><i /><i /><i /><span /><span /></div>
                  )}
                </div>
                <div className="projects-technology-copy">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <ul aria-label={`Ruang lingkup ${project.name}`}>
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section projects-ecosystem">
        <div className="container">
          <header className="projects-ecosystem-heading">
            <div><span className="projects-kicker">03 — Ekosistem</span><h2>Melihat nilai yang bergerak dalam satu lingkaran.</h2></div>
            <p>Ikan, sisa budidaya, azolla, dan tanaman dipelajari sebagai bagian dari hubungan yang saling terhubung.</p>
          </header>
          <div className="projects-cycle-list">
            {cycleStages.slice(0, 4).map((stage) => (
              <article className="projects-cycle-step" key={stage.number}>
                <span className="projects-cycle-number">{stage.number}</span>
                <img src={stage.image} alt={stage.alt} loading="lazy" decoding="async" />
                <div><small>{stage.label}</small><h3>{stage.title}</h3><p>{stage.description}</p></div>
                <span className="projects-cycle-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
          <p className="projects-ecosystem-note">Ekosistem sirkular merupakan area eksplorasi JagoFarm yang terus dipelajari dari konteks lapangan.</p>
        </div>
      </section>

      <section className="section projects-next">
        <div className="container projects-next-inner">
          <div><span className="number">Ikuti prosesnya</span><h2>Eksplorasi berlanjut di lapangan.</h2></div>
          <ButtonLink to="/dokumentasi">Lihat dokumentasi</ButtonLink>
        </div>
      </section>
    </>
  );
}
