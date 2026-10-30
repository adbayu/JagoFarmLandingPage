import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./styles.css";
import { Footer, Header } from "./components/Layout.jsx";
import { LanguageProvider, translate } from "./i18n.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProjectsPortfolioPage from "./pages/ProjectsPortfolioPage.jsx";
import ProjectGalleryPage from "./pages/ProjectGalleryPage.jsx";
import { projectPortfolio } from "./data/projectPortfolio.js";
import { localizedHref, parseRoute } from "./routing.js";
import { applyRouteMetadata } from "./metadata.js";

const projectGalleryPages = Object.fromEntries(projectPortfolio.map(({ slug }) => [`/proyek/${slug}`, ProjectGalleryPage]));
const pages = { "/": HomePage, "/tentang": AboutPage, "/produk": ProductsPage, "/proyek": ProjectsPortfolioPage, ...projectGalleryPages };
const HERO_THEME_DURATION_MS = 2400;

function routeUsesOverlayHeader(path) {
  return path === "/" || path === "/produk" || path === "/proyek" || path.startsWith("/proyek/") || path === "/tentang";
}

export default function App({ initialPath = "/" } = {}) {
  const [route, setRoute] = useState(() => parseRoute(typeof window === "undefined" ? initialPath : window.location.pathname));
  const [theme, setTheme] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  const { path: currentPath, language, albumSlug } = route;
  const [headerSolid, setHeaderSolid] = useState(() => !routeUsesOverlayHeader(parseRoute(typeof window === "undefined" ? initialPath : window.location.pathname).path));
  const lenisRef = useRef(null);
  const themeTransitionRef = useRef(null);
  const Page = pages[currentPath] ?? HomePage;

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    window.clearTimeout(themeTransitionRef.current);
    root.dataset.themeTransition = nextTheme === "dark" ? "to-dark" : "to-light";
    root.dataset.theme = nextTheme;
    setTheme(nextTheme);
    themeTransitionRef.current = window.setTimeout(() => delete root.dataset.themeTransition, HERO_THEME_DURATION_MS);
  }

  function toggleLanguage() {
    const nextLanguage = language === "id" ? "en" : "id";
    window.history.pushState(null, "", localizedHref(currentPath, nextLanguage));
    window.dispatchEvent(new Event("jagofarm:navigate"));
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.add("theme-ready");
    try { localStorage.setItem("jagofarm-theme", theme); } catch {}
  }, [theme]);

  useEffect(() => applyRouteMetadata(route, (text) => translate(text, language)), [currentPath, language]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    let lenis;
    const teardown = () => { if (lenis) { lenis.destroy(); lenis = null; } lenisRef.current = null; };
    const setup = () => {
      teardown();
      if (!desktop.matches) return;
      lenis = new Lenis({ autoRaf: true, duration: 0.7, easing: (time) => 1 - Math.pow(1 - time, 3), wheelMultiplier: 1, smoothWheel: true, syncTouch: false, respectReducedMotion: false, stopInertiaOnNavigate: true });
      lenisRef.current = lenis;
    };
    setup();
    desktop.addEventListener("change", setup);
    return () => { desktop.removeEventListener("change", setup); teardown(); };
  }, []);

  useEffect(() => () => window.clearTimeout(themeTransitionRef.current), []);
  useEffect(() => {
    const update = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", update);
    window.addEventListener("jagofarm:navigate", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("jagofarm:navigate", update);
    };
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".hero, .product-hero, .team-hero, .documentation-hero, .projects-hero, .project-gallery-hero");
    if (!hero) { setHeaderSolid(true); return; }
    const observer = new IntersectionObserver(([entry]) => setHeaderSolid(entry.intersectionRatio < 0.08), { threshold: [0, 0.08] });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [route]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    document.querySelector(".mobile-menu")?.removeAttribute("open");
    const elements = [...document.querySelectorAll("main .section:not(.hero):not(.product-hero):not(.projects-hero):not(.project-gallery-hero):not(.page-intro):not(.ecosystem-story), main .value-rail")];
    elements.forEach((element) => element.classList.add("reveal-ready"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.02, rootMargin: "50px 0px 50px 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [route]);

  return (
    <LanguageProvider language={language}>
      <Header currentPath={currentPath} theme={theme} solid={headerSolid} onToggleTheme={toggleTheme} onToggleLanguage={toggleLanguage} />
      <main><Page albumSlug={albumSlug} /></main>
      <Footer />
    </LanguageProvider>
  );
}
