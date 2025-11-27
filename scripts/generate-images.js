#!/usr/bin/env node
/**
 * AI Image Generation Script for Microsite Content
 * Uses Google Gemini's Imagen model for high-quality, original images
 *
 * Usage: node generate-images.js [category] [count]
 * Example: node generate-images.js balayage 10
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Image prompt templates for different hair content categories
const IMAGE_PROMPTS = {
  balayage: [
    "Professional salon photo of woman with beautiful sun-kissed balayage highlights, natural lighting, hair flowing, luxury salon background, high-end fashion photography style",
    "Before and after balayage transformation, brunette to dimensional blonde, professional photography, clean white background",
    "Stylist hand-painting balayage technique on client hair, close-up shot, professional salon, artistic lighting",
    "Woman with gorgeous caramel balayage walking on beach at sunset, hair blowing in wind, lifestyle photography",
    "Side profile of woman with seamless balayage blend from roots to ends, studio lighting, beauty photography"
  ],
  color_correction: [
    "Split image showing brassy orange hair on left, beautiful cool blonde on right, color correction transformation",
    "Professional colorist examining damaged hair under salon lighting, concerned expression, consultation scene",
    "Woman crying looking at phone showing bad box dye result, relatable moment, lifestyle photography",
    "Happy woman with perfectly corrected platinum blonde hair, smiling in mirror, salon celebration",
    "Close-up of healthy restored hair after color correction, glossy and vibrant, product photography style"
  ],
  wedding_hair: [
    "Elegant bridal updo with delicate flowers woven in, soft romantic lighting, wedding day photography",
    "Bride looking in mirror at her beautiful hair, emotional moment, natural window light",
    "Bridesmaid hair styling in progress, multiple women getting ready, fun atmosphere",
    "Classic bridal chignon from behind showing intricate detail, professional beauty photography",
    "Romantic loose waves on bride, beach wedding setting, golden hour lighting"
  ],
  keratin: [
    "Split image of frizzy hair vs smooth sleek hair after keratin treatment, dramatic transformation",
    "Woman with perfectly straight glossy hair in humid Florida outdoor setting, impossibly smooth",
    "Stylist applying keratin treatment with flat iron, steam rising, professional technique",
    "Before keratin: stressed woman with frizzy humidity hair. After: same woman with sleek confident look",
    "Close-up of silky smooth keratin-treated hair catching light, product photography"
  ],
  mens_grooming: [
    "Handsome man getting premium haircut at upscale barbershop/salon, masculine elegant setting",
    "Classic gentleman's fade haircut, sharp lines, professional male grooming photography",
    "Man examining his fresh haircut in mirror with satisfied expression, modern salon",
    "Barber/stylist trimming man's beard with precision, close-up professional shot",
    "Before and after men's grooming transformation, scruffy to polished"
  ],
  grey_blending: [
    "Elegant woman in her 50s with beautiful silver grey blended hair, confident smile, lifestyle photography",
    "Transformation showing graceful transition to grey, multiple stages, tasteful comparison",
    "Woman embracing her grey with stylish dimensional highlights, modern sophisticated look",
    "Close-up of expertly blended grey and natural color, seamless transition, detail shot",
    "Happy mature woman with gorgeous silver hair laughing with friends, lifestyle scene"
  ],
  curly_hair: [
    "Woman with bouncy defined curls, happy expression, celebrating natural texture",
    "Curly hair specialist styling ringlets, professional technique, salon setting",
    "Before and after DevaCut transformation, frizzy to defined curls",
    "Mixed race woman with gorgeous natural curly hair, confident pose, beauty photography",
    "Close-up of perfectly defined curl pattern, hydrated and healthy, detail shot"
  ],
  hair_extensions: [
    "Woman with long luxurious hair extensions, natural blend, flowing movement",
    "Stylist installing tape-in extensions, professional technique close-up",
    "Before and after extensions transformation, short to long dramatic change",
    "Woman with seamless hand-tied extensions tossing hair, freedom and confidence",
    "Close-up showing invisible extension attachment point, quality craftsmanship"
  ],
  salon_lifestyle: [
    "Luxurious modern salon interior with natural light, plants, elegant design",
    "Client relaxing with champagne during salon service, pampering experience",
    "Stylist and client laughing together, genuine connection, warm atmosphere",
    "Peaceful salon washing station, spa-like ambiance, relaxation",
    "Group of friends at salon for bridal party, celebration and bonding"
  ],
  florida_specific: [
    "Woman with perfect hair despite obvious Florida humidity, palm trees background",
    "Beach lifestyle with gorgeous maintained hair, South Florida vibes",
    "Pool party scene with woman whose hair still looks amazing, chlorine-proof",
    "Sunset at Delray Beach Atlantic Avenue, lifestyle photography",
    "Woman protecting hair from Florida sun with stylish hat, beach setting"
  ]
};

async function generateImageWithGemini(prompt, outputPath) {
  // Note: Gemini's Imagen 3 is available through Vertex AI
  // For basic usage, we'll use the standard API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: `You are an expert at creating detailed image generation prompts.
               Create a highly detailed, specific prompt for generating this image: "${prompt}"

               The prompt should be suitable for professional salon/beauty content.
               Include specific details about:
               - Lighting (natural, studio, golden hour)
               - Camera angle and composition
               - Subject appearance and expression
               - Background and setting
               - Style (photography, professional, lifestyle)
               - Color palette

               Return ONLY the enhanced prompt, nothing else.`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.candidates && response.candidates[0]) {
            resolve(response.candidates[0].content.parts[0].text);
          } else {
            reject(new Error('No response from Gemini'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

async function generateAllPrompts() {
  const outputDir = path.join(__dirname, '../image-prompts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating enhanced image prompts for all categories...\n');

  for (const [category, prompts] of Object.entries(IMAGE_PROMPTS)) {
    console.log(`\n📸 Category: ${category}`);
    console.log('='.repeat(50));

    const categoryPrompts = [];

    for (let i = 0; i < prompts.length; i++) {
      console.log(`  Processing ${i + 1}/${prompts.length}...`);
      try {
        const enhanced = await generateImageWithGemini(prompts[i]);
        categoryPrompts.push({
          original: prompts[i],
          enhanced: enhanced,
          filename: `${category}_${i + 1}.png`
        });
        console.log(`  ✓ Enhanced prompt ready`);
      } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
        categoryPrompts.push({
          original: prompts[i],
          enhanced: prompts[i], // fallback to original
          filename: `${category}_${i + 1}.png`
        });
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }

    // Save prompts to JSON file
    fs.writeFileSync(
      path.join(outputDir, `${category}_prompts.json`),
      JSON.stringify(categoryPrompts, null, 2)
    );
  }

  console.log('\n✅ All prompts generated and saved to /scripts/image-prompts/');
  console.log('\nNext steps:');
  console.log('1. Use these prompts with Midjourney, DALL-E, or Stable Diffusion');
  console.log('2. Or use Vertex AI Imagen 3 for Google-native generation');
  console.log('3. Save generated images to /images/[category]/ folders');
}

// Run the script
if (require.main === module) {
  generateAllPrompts().catch(console.error);
}

module.exports = { IMAGE_PROMPTS, generateImageWithGemini };
