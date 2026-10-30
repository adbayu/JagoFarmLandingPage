import { useEffect, useRef, useState } from "react";
import { Link } from "../components/navigation.jsx";
import { projectPortfolio } from "../data/projectPortfolio.js";
import "./ProjectsPortfolioPage.css";
import "./ProjectGalleryPage.css";

import { useLanguage } from "../i18n.jsx";

export default function ProjectGalleryPage({ albumSlug }) {
  const { t } = useLanguage();
  const slug = albumSlug;
  const project = projectPortfolio.find((item) => item.slug === slug) ?? projectPortfolio[0];
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const lightboxRef = useRef(null);
  const selectedPhoto = selectedPhotoIndex === null ? null : project.gallery[selectedPhotoIndex];

  useEffect(() => setSelectedPhotoIndex(null), [slug]);
  useEffect(() => {
    if (selectedPhotoIndex === null) lightboxRef.current?.close();
    else lightboxRef.current?.showModal();
  }, [selectedPhotoIndex]);

  function movePhoto(direction) {
    setSelectedPhotoIndex((index) => index === null ? null : (index + direction + project.gallery.length) % project.gallery.length);
  }

  return (
    <>
      <svg className="project-gallery-partner-filters" aria-hidden="true" focusable="false">
        <defs>
          <filter id="project-remove-white-background" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceGraphic" result="whiteAlpha" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -6.667 -6.667 -6.667 0 19" />
            <feComposite in="SourceGraphic" in2="whiteAlpha" operator="in" />
          </filter>
          <filter id="project-remove-black-background" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceGraphic" result="blackAlpha" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6.667 6.667 6.667 0 -.5" />
            <feComposite in="SourceGraphic" in2="blackAlpha" operator="in" />
          </filter>
        </defs>
      </svg>
      <section className="project-gallery-hero section">
        {project.cover && <img className={`project-gallery-hero-image ${project.slug === "bestari" ? "is-bestari" : ""}`} src={project.cover.image} alt={t(project.cover.alt)} fetchPriority="high" />}
        <div className="project-gallery-hero-shade" aria-hidden="true" />
        <div className="container project-gallery-hero-content">
          <Link className="project-gallery-back" to="/proyek"><span aria-hidden="true">←</span> {t("Semua proyek")}</Link>
          <div className="project-gallery-heading"><span>{t(project.kind)}</span><h1>{t(project.name)}</h1><p>{t(project.description)}</p></div>
          {project.partners?.length > 0 && (
            <div className="project-gallery-partners" aria-label={`${t("Mitra proyek")} ${t(project.name)}`}>
              <span>{t("Mitra proyek")}</span>
              <div>
                {project.partners.map((partner) => {
                  const logo = <img className={`project-gallery-partner-logo project-gallery-partner-logo--${partner.slug}`} src={partner.logo} alt={partner.name} />;
                  return partner.website ? (
                    <a className="project-gallery-partner-link" key={partner.slug} href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={`${t("Kunjungi website")} ${partner.name}`} title={`${t("Kunjungi website")} ${partner.name}`}>{logo}</a>
                  ) : <span key={partner.slug}>{logo}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="section project-gallery-section" aria-labelledby="project-album-title">
        <div className="container">
          <div className="project-gallery-intro">
            <div><span className="number">{t("Dokumentasi lapangan")} · {project.gallery.length} {t("foto")}</span><h2 id="project-album-title">{t("Album")} {t(project.name)}</h2></div>
            <p>{t(project.photoNote)}</p>
          </div>
          {project.gallery.length > 0 && <ul className="project-gallery-grid">
            {project.gallery.map((photo, index) => (
              <li key={photo.image}>
                <button className="project-gallery-card" type="button" onClick={() => setSelectedPhotoIndex(index)} aria-haspopup="dialog" aria-label={`${t("Buka foto")}: ${t(photo.title)}`}>
                  <img src={photo.image} alt={t(photo.alt)} loading="lazy" decoding="async" />
                  <span className="project-gallery-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="project-gallery-caption"><strong>{t(photo.title)}</strong><small>{t("Buka foto")} ↗</small></span>
                </button>
              </li>
            ))}
          </ul>}
          <div className="project-gallery-footer"><Link className="project-gallery-back project-gallery-back-bottom" to="/proyek">← {t("Semua proyek")}</Link></div>
        </div>
      </section>
      <dialog className="project-lightbox" ref={lightboxRef} aria-labelledby="project-photo-title" onClose={() => setSelectedPhotoIndex(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedPhotoIndex(null); }} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); movePhoto(event.key === "ArrowLeft" ? -1 : 1); }
      }}>
        {selectedPhoto && <div className="project-lightbox-content">
          <button className="project-lightbox-close" type="button" onClick={() => setSelectedPhotoIndex(null)} aria-label={t("Tutup foto")}>×</button>
          <img src={selectedPhoto.image} alt={t(selectedPhoto.alt)} decoding="async" />
          <footer>
            <div><strong id="project-photo-title">{t(selectedPhoto.title)}</strong><p>{t(selectedPhoto.alt)}</p></div>
            <div className="project-lightbox-controls">
              <button type="button" onClick={() => movePhoto(-1)} aria-label={t("Foto sebelumnya")}>←</button>
              <span aria-live="polite">{selectedPhotoIndex + 1} / {project.gallery.length}</span>
              <button type="button" onClick={() => movePhoto(1)} aria-label={t("Foto berikutnya")}>→</button>
            </div>
          </footer>
        </div>}
      </dialog>
    </>
  );
}
