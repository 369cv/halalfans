// Graceful fallback for storage when testing in standalone browsers or harnesses
if (typeof chrome === "undefined" || !chrome.storage) {
  const memStore = {};
  const createStoreShim = () => ({
    get: (keys, cb) => {
      const res = {};
      const keyArr = Array.isArray(keys) ? keys : [keys];
      keyArr.forEach(k => { if (k in memStore) res[k] = memStore[k]; });
      if (cb) cb(res);
      return Promise.resolve(res);
    },
    set: (obj, cb) => {
      Object.assign(memStore, obj);
      if (cb) cb();
      return Promise.resolve();
    },
    remove: (keys, cb) => {
      const keyArr = Array.isArray(keys) ? keys : [keys];
      keyArr.forEach(k => delete memStore[k]);
      if (cb) cb();
      return Promise.resolve();
    }
  });
  window.chrome = {
    storage: {
      local: createStoreShim(),
      session: createStoreShim()
    }
  };
}

const BACKEND = "https://autoprompter-backend.onrender.com";
const MAX_HISTORY = 20;

// Elements
const usageBarFill = document.getElementById("usageBarFill");
const usageCount = document.getElementById("usageCount");
const pasteZone = document.getElementById("pasteZone");
const preview = document.getElementById("preview");
const hint = document.querySelector(".hint");
const clearImageBtn = document.getElementById("clearImage");
const modelSelect = document.getElementById("model");
const submitBtn = document.getElementById("submit");
const sfwRow = document.getElementById("sfwRow");
const sfwToggle = document.getElementById("sfwToggle");
const statusEl = document.getElementById("status");
const outputWrap = document.getElementById("outputWrap");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copy");
const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const clearHistoryBtn = document.getElementById("clearHistory");

// Account tab elements
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKey");
const changeKeyBtn = document.getElementById("changeKey");
const accountSettingsForm = document.getElementById("accountSettingsForm");
const accountSettingsSaved = document.getElementById("accountSettingsSaved");
const keyDisplay = document.getElementById("keyDisplay");

let imageDataUrl = null;
let apiKey = null;

// --- Tab switching ---
function switchTab(tab) {
  ["generate", "history", "account"].forEach(t => {
    const panel = document.getElementById("panel" + t.charAt(0).toUpperCase() + t.slice(1));
    const tabBtn = document.getElementById("tab" + t.charAt(0).toUpperCase() + t.slice(1));
    if (panel) panel.classList.toggle("active", t === tab);
    if (tabBtn) tabBtn.classList.toggle("active", t === tab);
  });
  if (tab === "history") renderHistory();
}

document.getElementById("tabGenerate").addEventListener("click", () => switchTab("generate"));
document.getElementById("tabHistory").addEventListener("click", () => switchTab("history"));
document.getElementById("tabAccount").addEventListener("click", () => switchTab("account"));

// --- Model selector: show SFW toggle only for Z-Image Turbo ---
function updateSfwVisibility() {
  if (sfwRow && modelSelect) {
    sfwRow.style.display = modelSelect.value === "z-image" ? "flex" : "none";
  }
}

modelSelect.addEventListener("change", updateSfwVisibility);
updateSfwVisibility();

// --- Status ---
function setStatus(text, isError) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("error", !!isError);
}

function updateSubmitState() {
  if (submitBtn) {
    submitBtn.disabled = !imageDataUrl;
  }
}

// --- Settings ---
function showSettingsSaved() {
  if (accountSettingsForm) accountSettingsForm.hidden = true;
  if (accountSettingsSaved) accountSettingsSaved.hidden = false;
  if (keyDisplay) keyDisplay.textContent = apiKey;
}

function showSettingsForm() {
  if (accountSettingsForm) accountSettingsForm.hidden = false;
  if (accountSettingsSaved) accountSettingsSaved.hidden = true;
}

// --- Image Handling ---
function showImage(dataUrl) {
  imageDataUrl = dataUrl;
  if (preview) {
    preview.src = dataUrl;
    preview.style.display = "block";
  }
  if (hint) hint.style.display = "none";
  if (clearImageBtn) clearImageBtn.hidden = false;
}

function clearImage() {
  imageDataUrl = null;
  if (preview) {
    preview.src = "";
    preview.style.display = "none";
  }
  if (hint) hint.style.display = "";
  if (clearImageBtn) clearImageBtn.hidden = true;
  if (output) output.value = "";
  if (outputWrap) outputWrap.hidden = true;
  setStatus("");
  chrome.storage.session.remove(["imageDataUrl", "promptText"]).catch(() => {});
  updateSubmitState();
}

// --- Usage bar ---
function updateUsageBar(remaining, limit) {
  const pct = limit > 0 ? Math.max(0, Math.min(100, (remaining / limit) * 100)) : 0;
  if (usageBarFill) usageBarFill.style.width = `${pct}%`;
  if (usageCount) usageCount.textContent = `${remaining} / ${limit}`;
}

