import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./styles.css";
import { Footer, Header } from "./components/Layout.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import DocumentationPage from "./pages/DocumentationPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProjectsPortfolioPage from "./pages/ProjectsPortfolioPage.jsx";
import ProjectGalleryPage from "./pages/ProjectGalleryPage.jsx";
import { projectPortfolio } from "./data/projectPortfolio.js";

const projectGalleryPages = Object.fromEntries(projectPortfolio.map(({ slug }) => [`/proyek/${slug}`, ProjectGalleryPage]));
const pages = { "/": HomePage, "/tentang": AboutPage, "/produk": ProductsPage, "/proyek": ProjectsPortfolioPage, "/dokumentasi": DocumentationPage, ...projectGalleryPages };
const HERO_THEME_DURATION_MS = 2400;

function routeFromHash() {
  const path = window.location.hash.slice(1) || "/";
  return pages[path] ? path : "/";
}

function routeUsesOverlayHeader(path) {
  return path === "/" || path === "/produk" || path === "/proyek" || path.startsWith("/proyek/") || path === "/tentang" || path === "/dokumentasi";
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(routeFromHash);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  const [headerSolid, setHeaderSolid] = useState(() => !routeUsesOverlayHeader(routeFromHash()));
  const lenisRef = useRef(null);
  const themeTransitionRef = useRef(null);
  const Page = pages[currentPath];

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    window.clearTimeout(themeTransitionRef.current);
    root.dataset.themeTransition = nextTheme === "dark" ? "to-dark" : "to-light";
    root.dataset.theme = nextTheme;
    setTheme(nextTheme);
    themeTransitionRef.current = window.setTimeout(() => delete root.dataset.themeTransition, HERO_THEME_DURATION_MS);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.add("theme-ready");
    try { localStorage.setItem("jagofarm-theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    let lenis;
    const teardown = () => { if (lenis) { lenis.destroy(); lenis = null; } lenisRef.current = null; };
    const setup = () => {
      teardown();
      if (!desktop.matches) return;
      lenis = new Lenis({ autoRaf: true, duration: 1.8, easing: (time) => 1 - Math.pow(1 - time, 4), wheelMultiplier: 1, smoothWheel: true, syncTouch: false, respectReducedMotion: false, stopInertiaOnNavigate: true });
      lenisRef.current = lenis;
    };
    setup();
    desktop.addEventListener("change", setup);
    return () => { desktop.removeEventListener("change", setup); teardown(); };
  }, []);

  useEffect(() => () => window.clearTimeout(themeTransitionRef.current), []);
  useEffect(() => { const update = () => setCurrentPath(routeFromHash()); window.addEventListener("hashchange", update); return () => window.removeEventListener("hashchange", update); }, []);

  useEffect(() => {
    const hero = document.querySelector(".hero, .product-hero, .team-hero, .documentation-hero, .projects-hero, .project-gallery-hero");
    if (!hero) { setHeaderSolid(true); return; }
    const observer = new IntersectionObserver(([entry]) => setHeaderSolid(entry.intersectionRatio < 0.08), { threshold: [0, 0.08] });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [currentPath]);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    document.querySelector(".mobile-menu")?.removeAttribute("open");
    const elements = [...document.querySelectorAll("main .section:not(.hero):not(.product-hero):not(.projects-hero):not(.project-gallery-hero):not(.page-intro):not(.ecosystem-story), main .value-rail")];
    elements.forEach((element) => element.classList.add("reveal-ready"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.08, rootMargin: "0px 0px -8%" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [currentPath]);

  return <><Header currentPath={currentPath} theme={theme} solid={headerSolid} onToggleTheme={toggleTheme} /><main><Page /></main><Footer /></>;
}
