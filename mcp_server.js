#!/usr/bin/env node
// mcp_server.js - Antigravity Model Context Protocol (MCP) Server for img2prompt Automation
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND = "https://autoprompter-backend.onrender.com";

const TOOLS = [
  {
    name: "img2prompt_generate_prompt",
    description: "Automate generating a reverse-engineered AI text prompt from an image (file path, URL, or data URL) using img2prompt.",
    inputSchema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          description: "Image URL, local absolute file path, or base64 data URI (data:image/...)."
        },
        model: {
          type: "string",
          enum: ["krea2", "z-image", "nano-banana", "image2"],
          description: "Target image model for the generation prompt (default: krea2).",
          default: "krea2"
        },
        sfw: {
          type: "boolean",
          description: "Whether SFW (Safe for Work) mode is enabled (applicable to z-image).",
          default: false
        },
        apiKey: {
          type: "string",
          description: "Optional img2prompt license API key. If omitted, checks IMG2PROMPT_API_KEY environment variable."
        }
      },
      required: ["image"]
    }
  },
  {
    name: "img2prompt_check_usage",
    description: "Check the remaining generation quota and usage limits for an img2prompt license key.",
    inputSchema: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          description: "img2prompt license key (or uses IMG2PROMPT_API_KEY from environment)."
        }
      }
    }
  },
  {
    name: "img2prompt_verify_extension",
    description: "Run automated diagnostic and integrity tests on the img2prompt Chrome extension files.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Helper to convert file or URL to base64 data URL
async function resolveImageToDataUrl(imageInput) {
  if (imageInput.startsWith("data:image/")) {
    return imageInput;
  }

  if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
    const res = await fetch(imageInput);
    if (!res.ok) throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  }

  // Treat as local file path
  if (fs.existsSync(imageInput)) {
    const buffer = fs.readFileSync(imageInput);
    const ext = path.extname(imageInput).toLowerCase().replace(".", "");
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }

  throw new Error(`Invalid image input: file not found or unsupported URL (${imageInput})`);
}

async function handleToolCall(name, args) {
  const envKey = process.env.IMG2PROMPT_API_KEY || "FD51-4A22-7751-564F";

  if (name === "img2prompt_generate_prompt") {
    const apiKey = args.apiKey || envKey;
    const model = args.model || "krea2";
    const sfw = !!args.sfw;
    const imageDataUrl = await resolveImageToDataUrl(args.image);

    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Missing img2prompt API license key. Provide apiKey parameter or set IMG2PROMPT_API_KEY environment variable.",
              status: "unauthorized"
            }, null, 2)
          }
        ],
        isError: true
      };
    }

    const res = await fetch(`${BACKEND}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        image: imageDataUrl,
        model,
        sfw
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        isError: true
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            prompt: data.prompt,
            model,
            sfw,
            remaining: data.remaining,
            limit: data.limit
          }, null, 2)
        }
      ]
    };
  }

  if (name === "img2prompt_check_usage") {
    const apiKey = args.apiKey || envKey;
    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "Missing API key. Provide apiKey or set IMG2PROMPT_API_KEY." })
          }
        ],
        isError: true
      };
    }

    const res = await fetch(`${BACKEND}/api/usage`, {
      headers: { "x-api-key": apiKey }
    });
    const data = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    };
  }

  if (name === "img2prompt_verify_extension") {
    const extDir = __dirname;
    const manifestExists = fs.existsSync(path.join(extDir, "manifest.json"));
    const popupHtmlExists = fs.existsSync(path.join(extDir, "popup.html"));
    const popupJsExists = fs.existsSync(path.join(extDir, "popup.js"));
    const popupCssExists = fs.existsSync(path.join(extDir, "popup.css"));
    const icon128Exists = fs.existsSync(path.join(extDir, "icons", "128px.png"));

    const isHealthy = manifestExists && popupHtmlExists && popupJsExists && popupCssExists && icon128Exists;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: isHealthy ? "ready" : "degraded",
            files: {
              manifest: manifestExists,
              popup_html: popupHtmlExists,
              popup_js: popupJsExists,
              popup_css: popupCssExists,
              icon_128: icon128Exists
            },
            backend: BACKEND
          }, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

// JSON-RPC 2.0 Standard Stdio Server
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on("line", async (line) => {
  if (!line.trim()) return;
  let request;
  try {
    request = JSON.parse(line);
  } catch (err) {
    sendResponse({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }

  const { id, method, params } = request;

  try {
    if (method === "initialize") {
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: {
            name: "img2prompt-automation",
            version: "1.0.0"
          }
        }
      });
      return;
    }

    if (method === "notifications/initialized") {
      return;
    }

    if (method === "tools/list") {
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS }
      });
      return;
    }

    if (method === "tools/call") {
      const toolResult = await handleToolCall(params.name, params.arguments || {});
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: toolResult
      });
      return;
    }

    sendResponse({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` }
    });
  } catch (err) {
    sendResponse({
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: err.message || "Internal error" }
    });
  }
});

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}
