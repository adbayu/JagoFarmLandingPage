import { projectPortfolio } from "./data/projectPortfolio.js";

const routePaths = new Set([
  "/",
  "/tentang",
  "/produk",
  "/proyek",
  ...projectPortfolio.map(({ slug }) => `/proyek/${slug}`),
]);

function normalizedRoutePath(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) return null;
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return routePaths.has(path) ? path : null;
}

function routeFromPathname(pathname) {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const localizedPath = isEnglish ? pathname.slice(3) || "/" : pathname;
  const path = normalizedRoutePath(localizedPath);
  return { path, language: isEnglish ? "en" : "id" };
}

export function parseRoute(pathname) {
  const { path, language } = routeFromPathname(pathname || "/");
  const resolvedPath = path ?? "/";
  return {
    path: resolvedPath,
    language,
    albumSlug: resolvedPath.startsWith("/proyek/") ? resolvedPath.slice("/proyek/".length) : null,
  };
}

export function localizedHref(pathname, language) {
  const path = normalizedRoutePath(pathname) ?? "/";
  const prefix = language === "en" ? "/en" : "";
  return path === "/" ? `${prefix}/` : `${prefix}${path}/`;
}

export function legacyHashToPath(hash) {
  if (typeof hash !== "string" || !hash.startsWith("#/")) return null;
  const { path } = routeFromPathname(hash.slice(1));
  return path ? localizedHref(path, "id") : null;
}
