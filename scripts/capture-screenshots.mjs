import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:4173";
const outputDir = path.resolve(process.cwd(), "docs/screenshots");

const pages = [
  {
    id: "workspace-main",
    title: "主工作台",
    url: `${baseUrl}/workspace/ws-enterprise`,
    waitForTestId: "workspace-sidebar",
  },
];

async function waitForAppReady(page, selector) {
  await page.waitForSelector(`[data-testid="${selector}"]`, { timeout: 30_000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1200);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  for (const target of pages) {
    await page.goto(target.url, { waitUntil: "domcontentloaded" });
    await waitForAppReady(page, target.waitForTestId);

    await page.screenshot({
      path: path.join(outputDir, `${target.id}.png`),
      fullPage: false,
    });

    console.log(`captured ${target.title}: ${target.id}.png`);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
