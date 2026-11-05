const fs = require('fs');
const path = require('path');

// Read 10sorlabs_live.html
let html = fs.readFileSync('10sorlabs_live.html', 'utf8');

// 1. Clean protocol & relative URLs
html = html.replace(/https:\/\/https\/\//g, 'https://');
html = html.replace(/https:https:\/\//g, 'https://');
html = html.replace(/\/\/10sorlabs\.com\//g, 'https://10sorlabs.com/');
html = html.replace(/\/\/cdn\.shopify\.com\//g, 'https://cdn.shopify.com/');
html = html.replace(/src="\/cdn\//g, 'src="https://10sorlabs.com/cdn/');
html = html.replace(/srcset="\/cdn\//g, 'srcset="https://10sorlabs.com/cdn/');
html = html.replace(/href="\/cdn\//g, 'href="https://10sorlabs.com/cdn/');
html = html.replace(/poster="\/cdn\//g, 'poster="https://10sorlabs.com/cdn/');

// Turn all lazy loading to eager
html = html.replace(/loading="lazy"/g, 'loading="eager"');

// 2. Map all images and videos to local assets/reference/
const refDir = path.join(__dirname, 'assets', 'reference');
const refFiles = fs.readdirSync(refDir);
refFiles.forEach(file => {
  const filePath = path.join(refDir, file);
  if (fs.statSync(filePath).size > 100) {
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace in src or href
    const srcRegex = new RegExp('(?:https:\\/\\/10sorlabs\\.com\\/cdn\\/shop\\/files\\/|https:\\/\\/cdn\\.shopify\\.com\\/videos\\/c\\/o\\/v\\/)' + escaped + '(?:\\?[^"\'\\s]*)?', 'g');
    html = html.replace(srcRegex, 'assets/reference/' + file);

    // Replace in srcset
    const srcsetRegex = new RegExp('srcset="[^"]*' + escaped + '[^"]*"', 'g');
    html = html.replace(srcsetRegex, `srcset="assets/reference/${file}"`);
  }
});

// Fix any leftover duplicate protocols or invalid asset prefixes
html = html.replace(/https:assets\//g, 'assets/');
html = html.replace(/https:\/\/assets\//g, 'assets/');
html = html.replace(/https:https:\/\//g, 'https://');
html = html.replace(/https:\/\/https\/\//g, 'https://');

// 3. 9-Dots Grid SVG Icon
const nineDotsSvg = `<svg class="pnb-logo" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0;">
  <rect x="2" y="2" width="5" height="5" rx="1.2"/>
  <rect x="9.5" y="2" width="5" height="5" rx="1.2"/>
  <rect x="17" y="2" width="5" height="5" rx="1.2"/>
  <rect x="2" y="9.5" width="5" height="5" rx="1.2"/>
  <rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/>
  <rect x="17" y="9.5" width="5" height="5" rx="1.2"/>
  <rect x="2" y="17" width="5" height="5" rx="1.2"/>
  <rect x="9.5" y="17" width="5" height="5" rx="1.2"/>
  <rect x="17" y="17" width="5" height="5" rx="1.2"/>
</svg>`;

html = html.replace(/<img class="pnb-logo"[^>]*>/gi, nineDotsSvg);
html = html.replace(/<img class="pft-logo"[^>]*>/gi, nineDotsSvg);

// 4. Navbar branding and minimalist HeyGen/Muzeboard style nav links
const oldNavbarWrap = `<div class="pnb-wrap">
  <a class="pnb-brand" href="/">
    ${nineDotsSvg}
    <span class="pnb-name">10sorlabs</span>
  </a>`;

const newNavbarWrap = `<div class="pnb-wrap">
  <a class="pnb-brand" href="/">
    ${nineDotsSvg}
    <span class="pnb-name">halalfans.me</span>
  </a>

  <!-- Minimalist HeyGen / Muzeboard Style Navigation (NO loud CTAs) -->
  <nav class="hf-nav-links">
    <div class="hf-nav-item">
      <a href="#shopify-section-template--27200522617169__pe_workflows_section_ryt8FU" class="hf-nav-link">
        <span>Workflows</span>
        <span class="hf-tag">7 Suite</span>
        <svg class="chevron" viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </a>
      <div class="hf-nav-dropdown">
        <a href="#shopify-section-template--27200522617169__pe_workflows_section_ryt8FU" class="hf-dropdown-link">
          <span class="hf-dropdown-title">🎭 Character Consistency Engine</span>
          <span class="hf-dropdown-desc">InstantID & IP-Adapter pipelines for facial lock across unlimited angles.</span>
        </a>
        <a href="#shopify-section-template--27200522617169__pe_workflows_section_ryt8FU" class="hf-dropdown-link">
          <span class="hf-dropdown-title">🎬 Cinematic Video & Motion Control</span>
          <span class="hf-dropdown-desc">24fps video generation, fluid hair physics, and camera parallax loops.</span>
        </a>
        <a href="#shopify-section-template--27200522617169__pe_workflows_section_ryt8FU" class="hf-dropdown-link">
          <span class="hf-dropdown-title">💡 Studio Lighting & Skin Enhancing</span>
          <span class="hf-dropdown-desc">Realistic skin pores, studio softboxes, and film grain realism.</span>
        </a>
        <a href="#shopify-section-template--27200522617169__pe_workflows_section_ryt8FU" class="hf-dropdown-link">
          <span class="hf-dropdown-title">🔍 img2prompt Reverse Engineering</span>
          <span class="hf-dropdown-desc">1-click camera, lens, and lighting extraction for Flux & Midjourney.</span>
        </a>
      </div>
    </div>

    <div class="hf-nav-item">
      <a href="#shopify-section-template--27200522617169__prompt_use_cases_7t4gGn" class="hf-nav-link">
        <span>Use Cases</span>
        <svg class="chevron" viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </a>
      <div class="hf-nav-dropdown">
        <a href="#shopify-section-template--27200522617169__prompt_use_cases_7t4gGn" class="hf-dropdown-link">
          <span class="hf-dropdown-title">👗 AI Fashion & Model Lookbooks</span>
          <span class="hf-dropdown-desc">Editorial magazine spreads and digital apparel drops with zero photo shoots.</span>
        </a>
        <a href="#shopify-section-template--27200522617169__prompt_use_cases_7t4gGn" class="hf-dropdown-link">
          <span class="hf-dropdown-title">📱 TikTok & Short-Form Video</span>
          <span class="hf-dropdown-desc">Autonomous viral short-form video generation with persistent personas.</span>
        </a>
        <a href="#shopify-section-template--27200522617169__prompt_use_cases_7t4gGn" class="hf-dropdown-link">
          <span class="hf-dropdown-title">🤝 Brand Partnerships & Ads</span>
          <span class="hf-dropdown-desc">Monetize digital creators with product placements and sponsor deals.</span>
        </a>
      </div>
    </div>

    <a href="#shopify-section-template--27200522617169__hardware_compatibility_checker_W7j6d6" class="hf-nav-link">Hardware Specs</a>
    <a href="#shopify-section-template--27200522617169__prompt_social_proof_zTJ9Mz" class="hf-nav-link">Creators</a>
    <a href="#shopify-section-template--27200522617169__prompt_faq_QfwAmY" class="hf-nav-link">FAQ</a>
  </nav>`;

html = html.replace(oldNavbarWrap, newNavbarWrap);

// 5. Hero video: Add local webm and mp4 fallback with poster
const oldHeroVideo = `<video autoplay="" muted="" loop="" playsinline="" style="width:100%;height:100%;object-fit:cover;display:block;"><source src="https://cdn.shopify.com/videos/c/o/v/dec52c0f7cd741c1baf9d7c9f4c28f94.webm" media="(min-width: 750px)"><source src="https://cdn.shopify.com/videos/c/o/v/b79cfcbc30ff4f6ab434c1e4a8160a6d.webm"></video>`;
const newHeroVideo = `<video autoplay muted loop playsinline poster="assets/reference/hero_stadium_model.jpg" style="width:100%;height:100%;object-fit:cover;display:block;">
  <source src="assets/reference/hero_stadium_model.mp4" type="video/mp4">
  <source src="assets/reference/dec52c0f7cd741c1baf9d7c9f4c28f94.webm" type="video/webm">
</video>`;
html = html.replace(oldHeroVideo, newHeroVideo);

// 6. Section 4: 13 tutorials video placeholder
const oldTutorialPlaceholder = `<div class="pe-workflows__video-placeholder"></div>`;
const newTutorialVideo = `<div class="pe-workflows__video-placeholder">
  <video poster="assets/reference/tutorials_dashboard.jpg" src="assets/reference/0acfeadab55c4956b3b8ad733c39385a.webm" autoplay loop muted playsinline style="width:100%;height:auto;border-radius:14px;display:block;"></video>
</div>`;
html = html.replace(oldTutorialPlaceholder, newTutorialVideo);

// 7. Replace all case variants of brand references
html = html.replace(/\(Made with 10sorlabs\)/gi, '(Made with halalfans.me)');
html = html.replace(/Run your own AI influencers with 10sorlabs/gi, 'Run your own AI influencers with halalfans.me');
html = html.replace(/95% of 10sorlabs users/gi, '95% of halalfans users');
html = html.replace(/webpanel\.10sorlabs\.com/gi, 'halalfans.me');
html = html.replace(/hello@10sorlabs\.com/gi, 'baha@bahasavage.com');
html = html.replace(/© 2026 10sorlabs/gi, '© 2026 halalfans.me');
html = html.replace(/10sorLabs/g, 'halalfans.me');
html = html.replace(/<span class="pft-name">10sorlabs<\/span>/gi, '<span class="pft-name">halalfans.me</span>');

// 8. Update title and inject custom styles
html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>halalfans.me — Run Your Own AI Influencers with Local Workflows</title>');

const customHeadStyles = `
<style>
  /* Halalfans Minimalist Header Styles */
  .hf-nav-links {
    display: flex;
    align-items: center;
    gap: 22px;
  }
  @media (max-width: 820px) {
    .hf-nav-links { display: none !important; }
  }
  .hf-nav-item {
    position: relative;
  }
  .hf-nav-link {
    text-decoration: none;
    color: var(--pe-muted, #5e635c);
    font-family: var(--pe-font);
    font-size: 0.92rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 0;
    transition: color 0.15s ease;
  }
  .hf-nav-link:hover {
    color: var(--pe-ink, #14161a);
  }
  .hf-nav-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    width: 330px;
    background: #ffffff;
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 14px;
    box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.16);
    padding: 10px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1000;
    pointer-events: none;
  }
  .hf-nav-item:hover .hf-nav-dropdown,
  .hf-nav-item:focus-within .hf-nav-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }
  .hf-dropdown-link {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s ease;
  }
  .hf-dropdown-link:hover {
    background: #f8fafc;
  }
  .hf-dropdown-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .hf-dropdown-desc {
    font-size: 0.74rem;
    color: #64748b;
    line-height: 1.35;
  }
  .hf-tag {
    font-size: 0.68rem;
    background: #eff6ff;
    color: #2563eb;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  /* Cart action click handler smooth scroll to checkout */
  .pnb-cart {
    cursor: pointer;
  }
</style>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // When clicking cart button, scroll smoothly to checkout section
    document.querySelectorAll('[data-open-cart], .pnb-cart').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById('shopify-section-template--27200522617169__prompt_cta_final_XN3agM');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // When clicking "Explore the toolkit (free)" or secondary CTAs, scroll to workflows
    document.querySelectorAll('.pph-secondary-cta, a[href*="toolkit"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        if (!btn.getAttribute('href') || btn.getAttribute('href') === '#') {
          e.preventDefault();
          var target = document.getElementById('shopify-section-template--27200522617169__pe_workflows_section_ryt8FU');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // When clicking primary CTA button in hero, scroll smoothly to final pricing
    document.querySelectorAll('.pph-cta, a.pph-cta, [data-pe-cart-cta]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById('shopify-section-template--27200522617169__prompt_cta_final_XN3agM');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  });
</script>
`;

html = html.replace('</head>', customHeadStyles + '\n</head>');

// Remove tracking scripts
html = html.replace(/<script[^>]*trekkie[^>]*>[\s\S]*?<\/script>/gi, '');
html = html.replace(/<script[^>]*connect\.facebook\.net[^>]*>[\s\S]*?<\/script>/gi, '');
html = html.replace(/<script[^>]*googletagmanager[^>]*>[\s\S]*?<\/script>/gi, '');

fs.writeFileSync('index.html', html);
fs.writeFileSync('halalfans.html', html);
console.log('Successfully written index.html and halalfans.html (' + html.length + ' bytes)');
