import { routes } from "../data/content.js";
import { Arrow, Link } from "./navigation.jsx";

export function Header({ currentPath, theme, solid, onToggleTheme }) {
  return (
    <header className={`site-header ${solid ? "is-solid" : "is-overlay"}`}>
      <div className="container nav-shell">
        <Link className="brand" to="/">
          <img src="/jagofarm-mark-transparent.png" alt="" />
          <span>JAGO FARM</span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {routes.map(([path, label]) => (
            <Link
              className={currentPath === path ? "active" : ""}
              key={path}
              to={path}
            >
              {label}
            </Link>
          ))}
        </nav>
        <details className="mobile-menu">
          <summary>Menu</summary>
          <nav aria-label="Navigasi seluler">
            {routes.map(([path, label]) => (
              <Link
                className={currentPath === path ? "active" : ""}
                key={path}
                to={path}
              >
                {label}
              </Link>
            ))}
          </nav>
        </details>
        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <span className="theme-icon theme-icon-light" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
              </svg>
            </span>
            <span className="theme-icon theme-icon-dark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M19.2 15.4A8 8 0 0 1 8.6 4.8 8 8 0 1 0 19.2 15.4Z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-cta">
        <div>
          <span className="meta">Ruang diskusi</span>
          <h2>Ingin memahami arah ekosistem JagoFarm?</h2>
        </div>
        <Link className="footer-action" to="/dokumentasi">
          Lihat Dokumentasi <Arrow />
        </Link>
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-head">
            <img src="/jagofarm-mark-transparent.png" alt="" />
            <strong>JAGO FARM</strong>
          </div>
          <p>
            Eksplorasi ekosistem sirkular untuk meningkatkan produktivitas satu
            lahan.
          </p>
        </div>
        <nav className="footer-links" aria-label="Navigasi footer">
          <span className="meta">Jelajahi</span>
          {routes.map(([path, label]) => (
            <Link key={path} to={path}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="footer-links">
          <span className="meta">Fokus Ekosistem</span>
          <Link to="/produk">Ikan dan budidaya</Link>
          <Link to="/produk">Azolla</Link>
          <Link to="/produk">Tanaman</Link>
          <Link to="/dokumentasi">Dokumentasi lapangan</Link>
        </div>
        <nav className="footer-links" aria-label="Media sosial JagoFarm">
          <span className="meta">Media Sosial</span>
          <a
            href="https://www.facebook.com/JagoFarm"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/jagofarmstartup"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@jagofarmstartup"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
          <a
            href="https://www.youtube.com/@JagoFarm-g6p"
            target="_blank"
            rel="noreferrer"
          >
            YouTube
          </a>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {currentYear} JagoFarm</span>
        <span>Konsep dan dokumentasi awal · 2 September 2026</span>
        <Link to="/">Kembali ke beranda ↑</Link>
      </div>
    </footer>
  );
}
