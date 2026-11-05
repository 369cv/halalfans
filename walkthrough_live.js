// walkthrough_live.js - Visible live browser automation walking through img2prompt
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extPath = path.resolve(__dirname);

console.log("Launching visible Google Chrome with img2prompt loaded...");

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  defaultViewport: null,
  args: [
    `--disable-extensions-except=${extPath}`,
    `--load-extension=${extPath}`,
    "--no-sandbox",
    "--window-size=1200,850",
    "--window-position=80,80"
  ]
});

// Step 1: Open chrome://extensions to show the extension is loaded
const pages = await browser.pages();
const pageExtensions = pages[0] || (await browser.newPage());

try {
  await pageExtensions.goto("chrome://extensions", { waitUntil: "networkidle0" });
  console.log("Opened chrome://extensions in visible browser window.");
} catch (_) {}

await new Promise(r => setTimeout(r, 2000));

// Step 2: Open the extension popup in a new tab so user can test it interactively
const pagePopup = await browser.newPage();
await pagePopup.goto(`file://${path.join(extPath, "popup.html")}`, { waitUntil: "networkidle0" });
console.log("Opened extension popup interface.");

// Setup mock chrome API for testing in tab context
await pagePopup.evaluate(() => {
  if (!window.chrome) window.chrome = {};
  if (!window.chrome.storage) {
    window.chrome.storage = {
      local: {
        get: (keys, cb) => cb({ apiKey: "FD51-4A22-7751-564F", history: [] }),
        set: (obj, cb) => { if (cb) cb(); },
        remove: (k, cb) => { if (cb) cb(); }
      },
      session: {
        get: (k, cb) => cb({}),
        set: (o, cb) => { if (cb) cb(); },
        remove: (k, cb) => { if (cb) cb(); }
      }
    };
  }
});

// Re-init popup.js in tab
const popupJs = fs.readFileSync(path.join(extPath, "popup.js"), "utf-8");
await pagePopup.addScriptTag({ content: popupJs });

console.log("Live walk-through ready in visible Chrome window!");
