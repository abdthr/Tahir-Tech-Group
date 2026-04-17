import { createRequire } from "module";
const require = createRequire(import.meta.url);
const puppeteer = require("C:/Users/abdta/Desktop/Le Passage/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js");

import { existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, "temporary screenshots");
if (!existsSync(screenshotDir)) mkdirSync(screenshotDir);

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] ? `-${process.argv[3]}` : "";

const existing = readdirSync(screenshotDir).filter(f => f.endsWith(".png"));
const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || "0")).filter(Boolean);
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = `screenshot-${next}${label}.png`;

const browser = await puppeteer.launch({
  executablePath: "C:/Users/abdta/.cache/puppeteer/chrome/win64-147.0.7727.56/chrome-win64/chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle2" });
// Scroll through the page to trigger intersection observers
await page.evaluate(async () => {
  await new Promise(resolve => {
    let totalHeight = 0;
    const distance = 300;
    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      totalHeight += distance;
      if (totalHeight >= document.body.scrollHeight) {
        clearInterval(timer);
        window.scrollTo(0, 0);
        resolve();
      }
    }, 80);
  });
});
await new Promise(r => setTimeout(r, 3000));
const outPath = join(screenshotDir, filename);
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`Saved: ${outPath}`);
