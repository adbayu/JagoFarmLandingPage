import http from "node:http";
import crypto from "node:crypto";
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
const DATA_DIR = path.join(ROOT_DIR, "src/data");
const SCHEMA_JSON = path.join(DATA_DIR, "_schema.json");

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

const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL || "admin@jagofarm.dev";
const ADMIN_PASSWORD = process.env.CMS_ADMIN_PASSWORD || "jagofarm2026!";
const SESSION_SECRET = process.env.CMS_SESSION_SECRET || "jagofarm-local-session-secret-change-in-prod-2026";
const TOKEN_COOKIE_NAME = "jagofarm_cms_token";
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function createSessionToken(email) {
  const expiresAt = Date.now() + TOKEN_MAX_AGE_MS;
  const payload = `${email}.${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const signature = token.slice(lastDot + 1);
  const payload = token.slice(0, lastDot);
  const secondLastDot = payload.lastIndexOf(".");
  if (secondLastDot === -1) return null;
  const expiresAtStr = payload.slice(secondLastDot + 1);
  const email = payload.slice(0, secondLastDot);

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

  const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

  // Constant time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedHmac);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  return { email, expiresAt };
}

function extractTokenFromRequest(req) {
  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  // 2. Check Cookie: jagofarm_cms_token=<token>
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
      const parts = cookie.trim().split("=");
      if (parts[0] === TOKEN_COOKIE_NAME) {
        return decodeURIComponent(parts.slice(1).join("="));
      }
    }
  }
  return null;
}

async function loadSchema() {
  if (!existsSync(SCHEMA_JSON)) return [];
  try {
    return JSON.parse(await fs.readFile(SCHEMA_JSON, "utf8"));
  } catch {
    return [];
  }
}

async function saveSchema(schema) {
  await fs.writeFile(SCHEMA_JSON, (JSON.stringify(schema, null, 2) + "\n").replace(/\r?\n/g, "\r\n"), "utf8");
}

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

    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      // API: POST /api/auth/login
      if (pathname === "/api/auth/login" && method === "POST") {
        const bodyBuf = await readBody(req);
        let payload;
        try {
          payload = JSON.parse(bodyBuf.toString("utf8"));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        const { email, password } = payload || {};
        const validEmail = email && email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
        const passBuf = Buffer.from(password || "");
        const targetPassBuf = Buffer.from(ADMIN_PASSWORD);
        const validPass = passBuf.length === targetPassBuf.length && crypto.timingSafeEqual(passBuf, targetPassBuf);

        if (!validEmail || !validPass) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid email or password" }));
          return;
        }

        const token = createSessionToken(ADMIN_EMAIL);
        const isSecure = (req.headers["x-forwarded-proto"] === "https");
        const cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isSecure ? "; Secure" : ""}`;
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        });
        res.end(JSON.stringify({ success: true, email: ADMIN_EMAIL, token }));
        return;
      }

      // API: POST /api/auth/logout
      if (pathname === "/api/auth/logout" && method === "POST") {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `${TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        });
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // API: GET /api/auth/me
      if (pathname === "/api/auth/me" && method === "GET") {
        const token = extractTokenFromRequest(req);
        const session = verifySessionToken(token);
        if (!session) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ authenticated: false }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ authenticated: true, email: session.email }));
        return;
      }

      // Protected API Gateway: check session for all other /api/* routes
      if (pathname.startsWith("/api/")) {
        const token = extractTokenFromRequest(req);
        const session = verifySessionToken(token);
        if (!session) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Unauthorized. Please sign in to access the CMS." }));
          return;
        }
      }

      // API: GET /api/collections
      if (pathname === "/api/collections" && method === "GET") {
        const schema = await loadSchema();
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(schema, null, 2));
        return;
      }

      // API: POST /api/collections
      if (pathname === "/api/collections" && method === "POST") {
        const bodyBuf = await readBody(req);
        let payload;
        try {
          payload = JSON.parse(bodyBuf.toString("utf8"));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        const { name, title, fields } = payload || {};
        if (!name || typeof name !== "string" || !KEBAB_CASE_REGEX.test(name)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Collection name must be lowercase kebab-case (e.g. partners, blog-posts)" }));
          return;
        }

        const schema = await loadSchema();
        if (schema.some(c => c.name === name)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Collection "${name}" already exists` }));
          return;
        }

        const newCol = {
          name,
          title: (title && typeof title === "string" ? title.trim() : name),
          system: false,
          fields: Array.isArray(fields) ? fields : []
        };

        const targetFile = path.join(DATA_DIR, `${name}.json`);
        if (!existsSync(targetFile)) {
          await fs.writeFile(targetFile, "[]\n", "utf8");
        }

        schema.push(newCol);
        await saveSchema(schema);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, collection: newCol }));
        return;
      }

      // API: DELETE /api/collections/:name
      const deleteMatch = pathname.match(/^\/api\/collections\/([a-zA-Z0-9_-]+)$/);
      if (deleteMatch && method === "DELETE") {
        const targetName = deleteMatch[1];
        const schema = await loadSchema();
        const existingIdx = schema.findIndex(c => c.name === targetName);

        if (existingIdx === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Collection "${targetName}" not found` }));
          return;
        }

        if (schema[existingIdx].system) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Cannot delete system collection" }));
          return;
        }

        schema.splice(existingIdx, 1);
        await saveSchema(schema);

        const targetFile = path.join(DATA_DIR, `${targetName}.json`);
        if (existsSync(targetFile)) {
          try {
            await fs.unlink(targetFile);
          } catch {}
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // API: GET /api/:collection
      const colRecordMatch = pathname.match(/^\/api\/([a-zA-Z0-9_-]+)$/);
      if (colRecordMatch && colRecordMatch[1] !== "collections" && colRecordMatch[1] !== "upload" && colRecordMatch[1] !== "build") {
        const colName = colRecordMatch[1];
        if (!KEBAB_CASE_REGEX.test(colName)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid collection name" }));
          return;
        }

        const targetFile = path.join(DATA_DIR, `${colName}.json`);

        if (method === "GET") {
          if (!existsSync(targetFile)) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Collection "${colName}" does not exist` }));
            return;
          }
          const data = await fs.readFile(targetFile, "utf8");
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(data);
          return;
        }

        if (method === "PUT") {
          const bodyBuf = await readBody(req);
          let items;
          try {
            items = JSON.parse(bodyBuf.toString("utf8"));
          } catch {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
          }

          if (!Array.isArray(items)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Payload must be an array" }));
            return;
          }

          if (colName === "products") {
            for (const p of items) {
              try {
                validateProduct(p);
              } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err.message }));
                return;
              }
            }
          } else if (colName === "projects") {
            for (const prj of items) {
              try {
                validateProject(prj);
              } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err.message }));
                return;
              }
            }
          } else {
            // Custom collection validation against schema
            const schema = await loadSchema();
            const colDef = schema.find(c => c.name === colName);
            if (colDef && Array.isArray(colDef.fields)) {
              const reqFields = colDef.fields.filter(f => f.required);
              for (const it of items) {
                if (!it || typeof it !== "object") {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ error: "Each item must be an object" }));
                  return;
                }
                for (const rf of reqFields) {
                  const val = it[rf.name];
                  if (val === undefined || val === null || (typeof val === "string" && !val.trim())) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: `Field "${rf.label || rf.name}" is required` }));
                    return;
                  }
                }
              }
            }
          }

          await fs.writeFile(targetFile, JSON.stringify(items, null, 2) + "\n", "utf8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, count: items.length }));
          return;
        }
      }

      // API: POST /api/upload?folder=<collection>&filename=<name>
      if (pathname === "/api/upload" && method === "POST") {
        const folder = parsedUrl.searchParams.get("folder");
        const rawFilename = parsedUrl.searchParams.get("filename") || "image.png";

        if (!folder || !KEBAB_CASE_REGEX.test(folder)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid folder parameter" }));
          return;
        }

        const schema = await loadSchema();
        const validFolder = schema.some(c => c.name === folder) || folder === "products" || folder === "projects";
        if (!validFolder) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Invalid folder "${folder}". Must be a valid collection name.` }));
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

      // API: POST /api/build
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

      // Static assets from public/assets
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

      // Static files for CMS UI from scripts/cms/public
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

// Direct execution
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
