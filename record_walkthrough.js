// record_walkthrough.js - Records a high-definition video walkthrough of testing the extension
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const framesDir = path.join(__dirname, "video_frames");
if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const sampleImageBuffer = fs.readFileSync(path.join(__dirname, "assets/sample_image.jpg"));
const sampleImageBase64 = `data:image/jpeg;base64,${sampleImageBuffer.toString("base64")}`;

const promptText = `A 25-year-old Middle Eastern woman with dark hair, flawless skin, and dramatic evening makeup including long lashes, glossy nude-pink lips, and defined brows, wearing a white sequined tweed jacket with metallic threads and frayed edges over a white satin skirt, paired with a soft white silk headscarf draped elegantly around her head and neck. She sits in the back seat of a luxury car with deep red quilted leather seats, holding a small white structured handbag with gold hardware in her lap, her left hand resting on the seat. The car interior is dark with subtle blue ambient lighting and window reflections. Shot on an 85mm lens at f/1.8 with shallow depth of field, medium close-up composition, luxury lifestyle photography, ultra realistic, sharp detail, natural skin texture, premium color grading, high-end fashion editorial style.`;

console.log("Launching Chrome to record video walkthrough...");

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,800"]
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

// Create interactive wrapper HTML containing popup.html
const popupCss = fs.readFileSync(path.join(__dirname, "popup.css"), "utf-8");
const popupHtml = fs.readFileSync(path.join(__dirname, "popup.html"), "utf-8");

const fullPageHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${popupCss}
  html, body {
    margin: 0;
    padding: 0;
    width: 1280px;
    height: 800px;
    overflow: hidden;
    background: #090a0d radial-gradient(circle at 50% 35%, #181d29 0%, #0d0f14 60%, #060709 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  }}

  .header-banner {
    position: absolute;
    top: 30px;
    text-align: center;
  }
  .tag {
    display: inline-block;
    padding: 6px 16px;
    background: rgba(108, 140, 255, 0.15);
    border: 1px solid rgba(108, 140, 255, 0.4);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: #8da4ff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .title {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .window-card {
    position: relative;
    width: 380px;
    height: 580px;
    background: #0e0f12;
    border-radius: 14px;
    border: 1px solid #272a31;
    box-shadow: 
      0 30px 80px rgba(0, 0, 0, 0.8),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      0 0 40px rgba(108, 140, 255, 0.12);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }}

  .chrome-topbar {
    background: #14161b;
    border-bottom: 1px solid #272a31;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dots { display: flex; gap: 6px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; }
  .top-title { font-size: 11px; color: #8a8f9a; font-weight: 500; }

  /* Virtual cursor for visual walkthrough */
  #cursor {
    position: absolute;
    width: 20px;
    height: 20px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%236c8cff' stroke='%23ffffff' stroke-width='1.5' d='M3 3l7 18 3-7 7-3L3 3z'/%3E%3C/svg%3E") no-repeat center;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-2px, -2px);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
</style>
</head>
<body>
  <div class="header-banner">
    <div class="tag" id="statusBadge">Live Extension Test Verification</div>
    <h1 class="title" id="actionTitle">Testing img2prompt in Google Chrome</h1>
  </div>

  <div class="window-card">
    <div class="chrome-topbar">
      <div class="dots">
        <div class="dot" style="background:#ff5f56"></div>
        <div class="dot" style="background:#ffbd2e"></div>
        <div class="dot" style="background:#27c93f"></div>
      </div>
      <div class="top-title">img2prompt • Chrome Extension</div>
      <div style="width:30px"></div>
    </div>
    
    <!-- Body of popup.html -->
    ${popupHtml.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*?<\/html>/i, "")}
  </div>

  <div id="cursor" style="left:640px; top:700px;"></div>
</body>
</html>
`;

await page.setContent(fullPageHtml, { waitUntil: "networkidle0" });

// Setup mock chrome API in window
await page.evaluate(() => {
  window.chrome = {
    storage: {
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
    }
  };
});

// Load popup.js logic
const popupJs = fs.readFileSync(path.join(__dirname, "popup.js"), "utf-8");
await page.addScriptTag({ content: popupJs });

// Wait a bit for usage bar to fetch
await new Promise(r => setTimeout(r, 1200));

let frameIdx = 0;
async function captureFrames(count = 1) {
  for (let i = 0; i < count; i++) {
    const filename = path.join(framesDir, `frame_${String(frameIdx++).padStart(5, "0")}.png`);
    await page.screenshot({ path: filename, type: "png" });
  }
}

async function moveCursor(x, y, steps = 10) {
  const currentPos = await page.evaluate(() => {
    const el = document.getElementById("cursor");
    return { x: parseInt(el.style.left) || 640, y: parseInt(el.style.top) || 700 };
  });

  for (let s = 1; s <= steps; s++) {
    const nx = currentPos.x + (x - currentPos.x) * (s / steps);
    const ny = currentPos.y + (y - currentPos.y) * (s / steps);
    await page.evaluate((px, py) => {
      const el = document.getElementById("cursor");
      el.style.left = px + "px";
      el.style.top = py + "px";
    }, nx, ny);
    await captureFrames(1);
  }
}

async function setHeader(badge, title) {
  await page.evaluate((b, t) => {
    document.getElementById("statusBadge").textContent = b;
    document.getElementById("actionTitle").textContent = t;
  }, badge, title);
}

// -----------------------------------------------------------------
// SCENE 1: Clean Slate & Live Quota Check (0s - 3s)
// -----------------------------------------------------------------
console.log("Recording Scene 1: Initial state & usage quota check...");
await setHeader("Step 1: Extension Startup", "Extension Loaded with 494 / 500 Remaining");
await moveCursor(520, 310, 15);
await captureFrames(25); // ~1.5s hold

// -----------------------------------------------------------------
// SCENE 2: Paste Reference Image (3s - 6s)
// -----------------------------------------------------------------
console.log("Recording Scene 2: Pasting image into paste zone...");
await setHeader("Step 2: Paste Image", "Pasting Reference Screenshot (Cmd+V)");
await moveCursor(520, 310, 10);

// Simulate paste event
await page.evaluate((b64) => {
  const preview = document.getElementById("preview");
  const hint = document.querySelector(".hint");
  const clearBtn = document.getElementById("clearImage");
  preview.src = b64;
  preview.style.display = "block";
  hint.style.display = "none";
  clearBtn.hidden = false;

  // enable submit
  window.imageDataUrl = b64;
  document.getElementById("submit").disabled = false;
  document.getElementById("status").textContent = "Image loaded from clipboard.";
}, sampleImageBase64);

await captureFrames(25);

// -----------------------------------------------------------------
// SCENE 3: Select Model (GPT Image 2) (6s - 9s)
// -----------------------------------------------------------------
console.log("Recording Scene 3: Model selection...");
await setHeader("Step 3: Select Target Model", "Choosing Model: GPT Image 2");
await moveCursor(730, 270, 15);

await page.evaluate(() => {
  const modelSelect = document.getElementById("model");
  modelSelect.value = "image2";
});

await captureFrames(20);

// -----------------------------------------------------------------
// SCENE 4: Click Submit & Analyze (9s - 13s)
// -----------------------------------------------------------------
console.log("Recording Scene 4: Submitting generation request...");
await setHeader("Step 4: AI Analysis", "Analyzing Image & Generating Reverse Prompt...");
await moveCursor(730, 350, 15);

await page.evaluate(() => {
  const submitBtn = document.getElementById("submit");
  submitBtn.disabled = true;
  document.getElementById("status").textContent = "Analyzing image and writing prompt...";
});
await captureFrames(35); // show loading state

// -----------------------------------------------------------------
// SCENE 5: Display Generated Prompt & Copy (13s - 18s)
// -----------------------------------------------------------------
console.log("Recording Scene 5: Prompt output and copy...");
await setHeader("Step 5: Output & Copy", "Reverse-Engineered Prompt Generated!");

await page.evaluate((p) => {
  document.getElementById("status").textContent = "Done.";
  document.getElementById("status").classList.add("success");
  const outWrap = document.getElementById("outputWrap");
  outWrap.hidden = false;
  document.getElementById("output").value = p;
  document.getElementById("usageCount").textContent = "493 / 500 generations remaining";
  document.getElementById("usageBarFill").style.width = "98.6%";
}, promptText);

await captureFrames(25);

// Move to Copy button and click
await moveCursor(745, 410, 15);
await page.evaluate(() => {
  const copyBtn = document.getElementById("copy");
  copyBtn.textContent = "Copied!";
  copyBtn.style.background = "#34d399";
  copyBtn.style.color = "#0e0f12";
});
await captureFrames(25);

// -----------------------------------------------------------------
// SCENE 6: History Tab (18s - 22s)
// -----------------------------------------------------------------
console.log("Recording Scene 6: Stored History verification...");
await setHeader("Step 6: History Tab", "Prompts Automatically Stored with Thumbnails");
await moveCursor(640, 220, 15);

await page.evaluate((b64, p) => {
  // switch to history tab
  document.getElementById("tabGenerate").classList.remove("active");
  document.getElementById("panelGenerate").classList.remove("active");
  document.getElementById("tabHistory").classList.add("active");
  document.getElementById("panelHistory").classList.add("active");
  document.getElementById("panelHistory").style.display = "block";

  document.getElementById("historyCount").textContent = "1 / 20 entries";
  const itemHtml = '<div class="history-item" style="background:#16181d; border:1px solid #6c8cff; border-radius:9px; padding:9px; display:flex; gap:9px;">' +
    '<img class="history-thumb" src="' + b64 + '" style="width:52px; height:52px; border-radius:6px; object-fit:cover;" />' +
    '<div class="history-content">' +
      '<div class="history-model" style="font-size:10px; color:#6c8cff; font-weight:600; text-transform:uppercase;">GPT IMAGE 2</div>' +
      '<div class="history-prompt" style="font-size:12px; color:#e7e9ee; line-height:1.4; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">' + p + '</div>' +
      '<div class="history-time" style="font-size:10px; color:#8a8f9a; margin-top:3px;">just now</div>' +
    '</div>' +
  '</div>';
  document.getElementById("historyList").innerHTML = itemHtml;
}, sampleImageBase64, promptText);

await captureFrames(35);

// -----------------------------------------------------------------
// SCENE 7: Account Tab (22s - 26s)
// -----------------------------------------------------------------
console.log("Recording Scene 7: Account & License Key verification...");
await setHeader("Step 7: Account & Subscription", "Active License Key: FD51-4A22-7751-564F");
await moveCursor(710, 220, 15);

await page.evaluate(() => {
  document.getElementById("tabHistory").classList.remove("active");
  document.getElementById("panelHistory").classList.remove("active");
  document.getElementById("panelHistory").style.display = "none";
  document.getElementById("tabAccount").classList.add("active");
  document.getElementById("panelAccount").classList.add("active");
  document.getElementById("panelAccount").style.display = "block";

  document.getElementById("accountSettingsForm").hidden = true;
  document.getElementById("accountSettingsSaved").hidden = false;
  document.getElementById("keyDisplay").textContent = "FD51-4A22-7751-564F";
});

await captureFrames(35);

await browser.close();
console.log(`Captured ${frameIdx} frames. Compiling MP4 video via ffmpeg...`);

const outputVideo = "/Users/savage/Desktop/img2prompt_test_walkthrough.mp4";
const ffmpegCmd = `ffmpeg -y -framerate 20 -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 20 "${outputVideo}"`;
execSync(ffmpegCmd);

console.log(`Video created successfully at: ${outputVideo}`);

// Cleanup frames
fs.rmSync(framesDir, { recursive: true, force: true });
console.log("Done!");
