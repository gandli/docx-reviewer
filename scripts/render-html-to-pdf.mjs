import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("usage: node scripts/render-html-to-pdf.mjs <input.html> <output.pdf>");
  process.exit(1);
}

const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve(inputPath)).href, {
    waitUntil: "networkidle",
  });
  await page.pdf({
    path: path.resolve(outputPath),
    format: "A4",
    printBackground: true,
    margin: {
      top: "18mm",
      right: "18mm",
      bottom: "18mm",
      left: "18mm",
    },
  });
} finally {
  await browser.close();
}
