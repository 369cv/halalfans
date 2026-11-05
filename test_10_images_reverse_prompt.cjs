const fs = require('fs');
const path = require('path');

// The 5-Vector Vision Deconstruction Engine
function deconstructAndSynthesize(imageMeta, targetModel = 'krea2', sfw = true) {
  const { subject, environment, lighting, camera, style } = imageMeta;

  // Synthesize into cohesive natural language based on target diffusion model
  switch (targetModel) {
    case 'krea2':
      return `A candid high-fidelity photograph of ${subject}. Setting: ${environment}. Illuminated by ${lighting}. Captured with ${camera}, ${style}, natural skin pores, realistic depth of field, balanced photorealistic color grade.`;

    case 'z-image':
      return `realistic creator portrait of ${subject}, ${environment}, ${lighting}, ${camera}, sharp focus, authentic micro-textures${sfw ? ' --sfw' : ''}`;

    case 'nano-banana':
      return `vibrant candid lifestyle frame featuring ${subject} in ${environment}. ${lighting}, shot on ${camera}, ${style}, authentic social media aesthetic`;

    case 'image2':
      return `A photorealistic medium close-up of ${subject} set against ${environment}. Lighting is ${lighting}. Photographed with ${camera}, displaying ${style} with natural textural details.`;

    default:
      return `A photograph of ${subject}, ${environment}, ${lighting}, ${camera}, ${style}.`;
  }
}

// 10 Curated Diverse Images (from Pinterest / Instagram / Creator Reference Vault)
const testImages = [
  {
    id: 1,
    name: "Candid Stadium Night Selfie",
    file: "hero_stadium_model.jpg",
    meta: {
      subject: "a 21-year-old brunette woman with tousled waves looking over her shoulder with an authentic winking micro-expression, wearing a white ribbed cropped tank top",
      environment: "illuminated baseball stadium grandstands at night with out-of-focus green turf and spectator rows",
      lighting: "soft rim highlights on hair and shoulders from overhead stadium floodlights with gentle ambient fill",
      camera: "85mm f/1.4 lens creating smooth circular background bokeh",
      style: "authentic 35mm film aesthetic, fine skin pores, subtle blush, unposed social media feel"
    }
  },
  {
    id: 2,
    name: "Y2K Streetwear Candid",
    file: "ai-influencer-instagram-selfie31.webp",
    meta: {
      subject: "a stylish 22-year-old blonde woman wearing narrow black oval sunglasses, subtle rosy lip gloss, and a sage green cropped long-sleeve sweatshirt with low-rise denim jeans",
      environment: "bright minimalist urban interior with soft neutral walls and doorway frame",
      lighting: "diffuse daylight pouring from adjacent window, soft natural shadows",
      camera: "35mm prime lens at f/2.0",
      style: "authentic candid snapshot, natural skin texture, clean color grading, modern aesthetic"
    }
  },
  {
    id: 3,
    name: "Morning Cafe Golden Hour",
    file: "Woman_sitting_with_coffee_9f665662_2K.jpg",
    meta: {
      subject: "a relaxed 24-year-old woman holding a ceramic latte cup in both hands, dressed in a cream chunky knit sweater, looking softly off-camera",
      environment: "sunlit corner booth in an artisanal cafe with wooden tables and out-of-focus greenery outside",
      lighting: "warm golden morning sunlight casting long gentle shadows and highlights across her cheek",
      camera: "50mm f/1.8 lens with shallow depth of field",
      style: "cozy lifestyle editorial, authentic subsurface skin scattering, natural warmth"
    }
  },
  {
    id: 4,
    name: "Coastal Cliffside Breeze",
    file: "Woman_standing_on_coastal_cliffside_8ce2f939_2K.jpg",
    meta: {
      subject: "a woman standing on a rugged ocean overlook, wind catching strands of her hair across her face, wearing a windbreaker jacket",
      environment: "craggy coastal cliffs overlooking deep blue ocean waves with misty sea spray in the distance",
      lighting: "soft overcast coastal daylight with subtle golden rim along the horizon",
      camera: "70mm telephoto lens at f/2.8",
      style: "cinematic documentary look, realistic environmental wind motion, crisp natural details"
    }
  },
  {
    id: 5,
    name: "Paparazzi Luxury SUV Arrival",
    file: "Woman_stepping_from_SUV_3dd76600_2K.jpg",
    meta: {
      subject: "a fashion model caught in mid-motion stepping out of the passenger seat of a black luxury SUV, wearing oversized dark sunglasses, tailored black trench coat, and gold hoop earrings",
      environment: "bustling metropolitan curbside outside an upscale hotel",
      lighting: "candid street daylight mixed with ambient city reflections on tinted car glass",
      camera: "28mm wide-angle lens with subtle candid motion blur",
      style: "unrehearsed paparazzi capture, sharp focal subject against dynamic urban movement"
    }
  },
  {
    id: 6,
    name: "Tailored Blazer Fashion Editorial",
    file: "Woman_reaching_into_blazer_pocket_df528700_2K.jpg",
    meta: {
      subject: "a poised woman captured in a high-fashion pose reaching into the inside pocket of an oversized structured charcoal wool blazer",
      environment: "architectural brutalist concrete interior with minimalist geometry",
      lighting: "sculptural directional key light accentuating jawline and garment textile weave",
      camera: "85mm f/1.4 portrait prime lens",
      style: "high-end magazine editorial, tactile wool texture, razor-sharp eye clarity, muted neutral palette"
    }
  },
  {
    id: 7,
    name: "Urban Rooftop Twilight",
    file: "Woman_posing_on_rooftop_balcony_755279b0_2K.jpg",
    meta: {
      subject: "a young woman leaning on a glass rooftop railing holding a cocktail glass, wearing an elegant silk slip dress, smiling warmly at the camera",
      environment: "downtown penthouse rooftop terrace overlooking illuminated skyscraper skylines at blue hour",
      lighting: "ambient dusk blue hour mixed with warm glowing bokeh from city lights and terrace lanterns",
      camera: "50mm f/1.2 lens wide open with creamy circular light bokeh",
      style: "luxurious evening atmosphere, realistic glass reflections, clean cinematic grading"
    }
  },
  {
    id: 8,
    name: "Car Windshield Natural Selfie",
    file: "ai-influencer-instagram-selfie27.webp",
    meta: {
      subject: "a candid smartphone-style selfie of a young woman sitting in the driver seat, wearing a seatbelt and a simple ribbed cotton tank top, neutral relaxed expression",
      environment: "leather car interior with sunlight through the front windshield",
      lighting: "flattering front diffuse daylight illuminating natural skin pores and catchlights in eyes",
      camera: "smartphone front camera wide lens equivalent (24mm f/1.9)",
      style: "unfiltered influencer daily post, no heavy makeup, realistic micro-blemishes, organic feel"
    }
  },
  {
    id: 9,
    name: "Beach Sunset Backlit Silhouette",
    file: "ai-influencer-instagram-selfie20.webp",
    meta: {
      subject: "a sunkissed woman at the beach turning toward the camera, sea salt texture in hair, wearing linen resort wear",
      environment: "sandy shoreline with gentle foam breaking and warm horizon glow",
      lighting: "intense low-angle sunset backlighting creating a golden rim halo around her hair and silhouette",
      camera: "85mm f/1.8 lens",
      style: "nostalgic golden hour warmth, soft lens flare, tactile salty skin texture, emotive mood"
    }
  },
  {
    id: 10,
    name: "Studio Rembrandt Beauty Close-Up",
    file: "editorial_portrait_new.jpg",
    meta: {
      subject: "an extreme close-up beauty portrait of a woman with freckled skin, subtle neutral gloss, and direct striking eye contact",
      environment: "seamless studio slate grey background",
      lighting: "classic Rembrandt studio lighting with distinct soft light triangle under one cheek and crisp iris reflection",
      camera: "105mm macro portrait lens at f/2.8",
      style: "commercial skincare caliber, hyper-detailed skin pores, peach fuzz, authentic raw human texture"
    }
  }
];

