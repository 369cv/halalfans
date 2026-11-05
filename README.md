# img2prompt — Chrome Extension & Antigravity Automation

Exact 1:1 reproduction of the official **img2prompt** Chrome extension (`edehmemaekkbgmdmogfmlagbjpnpbnoh`), paired with an Antigravity MCP automation server.

---

## 📁 Extension Components

- `manifest.json`: Exact Manifest V3 definition matching version `0.4.1`.
- `popup.html`: Exact reference markup (Header, usage bar, Generate/History/Account tabs, paste zone, model dropdown, SFW toggle, history cards).
- `popup.css`: Exact reference styling with dark theme, split-row flex layout, and custom scrollbars.
- `popup.js`: Exact reference event listeners, session restore, clipboard paste listener, history compression, and backend communication.
- `icons/`: Reference icons (`16px.png`, `48px.png`, `128px.png`).
- `img2prompt.zip`: Ready-to-upload package for the Chrome Web Store Developer Console.

---

## 🤖 Antigravity MCP Automation Server

The extension is connected to Antigravity as an MCP tool server via `mcp_server.js` and registered in `~/.gemini/config/mcp_config.json`.

### Available MCP Automation Tools:
1. `img2prompt_generate_prompt`:
   - Automates prompt generation from any image URL, local file path, or base64 data URI.
   - Parameters: `image` (string), `model` (`krea2` | `z-image` | `nano-banana` | `image2`), `sfw` (boolean), `apiKey` (string).
2. `img2prompt_check_usage`:
   - Checks remaining generation balance and total monthly quota.
3. `img2prompt_verify_extension`:
   - Runs diagnostic checks verifying all Chrome extension files and backend readiness.

### Testing the Extension:
Run the comprehensive test suite:
```bash
node test_extension.js
```
All 61 automated checks verify the manifest, HTML IDs, CSS theme, runtime logic, and backend endpoints.
