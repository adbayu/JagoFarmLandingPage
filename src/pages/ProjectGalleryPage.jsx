import { useRef, useState } from "react";
import { Link } from "../components/navigation.jsx";
import { projectPortfolio } from "../data/projectPortfolio.js";
import "./ProjectsPortfolioPage.css";
import "./ProjectGalleryPage.css";

export default function ProjectGalleryPage() {
  const slug = window.location.hash.slice(1).split("/")[2];
  const project = projectPortfolio.find((item) => item.slug === slug) ?? projectPortfolio[0];
  const dialogRef = useRef(null);
  const [selected, setSelected] = useState(null);

  function openImage(photo) {
    setSelected(photo);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  return (
    <>
      <section className="project-gallery-hero section">
        <img className="project-gallery-hero-image" src={project.cover.image} alt="" fetchPriority="high" />
        <div className="project-gallery-hero-shade" aria-hidden="true" />
        <div className="container project-gallery-hero-content">
          <Link className="project-gallery-back" to="/proyek"><span aria-hidden="true">←</span> Semua proyek</Link>
          <div className="project-gallery-heading"><span>{project.kind}</span><h1>{project.name}</h1><p>{project.description}</p></div>
        </div>
      </section>
      <section className="section project-gallery-section">
        <div className="container">
          <header className="project-gallery-intro"><div><span className="number">Arsip visual</span><h2>Catatan dokumentasi JagoFarm.</h2></div><p>{project.photoNote}</p></header>
          <div className="project-gallery-grid">
            {project.gallery.map((photo, index) => (
              <button className="project-gallery-card" key={`${photo.image}-${index}`} type="button" onClick={() => openImage(photo)}>
                <img src={photo.image} alt={photo.alt} loading="lazy" decoding="async" /><span className="project-gallery-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="project-gallery-caption"><strong>{photo.title}</strong><small>Buka foto</small></span>
              </button>
            ))}
          </div>
          <div className="project-gallery-footer"><Link className="project-gallery-back project-gallery-back-bottom" to="/proyek"><span aria-hidden="true">←</span> Kembali ke semua proyek</Link></div>
        </div>
      </section>
      <dialog className="project-lightbox" ref={dialogRef} aria-labelledby="project-lightbox-title" onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        {selected ? <div className="project-lightbox-content"><button className="project-lightbox-close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Tutup gambar">×</button><img src={selected.image} alt={selected.alt} /><footer><strong id="project-lightbox-title">{selected.title}</strong><p>{selected.alt}</p></footer></div> : null}
      </dialog>
    </>
  );
}
