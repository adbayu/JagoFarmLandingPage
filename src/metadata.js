import { projectPortfolio } from "./data/projectPortfolio.js";
import { localizedHref } from "./routing.js";

export const SITE_ORIGIN = "https://jagofarm.dev";
export const SOCIAL_PREVIEW_IMAGE = `${SITE_ORIGIN}/assets/startup/startup-01.jpg`;

const metadataByPath = {
  "/": {
    title: "JagoFarm | Platform keputusan budidaya berbasis sensor",
    description: "Platform JagoFarm untuk akuaponik, hidroponik, dan budidaya ikan. ESP32 membaca pH, TDS, dan suhu air. Rekomendasi AI sedang diintegrasikan dengan Claude API.",
  },
  "/tentang": {
    title: "Tentang | JagoFarm",
    description: "JagoFarm adalah startup di bawah naungan Kolab Creative Hub. Tim melakukan riset dan pengembangan ekosistem budidaya sirkular serta teknologi pemantauan, dibantu AI.",
  },
  "/produk": {
    title: "Produk | JagoFarm",
    description: "Katalog JagoFarm mencakup ikan, azolla, tanaman, dan platform sensor untuk budidaya.",
  },
  "/proyek": {
    title: "Proyek | JagoFarm",
    description: "Dokumentasi proyek JagoFarm mencakup kolaborasi, program pengabdian kepada masyarakat, teknologi sensor dan IoT, serta eksplorasi ekosistem sirkular.",
  },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "JagoFarm",
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/jagofarm-mark-transparent.png`,
  email: "haykal@jagofarm.dev",
  foundingDate: "2026-06-30",
  sameAs: [
    "https://www.facebook.com/JagoFarm",
    "https://www.instagram.com/jagofarmstartup",
    "https://www.tiktok.com/@jagofarmstartup",
    "https://www.youtube.com/@JagoFarm-g6p",
    "https://www.linkedin.com/company/jagofarm",
  ],
};

export function getOrganizationSchema() {
  return { ...organization, sameAs: [...organization.sameAs] };
}

export function getRouteMetadata(route, t = (text) => text) {
  const { path, language } = route;
  const project = path.startsWith("/proyek/")
    ? projectPortfolio.find(({ slug }) => path === `/proyek/${slug}`)
    : null;
  const titleKey = project
    ? `${project.name} | JagoFarm`
    : metadataByPath[path]?.title ?? metadataByPath["/"].title;
  const descriptionKey = project
    ? project.description
    : metadataByPath[path]?.description ?? metadataByPath["/"].description;
  const idUrl = `${SITE_ORIGIN}${localizedHref(path, "id")}`;
  const englishUrl = `${SITE_ORIGIN}${localizedHref(path, "en")}`;

  return {
    language,
    title: t(titleKey),
    description: t(descriptionKey),
    canonical: `${SITE_ORIGIN}${localizedHref(path, language)}`,
    alternates: { id: idUrl, en: englishUrl, "x-default": idUrl },
    ogLocale: language === "en" ? "en_US" : "id_ID",
    ogImage: SOCIAL_PREVIEW_IMAGE,
    organization: path === "/" ? getOrganizationSchema() : null,
  };
}

export function renderMetadataHead(metadata) {
  const escapeAttribute = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const meta = (attribute, key, value) => `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(value)}" />`;
  const alternates = Object.entries(metadata.alternates)
    .map(([language, href]) => `<link rel="alternate" hreflang="${language}" href="${escapeAttribute(href)}" data-jagofarm-alternate="true" />`)
    .join("\n    ");
  const schema = metadata.organization
    ? `<script type="application/ld+json" data-jagofarm-schema="true">${JSON.stringify(metadata.organization).replaceAll("<", "\\u003c")}</script>`
    : "";

  return [
    `<title>${escapeAttribute(metadata.title)}</title>`,
    meta("name", "description", metadata.description),
    `<link rel="canonical" href="${escapeAttribute(metadata.canonical)}" />`,
    alternates,
    meta("property", "og:title", metadata.title),
    meta("property", "og:description", metadata.description),
    meta("property", "og:type", "website"),
    meta("property", "og:url", metadata.canonical),
    meta("property", "og:locale", metadata.ogLocale),
    meta("property", "og:image", metadata.ogImage),
    meta("name", "twitter:card", "summary_large_image"),
    schema,
  ].filter(Boolean).join("\n    ");
}

export function applyRouteMetadata(route, t) {
  const metadata = getRouteMetadata(route, t);
  document.documentElement.lang = metadata.language;
  document.title = metadata.title;

  const upsertMeta = (selector, attribute, key, value) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.append(element);
    }
    element.content = value;
  };

  upsertMeta('meta[name="description"]', "name", "description", metadata.description);
  upsertMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
  upsertMeta('meta[property="og:description"]', "property", "og:description", metadata.description);
  upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
  upsertMeta('meta[property="og:url"]', "property", "og:url", metadata.canonical);
  upsertMeta('meta[property="og:locale"]', "property", "og:locale", metadata.ogLocale);
  upsertMeta('meta[property="og:image"]', "property", "og:image", metadata.ogImage);
  upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = metadata.canonical;

  document.head.querySelectorAll('link[data-jagofarm-alternate="true"]').forEach((link) => link.remove());
  for (const [language, href] of Object.entries(metadata.alternates)) {
    const alternate = document.createElement("link");
    alternate.rel = "alternate";
    alternate.hreflang = language;
    alternate.href = href;
    alternate.dataset.jagofarmAlternate = "true";
    document.head.append(alternate);
  }

  document.head.querySelector('script[data-jagofarm-schema="true"]')?.remove();
  if (metadata.organization) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.dataset.jagofarmSchema = "true";
    schema.textContent = JSON.stringify(metadata.organization);
    document.head.append(schema);
  }
}
