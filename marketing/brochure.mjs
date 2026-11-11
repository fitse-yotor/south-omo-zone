// Builds an A4 tri-fold brochure (EN + AM) from the site data and screenshots.
// Usage: node marketing/capture.cjs (first) && node marketing/brochure.mjs
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { leader, stats, sectors, woredas, opportunities } from "../src/data/mock.js";
import { SITE } from "../src/config.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "output");
const SITE_URL = process.env.SITE_URL || "https://southomo.example.gov.et";
fs.mkdirSync(OUT, { recursive: true });

const f = (p) => pathToFileURL(path.join(ROOT, p)).href;
const shot = (n) => pathToFileURL(path.join(HERE, "screenshots", n)).href;

const T = {
  en: {
    leaderH: "A message from the Zone Administrator",
    watch: "Watch the full video message on our website.",
    howH: "How to invest", steps: [
      ["Explore", "Browse opportunities by woreda and sector on our website."],
      ["Enquire", "Contact the zone investment desk with your project idea."],
      ["Visit", "We arrange a site visit with the woreda administration."],
      ["Register", "Get your investment licence and land allocation support."],
    ],
    contactH: "Contact", scan: "Scan to visit the website",
    pillars: "Agriculture · Investment · Tourism",
    whyH: "Why South Omo", keyH: "Opportunities at a glance",
    oppsN: "opportunities", haN: "hectares available", jobsN: "potential jobs", usdN: "M USD investment",
    sectorsH: "Priority sectors", woredasH: "Our woredas", featuredH: "Featured opportunities",
    annH: "Vacancies & tenders", annP: "Job vacancies and procurement tenders are published on the website, with deadlines and full requirements.",
    cta: "Find your opportunity", demo: "Demo brochure: all figures are sample data.",
    ha: "ha", jobs: "jobs", musd: "M USD",
  },
  am: {
    leaderH: "የዞኑ ዋና አስተዳዳሪ መልዕክት",
    watch: "ሙሉውን የቪዲዮ መልዕክት በድረ-ገጻችን ይመልከቱ።",
    howH: "እንዴት ኢንቨስት ያደርጋሉ", steps: [
      ["ይቃኙ", "ዕድሎችን በወረዳና በዘርፍ በድረ-ገጻችን ይመልከቱ።"],
      ["ይጠይቁ", "የፕሮጀክት ሀሳብዎን ይዘው የዞኑን የኢንቨስትመንት ጽ/ቤት ያግኙ።"],
      ["ይጎብኙ", "ከወረዳው አስተዳደር ጋር የቦታ ጉብኝት እናመቻቻለን።"],
      ["ይመዝገቡ", "የኢንቨስትመንት ፈቃድና የመሬት አቅርቦት ድጋፍ ያግኙ።"],
    ],
    contactH: "አድራሻ", scan: "ድረ-ገጹን ለመጎብኘት ይቃኙ",
    pillars: "ግብርና · ኢንቨስትመንት · ቱሪዝም",
    whyH: "ለምን ደቡብ ኦሞ", keyH: "ዕድሎች በአጭሩ",
    oppsN: "ዕድሎች", haN: "ሄክታር መሬት", jobsN: "የሥራ ዕድሎች", usdN: "ሚሊዮን ዶላር",
    sectorsH: "ቅድሚያ የተሰጣቸው ዘርፎች", woredasH: "ወረዳዎቻችን", featuredH: "ተመራጭ ዕድሎች",
    annH: "ክፍት የሥራ ቦታዎችና ጨረታዎች", annP: "የሥራ ማስታወቂያዎችና የግዥ ጨረታዎች ከመጨረሻ ቀናቸውና ሙሉ መስፈርቶቻቸው ጋር በድረ-ገጹ ላይ ይወጣሉ።",
    cta: "ዕድልዎን ያግኙ", demo: "ናሙና ብሮሹር፦ ሁሉም አሃዞች የሙከራ መረጃ ናቸው።",
    ha: "ሄክታር", jobs: "ሥራ", musd: "ሚ. ዶላር",
  },
};

const sum = (k) => opportunities.reduce((a, o) => a + o[k], 0);
const fmt = (n) => n.toLocaleString("en-US");

