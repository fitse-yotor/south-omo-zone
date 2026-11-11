// Builds an A4 landscape tri-fold brochure (English and Amharic editions) from the site's content, photos and screenshots.
// Usage: node marketing/capture.cjs && node marketing/brochure.mjs
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs";
import path from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import QRCode from "qrcode";
import { Sprout, Beef, Factory, Fish, Binoculars, Sun, MapPin, Phone, Mail, Globe, Play, Clock, Briefcase } from "lucide-react";
import { zone, facts, leader, sectors, woredas, attractions, markets, investSteps, peoples, peoplesAm } from "../src/data/content.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "output");
const SITE_URL = process.env.SITE_URL || "https://southomo.gov.et";
const SITE = SITE_URL.replace(/^https?:\/\//, "");
fs.mkdirSync(OUT, { recursive: true });

const f = (p) => pathToFileURL(path.join(ROOT, p)).href;
const photo = (id) => f(`public/images/${id}.jpg`);
const shot = (n) => pathToFileURL(path.join(HERE, "screenshots", n)).href;
const ICONS = { Sprout, Beef, Factory, Fish, Binoculars, Sun };
const icon = (I, size = 14, extra = {}) => renderToStaticMarkup(React.createElement(I, { size, strokeWidth: 1.8, ...extra }));
const credits = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/credits.json"), "utf8"));

const T = {
  en: {
    pillars: ["Investment", "Agriculture", "Tourism"],
    leaderH: "A message from the Chief Administrator",
    watch: "Watch the video message on our portal",
    portalH: "Everything online, in English and Amharic",
    portalP: "Woreda profiles, investment opportunities, vacancies and tenders with live deadlines, and travel information.",
    scan: "Scan to open the portal",
    contactH: "Contact us",
    whyH: "Why South Omo",
    peoplesH: "Peoples of South Omo",
    sectorsH: "Six sectors ready for investment",
    stepsH: "How to invest",
    woredasH: "Eight woredas",
    tourismH: "Discover the valley",
    marketsH: "Weekly markets",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    commit: "We ask every investor to consult communities, hire locally and protect the Omo River and Lake Turkana.",
    annH: "Vacancies & tenders", annP: "Job vacancies and procurement tenders are published on the portal with deadlines and full requirements.",
    sample: "Contact details are placeholders until confirmed by the zone office.",
    photos: "Photos: Wikimedia Commons contributors, CC BY / CC BY-SA. Full credits on the portal.",
  },
  am: {
    pillars: ["ኢንቨስትመንት", "ግብርና", "ቱሪዝም"],
    leaderH: "የዋና አስተዳዳሪው መልዕክት",
    watch: "የቪዲዮ መልዕክቱን በፖርታላችን ይመልከቱ",
    portalH: "ሁሉም መረጃ በኦንላይን፣ በአማርኛና በእንግሊዝኛ",
    portalP: "የወረዳ መገለጫዎች፣ የኢንቨስትመንት ዕድሎች፣ የመጨረሻ ቀናቸው የሚታይ ክፍት የሥራ ቦታዎችና ጨረታዎች እንዲሁም የጉዞ መረጃ።",
    scan: "ፖርታሉን ለመክፈት ይቃኙ",
    contactH: "ያግኙን",
    whyH: "ለምን ደቡብ ኦሞ",
    peoplesH: "የደቡብ ኦሞ ሕዝቦች",
    sectorsH: "ለኢንቨስትመንት ዝግጁ ስድስት ዘርፎች",
    stepsH: "እንዴት ኢንቨስት ያደርጋሉ",
    woredasH: "ስምንቱ ወረዳዎች",
    tourismH: "ሸለቆውን ይጎብኙ",
    marketsH: "ሳምንታዊ ገበያዎች",
    days: ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"],
    commit: "እያንዳንዱ ባለሀብት ማህበረሰቡን እንዲያማክር፣ ከአካባቢው እንዲቀጥርና የኦሞ ወንዝንና የቱርካና ሐይቅን እንዲጠብቅ እንጠይቃለን።",
    annH: "ክፍት የሥራ ቦታዎችና ጨረታዎች", annP: "የሥራ ማስታወቂያዎችና የግዥ ጨረታዎች ከመጨረሻ ቀናቸውና ሙሉ መስፈርቶቻቸው ጋር በፖርታሉ ላይ ይወጣሉ።",
    sample: "የአድራሻ መረጃዎቹ በዞኑ ጽ/ቤት እስኪረጋገጡ ድረስ ጊዜያዊ ናቸው።",
    photos: "ፎቶዎች፦ የዊኪሚዲያ ኮመንስ አበርካቾች፣ CC BY / CC BY-SA። ሙሉ ምስጋና በፖርታሉ ላይ።",
  },
};

function html(lang, qr) {
  const t = T[lang];
  const tx = (o) => (o && typeof o === "object" && !Array.isArray(o) ? o[lang] : o);
  const am = lang === "am";
  const credit = (id) => { const c = credits.find((x) => x.id === id); return c ? `© ${c.author} · ${c.license}` : ""; };
  const tour = ["lower-omo", "mago", "hamer"].map((id) => attractions.find((a) => a.id === id));

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
${["inter/400", "inter/500", "inter/600", "playfair-display/400", "playfair-display/400-italic", "playfair-display/500", "noto-sans-ethiopic/400", "noto-sans-ethiopic/600", "noto-serif-ethiopic/400", "noto-serif-ethiopic/600"]
  .map((x) => `<link rel="stylesheet" href="${f(`node_modules/@fontsource/${x}.css`)}">`).join("")}
<style>
@page{size:A4 landscape;margin:0}
:root{--r9:#142a5c;--r95:#0b1a3d;--r7:#22459a;--r6:#2a55bd;--r4:#5286fe;--r1:#dce6ff;--r05:#eef3ff;--sun:#e0a82e;--sun4:#f2c94c;--leaf:#2a9104;--ember:#c8372d;--ink:#151b2c;--soft:#4a5268;--mute:#7a8296;--sand:#f5f0e7;--sand2:#e9e0d0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${am ? '"Noto Sans Ethiopic",Inter' : 'Inter,"Noto Sans Ethiopic"'},sans-serif;color:var(--ink);font-size:${am ? "7.9pt" : "8.2pt"};line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.serif{font-family:${am ? '"Noto Serif Ethiopic","Playfair Display"' : '"Playfair Display","Noto Serif Ethiopic"'},serif}
.sheet{width:297mm;height:210mm;display:grid;grid-template-columns:repeat(3,99mm);page-break-after:always;overflow:hidden;background:#fbf8f3}
@media screen{.sheet{margin-bottom:10mm}}
.p{position:relative;padding:12mm 9mm 10mm;overflow:hidden;display:flex;flex-direction:column}
.eyebrow{display:flex;align-items:center;gap:2.5mm;font-size:${am ? "7pt" : "6.2pt"};font-weight:600;letter-spacing:${am ? "0" : ".22em"};text-transform:uppercase;color:var(--r6)}
.eyebrow::before{content:"";width:7mm;height:.3mm;background:currentColor}
h2{font-size:${am ? "14.5pt" : "16pt"};line-height:1.15;font-weight:400;color:var(--r95);margin-top:2.5mm}
h3{font-size:${am ? "7pt" : "6.2pt"};font-weight:600;letter-spacing:${am ? "0" : ".18em"};text-transform:uppercase;color:var(--r6);margin:4.5mm 0 2mm}
.mute{color:var(--mute)}.soft{color:var(--soft)}
.img{background-size:cover;background-position:center;border-radius:2.5mm}
.rings{position:absolute;pointer-events:none}
/* cover */
.cover{padding:0;color:#fff;background:var(--r95)}
.cover .bg{position:absolute;inset:0;background:url(${photo("turmi-hills")}) center/cover}
.cover .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,26,61,.55) 0%,rgba(11,26,61,.15) 35%,rgba(11,26,61,.85) 72%,#0b1a3d 100%)}
.cover .in{position:relative;height:100%;display:flex;flex-direction:column;padding:11mm 9mm 9mm}
.cover .top{display:flex;align-items:center;gap:3mm;font-size:6.6pt;color:rgba(255,255,255,.85)}
.cover .top img{width:13mm;height:13mm;border-radius:50%;background:#fff;padding:.4mm}
.cover h1{margin-top:auto;font-size:${am ? "30pt" : "33pt"};line-height:1;font-weight:400}
.cover .alt{font-size:${am ? "12pt" : "13pt"};color:var(--sun4);margin-top:2mm}
.cover .tag{font-size:${am ? "10pt" : "11pt"};font-style:${am ? "normal" : "italic"};margin-top:4mm;color:rgba(255,255,255,.9);max-width:70mm;line-height:1.35}
.cover .pills{display:flex;gap:1.5mm;margin-top:6mm}
.cover .pills span{border:.25mm solid rgba(255,255,255,.45);border-radius:10mm;padding:1mm 3mm;font-size:${am ? "7pt" : "6.4pt"};letter-spacing:${am ? "0" : ".08em"};text-transform:uppercase}
.cover .foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:7mm;padding-top:3mm;border-top:.25mm solid rgba(255,255,255,.2);font-size:6.4pt;color:rgba(255,255,255,.7)}
.cover .credit{position:absolute;right:3mm;top:3mm;font-size:5pt;color:rgba(255,255,255,.55);writing-mode:vertical-rl}
/* leader */
.leader{background:linear-gradient(160deg,#2a55bd,#142a5c 75%);color:#fff}
.leader .eyebrow{color:var(--sun4)}
.leader h2{color:#fff}
.leader .seal{display:flex;align-items:center;gap:3mm;margin-top:6mm}
.leader .seal img{width:16mm;height:16mm;border-radius:50%;background:#fff;padding:.5mm}
.leader .q{font-size:26pt;line-height:.6;color:var(--sun4);margin-top:6mm;height:5mm}
.leader .ex{font-size:${am ? "10pt" : "11.2pt"};line-height:1.45;font-style:${am ? "normal" : "italic"};margin-top:2mm}
.leader .body{margin-top:4mm;color:rgba(255,255,255,.78);font-size:${am ? "7.4pt" : "7.7pt"}}
.leader .body p+p{margin-top:2mm}
.leader .watch{margin-top:auto;display:flex;align-items:center;gap:3mm;background:rgba(255,255,255,.1);border:.25mm solid rgba(255,255,255,.18);border-radius:3mm;padding:2.5mm 3mm;font-weight:600}
.leader .watch i{display:grid;place-items:center;width:8mm;height:8mm;border-radius:50%;background:var(--sun4);color:var(--r95)}
/* back */
.phone{width:34mm;height:48mm;border:1.6mm solid #151b2c;border-radius:5mm;overflow:hidden;background:#fff;box-shadow:0 3mm 8mm rgba(11,26,61,.25);flex:none}
.phone img{width:100%;display:block}
.portal{display:flex;gap:4mm;align-items:center;margin-top:5mm}
.qr{display:flex;align-items:center;gap:3mm;margin-top:4mm;background:#fff;border-radius:3mm;padding:2.5mm;border:.25mm solid var(--sand2)}
.qr img{width:20mm;height:20mm}
.contact{display:grid;gap:1.6mm;margin-top:1mm}
.contact div{display:flex;gap:2mm;align-items:flex-start}
.contact svg{color:var(--r6);flex:none;margin-top:.5mm}
.fine{margin-top:auto;font-size:5.6pt;color:var(--mute);line-height:1.4}
/* inside */
.facts{display:grid;grid-template-columns:1fr 1fr;gap:2mm;margin-top:4mm}
.facts div{background:#fff;border-radius:2.5mm;padding:2.6mm 3mm;border:.25mm solid var(--sand2)}
.facts b{display:block;font-size:15pt;font-weight:400;color:var(--r7);line-height:1.1}
.facts span{font-size:${am ? "6.6pt" : "6.6pt"};color:var(--soft);line-height:1.3;display:block;margin-top:.8mm}
.chips{display:flex;flex-wrap:wrap;gap:1.2mm}
.chips span{background:#fff;border:.25mm solid var(--r1);color:var(--r7);border-radius:5mm;padding:.5mm 2.2mm;font-size:6.4pt}
.sector{display:grid;grid-template-columns:15mm 1fr;gap:3mm;align-items:center;padding:1.7mm 0;border-bottom:.25mm solid var(--sand2)}
.sector .img{height:11mm;border-radius:2mm}
.sector b{display:flex;align-items:center;gap:1.5mm;font-size:${am ? "8pt" : "8.4pt"};color:var(--r95)}
.sector b svg{color:var(--r6)}
.sector p{font-size:${am ? "6.4pt" : "6.6pt"};color:var(--soft);line-height:1.35;margin-top:.4mm;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
ol.steps{list-style:none;display:grid;gap:1.4mm}
ol.steps li{display:grid;grid-template-columns:5mm 1fr;gap:2mm;align-items:start;font-size:${am ? "6.8pt" : "7pt"}}
ol.steps li>span{display:grid;place-items:center;width:5mm;height:5mm;border-radius:50%;background:var(--r6);color:#fff;font-size:6.5pt}
ol.steps b{color:var(--r95)}
.commit{margin-top:auto;background:var(--r05);border-left:1mm solid var(--leaf);border-radius:1.5mm;padding:2.2mm 3mm;font-size:${am ? "6.6pt" : "6.8pt"};color:var(--r9)}
.wgrid{display:grid;grid-template-columns:1fr 1fr;gap:1.6mm 3mm}
.w b{display:block;font-size:${am ? "8.2pt" : "8.6pt"};font-weight:400;color:var(--r95)}
.w small{display:flex;align-items:center;gap:.8mm;font-size:6pt;color:var(--mute)}
.tour{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.8mm}
.tour div{position:relative;height:26mm;border-radius:2.2mm;overflow:hidden;background-size:cover;background-position:center}
.tour div::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 35%,rgba(11,26,61,.9))}
.tour span{position:absolute;left:2mm;right:2mm;bottom:1.8mm;z-index:1;color:#fff;font-size:${am ? "6.6pt" : "6.8pt"};line-height:1.2}
.mk{width:100%;border-collapse:collapse;font-size:6.2pt}
.mk th{font-weight:500;color:var(--mute);padding-bottom:1mm}
.mk td{border-top:.25mm solid var(--sand2);padding:1.3mm 0;text-align:center}
.mk td:first-child{text-align:left;color:var(--r95);font-weight:600}
.dot{display:inline-block;width:2.2mm;height:2.2mm;border-radius:50%;background:var(--r6)}
.band{position:absolute;left:0;right:0;bottom:0;height:1.6mm;background:linear-gradient(90deg,var(--r6),var(--sun),var(--leaf))}
</style></head><body>

<section class="sheet">
  <div class="p leader">
    <svg class="rings" style="right:-30mm;top:-30mm;width:90mm;height:90mm;color:rgba(255,255,255,.07)" viewBox="0 0 400 400" fill="none" stroke="currentColor"><circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="160" stroke-dasharray="2 10"/><circle cx="200" cy="200" r="130"/><circle cx="200" cy="200" r="100" stroke-width="18" stroke-dasharray="6 9"/></svg>
    <span class="eyebrow">${tx(zone.admin)}</span>
    <h2 class="serif">${t.leaderH}</h2>
    <div class="q serif">“</div>
    <p class="ex serif">${tx(leader.excerpt)}</p>
    <div class="body">${tx(leader.message).slice(1, 3).map((p) => `<p>${p}</p>`).join("")}</div>
    <div class="seal"><img src="${f("public/brand/logo.png")}"><div><b class="serif" style="font-size:9.5pt;font-weight:400">${tx(leader.name)}</b><div style="font-size:6.6pt;color:rgba(255,255,255,.65)">${tx(leader.title)}</div></div></div>
    <div class="watch" style="margin-top:5mm"><i>${icon(Play, 12, { fill: "currentColor" })}</i>${t.watch}</div>
  </div>

  <div class="p">
    <span class="eyebrow">${SITE}</span>
    <h2 class="serif">${t.portalH}</h2>
    <div class="portal">
      <div class="phone"><img src="${shot(`${lang}-mobile-home.png`)}"></div>
      <p class="soft">${t.portalP}</p>
    </div>
    <div class="qr"><img src="${qr}"><div><b style="color:var(--r95)">${t.scan}</b><div class="mute" style="font-size:6.6pt">${SITE}</div></div></div>
    <h3>${t.contactH}</h3>
    <div class="contact">
      <div>${icon(MapPin, 11)}<span>${tx(zone.contact.address)}</span></div>
      <div>${icon(Phone, 11)}<span>${zone.contact.phone}</span></div>
      <div>${icon(Mail, 11)}<span>${zone.contact.invest}</span></div>
      <div>${icon(Globe, 11)}<span>${SITE}</span></div>
      <div>${icon(Clock, 11)}<span>${tx(zone.contact.hours)}</span></div>
    </div>
    <p class="fine">${t.sample}<br>${t.photos}</p>
    <div class="band"></div>
  </div>

  <div class="p cover">
    <div class="bg"></div><div class="shade"></div>
    <span class="credit">${credit("turmi-hills")}</span>
    <div class="in">
      <div class="top"><img src="${f("public/brand/logo.png")}"><span>${tx(zone.region)}<br><b style="color:#fff">${tx(zone.admin)}</b></span></div>
      <h1 class="serif">${tx(zone.name)}</h1>
      <div class="alt serif">${am ? zone.name.en : zone.name.am}</div>
      <p class="tag serif">${tx(zone.tagline)}</p>
      <div class="pills">${t.pillars.map((x) => `<span>${x}</span>`).join("")}</div>
      <div class="foot"><span>${tx(zone.capital)} · ${SITE}</span><span>2026</span></div>
    </div>
  </div>
</section>

<section class="sheet">
  <div class="p">
    <span class="eyebrow">${t.whyH}</span>
    <h2 class="serif">${tx(zone.tagline)}</h2>
    <p class="soft" style="margin-top:3mm">${tx(zone.intro)}</p>
    <div class="facts">${facts.map((x) => `<div><b class="serif">${x.value}</b><span>${tx(x.label)}</span></div>`).join("")}</div>
    <div class="img" style="height:${am ? 30 : 34}mm;margin-top:4mm;background-image:url(${photo("omo-river-omorate")})"></div>
    <h3>${t.peoplesH}</h3>
    <div class="chips">${(am ? peoplesAm : peoples).map((x) => `<span>${x}</span>`).join("")}</div>
    <div class="band"></div>
  </div>

  <div class="p">
    <span class="eyebrow">${am ? "ኢንቨስትመንት" : "Invest"}</span>
    <h2 class="serif">${t.sectorsH}</h2>
    <div style="margin-top:2.5mm">${sectors.map((s) => `<div class="sector"><div class="img" style="background-image:url(${photo(s.image)})"></div><div><b>${icon(ICONS[s.icon], 10)}${tx(s.title)}</b><p>${tx(s.text)}</p></div></div>`).join("")}</div>
    <h3>${t.stepsH}</h3>
    <ol class="steps">${investSteps[lang].map(([h, d], i) => `<li><span>${i + 1}</span><div><b>${h}.</b> <span class="soft">${d.split(/[.።;]/)[0]}${am ? "።" : "."}</span></div></li>`).join("")}</ol>
    <p class="commit" style="margin-top:3mm">${t.commit}</p>
    <div class="band"></div>
  </div>

  <div class="p">
    <span class="eyebrow">${t.woredasH}</span>
    <h2 class="serif">${am ? "ወረዳዎችና መስህቦች" : "Woredas & destinations"}</h2>
    <div class="wgrid" style="margin-top:3.5mm">${woredas.map((w) => `<div class="w"><b class="serif">${tx(w.name)}</b><small>${w.seat ? icon(MapPin, 7) + tx(w.seat) : tx(w.peoples)}</small></div>`).join("")}</div>
    <h3>${t.tourismH}</h3>
    <div class="tour">${tour.map((a) => `<div style="background-image:url(${photo(a.image)})"><span class="serif">${tx(a.title)}</span></div>`).join("")}</div>
    <h3>${t.marketsH}</h3>
    <table class="mk"><tr><th></th>${t.days.map((d) => `<th>${am ? d.slice(0, 3) : d}</th>`).join("")}</tr>
      ${markets.map((m) => `<tr><td>${tx(m.place)}</td>${[0, 1, 2, 3, 4, 5, 6].map((k) => `<td>${m.days.includes(k) ? '<span class="dot"></span>' : ""}</td>`).join("")}</tr>`).join("")}</table>
    <div style="margin-top:auto;display:flex;gap:3mm;align-items:flex-start;background:#fff;border:.25mm solid var(--sand2);border-radius:3mm;padding:3mm">
      <span style="color:var(--sun);flex:none">${icon(Briefcase, 14)}</span>
      <div><b style="color:var(--r95)">${t.annH}</b><div class="soft" style="font-size:6.8pt;margin-top:.6mm">${t.annP}</div></div>
    </div>
    <div style="margin-top:2.5mm;display:flex;align-items:center;justify-content:space-between;background:var(--r6);color:#fff;border-radius:3mm;padding:3mm 3.5mm">
      <span class="serif" style="font-size:${am ? "9pt" : "10pt"}">${am ? "የኢንቨስትመንት ጽ/ቤቱን ያነጋግሩ" : "Talk to our investment desk"}</span>
      <span style="font-size:6.6pt;opacity:.85">${zone.contact.invest}</span>
    </div>
    <div class="band"></div>
  </div>
</section>
</body></html>`;
}

const qr = await QRCode.toDataURL(SITE_URL, { margin: 0, width: 400, color: { dark: "#0b1a3d", light: "#ffffff" } });
const b = await chromium.launch();
for (const lang of ["en", "am"]) {
  const file = path.join(OUT, `brochure-${lang}.html`);
  fs.writeFileSync(file, html(lang, qr));
  const p = await b.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(file).href);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForLoadState("networkidle");
  await p.pdf({ path: path.join(OUT, `brochure-${lang}.pdf`), format: "A4", landscape: true, printBackground: true });
  const sheets = p.locator(".sheet");
  for (let i = 0; i < 2; i++) await sheets.nth(i).screenshot({ path: path.join(OUT, `brochure-${lang}-${i ? "inside" : "outside"}.png`) });
  // overflow check: any panel whose content is taller than the panel
  const over = await p.evaluate(() => [...document.querySelectorAll(".p")].map((el, i) => el.scrollHeight - el.clientHeight).map((d, i) => (d > 1 ? i : -1)).filter((i) => i >= 0));
  console.log(lang, over.length ? `OVERFLOW in panels ${over}` : "fits");
  await p.close();
}
await b.close();
