// Captures marketing screenshots of the site. Usage: npm run build && npx vite preview --port 4173 & node marketing/capture.cjs
const { chromium, devices } = require("playwright");
const path = require("path");
const BASE = process.env.BASE || "http://localhost:4173/#";
const OUT = path.join(__dirname, "screenshots");
const DUMMY = path.join(__dirname, "assets", "dummy.mp4");

async function setup(ctx, lang) {
  await ctx.addInitScript((l) => localStorage.setItem("lang", l), lang);
  // The demo video lives on an external host; serve a local clip so the player renders its poster offline.
  await ctx.route(/\.mp4$/, (r) => r.fulfill({ path: DUMMY, contentType: "video/mp4" }));
}
async function go(p, route, sel) {
  await p.goto(BASE + route);
  await p.waitForSelector(sel);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(350);
}

(async () => {
  const b = await chromium.launch();
  for (const lang of ["en", "am"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await setup(ctx, lang);
    const p = await ctx.newPage();
    const shot = (n, o = {}) => p.screenshot({ path: `${OUT}/${lang}-${n}.png`, ...o });

    await go(p, "/", ".leader");
    await shot("home-hero");
    await shot("home-full", { fullPage: true });
    // element shots: un-stick the header so it doesn't cover the element, and show the full message
    const unstick = await p.addStyleTag({ content: ".header{position:static!important}" });
    await p.locator(".leader .btnlink").click();
    await p.waitForTimeout(150);
    await p.locator(".leader").screenshot({ path: `${OUT}/${lang}-leader.png` });
    await p.locator(".annlist").screenshot({ path: `${OUT}/${lang}-latest-announcements.png` });
    await unstick.evaluate((n) => n.remove());

    await go(p, "/woredas", ".woreda");
    await shot("woredas");
    await go(p, "/woredas/male", ".opp");
    await shot("woreda-detail");
    await go(p, "/woredas/selamago", ".opp");
    await shot("woreda-detail-2");
    await go(p, "/opportunities", ".opp");
    await shot("opportunities");
    await p.locator(".chipbtn").nth(3).click(); // tourism
    await p.waitForTimeout(200);
    await shot("opportunities-tourism");
    await go(p, "/announcements", ".ann");
    await shot("announcements");
    await p.locator(".chipbtn").nth(2).click(); // tenders
    await p.locator(".ann").first().click();
    await p.waitForSelector(".sheet");
    await shot("tender-detail");
    await ctx.close();

    const m = await b.newContext({ ...devices["iPhone 13"] });
    await setup(m, lang);
    const mp = await m.newPage();
    await go(mp, "/", ".leader");
    await mp.screenshot({ path: `${OUT}/${lang}-mobile-home.png` });
    await mp.locator(".leader").scrollIntoViewIfNeeded();
    await mp.evaluate(() => window.scrollBy(0, -80));
    await mp.screenshot({ path: `${OUT}/${lang}-mobile-leader.png` });
    await go(mp, "/woredas/hamer", ".opp");
    await mp.screenshot({ path: `${OUT}/${lang}-mobile-woreda.png` });
    await go(mp, "/announcements", ".ann");
    await mp.screenshot({ path: `${OUT}/${lang}-mobile-announcements.png` });
    await m.close();
  }
  await b.close();
  console.log("done");
})();
