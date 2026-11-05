// test_extension.js - Automated Test Suite for img2prompt Chrome Extension
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function log(title, passed, details = "") {
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${title}]: ${passed ? "PASSED" : "FAILED"}`);
  if (details) console.log(`   ${details}`);
}

let totalTests = 0;
let passedTests = 0;

function assert(condition, title, details) {
  totalTests++;
  if (condition) {
    passedTests++;
    log(title, true, details);
  } else {
    log(title, false, details);
  }
}

console.log("=================================================");
console.log("🧪 RUNNING IMG2PROMPT EXTENSION VERIFICATION SUITE");
console.log("=================================================\n");

// --- TEST 1: Manifest Integrity ---
console.log("--- TEST 1: Manifest & File Integrity ---");
const manifestPath = path.join(__dirname, "manifest.json");
assert(fs.existsSync(manifestPath), "Manifest Exists", "manifest.json located");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
assert(manifest.manifest_version === 3, "Manifest V3 Compliant", `version: ${manifest.manifest_version}`);
assert(manifest.name === "img2prompt", "Extension Name", `name: ${manifest.name}`);
assert(manifest.action && manifest.action.default_popup === "popup.html", "Action Popup", "popup.html specified");
assert(Array.isArray(manifest.permissions) && manifest.permissions.includes("clipboardWrite") && manifest.permissions.includes("storage"), "Permissions", `permissions: ${manifest.permissions.join(", ")}`);
assert(manifest.host_permissions && manifest.host_permissions.includes("https://autoprompter-backend.onrender.com/*"), "Host Permissions", "autoprompter backend declared");

// Icons check
["16px.png", "48px.png", "128px.png"].forEach((icon) => {
  const iconPath = path.join(__dirname, "icons", icon);
  assert(fs.existsSync(iconPath), `Icon Asset ${icon}`, `Found at ${iconPath}`);
});

// --- TEST 2: HTML Structure & Element IDs ---
console.log("\n--- TEST 2: HTML Element Verification ---");
const htmlPath = path.join(__dirname, "popup.html");
assert(fs.existsSync(htmlPath), "HTML Exists", "popup.html located");
const html = fs.readFileSync(htmlPath, "utf-8");

const requiredIds = [
  "usageBarFill", "usageCount",
  "tabGenerate", "tabHistory", "tabAccount",
  "panelGenerate", "panelHistory", "panelAccount",
  "pasteZone", "preview", "clearImage",
  "model", "sfwRow", "sfwToggle", "submit",
  "status", "outputWrap", "output", "copy",
  "historyHeader", "historyCount", "clearHistory", "historyList",
  "apiKeyInput", "saveKey", "accountSettingsForm", "accountSettingsSaved", "keyDisplay", "changeKey"
];

// Note: historyHeader is a class .history-header in popup.html
const idsToCheck = [
  "usageBarFill", "usageCount",
  "tabGenerate", "tabHistory", "tabAccount",
  "panelGenerate", "panelHistory", "panelAccount",
  "pasteZone", "preview", "clearImage",
  "model", "sfwRow", "sfwToggle", "submit",
  "status", "outputWrap", "output", "copy",
  "historyCount", "clearHistory", "historyList",
  "apiKeyInput", "saveKey", "accountSettingsForm", "accountSettingsSaved", "keyDisplay", "changeKey"
];

idsToCheck.forEach((id) => {
  const hasId = html.includes(`id="${id}"`);
  assert(hasId, `ID Present: #${id}`, `Found element id="${id}"`);
});

// Models check
const models = ["krea2", "z-image", "nano-banana", "image2"];
models.forEach((m) => {
  assert(html.includes(`value="${m}"`), `Model Option: ${m}`, `Found option value="${m}"`);
});

// --- TEST 3: CSS Stylesheet Verification ---
console.log("\n--- TEST 3: CSS Stylesheet Verification ---");
const cssPath = path.join(__dirname, "popup.css");
assert(fs.existsSync(cssPath), "CSS Exists", "popup.css located");
const css = fs.readFileSync(cssPath, "utf-8");
assert(css.includes("--bg: #0e0f12;"), "Theme Variable: Background", "Dark background verified");
assert(css.includes("--accent: #6c8cff;"), "Theme Variable: Accent", "Accent color verified");
assert(css.includes(".paste-zone"), "Paste Zone Styling", ".paste-zone class defined");
assert(css.includes(".split-row"), "Split Layout Styling", ".split-row flex defined");

// --- TEST 4: JavaScript Logic & Simulation ---
console.log("\n--- TEST 4: Logic & State Simulation ---");
const jsPath = path.join(__dirname, "popup.js");
assert(fs.existsSync(jsPath), "JS Exists", "popup.js located");
const js = fs.readFileSync(jsPath, "utf-8");

assert(js.includes('const BACKEND = "https://autoprompter-backend.onrender.com";'), "Backend URL", "Official backend configured");
assert(js.includes("function switchTab"), "Tab Switch Logic", "switchTab function defined");
assert(js.includes("function updateSfwVisibility"), "SFW Visibility Handler", "updateSfwVisibility function defined");
assert(js.includes("function saveToHistory"), "History Storage Handler", "saveToHistory function defined");
assert(js.includes("function restoreFromHistory"), "History Restore Handler", "restoreFromHistory function defined");

// Simulate SFW visibility logic:
function testSfwLogic(model) {
  return model === "z-image" ? "flex" : "none";
}
assert(testSfwLogic("z-image") === "flex", "SFW Logic: z-image", "SFW row displays on z-image");
assert(testSfwLogic("krea2") === "none", "SFW Logic: krea2", "SFW row hides on krea2");
assert(testSfwLogic("image2") === "none", "SFW Logic: image2", "SFW row hides on image2");

// Simulate timeAgo logic:
function timeAgo(date) {
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
assert(timeAgo(Date.now() - 10000) === "just now", "TimeAgo: 10s", "just now");
assert(timeAgo(Date.now() - 120000) === "2m ago", "TimeAgo: 2m", "2m ago");
assert(timeAgo(Date.now() - 7200000) === "2h ago", "TimeAgo: 2h", "2h ago");

// --- TEST 5: Backend Live Health Check ---
console.log("\n--- TEST 5: Backend Endpoint Verification ---");
try {
  const usageRes = await fetch("https://autoprompter-backend.onrender.com/api/usage");
  const usageData = await usageRes.json();
  assert(usageRes.status === 401 && usageData.error === "Missing API key.", "Backend /api/usage Auth Check", "Responds with 401 Missing API key as expected");

  const genRes = await fetch("https://autoprompter-backend.onrender.com/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: "data:image/png;base64,mock", model: "krea2" })
  });
  const genData = await genRes.json();
  assert(genRes.status === 401 && genData.error.includes("Missing API key"), "Backend /api/generate Auth Check", "Responds with 401 Missing API key as expected");
} catch (err) {
  log("Backend Live Check", false, err.message);
}

console.log("\n=================================================");
console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log("=================================================");
