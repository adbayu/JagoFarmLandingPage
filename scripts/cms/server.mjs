import http from "node:http";
import fs from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { validateProduct, validateProject } from "../../src/data/cmsValidation.js";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../../");
const PUBLIC_CMS_DIR = path.join(__dirname, "public");
const PUBLIC_ASSETS_DIR = path.join(ROOT_DIR, "public");
const PRODUCTS_JSON = path.join(ROOT_DIR, "src/data/products.json");
const PROJECTS_JSON = path.join(ROOT_DIR, "src/data/projects.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function createCmsServer() {
  return http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, "http://" + (req.headers.host || "localhost"));
    const pathname = parsedUrl.pathname;
    const method = req.method;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (pathname === "/api/products" && method === "GET") {
        const data = await fs.readFile(PRODUCTS_JSON, "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(data);
        return;
      }

      if (pathname === "/api/products" && method === "PUT") {
        const bodyBuf = await readBody(req);
        let products;
        try {
          products = JSON.parse(bodyBuf.toString("utf8"));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        if (!Array.isArray(products)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Products payload must be an array" }));
          return;
        }

        for (const p of products) {
          try {
            validateProduct(p);
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        await fs.writeFile(PRODUCTS_JSON, JSON.stringify(products, null, 2) + "\n", "utf8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, count: products.length }));
        return;
      }

      if (pathname === "/api/projects" && method === "GET") {
        const data = await fs.readFile(PROJECTS_JSON, "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(data);
        return;
      }

      if (pathname === "/api/projects" && method === "PUT") {
        const bodyBuf = await readBody(req);
        let projects;
        try {
          projects = JSON.parse(bodyBuf.toString("utf8"));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        if (!Array.isArray(projects)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Projects payload must be an array" }));
          return;
        }

        for (const prj of projects) {
          try {
            validateProject(prj);
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        await fs.writeFile(PROJECTS_JSON, JSON.stringify(projects, null, 2) + "\n", "utf8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, count: projects.length }));
        return;
      }

      if (pathname === "/api/upload" && method === "POST") {
        const folder = parsedUrl.searchParams.get("folder");
        const rawFilename = parsedUrl.searchParams.get("filename") || "image.png";

        if (folder !== "products" && folder !== "projects") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid folder. Must be products or projects" }));
          return;
        }

        const baseFilename = path.basename(rawFilename);
        const ext = path.extname(baseFilename).toLowerCase();
        const cleanName = path.basename(baseFilename, ext).replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
        const safeFilename = Date.now() + "-" + cleanName + ext;

        const targetDir = path.join(PUBLIC_ASSETS_DIR, "assets", folder);
        await fs.mkdir(targetDir, { recursive: true });
        const targetPath = path.join(targetDir, safeFilename);

        const bodyBuf = await readBody(req);
        await fs.writeFile(targetPath, bodyBuf);

        const relativeUrl = "/assets/" + folder + "/" + safeFilename;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ url: relativeUrl, filename: safeFilename }));
        return;
      }

      if (pathname === "/api/build" && method === "POST") {
        try {
          const { stdout, stderr } = await execAsync("npm run build", { cwd: ROOT_DIR });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, output: (stdout + "\n" + stderr).trim() }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, output: err.stdout ? (err.stdout + "\n" + err.stderr).trim() : err.message }));
        }
        return;
      }

      if (pathname.startsWith("/assets/")) {
        const assetFilePath = path.join(PUBLIC_ASSETS_DIR, pathname);
        const normalized = path.normalize(assetFilePath);
        if (normalized.startsWith(PUBLIC_ASSETS_DIR) && existsSync(normalized)) {
          const stat = await fs.stat(normalized);
          if (stat.isFile()) {
            const ext = path.extname(normalized).toLowerCase();
            res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
            createReadStream(normalized).pipe(res);
            return;
          }
        }
      }

      let relativeFile = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
      let filePath = path.join(PUBLIC_CMS_DIR, relativeFile);
      let normalized = path.normalize(filePath);

      if (normalized.startsWith(PUBLIC_CMS_DIR) && existsSync(normalized)) {
        const stat = await fs.stat(normalized);
        if (stat.isFile()) {
          const ext = path.extname(normalized).toLowerCase();
          res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
          createReadStream(normalized).pipe(res);
          return;
        }
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  let port = 3333;
  const testPortIdx = process.argv.indexOf("--test-port");
  const portIdx = process.argv.indexOf("--port");
  if (testPortIdx !== -1 && process.argv[testPortIdx + 1]) {
    port = parseInt(process.argv[testPortIdx + 1], 10);
  } else if (portIdx !== -1 && process.argv[portIdx + 1]) {
    port = parseInt(process.argv[portIdx + 1], 10);
  } else if (process.env.CMS_PORT) {
    port = parseInt(process.env.CMS_PORT, 10);
  }

  const server = createCmsServer();
  server.listen(port, () => {
    console.log("JagoFarm CMS server running at http://localhost:" + port);
  });
}
