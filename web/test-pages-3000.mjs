import pkg from "./node_modules/playwright-core/index.js";
const { chromium } = pkg;
import { mkdirSync } from "fs";

const SHELL = "/home/euger/.cache/ms-playwright/chromium_headless_shell-1222/chrome-headless-shell-linux64/chrome-headless-shell";
const BASE  = "http://localhost:3000";
const OUT   = "test-screenshots";
// Manga with confirmed hosted pages (Berserk ch.1 = 3c652754-fbf7-4465-be54-f61e50eadc5a, 37 pages)
const TEST_MANGA   = "77bee52c-d2d6-44ad-a33a-1734c1fe696a";
const TEST_CHAPTER = "3c652754-fbf7-4465-be54-f61e50eadc5a";

mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: "library",   url: "/library" },
  { name: "browse",    url: "/browse" },
  { name: "history",   url: "/history" },
  { name: "updates",   url: "/updates" },
  { name: "downloads", url: "/downloads" },
  { name: "settings",  url: "/settings" },
];

const browser = await chromium.launch({
  executablePath: SHELL,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const ctx  = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

const jsErrors = [];
page.on("console",  m => { if (m.type() === "error") jsErrors.push(m.text()); });
page.on("pageerror", e => jsErrors.push(e.message));

const results = [];

// ── 1. Static pages ─────────────────────────────────────────────────────
for (const { name, url } of PAGES) {
  jsErrors.length = 0;
  process.stdout.write(`Testing /${name} ... `);
  try {
    const res = await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    const h1   = (await page.textContent("h1").catch(() => "")) ?? "";
    const ok   = res?.status() === 200;
    const errs = [...jsErrors];
    console.log(`${ok ? "✓" : "✗"} ${res?.status()}  h1="${h1.trim()}"${errs.length ? `  ⚠ ${errs.length} JS error(s)` : ""}`);
    errs.forEach(e => console.log(`   ↳ ${e.slice(0, 140)}`));
    results.push({ page: name, ok, errors: errs });
  } catch (e) {
    console.log(`✗ FAILED: ${e.message.slice(0, 100)}`);
    results.push({ page: name, ok: false, error: e.message });
  }
}

// ── 2. Manga detail ─────────────────────────────────────────────────────
jsErrors.length = 0;
process.stdout.write(`Testing /manga/[id] ... `);
try {
  await page.goto(`${BASE}/manga/${TEST_MANGA}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/manga-detail.png` });
  const h2       = (await page.textContent("h2").catch(() => "")) ?? "";
  const chapRows = await page.$$("a[href*='/chapter/']");
  const extLinks = await page.$$("a[target='_blank'][href*='chapter']");
  const errs     = [...jsErrors];
  const ok       = h2.trim().length > 0;
  console.log(`${ok ? "✓" : "✗"}  title="${h2.trim().slice(0, 50)}"  chapters=${chapRows.length}  external-links=${extLinks.length}${errs.length ? `  ⚠ ${errs.length} err` : ""}`);
  errs.forEach(e => console.log(`   ↳ ${e.slice(0, 140)}`));
  results.push({ page: "manga-detail", ok, errors: errs });
} catch (e) {
  console.log(`✗ FAILED: ${e.message.slice(0, 100)}`);
  results.push({ page: "manga-detail", ok: false, error: e.message });
}

// ── 3. Reader (confirmed hosted chapter) ─────────────────────────────────
jsErrors.length = 0;
process.stdout.write(`Testing /reader (${TEST_CHAPTER.slice(0, 8)}…) ... `);
try {
  await page.goto(`${BASE}/reader?mangaId=${TEST_MANGA}&chapterId=${TEST_CHAPTER}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(7000); // at-home API + CDN image fetch
  await page.screenshot({ path: `${OUT}/reader.png` });

  const isLoading  = await page.locator("text=Loading chapter").isVisible().catch(() => false);
  const isError    = await page.locator("text=Failed to load").isVisible().catch(() => false);
  const isExternal = await page.locator("text=Hosted externally").isVisible().catch(() => false);
  const hasSlider  = await page.locator("input[type=range]").isVisible().catch(() => false);
  const imgs       = await page.$$("img");
  const errs       = [...jsErrors];

  const state = isLoading  ? "still-loading"
              : isError    ? "ERROR: failed to load"
              : isExternal ? "EXTERNAL (expected for ext chapters)"
              : imgs.length ? `✓ ${imgs.length} image(s) loaded`
              : "EMPTY - no images";

  const ok = !isError && !isLoading && imgs.length > 0;
  console.log(`${ok ? "✓" : "✗"}  state=${state}  slider=${hasSlider}${errs.length ? `  ⚠ ${errs.length} err` : ""}`);
  errs.forEach(e => console.log(`   ↳ ${e.slice(0, 140)}`));
  results.push({ page: "reader", ok, errors: errs });
} catch (e) {
  console.log(`✗ FAILED: ${e.message.slice(0, 100)}`);
  results.push({ page: "reader", ok: false, error: e.message });
}

// ── 4. External chapter screen ────────────────────────────────────────────
jsErrors.length = 0;
process.stdout.write(`Testing reader (external chapter) ... `);
const EXT_CHAPTER = "ecd2e5b0-e100-49c6-968a-d39ba41c598e"; // tappytoon chapter
const EXT_MANGA   = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0";
try {
  await page.goto(`${BASE}/reader?mangaId=${EXT_MANGA}&chapterId=${EXT_CHAPTER}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/reader-external.png` });
  const isExtScreen = await page.locator("text=Hosted externally").isVisible().catch(() => false);
  const hasOpenBtn  = await page.locator("text=Open external site").isVisible().catch(() => false);
  const ok = isExtScreen && hasOpenBtn;
  console.log(`${ok ? "✓" : "✗"}  external-screen=${isExtScreen}  open-btn=${hasOpenBtn}`);
  results.push({ page: "reader-external", ok, errors: [...jsErrors] });
} catch (e) {
  console.log(`✗ FAILED: ${e.message.slice(0, 100)}`);
  results.push({ page: "reader-external", ok: false, error: e.message });
}

await browser.close();

// ── Summary ───────────────────────────────────────────────────────────────
console.log("\n══════════════ SUMMARY ══════════════");
const pass   = results.filter(r => r.ok && !r.errors?.length);
const issues = results.filter(r => !r.ok || r.errors?.length);
console.log(`Passed: ${pass.length}/${results.length}`);
if (issues.length) {
  console.log("Issues:");
  issues.forEach(r => console.log(`  ✗ ${r.page}: ${r.error ?? r.errors?.slice(0,2).join("; ") ?? "failed"}`));
} else {
  console.log("✓ All pages pass");
}
console.log(`\nScreenshots → ./${OUT}/`);
