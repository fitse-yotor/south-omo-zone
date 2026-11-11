// Captures marketing screenshots of the site (desktop + iPhone, English + Amharic).
// Usage: npm run build && npx vite preview --port 4173 &  node marketing/capture.cjs
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BASE || "http://localhost:4173/#";
const OUT = path.join(__dirname, "screenshots");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

async function go(p, route) {
  await p.goto(BASE + route);
  await p.waitForLoadState("networkidle");
  await p.evaluate(() => document.fonts.ready);
  // Scroll through the page so every scroll-reveal animation has played, then return to top.
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 400) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(90); }
  await p.waitForTimeout(900);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(500);
}
// Scroll so that `sel` sits just below the fixed header, then take a viewport shot.
async function at(p, sel, file, offset = 90) {
  await p.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - o); }, [sel, offset]);
  await p.waitForTimeout(700);
  await p.screenshot({ path: file });
}

(async () => {
  const b = await chromium.launch();
  for (const lang of ["en", "am"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await ctx.addInitScript((l) => localStorage.setItem("lang", l), lang);
    const p = await ctx.newPage();
    const f = (n) => `${OUT}/${lang}-${n}.png`;

    await go(p, "/");
    await p.screenshot({ path: f("home-hero") });
    await at(p, "main section:nth-of-type(3)", f("home-leader"), 60);
    await at(p, "main section:nth-of-type(4)", f("home-sectors"), 40);
    await at(p, "main section:nth-of-type(5)", f("home-woredas"), 40);
    await at(p, "main section:nth-of-type(6)", f("home-tourism"), 40);
    await at(p, "main section:nth-of-type(7)", f("home-notices"), 40);
    await p.screenshot({ path: f("home-full"), fullPage: true });

    await go(p, "/invest");
    await at(p, "#opportunities", f("invest-opportunities"), 40);
    await go(p, "/woredas");
    await p.screenshot({ path: f("woredas") });
    await at(p, "main section:nth-of-type(2)", f("woredas-grid"), 90);
    await go(p, "/woredas/hamer");
    await p.screenshot({ path: f("woreda-hamer") });
    await go(p, "/tourism");
    await at(p, "main section:nth-of-type(3)", f("tourism-markets"), 40);
    await go(p, "/announcements");
    await p.screenshot({ path: f("announcements") });
    await p.locator("main button.group").first().click();
    await p.waitForTimeout(800);
    await p.screenshot({ path: f("announcement-detail") });
    await go(p, "/about");
    await at(p, "#message", f("about-message"), 60);
    await ctx.close();

    const m = await b.newContext({ ...devices["iPhone 13"] });
    await m.addInitScript((l) => localStorage.setItem("lang", l), lang);
    const mp = await m.newPage();
    await go(mp, "/");
    await mp.screenshot({ path: f("mobile-home") });
    await at(mp, "main section:nth-of-type(3)", f("mobile-leader"), 70);
    await go(mp, "/woredas/dasenech");
    await mp.screenshot({ path: f("mobile-woreda") });
    await go(mp, "/tourism");
    await at(mp, "main section:nth-of-type(3)", f("mobile-markets"), 70);
    await go(mp, "/announcements");
    await at(mp, "main section:nth-of-type(2)", f("mobile-announcements"), 70);
    await m.close();
  }
  await b.close();
  console.log("screenshots:", fs.readdirSync(OUT).length);
})();
