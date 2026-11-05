const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1 });
  
  const localUrl = 'file://' + path.join(__dirname, 'index.html');
  console.log('Loading updated index.html...');
  await page.goto(localUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  const sections = [
    { name: 'updated_section_0_header.png', id: 'shopify-section-template--27200522617169__prompt_navbar_6VJMkJ' },
    { name: 'updated_section_1_hero.png', id: 'shopify-section-template--27200522617169__prompt_product_hero_WqWek7' },
    { name: 'updated_section_2_carousel.png', id: 'shopify-section-template--27200522617169__prompt_media_carousel_iFeG7J' },
    { name: 'updated_section_3_testimonials.png', id: 'shopify-section-template--27200522617169__prompt_social_proof_RcC4eR' },
    { name: 'updated_section_4_workflows.png', id: 'shopify-section-template--27200522617169__pe_workflows_section_ryt8FU' },
    { name: 'updated_section_5_usecases.png', id: 'shopify-section-template--27200522617169__prompt_use_cases_7t4gGn' },
    { name: 'updated_section_6_checkout.png', id: 'shopify-section-template--27200522617169__prompt_cta_final_XN3agM' },
    { name: 'updated_section_7_faq.png', id: 'shopify-section-template--27200522617169__prompt_faq_QfwAmY' },
    { name: 'updated_section_8_footer.png', id: 'shopify-section-sections--27200522748241__prompt_footer_hnjgBi' }
  ];

  for (const s of sections) {
    try {
      const el = await page.$('#' + s.id);
      if (el) {
        await el.screenshot({ path: s.name });
        console.log('Saved ' + s.name);
      } else {
        console.log('Element not found: ' + s.id);
      }
    } catch (err) {
      console.error('Error on ' + s.name, err.message);
    }
  }

  // Full page screenshot
  await page.screenshot({ path: 'updated_full_landing_page.png', fullPage: true });
  console.log('Saved updated_full_landing_page.png');

  await browser.close();
  console.log('Screenshot verification completed successfully.');
})();
