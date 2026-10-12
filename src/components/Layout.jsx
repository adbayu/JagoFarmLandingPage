import { useEffect, useRef } from "react";
import { routes } from "../data/content.js";
import { useLanguage } from "../i18n.jsx";
import { Arrow, Link } from "./navigation.jsx";

export function Header({ currentPath, theme, solid, onToggleTheme, onToggleLanguage }) {
  const { language, t } = useLanguage();
  const menuRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      const menu = menuRef.current;
      if (!menu?.open) return;
      if (event.type === "keydown") {
        if (event.key !== "Escape") return;
        menu.open = false;
        menu.querySelector("summary").focus();
      } else if (!menu.contains(event.target)) menu.open = false;
    }
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeMenu);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeMenu);
    };
  }, []);

  return (
    <header className={`site-header ${solid ? "is-solid" : "is-overlay"}`}>
      <div className="container nav-shell">
        <Link className="brand" to="/" aria-label={`JagoFarm · ${t("Beranda")}`}>
          <img src="/jagofarm-mark-transparent.png" alt="" />
          <span>JAGO FARM</span>
        </Link>
        <nav className="desktop-nav" aria-label={t("Navigasi utama")}>
          {routes.map(([path, label]) => (
            <Link
              className={currentPath === path || (path === "/proyek" && currentPath.startsWith("/proyek/")) ? "active" : ""}
              key={path}
              to={path}
            >
              {t(label)}
            </Link>
          ))}
        </nav>
        <details className="mobile-menu" ref={menuRef}>
          <summary>
            <span className="sr-only">{t("Menu")}</span>
            <svg className="mobile-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg>
          </summary>
          <nav aria-label={t("Navigasi seluler")}>
            {routes.map(([path, label]) => (
              <Link
                className={currentPath === path || (path === "/proyek" && currentPath.startsWith("/proyek/")) ? "active" : ""}
                key={path}
                to={path}
                onClick={() => { menuRef.current.open = false; }}
                aria-current={currentPath === path || (path === "/proyek" && currentPath.startsWith("/proyek/")) ? "page" : undefined}
              >
                {t(label)}
              </Link>
            ))}
          </nav>
        </details>
        <div className="header-actions">
          <button
            className="language-toggle"
            type="button"
            onClick={onToggleLanguage}
            aria-label={t(language === "id" ? "Ganti bahasa ke Inggris" : "Ganti bahasa ke Bahasa Indonesia")}
            title={t(language === "id" ? "Ganti bahasa ke Inggris" : "Ganti bahasa ke Bahasa Indonesia")}
            aria-pressed={language === "en"}
          >
            {language === "id" ? "EN" : "ID"}
          </button>
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={t(theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap")}
            title={t(theme === "dark" ? "Mode terang" : "Mode gelap")}
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
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="container footer-cta">
        <div>
          <span className="meta">{t("Ruang diskusi")}</span>
          <h2>{t("Ingin membahas platform atau kegiatan lapangan JagoFarm?")}</h2>
        </div>
        <a className="footer-action" href="https://www.instagram.com/jagofarmstartup" target="_blank" rel="noreferrer">
          {t("Diskusi lewat Instagram")} <Arrow />
        </a>
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-head">
            <img src="/jagofarm-mark-transparent.png" alt="" />
            <strong>JAGO FARM</strong>
          </div>
          <p>
            {t("Platform keputusan budidaya dan riset ekosistem sirkular JagoFarm.")}
          </p>
        </div>
        <nav className="footer-links" aria-label={t("Navigasi footer")}>
          <span className="meta">{t("Jelajahi")}</span>
          {routes.map(([path, label]) => (
            <Link key={path} to={path}>
              {t(label)}
            </Link>
          ))}
        </nav>
        <div className="footer-links">
          <span className="meta">{t("Fokus Ekosistem")}</span>
          <Link to="/produk">{t("Ikan dan budidaya")}</Link>
          <Link to="/produk">Azolla</Link>
          <Link to="/produk">{t("Tanaman")}</Link>
        </div>
        <nav className="footer-links" aria-label={t("Media sosial JagoFarm")}>
          <span className="meta">{t("Media Sosial")}</span>
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
        <span>{t("Prototype dalam pengembangan · Diperbarui 12 Oktober 2026")}</span>
        <Link to="/">{t("Kembali ke beranda ↑")}</Link>
      </div>
    </footer>
  );
}
