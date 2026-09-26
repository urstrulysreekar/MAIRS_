const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function main() {
  const artifactDir = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\cb7a4c7b-6536-409f-a9fa-c1839a65bdfb';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: edgePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Hero
  await page.screenshot({
    path: path.join(artifactDir, 'maris_hero_1440.png'),
    fullPage: false,
  });
  console.log('Saved maris_hero_1440.png');

  // 2. Art Reveal at scroll positions
  // Total page height is ~6000px, Art Reveal begins around 900px and spans 2700px (300vh)
  const scrollPositions = [
    { name: 'reveal_prog_00.png', y: 900 },
    { name: 'reveal_prog_25.png', y: 1575 },
    { name: 'reveal_prog_50.png', y: 2250 },
    { name: 'reveal_prog_75.png', y: 2925 },
    { name: 'reveal_prog_100.png', y: 3600 },
  ];

  for (const pos of scrollPositions) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), pos.y);
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, pos.name),
      fullPage: false,
    });
    console.log(`Saved ${pos.name}`);
  }

  // 3. Below the fold sections
  await page.evaluate(() => window.scrollTo(0, 3900));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(artifactDir, 'sections_why_and_pipeline.png'),
    fullPage: false,
  });
  console.log('Saved sections_why_and_pipeline.png');

  await page.evaluate(() => window.scrollTo(0, 5200));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(artifactDir, 'sections_preview_and_taxonomy.png'),
    fullPage: false,
  });
  console.log('Saved sections_preview_and_taxonomy.png');

  await browser.close();
  console.log('All scroll capture frames completed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
