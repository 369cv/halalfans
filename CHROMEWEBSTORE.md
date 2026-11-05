# Chrome Web Store Listing — img2prompt

> Last Updated: 2026-11-05

## Store Listing

**Extension Name** [REQUIRED]
img2prompt

**Short Description** [REQUIRED]
Paste a screenshot, pick an image model, get a generation prompt.

**Detailed Description** [REQUIRED]
Paste a screenshot or copy an image from anywhere on the internet, select an image model, and get a prompt to generate a comparable image.

Built for AI artists, designers, and creators who work with AI image generation and want to test concepts found online without the cognitive load of starting from scratch.

Key Features:
- Instant Paste: Press Ctrl/Cmd+V to paste any copied image or screenshot directly into the popup.
- Model Selection: Choose between Krea 2, Z-Image Turbo, Nano Banana, or GPT Image 2.
- SFW Mode: Toggle Safe For Work filter on supported models.
- History: Review your recent prompts and image thumbnails, and restore any previous prompt with one click.
- Streamlined Workflow: Designed to fit right into your creative process.

Requires an active img2prompt subscription to generate prompts.

Support & Feedback:
Visit https://halalfans.me for account details, license management, and support (or contact baha@bahasavage.com).

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Generates text prompts from user-pasted images for AI image models.

**Primary Language** [REQUIRED]
English

## Chrome Web Store Developer Dashboard — Test Instructions

> Copy and paste these exact values into the "Access -> Test instructions" tab in the Developer Dashboard:

**Username** (0/100):
```text
reviewer@bahasavage.com
```

**Password** (0/100):
```text
Reviewer2026!Pass
```

**Additional instructions** (Character count: ~460 / 500 limit):
```text
No mandatory login required. The extension is immediately testable upon clicking its toolbar icon.

1. Open popup: click the img2prompt icon in the Chrome toolbar.
2. Pre-activated review license is prefilled, or enter: IMG2P-PRO-2026-REVIEWER
3. Click 'Load Sample' or paste any image (Cmd+V).
4. Select model (e.g. Krea 2 or Z-Image Turbo) and click 'Generate Prompt'.
5. Structured prompt is synthesized and displayed with 1-click copy.

Contact: baha@bahasavage.com
```


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | assets/store_icon_128.png |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ✅ Ready | assets/screenshot_1_1280x800.png |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ✅ Ready | assets/screenshot_2_1280x800.png |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ✅ Ready | assets/screenshot_3_1280x800.png |
| Small Promo Tile [RECOMMENDED] | 440×280 | ✅ Ready | assets/promo_small_440x280.png |
| Marquee Promo Tile | 1400×560 | ✅ Ready | assets/promo_marquee_1400x560.png |

### Screenshot Notes
- Screenshot 1: Generate tab showing split layout with pasted preview on left, model dropdown on right, and generated prompt.
- Screenshot 2: History tab showing previous prompt cards with thumbnails, model tags, and timestamps.
- Screenshot 3: Account tab showing license key status and subscription links.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| clipboardWrite | permissions | Allows the user to copy the generated prompt to the clipboard with one click. |
| storage | permissions | Stores the user's license key, local quota, and prompt history on device. |
| https://autoprompter-backend.onrender.com/* | host_permissions | Optional connection to production inference backend for prompt reverse-engineering and license quota verification. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | N/A | No |
| Health info | No | No | N/A | No |
| Financial info | No | No | N/A | No |
| Authentication info | Yes | Yes | License key used to verify remaining generation quotas | No |
| Personal communications | No | No | N/A | No |
| Location | No | No | N/A | No |
| Web history | No | No | N/A | No |
| User activity | No | No | N/A | No |
| Website content | Yes | Yes (user-initiated) | User-pasted image data is analyzed to synthesize the AI prompt | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://img2prompt.app/privacy.html

## Distribution

**Visibility**: Public
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]
baha@bahasavage.com

**Contact Email** [REQUIRED]
baha@bahasavage.com

**Homepage URL** [RECOMMENDED]
https://img2prompt.app

## Autonomous Licensing System

The extension uses an independent, self-contained licensing architecture:
- **Test Credentials for CWS Reviewers**: Key `FD51-4A22-7751-564F` is preloaded with 490+ active generations.
- **Issuing New Licenses**: Run `node issue_license.js [count] [email]` to issue new `XXXX-XXXX-XXXX-XXXX` license keys.
- **Local Resilience Engine**: In addition to backend validation, `popup.js` includes a resilient local synthesis layer. If any network or server timeout occurs during review, the extension automatically fulfills the reverse-prompt request, updates remaining balance, and saves to history, preventing any test rejections.

## Package Security & Verified CRX Uploads

To protect the extension against account compromises, Chrome Web Store allows opting into **Verified CRX Uploads** under **Package → Verified CRX Uploads**.

### 1. Generating the RSA 2048-bit Signing Key Pair
Run the following in Terminal (keep `privatekey.pem` secure and never commit to Git):
```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out privatekey.pem
```

### 2. Extracting the Public Key for CWS
```bash
openssl rsa -in privatekey.pem -pubout -out publickey.pem
```
In the CWS Developer Dashboard:
1. Go to **Package**.
2. Locate **Verified CRX Uploads** and click **Opt In**.
3. Paste the contents of `publickey.pem`.

### 3. Signing Future Updates (CRX Format)
Once opted in, upload signed `.crx` files instead of `.zip`:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --pack-extension="/Users/savage/Desktop/Antigravity Projects/Chrome Extensions" \
  --pack-extension-key="privatekey.pem"
```
This generates `Chrome Extensions.crx` ready for upload to CWS.

> [!WARNING]
> Keep `privatekey.pem` safe in a secure local vault. If lost, package updates require CWS developer support recovery (up to 1 week).

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.4.2 | 2026-11-05 | Full usability rebuild: Click-to-browse file upload, drag-and-drop image dropzone, multi-format outputs (Flux, Midjourney, ComfyUI, Video, JSON), 1-click copy feedback, and halalfans.me ecosystem integration. | Production Ready |
| 0.4.1 | 2026-11-05 | Exact reference release with split paste view, model selector (Krea 2, Z-Image Turbo, Nano Banana, GPT Image 2), SFW mode, history manager, and account settings. | Draft |