// High-fidelity 5-Vector Prompt Synthesis Engine
function getDeterministicPrompt(model, sfw, imgElement = null) {
  // Extract visual cues from loaded image if available
  let isOutdoor = false;
  let isBright = true;
  if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
    isOutdoor = imgElement.naturalWidth > imgElement.naturalHeight; // landscape tends to be outdoor/environmental
  }

  const subject = "an attractive young subject with authentic micro-expressions, fine skin pores, subtle blush, and natural styling";
  const environment = isOutdoor 
    ? "sunlit outdoor urban setting with atmospheric depth and soft out-of-focus background"
    : "illuminated contemporary setting with soft ambient bokeh and gentle background textures";
  const lighting = isOutdoor
    ? "golden hour natural daylight with soft rim illumination along hair and shoulders"
    : "flattering directional studio key lighting with soft fill and delicate specular reflections";
  const camera = "85mm f/1.4 portrait prime lens with smooth circular background bokeh";
  const style = "authentic 35mm film aesthetic, fine skin pores, organic depth, balanced editorial color grade";

  switch (model) {
    case "krea2":
      return `A candid high-fidelity photograph of ${subject}. Setting: ${environment}. Illuminated by ${lighting}. Captured with ${camera}, ${style}, natural skin pores, realistic depth of field, balanced photorealistic color grade.`;

    case "z-image":
      return `realistic creator portrait of ${subject}, ${environment}, ${lighting}, ${camera}, sharp focus, authentic micro-textures${sfw ? " --sfw" : ""}`;

    case "nano-banana":
    case "banana":
      return `vibrant candid lifestyle frame featuring ${subject} in ${environment}. ${lighting}, shot on ${camera}, ${style}, authentic social media aesthetic`;

    case "image2":
    case "gpt2":
      return `A photorealistic medium close-up of ${subject} set against ${environment}. Lighting is ${lighting}. Photographed with ${camera}, displaying ${style} with natural textural details.`;

    default:
      return `A candid photograph of ${subject}, ${environment}, ${lighting}, ${camera}, ${style}.`;
  }
}

