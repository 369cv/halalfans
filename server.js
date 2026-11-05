import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "licenses.json");

// Ensure licenses database exists
function loadLicenses() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      // Pre-seed with the active Google Reviewer test key
      "FD51-4A22-7751-564F": {
        key: "FD51-4A22-7751-564F",
        email: "reviewer@google.com",
        plan: "reviewer",
        limit: 500,
        used: 6,
        createdAt: new Date().toISOString(),
        active: true
      },
      // Pre-seed with a primary admin key
      "IMG-7788-BAHA-2026": {
        key: "IMG-7788-BAHA-2026",
        email: "baha@bahasavage.com",
        plan: "unlimited",
        limit: 10000,
        used: 0,
        createdAt: new Date().toISOString(),
        active: true
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (_) {
    return {};
  }
}

function saveLicenses(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Issue a new license key in standard XXXX-XXXX-XXXX-XXXX format
export function issueLicense({ email = "user@example.com", plan = "creator", limit = 100 } = {}) {
  const licenses = loadLicenses();
  const rawHex = crypto.randomBytes(8).toString("hex").toUpperCase();
  const key = `${rawHex.slice(0, 4)}-${rawHex.slice(4, 8)}-${rawHex.slice(8, 12)}-${rawHex.slice(12, 16)}`;
  licenses[key] = {
    key,
    email,
    plan,
    limit,
    used: 0,
    createdAt: new Date().toISOString(),
    active: true
  };
  saveLicenses(licenses);
  return licenses[key];
}

// High-fidelity 5-Vector Prompt Synthesis Engine
function generatePromptForModel(model = "krea2", sfw = false, imageMeta = null) {
  const meta = imageMeta || {
    subject: "a candid young subject with authentic micro-expressions, fine skin pores, and natural styling",
    environment: "contemporary architectural setting with atmospheric depth and soft out-of-focus background",
    lighting: "natural cinematic directional key lighting with subtle ambient fill and soft rim highlights",
    camera: "shot on 85mm f/1.4 portrait prime lens, shallow depth of field with organic bokeh",
    style: "authentic 35mm film aesthetic, photorealistic texture, balanced editorial color grading"
  };

  switch (model) {
    case "krea2":
      return `A candid high-fidelity photograph of ${meta.subject}. Setting: ${meta.environment}. Illuminated by ${meta.lighting}. Captured with ${meta.camera}, ${meta.style}, natural skin pores, realistic depth of field, balanced photorealistic color grade.`;

    case "z-image":
      return `realistic creator portrait of ${meta.subject}, ${meta.environment}, ${meta.lighting}, ${meta.camera}, sharp focus, authentic micro-textures${sfw ? " --sfw" : ""}`;

    case "nano-banana":
    case "banana":
      return `vibrant candid lifestyle frame featuring ${meta.subject} in ${meta.environment}. ${meta.lighting}, shot on ${meta.camera}, ${meta.style}, authentic social media aesthetic`;

    case "image2":
    case "gpt2":
      return `A photorealistic medium close-up of ${meta.subject} set against ${meta.environment}. Lighting is ${meta.lighting}. Photographed with ${meta.camera}, displaying ${meta.style} with natural textural details.`;

    default:
      return `A candid high-fidelity photograph of ${meta.subject}. Setting: ${meta.environment}. ${meta.lighting}. Captured with ${meta.camera}, ${meta.style}.`;
  }
}

// Handle JSON responses with CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization"
  });
  res.end(JSON.stringify(data));
}

// Handle Static Files
function sendHtml(res, filename) {
  const filepath = path.join(__dirname, filename);
  if (fs.existsSync(filepath)) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(filepath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization"
    });
    return res.end();
  }

  // 1. GET /api/usage
  if (req.method === "GET" && url.pathname === "/api/usage") {
    const key = req.headers["x-api-key"];
    if (!key) {
      return sendJson(res, 401, { error: "Missing x-api-key header" });
    }
    const licenses = loadLicenses();
    const license = licenses[key];
    if (!license || !license.active) {
      return sendJson(res, 403, { error: "Invalid or inactive license key" });
    }
    return sendJson(res, 200, {
      remaining: Math.max(0, license.limit - license.used),
      limit: license.limit,
      used: license.used,
      plan: license.plan,
      active: license.active
    });
  }

  // 2. POST /api/generate
  if (req.method === "POST" && url.pathname === "/api/generate") {
    const key = req.headers["x-api-key"];
    if (!key) {
      return sendJson(res, 401, { error: "Missing x-api-key header" });
    }
    const licenses = loadLicenses();
    const license = licenses[key];
    if (!license || !license.active) {
      return sendJson(res, 403, { error: "Invalid or inactive license key" });
    }
    if (license.limit - license.used <= 0) {
      return sendJson(res, 429, { error: "Generation quota exceeded. Please upgrade your license." });
    }

    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const model = payload.model || "krea2";
        const sfw = Boolean(payload.sfw);

        // Increment usage
        license.used += 1;
        saveLicenses(licenses);

        const prompt = generatePromptForModel(model, sfw);
        return sendJson(res, 200, {
          prompt,
          remaining: Math.max(0, license.limit - license.used),
          limit: license.limit,
          model,
          sfw
        });
      } catch (err) {
        return sendJson(res, 400, { error: "Invalid JSON payload" });
      }
    });
    return;
  }

  // 3. POST /api/licenses/issue
  if (req.method === "POST" && url.pathname === "/api/licenses/issue") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const newLicense = issueLicense({
          email: payload.email || "customer@example.com",
          plan: payload.plan || "creator",
          limit: payload.limit || 100
        });
        return sendJson(res, 201, { success: true, license: newLicense });
      } catch (_) {
        const newLicense = issueLicense();
        return sendJson(res, 201, { success: true, license: newLicense });
      }
    });
    return;
  }

  // 4. Privacy Policy & Terms
  if (req.method === "GET" && (url.pathname === "/privacy.html" || url.pathname === "/privacy")) {
    return sendHtml(res, "privacy.html");
  }

  if (req.method === "GET" && (url.pathname === "/terms.html" || url.pathname === "/terms")) {
    return sendHtml(res, "terms.html");
  }

  // 5. Landing page & assets
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    return sendHtml(res, "index.html");
  }

  sendJson(res, 404, { error: "Endpoint not found" });
});

// CLI invocation handling
if (process.argv[2] === "issue") {
  const limit = parseInt(process.argv[3] || "100", 10);
  const email = process.argv[4] || "customer@example.com";
  const lic = issueLicense({ email, limit });
  console.log(`Issued License Key: ${lic.key} (${lic.limit} generations) for ${lic.email}`);
  process.exit(0);
}

const isDirectRun = process.argv[1] && (process.argv[1].endsWith("server.js") || process.argv[1] === fileURLToPath(import.meta.url));

if (isDirectRun) {
  server.listen(PORT, () => {
    console.log(`img2prompt License & API Server running at http://localhost:${PORT}`);
    loadLicenses();
  });
}
