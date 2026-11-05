const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log('Loading local index.html...');
  await page.goto('file://' + process.cwd() + '/index.html', { waitUntil: 'networkidle2', timeout: 45000 });
  
  // Auto scroll down to trigger all animations / lazy loads
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot sections by element selector
  const sectionsToCapture = [
    { name: 'our_section_1_hero', sel: '#shopify-section-template--27200522617169__prompt_product_hero_WqWek7' },
    { name: 'our_section_2_carousel', sel: '#shopify-section-template--27200522617169__prompt_media_carousel_iFeG7J' },
    { name: 'our_section_3_testimonials', sel: '#shopify-section-template--27200522617169__prompt_social_proof_RcC4eR' },
    { name: 'our_section_4_workflows', sel: '#shopify-section-template--27200522617169__pe_workflows_section_ryt8FU' },
    { name: 'our_section_5_hardware', sel: '#shopify-section-template--27200522617169__hardware_compatibility_checker_W7j6d6' },
    { name: 'our_section_6_usecases', sel: '#shopify-section-template--27200522617169__prompt_use_cases_7t4gGn' },
    { name: 'our_section_7_results', sel: '#shopify-section-template--27200522617169__prompt_social_proof_zTJ9Mz' },
    { name: 'our_section_8_checkout', sel: '#shopify-section-template--27200522617169__prompt_cta_final_XN3agM' },
    { name: 'our_section_9_faq', sel: '#shopify-section-template--27200522617169__prompt_faq_QfwAmY' },
    { name: 'our_section_10_footer', sel: '#shopify-section-sections--27200522748241__prompt_footer_hnjgBi' }
  ];

  // Capture navbar + top of hero
  await page.screenshot({ path: 'our_section_0_header.png', clip: { x: 0, y: 0, width: 1200, height: 750 } });
  console.log('Saved our_section_0_header.png');

  for (const s of sectionsToCapture) {
    const el = await page.$(s.sel);
    if (el) {
      await el.screenshot({ path: `${s.name}.png` });
      console.log(`Saved ${s.name}.png`);
    } else {
      console.log(`Selector not found: ${s.sel}`);
    }
  }

  await browser.close();
  console.log('Verification screenshots finished');
})();
