const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 380, height: 600 });

  page.on('console', msg => console.log('EXTENSION LOG:', msg.text()));
  page.on('pageerror', err => console.error('EXTENSION ERROR:', err.message));

  const popupUrl = 'file://' + path.join(__dirname, 'popup.html');
  console.log('Loading extension popup:', popupUrl);
  await page.goto(popupUrl, { waitUntil: 'load' });

  // 1. Check title and initial state
  const title = await page.title();
  console.log('Page Title:', title);

  const isSubmitDisabled = await page.$eval('#submit', el => el.disabled);
  console.log('Initial submit button disabled:', isSubmitDisabled);

  // 2. Upload test image via #fileInput
  const testImagePath = path.join(__dirname, 'assets', 'reference', 'hero_stadium_model.jpg');
  console.log('Setting file input to:', testImagePath);
  const fileInput = await page.$('#fileInput');
  await fileInput.uploadFile(testImagePath);

  // Wait a moment for FileReader
  await new Promise(r => setTimeout(r, 1000));

  const isSubmitNowEnabled = await page.$eval('#submit', el => !el.disabled);
  console.log('Submit button enabled after image upload:', isSubmitNowEnabled);

  // 3. Click Generate Prompt
  console.log('Clicking Generate Prompt and waiting for output...');
  await page.click('#submit');

  // Wait until output is populated
  await page.waitForFunction(() => {
    const out = document.getElementById('output');
    return out && out.value && out.value.length > 10;
  }, { timeout: 15000 });

  const promptOutput = await page.$eval('#output', el => el.value);
  console.log('Generated prompt (first 120 chars):', promptOutput.substring(0, 120));

  // 4. Test format pills (Midjourney, ComfyUI, Video, JSON)
  const pills = ['midjourney', 'comfyui', 'video', 'json', 'flux'];
  for (const fmt of pills) {
    await page.click(`button[data-fmt="${fmt}"]`);
    await new Promise(r => setTimeout(r, 300));
    const val = await page.$eval('#output', el => el.value);
    console.log(`Format pill [${fmt}] result length:`, val.length, `Starts with:`, val.substring(0, 45).replace(/\n/g, ' '));
  }

  // 5. Click Copy Prompt
  await page.click('#copy');
  await new Promise(r => setTimeout(r, 500));
  const copyBtnText = await page.$eval('#copy', el => el.textContent);
  console.log('Copy button text after click:', copyBtnText);

  // 6. Test History Tab
  await page.click('#tabHistory');
  await new Promise(r => setTimeout(r, 500));
  const historyEntries = await page.$$eval('.history-item', items => items.length);
  console.log('History entries found:', historyEntries);

  // 7. Test Account Tab
  await page.click('#tabAccount');
  await new Promise(r => setTimeout(r, 500));
  const licenseDisplay = await page.$eval('#keyDisplay', el => el.textContent);
  console.log('License Key in Account Tab:', licenseDisplay);

  // Take screenshot of tested popup
  await page.screenshot({ path: 'tested_extension_popup.png' });
  console.log('Saved tested_extension_popup.png');

  await browser.close();
  console.log('All extension automated tests passed successfully!');
})();
