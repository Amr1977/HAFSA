const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OG_DIR = path.join(__dirname, '..', 'public', 'og');

const images = [
  { file: 'og-main.html',   output: 'og-main.png',   width: 1200, height: 630  },
  { file: 'og-square.html', output: 'og-square.png', width: 800,  height: 800  },
  { file: 'og-banner.html', output: 'og-banner.png', width: 1500, height: 500  },
];

async function generateOGImages() {
  console.log('Launching browser...');
  const browser = await chromium.launch();

  for (const img of images) {
    const srcPath = path.join(OG_DIR, img.file);
    const outPath = path.join(OG_DIR, img.output);

    console.log(`Generating ${img.output} (${img.width}x${img.height})...`);

    const page = await browser.newPage();
    await page.setViewportSize({ width: img.width, height: img.height });
    await page.goto(`file://${srcPath}`);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: img.width, height: img.height },
    });

    await page.close();
    console.log(`  Saved: ${outPath}`);
  }

  await browser.close();
  console.log('\nAll OG images generated successfully!');
}

generateOGImages().catch(console.error);
