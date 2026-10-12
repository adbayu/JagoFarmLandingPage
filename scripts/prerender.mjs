import { createServer } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projectPortfolio } from "../src/data/projectPortfolio.js";
import { localizedHref, parseRoute } from "../src/routing.js";
import { getRouteMetadata, renderMetadataHead } from "../src/metadata.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(projectRoot, "dist");
const routePaths = [
  "/",
  "/tentang",
  "/produk",
  "/proyek",
  ...projectPortfolio.map(({ slug }) => `/proyek/${slug}`),
];

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function notFoundDocument(translate) {
  const messages = {
    title: { id: translate("Halaman tidak ditemukan", "id"), en: translate("Halaman tidak ditemukan", "en") },
    description: { id: translate("Halaman yang Anda cari tidak tersedia.", "id"), en: translate("Halaman yang Anda cari tidak tersedia.", "en") },
    home: { id: translate("Kembali ke beranda", "id"), en: translate("Kembali ke beranda", "en") },
  };
  const initialText = (key) => messages[key].id;

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>${initialText("title")} | JagoFarm</title>
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f4ed;color:#18392d;font:16px/1.6 Manrope,Arial,sans-serif}main{max-width:36rem;padding:3rem}h1{font-size:clamp(2rem,6vw,4rem);line-height:1.05}a{color:inherit;text-underline-offset:.25em}</style>
</head>
<body>
  <main>
    <h1 data-message="title">${initialText("title")}</h1>
    <p data-message="description">${initialText("description")}</p>
    <a id="home-link" href="/" data-message="home">${initialText("home")}</a>
  </main>
  <script>
    const translations = ${safeJson(messages)};
    const language = location.pathname === "/en" || location.pathname.startsWith("/en/") ? "en" : "id";
    document.documentElement.lang = language;
    document.querySelectorAll("[data-message]").forEach((element) => { element.textContent = translations[element.dataset.message][language]; });
    document.getElementById("home-link").href = language === "en" ? "/en/" : "/";
    document.title = translations.title[language] + " | JagoFarm";
  </script>
</body>
</html>`;
}

const manifest = JSON.parse(await readFile(path.join(distDirectory, ".vite", "manifest.json"), "utf8"));
const heroLight = manifest["assets/herosection/hero_section_light.webp"]?.file;
const heroDark = manifest["assets/herosection/hero_section_dark.webp"]?.file;
if (!heroLight || !heroDark) throw new Error("Vite manifest is missing the imported hero images.");

const vite = await createServer({
  root: projectRoot,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [{ render }, { translate }] = await Promise.all([
    vite.ssrLoadModule("/src/entry-server.jsx"),
    vite.ssrLoadModule("/src/i18n.jsx"),
  ]);
  const shell = await readFile(path.join(distDirectory, "index.html"), "utf8");
  if (!shell.includes("<!-- jagofarm:metadata -->") || !shell.includes('<div id="root"></div>')) {
    throw new Error("Vite HTML shell is missing the prerender metadata or root markers.");
  }

  const generatedPaths = [];
  for (const language of ["id", "en"]) {
    for (const basePath of routePaths) {
      const pathname = localizedHref(basePath, language);
      const route = parseRoute(pathname);
      const markup = render(pathname)
        .replaceAll("/assets/herosection/hero_section_light.webp", `/${heroLight}`)
        .replaceAll("/assets/herosection/hero_section_dark.webp", `/${heroDark}`);
      const metadata = getRouteMetadata(route, (text) => translate(text, language));
      const document = shell
        .replace("<html lang=\"id\">", `<html lang="${language}">`)
        .replace(/<title>JagoFarm<\/title>\s*(?=<!-- jagofarm:metadata -->)/, "")
        .replace("<!-- jagofarm:metadata -->", renderMetadataHead(metadata))
        .replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
      const relativePath = pathname === "/" ? "index.html" : `${pathname.slice(1)}index.html`;
      const outputPath = path.join(distDirectory, relativePath);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, document, "utf8");
      generatedPaths.push(pathname);
    }
  }

  const expectedCount = routePaths.length * 2;
  if (generatedPaths.length !== expectedCount || new Set(generatedPaths).size !== expectedCount) {
    throw new Error(`Expected ${expectedCount} unique localized route documents, generated ${generatedPaths.length}.`);
  }
  await writeFile(path.join(distDirectory, "404.html"), notFoundDocument(translate), "utf8");
  console.log(`Prerendered ${generatedPaths.length} route documents and dist/404.html.`);
} finally {
  await vite.close();
}