function html(lang, qr) {
  const t = T[lang], tx = (o) => o[lang];
  const count = (id) => opportunities.filter((o) => o.woreda === id).length;
  const bySector = Object.entries(sectors).map(([k, s]) => [s, opportunities.filter((o) => o.sector === k).length]);
  const featured = [...opportunities].sort((a, b) => b.investmentUsdM - a.investmentUsdM).slice(0, 4);
  const wname = (id) => tx(woredas.find((w) => w.id === id).name);

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${f("node_modules/@fontsource/inter/400.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource/inter/600.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource/inter/700.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource/noto-sans-ethiopic/400.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource/noto-sans-ethiopic/600.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource/noto-sans-ethiopic/700.css")}">
<style>
@page{size:A4 landscape;margin:0}
:root{--green:#0b6b34;--green-d:#074a24;--gold:#e8a317;--red:#c8102e;--ink:#1c2a1f;--muted:#5b6b5f;--band:#f1f4ea;--line:#dfe5d6}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${lang === "am" ? '"Noto Sans Ethiopic",Inter' : 'Inter,"Noto Sans Ethiopic"'},sans-serif;color:var(--ink);font-size:8.6pt;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{width:297mm;height:210mm;display:grid;grid-template-columns:repeat(3,99mm);page-break-after:always;overflow:hidden}
.p{position:relative;padding:11mm 9mm 9mm;overflow:hidden;display:flex;flex-direction:column;gap:3.2mm}
.p+.p{border-left:.2mm dashed #e5e5e5}
h2{font-size:13pt;line-height:1.2;color:var(--green-d);padding-left:3mm;border-left:1.4mm solid var(--gold)}
h3{font-size:9.5pt;color:var(--green-d);margin-top:1mm}
.muted{color:var(--muted)}.small{font-size:7.2pt}
.flag{position:absolute;left:0;right:0;bottom:0;height:2.2mm;background:linear-gradient(90deg,var(--green) 0 33.3%,var(--gold) 33.3% 66.6%,var(--red) 66.6%)}
/* cover */
.cover{background:radial-gradient(circle at 90% 8%,rgba(232,163,23,.4),transparent 40%),linear-gradient(160deg,var(--green-d),var(--green) 70%,#1d8a47);color:#fff;justify-content:space-between}
.cover .logo{width:24mm;height:24mm}
.cover h1{font-size:26pt;line-height:1.05;margin-top:5mm}
.cover .alt{font-size:13pt;color:var(--gold);font-weight:600;margin-top:1.5mm}
.cover .tag{font-size:10.5pt;opacity:.95;margin-top:3mm}
.cover .pillars{display:inline-block;margin-top:4mm;padding:1.5mm 3.5mm;border:.3mm solid rgba(255,255,255,.6);border-radius:10mm;font-size:8pt;font-weight:600;letter-spacing:.04em}
.browser{border-radius:2.5mm;overflow:hidden;background:#fff;box-shadow:0 2mm 6mm rgba(0,0,0,.35)}
.browser .bar{height:4mm;background:#eef1ea;display:flex;gap:1.2mm;align-items:center;padding-left:2mm}
.browser .bar i{width:1.6mm;height:1.6mm;border-radius:50%;background:#c9cfc4}
.browser img{display:block;width:100%}
.url{font-size:8pt;opacity:.9}
/* leader */
.portrait{display:flex;gap:4mm;align-items:center}
.portrait img{width:24mm;height:28mm;object-fit:cover;border-radius:2mm;background:var(--band)}
.portrait b{display:block;font-size:10pt}
.quote{font-size:30pt;color:var(--gold);line-height:.4;height:4mm;margin-top:2mm}
.msg p{margin-bottom:2mm;font-size:8.8pt}
.video{position:relative;border-radius:2mm;overflow:hidden;margin-top:auto}
.video img{display:block;width:100%}
.video span{position:absolute;right:4mm;bottom:5mm}
.video .play{width:12mm;height:12mm;border-radius:50%;background:rgba(232,163,23,.95);color:#fff;display:grid;place-items:center;font-size:12pt;padding-left:.8mm}
@media screen{.sheet{margin-bottom:12mm}}
/* back */
ol.steps{list-style:none;display:grid;gap:2.4mm}
ol.steps li{display:grid;grid-template-columns:7mm 1fr;gap:2.5mm;align-items:start}
ol.steps li>span{width:7mm;height:7mm;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;font-weight:700}
ol.steps b{display:block;color:var(--green-d)}
.contact{background:var(--band);border-radius:2.5mm;padding:3.5mm;display:grid;gap:1mm}
.qr{display:flex;gap:3.5mm;align-items:center;margin-top:auto}
.qr img{width:26mm;height:26mm}
/* inside */
.stats{display:grid;grid-template-columns:1fr 1fr;gap:2.2mm}
.stats div{background:var(--band);border-radius:2mm;padding:2.4mm 3mm}
.stats b{display:block;font-size:13pt;color:var(--green)}
.big{display:grid;grid-template-columns:1fr 1fr;gap:2.2mm}
.big div{border:.3mm solid var(--line);border-radius:2mm;padding:2.4mm 3mm}
.big b{display:block;font-size:14pt;color:var(--red)}
.sector{display:flex;align-items:center;gap:2.5mm;padding:1.3mm 0;border-bottom:.2mm solid var(--line)}
.sector i{width:3mm;height:3mm;border-radius:50%;flex:none}
.sector em{margin-left:auto;font-style:normal;font-weight:700;color:var(--muted)}
.wlist{display:grid;gap:1.6mm}
.w{display:grid;grid-template-columns:8mm 1fr auto;gap:2.5mm;align-items:center}
.w .dot{width:8mm;height:8mm;border-radius:2mm;color:#fff;display:grid;place-items:center;font-weight:700;font-size:10pt}
.w b{display:block;font-size:8.8pt;line-height:1.2}.w small{display:block;color:var(--muted);font-size:7pt;line-height:1.25}
.w em{font-style:normal;font-size:7pt;background:var(--band);border-radius:5mm;padding:.6mm 2mm;white-space:nowrap}
.opp{border:.3mm solid var(--line);border-left:1.2mm solid var(--c);border-radius:1.6mm;padding:2mm 2.8mm}
.opp b{display:block;font-size:8.8pt;line-height:1.25}
.opp small{color:var(--muted);font-size:7.2pt}
.annbox{background:var(--green-d);color:#fff;border-radius:2.5mm;padding:3.5mm;display:grid;gap:1.5mm}
.annbox h3{color:var(--gold);margin:0}
.annrow{display:grid;grid-template-columns:1fr 30mm;gap:3mm;align-items:center}
.phone{border:1.4mm solid #1c2a1f;border-radius:4mm;overflow:hidden;height:58mm;box-shadow:0 1.5mm 4mm rgba(0,0,0,.2)}
.phone img{display:block;width:100%;height:auto}
.ctab{margin-top:auto;background:var(--gold);color:#2b1d00;border-radius:2.5mm;padding:3mm 3.5mm;font-weight:700;display:flex;justify-content:space-between;align-items:center}
.shotsm{border-radius:2mm;overflow:hidden;border:.3mm solid var(--line)}
.shotsm img{display:block;width:100%}
</style></head><body>

<section class="sheet">
  <div class="p">
    <h2>${t.leaderH}</h2>
    <div class="portrait"><img src="${f("public/leader.svg")}"><div><b>${tx(leader.name)}</b><span class="muted">${tx(leader.title)}</span></div></div>
    <div class="quote">“</div>
    <div class="msg">${tx(leader.message).map((p) => `<p>${p}</p>`).join("")}</div>
    <div class="video"><img src="${f("public/video-poster.svg")}"><span><b class="play">▶</b></span></div>
    <p class="small muted">▶ ${t.watch}</p>
    <div class="flag"></div>
  </div>

  <div class="p">
    <h2>${t.howH}</h2>
    <ol class="steps">${t.steps.map(([h, d], i) => `<li><span>${i + 1}</span><div><b>${h}</b>${d}</div></li>`).join("")}</ol>
    <h3>${t.contactH}</h3>
    <div class="contact">
      <div><b>${tx(SITE.name)}</b></div>
      <div>${tx(SITE.contact.address)}</div>
      <div>☎ ${SITE.contact.phone}</div>
      <div>✉ ${SITE.contact.investmentDesk}</div>
    </div>
    <div class="qr"><img src="${qr}"><div><b>${t.scan}</b><div class="muted small">${SITE_URL.replace("https://", "")}</div></div></div>
    <p class="small muted">${t.demo}</p>
    <div class="flag"></div>
  </div>

  <div class="p cover">
    <div>
      <img class="logo" src="${f("public/logo.svg")}">
      <h1>${tx(SITE.name)}</h1>
      <div class="alt">${lang === "en" ? SITE.name.am : SITE.name.en}</div>
      <p class="tag">${tx(SITE.tagline)}</p>
      <span class="pillars">${t.pillars}</span>
    </div>
    <div class="browser"><div class="bar"><i></i><i></i><i></i></div><img src="${shot(`${lang}-home-hero.png`)}"></div>
    <div class="url">${SITE_URL.replace("https://", "")}</div>
    <div class="flag"></div>
  </div>
</section>

<section class="sheet">
  <div class="p">
    <h2>${t.whyH}</h2>
    <div class="stats">${stats.map((s) => `<div><b>${s.value}</b>${tx(s.label)}</div>`).join("")}</div>
    <h3>${t.keyH}</h3>
    <div class="big">
      <div><b>${opportunities.length}</b>${t.oppsN}</div>
      <div><b>${fmt(sum("landHa"))}</b>${t.haN}</div>
      <div><b>${fmt(sum("jobs"))}</b>${t.jobsN}</div>
      <div><b>${Math.round(sum("investmentUsdM"))}</b>${t.usdN}</div>
    </div>
    <h3>${t.sectorsH}</h3>
    <div>${bySector.map(([s, n]) => `<div class="sector"><i style="background:${s.color}"></i>${tx(s)}<em>${n}</em></div>`).join("")}</div>
    <div class="flag"></div>
  </div>

  <div class="p">
    <h2>${t.woredasH}</h2>
    <div class="wlist">${woredas.map((w) => `<div class="w"><span class="dot" style="background:hsl(${w.hue} 55% 36%)">${tx(w.name).slice(0, 1)}</span><div><b>${tx(w.name)}</b><small>${tx(w.tagline)}</small></div><em>${count(w.id)} ${t.oppsN}</em></div>`).join("")}</div>
    <div class="shotsm" style="margin-top:auto"><img src="${shot(`${lang}-woredas.png`)}"></div>
    <div class="flag"></div>
  </div>

  <div class="p">
    <h2>${t.featuredH}</h2>
    ${featured.map((o) => `<div class="opp" style="--c:${sectors[o.sector].color}"><b>${tx(o.title)}</b><small>📍 ${wname(o.woreda)} · ${fmt(o.landHa)} ${t.ha} · ${o.investmentUsdM} ${t.musd} · ${fmt(o.jobs)} ${t.jobs}</small></div>`).join("")}
    <div class="annrow"><div class="annbox"><h3>${t.annH}</h3><span>${t.annP}</span></div><div class="phone"><img src="${shot(`${lang}-mobile-announcements.png`)}"></div></div>
    <div class="ctab"><span>${t.cta} →</span><span class="small">${SITE_URL.replace("https://", "")}</span></div>
    <div class="flag"></div>
  </div>
</section>
</body></html>`;
}

const qr = await QRCode.toDataURL(SITE_URL, { margin: 0, width: 400, color: { dark: "#074a24", light: "#ffffff" } });
const b = await chromium.launch();
for (const lang of ["en", "am"]) {
  const file = path.join(OUT, `brochure-${lang}.html`);
  fs.writeFileSync(file, html(lang, qr));
  const p = await b.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(file).href);
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(OUT, `brochure-${lang}.pdf`), format: "A4", landscape: true, printBackground: true });
  // PNG previews of each side
  const sheets = p.locator(".sheet");
  for (let i = 0; i < 2; i++)
    await sheets.nth(i).screenshot({ path: path.join(OUT, `brochure-${lang}-${i ? "inside" : "outside"}.png`) });
  await p.close();
}
await b.close();
console.log("brochures done");