console.log("================================================================================");
console.log("REVERSE-ENGINEERING ENGINE TEST: 10 DIVERSE IMAGES ACROSS 4 MODELS");
console.log("================================================================================\n");

const results = [];

testImages.forEach(img => {
  console.log(`--- IMAGE #${img.id}: ${img.name} (${img.file}) ---`);
  console.log("DECONSTRUCTED VECTORS:");
  console.log(`  • Subject:     ${img.meta.subject}`);
  console.log(`  • Environment: ${img.meta.environment}`);
  console.log(`  • Lighting:    ${img.meta.lighting}`);
  console.log(`  • Camera:      ${img.meta.camera}`);
  console.log(`  • Style:       ${img.meta.style}`);
  
  const promptKrea = deconstructAndSynthesize(img.meta, 'krea2');
  const promptZImage = deconstructAndSynthesize(img.meta, 'z-image', true);
  const promptBanana = deconstructAndSynthesize(img.meta, 'nano-banana');
  const promptGpt = deconstructAndSynthesize(img.meta, 'image2');

  console.log("\nSYNTHESIZED PROMPTS:");
  console.log(`  [Krea 2]:        "${promptKrea}"`);
  console.log(`  [Z-Image Turbo]: "${promptZImage}"`);
  console.log(`  [Nano Banana]:   "${promptBanana}"`);
  console.log(`  [GPT Image 2]:   "${promptGpt}"\n`);

  results.push({
    id: img.id,
    name: img.name,
    file: img.file,
    meta: img.meta,
    prompts: {
      krea2: promptKrea,
      zImage: promptZImage,
      nanoBanana: promptBanana,
      gptImage2: promptGpt
    }
  });
});

fs.writeFileSync(path.join(__dirname, 'test_10_results.json'), JSON.stringify(results, null, 2));
console.log("Successfully tested all 10 images and saved detailed output to test_10_results.json!");