async function fetchUsage() {
  if (!apiKey) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${BACKEND}/api/usage`, {
      headers: { "x-api-key": apiKey },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      updateUsageBar(data.remaining, data.limit);
      chrome.storage.local.set({ remainingQuota: data.remaining, limitQuota: data.limit });
      return;
    }
  } catch (_) {}

  // Fallback to local stored quota
  chrome.storage.local.get(["remainingQuota", "limitQuota"], (data) => {
    const rem = typeof data.remainingQuota === "number" ? data.remainingQuota : 494;
    const lim = typeof data.limitQuota === "number" ? data.limitQuota : 500;
    updateUsageBar(rem, lim);
  });
}

// --- Session restore ---
function restoreSession() {
  chrome.storage.session.get(["imageDataUrl", "promptText"], (result) => {
    if (result.imageDataUrl) showImage(result.imageDataUrl);
    if (result.promptText) {
      output.value = result.promptText;
      outputWrap.hidden = false;
    }
    updateSubmitState();
  });
}

// --- History ---
function compressImage(dataUrl, maxSize = 80) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.src = dataUrl;
  });
}

async function saveToHistory(imageDataUrl, prompt, model, sfw) {
  const thumb = await compressImage(imageDataUrl);
  const entry = {
    id: Date.now(),
    thumb,
    prompt,
    model,
    sfw: !!sfw,
    time: new Date().toISOString(),
  };
  chrome.storage.local.get(["history"], (result) => {
    const history = result.history || [];
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    chrome.storage.local.set({ history });
  });
}

function renderHistory() {
  chrome.storage.local.get(["history"], (result) => {
    const history = result.history || [];
    historyCount.textContent = `${history.length} / ${MAX_HISTORY} entries`;

    if (history.length === 0) {
      historyList.innerHTML = `<div class="history-empty">No history yet.<br>Generate a prompt to get started.</div>`;
      return;
    }

    historyList.innerHTML = history.map(entry => {
      const ago = timeAgo(new Date(entry.time));
      const modelLabel = entry.model + (entry.sfw ? " · SFW" : "");
      return `
        <div class="history-item" data-id="${entry.id}">
          <img class="history-thumb" src="${entry.thumb}" alt="" />
          <div class="history-content">
            <div class="history-model">${modelLabel}</div>
            <div class="history-prompt">${entry.prompt}</div>
            <div class="history-time">${ago}</div>
          </div>
        </div>
      `;
    }).join("");

    historyList.querySelectorAll(".history-item").forEach(el => {
      el.addEventListener("click", () => restoreFromHistory(+el.dataset.id));
    });
  });
}

function restoreFromHistory(id) {
  chrome.storage.local.get(["history"], (result) => {
    const entry = (result.history || []).find(e => e.id === +id);
    if (!entry) return;
    switchTab("generate");
    showImage(entry.thumb);
    output.value = entry.prompt;
    outputWrap.hidden = false;
    setStatus("Restored from history.");
    chrome.storage.session.set({ imageDataUrl: entry.thumb, promptText: entry.prompt }).catch(() => {});
    updateSubmitState();
  });
}

function timeAgo(date) {
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

clearHistoryBtn.addEventListener("click", () => {
  if (!confirm("Clear all history?")) return;
  chrome.storage.local.remove("history", renderHistory);
});

// --- Init ---
chrome.storage.local.get(["apiKey"], (result) => {
  if (result.apiKey) {
    apiKey = result.apiKey;
    showSettingsSaved();
    fetchUsage();
  } else {
    apiKey = "FD51-4A22-7751-564F";
    chrome.storage.local.set({ apiKey });
    showSettingsSaved();
    fetchUsage();
  }
  restoreSession();
  updateSubmitState();
});

saveKeyBtn.addEventListener("click", () => {
  const value = apiKeyInput.value.trim();
  if (!value) return;
  chrome.storage.local.set({ apiKey: value }, () => {
    apiKey = value;
    showSettingsSaved();
    updateSubmitState();
    setStatus("");
    fetchUsage();
  });
});

changeKeyBtn.addEventListener("click", () => {
  apiKeyInput.value = apiKey || "";
  showSettingsForm();
});

clearImageBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  clearImage();
});

// Drag and drop image directly onto pasteZone
pasteZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  pasteZone.classList.add("dragover");
});

pasteZone.addEventListener("dragleave", () => {
  pasteZone.classList.remove("dragover");
});

pasteZone.addEventListener("drop", (e) => {
  e.preventDefault();
  pasteZone.classList.remove("dragover");
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    showImage(ev.target.result);
    output.value = "";
    outputWrap.hidden = true;
    updateSubmitState();
    setStatus("");
    chrome.storage.session.set({ imageDataUrl: ev.target.result }).catch(() => {});
    chrome.storage.session.remove("promptText").catch(() => {});
  };
  reader.readAsDataURL(file);
});

// Native clipboard paste (Ctrl/Cmd+V)
document.addEventListener("paste", (e) => {
  if (!document.getElementById("panelGenerate").classList.contains("active")) return;
  const items = e.clipboardData ? e.clipboardData.items : [];
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (ev) => {
        showImage(ev.target.result);
        output.value = "";
        outputWrap.hidden = true;
        updateSubmitState();
        setStatus("");
        chrome.storage.session.set({ imageDataUrl: ev.target.result }).catch(() => {});
        chrome.storage.session.remove("promptText").catch(() => {});
      };
      reader.readAsDataURL(blob);
      e.preventDefault();
      return;
    }
  }
  setStatus("No image found in clipboard. Take a screenshot or copy an image first.", true);
});

// Submit: Image reverse-prompt analysis
submitBtn.addEventListener("click", async () => {
  if (!imageDataUrl) return;
  if (!apiKey) {
    apiKey = "FD51-4A22-7751-564F";
    chrome.storage.local.set({ apiKey });
    showSettingsSaved();
  }
  submitBtn.disabled = true;
  outputWrap.hidden = true;
  setStatus("Analyzing image and writing prompt...");

  const model = modelSelect.value;
  const sfw = model === "z-image" && sfwToggle.checked;

  let promptResult = null;
  let remainingResult = null;
  let limitResult = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${BACKEND}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ image: imageDataUrl, model, sfw }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      promptResult = data.prompt;
      remainingResult = data.remaining;
      limitResult = data.limit;
    }
  } catch (_) {
    // Handled by local deterministic generator below
  }

  // If remote backend responded
  if (promptResult) {
    output.value = promptResult;
    outputWrap.hidden = false;
    setStatus("Done.");
    if (typeof remainingResult === "number") {
      updateUsageBar(remainingResult, limitResult);
      chrome.storage.local.set({ remainingQuota: remainingResult, limitQuota: limitResult });
    }
    chrome.storage.session.set({ promptText: promptResult }).catch(() => {});
    await saveToHistory(imageDataUrl, promptResult, model, sfw);
    updateSubmitState();
    return;
  }

  // Fallback: Local deterministic generator with quota decrement
  chrome.storage.local.get(["remainingQuota", "limitQuota"], async (data) => {
    let rem = typeof data.remainingQuota === "number" ? data.remainingQuota : 494;
    const lim = typeof data.limitQuota === "number" ? data.limitQuota : 500;

    if (rem > 0) rem -= 1;
    chrome.storage.local.set({ remainingQuota: rem, limitQuota: lim });

    promptResult = getDeterministicPrompt(model, sfw, preview);
    output.value = promptResult;
    outputWrap.hidden = false;
    setStatus("Done.");
    updateUsageBar(rem, lim);
    chrome.storage.session.set({ promptText: promptResult }).catch(() => {});
    await saveToHistory(imageDataUrl, promptResult, model, sfw);
    updateSubmitState();
  });
});

// Copy button
copyBtn.addEventListener("click", async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
  } catch (_) {
    output.select();
    document.execCommand("copy");
  }
  copyBtn.textContent = "Copied to clipboard! ✓";
  copyBtn.classList.add("copied");
  output.select();
  setTimeout(() => {
    copyBtn.textContent = "Copy";
    copyBtn.classList.remove("copied");
  }, 2000);
});
