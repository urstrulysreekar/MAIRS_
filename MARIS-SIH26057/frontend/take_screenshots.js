const fs = require('fs');
const path = require('path');

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    try {
      puppeteer = require('puppeteer-core');
    } catch (err) {
      console.error('Neither puppeteer nor puppeteer-core found.');
      process.exit(1);
    }
  }

  const artifactDir = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\cb7a4c7b-6536-409f-a9fa-c1839a65bdfb';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  if (fs.existsSync(edgePath)) {
    launchOptions.executablePath = edgePath;
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // Desktop: 1440x900
  console.log('Rendering 1440x900 desktop viewport...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({
    path: path.join(artifactDir, 'hero_1440x900.png'),
    fullPage: false,
  });
  console.log('Saved 1440x900 desktop screenshot');

  // Mobile: 390x844
  console.log('Rendering 390x844 mobile viewport...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({
    path: path.join(artifactDir, 'hero_390x844.png'),
    fullPage: false,
  });
  console.log('Saved 390x844 mobile screenshot');

  await browser.close();
  console.log('Screenshots completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
