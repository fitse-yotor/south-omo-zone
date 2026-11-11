// Renders a ~50s 1920x1080 promo video from the site screenshots.
// Each frame is rendered by seeking a paused Web Animations timeline, then piped to ffmpeg.
// Usage: node marketing/capture.cjs (first) && node marketing/video.mjs
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { opportunities, woredas } from "../src/data/mock.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "output");
const FPS = Number(process.env.FPS || 30);
const SITE_URL = (process.env.SITE_URL || "https://southomo.example.gov.et").replace("https://", "");
fs.mkdirSync(OUT, { recursive: true });

const f = (p) => pathToFileURL(path.join(ROOT, p)).href;
const s = (n) => pathToFileURL(path.join(HERE, "screenshots", n)).href;
const sum = (k) => opportunities.reduce((a, o) => a + o[k], 0);

const browser = (img, cls = "", url = SITE_URL) =>
  `<div class="browser ${cls}"><div class="bar"><i></i><i></i><i></i><span>${url}</span></div><div class="vp"><img src="${img}"></div></div>`;
const cap = (en, am, subEn, subAm) =>
  `<div class="cap"><h2>${en}</h2><h3>${am}</h3><p>${subEn}</p><p class="am">${subAm}</p></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
${["inter/400", "inter/600", "inter/700", "inter/800", "noto-sans-ethiopic/400", "noto-sans-ethiopic/700"]
  .map((x) => `<link rel="stylesheet" href="${f(`node_modules/@fontsource/${x}.css`)}">`).join("")}
<style>
:root{--green:#0b6b34;--green-d:#074a24;--gold:#e8a317;--red:#c8102e;--ink:#1c2a1f;--muted:#5b6b5f;--cream:#f6f5ee}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1920px;height:1080px;overflow:hidden;background:var(--cream);font-family:Inter,"Noto Sans Ethiopic",sans-serif;color:var(--ink)}
.am,h3{font-family:"Noto Sans Ethiopic",Inter,sans-serif}
.scene{position:absolute;inset:0;opacity:0;overflow:hidden}
.green{background:radial-gradient(circle at 85% 15%,rgba(232,163,23,.35),transparent 40%),linear-gradient(135deg,var(--green-d),var(--green) 65%,#1d8a47);color:#fff}
.flag{position:absolute;left:0;right:0;bottom:0;height:16px;background:linear-gradient(90deg,var(--green) 0 33.3%,var(--gold) 33.3% 66.6%,var(--red) 66.6%);transform-origin:left}
.green .flag{background:linear-gradient(90deg,#fff2 0 33.3%,var(--gold) 33.3% 66.6%,var(--red) 66.6%)}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.logo{width:210px;height:210px;filter:drop-shadow(0 12px 30px rgba(0,0,0,.3))}
h1{font-size:128px;font-weight:800;letter-spacing:-.02em;line-height:1.05;margin-top:34px}
.amt{font-family:"Noto Sans Ethiopic";font-size:66px;font-weight:700;color:var(--gold);margin-top:6px}
.tag{font-size:38px;opacity:.95;margin-top:24px}
.tag.am{font-size:32px;opacity:.8;margin-top:8px}
/* captions */
.cap{position:absolute;left:110px;top:50%;width:560px;transform:translateY(-50%)}
.cap h2{font-size:64px;line-height:1.08;font-weight:800;color:var(--green-d);letter-spacing:-.01em}
.cap h3{font-size:36px;color:var(--gold);margin-top:14px;line-height:1.3}
.cap p{font-size:28px;color:var(--muted);margin-top:26px;line-height:1.4}
.cap p.am{font-size:24px;margin-top:8px}
.cap::before{content:"";display:block;width:90px;height:10px;border-radius:5px;background:var(--gold);margin-bottom:30px}
/* browser frame */
.browser{position:absolute;left:720px;top:130px;width:1110px;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 30px 80px rgba(7,74,36,.25),0 0 0 1px #0001}
.browser .bar{height:44px;background:#eef1ea;display:flex;align-items:center;gap:9px;padding-left:18px}
.browser .bar i{width:13px;height:13px;border-radius:50%;background:#c9cfc4}
.browser .bar span{margin-left:22px;background:#fff;border-radius:20px;padding:5px 22px;font-size:16px;color:var(--muted)}
.browser .vp{height:694px;overflow:hidden}
.browser .vp img{display:block;width:100%;transform-origin:top left}
/* pillars + stats */
.pillars{position:absolute;top:210px;left:0;right:0;display:flex;justify-content:center;gap:40px}
.pillar{width:480px;background:#fff;border-radius:24px;padding:46px 44px;box-shadow:0 20px 60px rgba(7,74,36,.12);border-top:14px solid var(--c)}
.pillar b{display:block;font-size:56px;font-weight:800;color:var(--c)}
.pillar span{font-family:"Noto Sans Ethiopic";font-size:36px;color:var(--muted)}
.stats{position:absolute;top:640px;left:0;right:0;display:flex;justify-content:center;gap:40px}
.stat{width:340px;text-align:center}
#st2{width:400px}
#st2 b::after{content:" km²";font-size:46px;font-weight:700}
.stat b{display:block;white-space:nowrap;font-size:84px;font-weight:800;color:var(--green-d);line-height:1}
.stat span{display:block;font-size:26px;color:var(--muted);margin-top:10px}
.stat span.am{font-size:22px;margin-top:2px}
/* counters card */
.counters{position:absolute;right:80px;bottom:90px;background:var(--green-d);color:#fff;border-radius:22px;padding:30px 40px;display:flex;gap:46px;box-shadow:0 24px 60px rgba(0,0,0,.3)}
.counters b{display:block;font-size:54px;font-weight:800;color:var(--gold);line-height:1}
.counters span{font-size:20px;opacity:.9}
/* phones */
.phones{position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center;gap:70px}
.phone{width:330px;height:690px;border:14px solid #1c2a1f;border-radius:52px;overflow:hidden;background:#fff;box-shadow:0 30px 70px rgba(7,74,36,.3)}
.phone img{width:100%;display:block}
.toptitle{position:absolute;top:80px;left:0;right:0;text-align:center}
.toptitle h2{font-size:64px;font-weight:800;color:var(--green-d)}
.toptitle h3{font-size:34px;color:var(--gold);margin-top:6px}
.bug{position:absolute;right:46px;top:36px;display:flex;align-items:center;gap:12px;font-weight:700;color:var(--green-d);font-size:22px;opacity:0}
.bug img{width:46px;height:46px}
.contact{margin-top:46px;display:flex;gap:40px;font-size:28px;opacity:.95}
.url{margin-top:40px;font-size:40px;font-weight:700;background:var(--gold);color:#2b1d00;padding:14px 40px;border-radius:60px}
.demo{position:absolute;bottom:40px;left:0;right:0;text-align:center;font-size:18px;opacity:.6}
</style></head><body>

<section class="scene green" id="s1"><div class="center">
  <img class="logo" id="s1logo" src="${f("public/logo.svg")}">
  <h1 id="s1t">South Omo Zone</h1>
  <div class="amt" id="s1a">ደቡብ ኦሞ ዞን</div>
  <div class="tag" id="s1g">Where living culture meets fertile land</div>
  <div class="tag am" id="s1ga">ህያው ባህል ከለም መሬት የሚገናኝበት</div>
</div><div class="flag" id="s1f"></div></section>

<section class="scene" id="s2">
  <div class="pillars">
    <div class="pillar" id="p1" style="--c:#0b6b34"><b>Agriculture</b><span>ግብርና</span></div>
    <div class="pillar" id="p2" style="--c:#b7791f"><b>Investment</b><span>ኢንቨስትመንት</span></div>
    <div class="pillar" id="p3" style="--c:#c8102e"><b>Tourism</b><span>ቱሪዝም</span></div>
  </div>
  <div class="stats">
    <div class="stat" id="st1"><b data-count="${woredas.length}" data-start="7" data-dur="1.6">0</b><span>Woredas</span><span class="am">ወረዳዎች</span></div>
    <div class="stat" id="st2"><b data-count="23000" data-start="7.2" data-dur="1.6">0</b><span>Land area</span><span class="am">የቆዳ ስፋት</span></div>
    <div class="stat" id="st3"><b data-count="16" data-start="7.4" data-dur="1.6">0</b><span>Ethnic groups</span><span class="am">ብሔረሰቦች</span></div>
    <div class="stat" id="st4"><b data-count="1" data-start="7.6" data-dur="1">0</b><span>National park</span><span class="am">ብሔራዊ ፓርክ</span></div>
  </div>
  <div class="flag"></div>
</section>

<section class="scene" id="s3">
  ${cap("South Omo, online", "ደቡብ ኦሞ በዲጂታል ዓለም", "One bilingual website for investors, visitors and citizens.", "ለባለሀብቶች፣ ለጎብኚዎችና ለነዋሪዎች አንድ ባለሁለት ቋንቋ ድረ-ገጽ።")}
  ${browser(s("en-home-full.png"), "", SITE_URL)}
  <div class="flag"></div>
</section>

<section class="scene" id="s4">
  ${cap("A message from the Zone Administrator", "የዞኑ ዋና አስተዳዳሪ መልዕክት", "Photo, written message and video, in English and Amharic.", "ፎቶ፣ የጽሑፍ መልዕክትና ቪዲዮ በእንግሊዝኛና በአማርኛ።")}
  ${browser(s("en-leader.png"), "", SITE_URL)}
  <div class="flag"></div>
</section>

<section class="scene" id="s5">
  ${cap(`${woredas.length} woredas, each with its own page`, "እያንዳንዱ ወረዳ የራሱ ገጽ አለው", "Profile, key facts and investment opportunities for every woreda.", "ለእያንዳንዱ ወረዳ መገለጫ፣ ቁልፍ መረጃዎችና የኢንቨስትመንት ዕድሎች።")}
  ${browser(s("en-woredas.png"), "b1", SITE_URL + "/woredas")}
  ${browser(s("en-woreda-detail.png"), "b2", SITE_URL + "/woredas/male")}
  <div class="flag"></div>
</section>

<section class="scene" id="s6">
  ${cap("Opportunities ready for investors", "ለባለሀብቶች የተዘጋጁ ዕድሎች", "Search and filter by sector and woreda.", "በዘርፍና በወረዳ ይፈልጉ።")}
  ${browser(s("en-opportunities.png"), "b1", SITE_URL + "/opportunities")}
  ${browser(s("en-opportunities-tourism.png"), "b2", SITE_URL + "/opportunities")}
  <div class="counters" id="cnt">
    <div><b data-count="${opportunities.length}" data-start="32" data-dur="1.4">0</b><span>opportunities · ዕድሎች</span></div>
    <div><b data-count="${sum("landHa")}" data-start="32.2" data-dur="1.4">0</b><span>hectares · ሄክታር</span></div>
    <div><b data-count="${sum("jobs")}" data-start="32.4" data-dur="1.4">0</b><span>jobs · የሥራ ዕድሎች</span></div>
  </div>
  <div class="flag"></div>
</section>

<section class="scene" id="s7">
  ${cap("Vacancies & tenders", "ክፍት የሥራ ቦታዎችና ጨረታዎች", "Published with live deadlines and full requirements.", "ከመጨረሻ ቀንና ሙሉ መስፈርቶች ጋር ይወጣሉ።")}
  ${browser(s("en-announcements.png"), "b1", SITE_URL + "/announcements")}
  ${browser(s("en-tender-detail.png"), "b2", SITE_URL + "/announcements")}
  <div class="flag"></div>
</section>

<section class="scene" id="s8">
  <div class="toptitle"><h2>Made for every phone</h2><h3>English &amp; አማርኛ</h3></div>
  <div class="phones">
    <div class="phone" id="ph1"><img src="${s("en-mobile-home.png")}"></div>
    <div class="phone" id="ph2"><img src="${s("am-mobile-leader.png")}"></div>
    <div class="phone" id="ph3"><img src="${s("am-mobile-announcements.png")}"></div>
  </div>
  <div class="flag"></div>
</section>

<section class="scene green" id="s9"><div class="center">
  <img class="logo" id="s9logo" src="${f("public/logo.svg")}" style="width:160px;height:160px">
  <h1 id="s9t" style="font-size:104px">Invest in South Omo</h1>
  <div class="amt" id="s9a">በደቡብ ኦሞ ኢንቨስት ያድርጉ</div>
  <div class="url" id="s9u">${SITE_URL}</div>
  <div class="contact" id="s9c"><span>Jinka · ጂንካ</span><span>+251 46 775 0000</span></div>
</div><div class="demo">Demo video · sample data</div><div class="flag"></div></section>

<div class="bug" id="bug"><img src="${f("public/logo.svg")}">South Omo Zone</div>

<script>
const T = 50; // seconds
const ease = "cubic-bezier(.2,.7,.2,1)";
const $ = (q) => document.querySelector(q);
// K(el, [[time, style], ...]): one animation over the whole timeline, so values hold before/after each keyframe.
function K(el, frames) {
  if (typeof el === "string") el = $(el);
  const kf = frames.map(([t, st]) => ({ ...st, offset: Math.min(1, t / T), easing: ease }));
  if (kf[0].offset > 0) kf.unshift({ ...frames[0][1], offset: 0 });
  if (kf[kf.length - 1].offset < 1) kf.push({ ...frames[frames.length - 1][1], offset: 1 });
  el.animate(kf, { duration: T * 1000, fill: "both" }).pause();
}
const scene = (id, a, b, fade = 0.6) =>
  K(id, [[a, { opacity: 0 }], [a + fade, { opacity: 1 }], [b - fade, { opacity: 1 }], [b, { opacity: 0 }]]);
const rise = (el, t, d = 0.9, y = 60) => K(el, [[t, { opacity: 0, transform: \`translateY(\${y}px)\` }], [t + d, { opacity: 1, transform: "translateY(0)" }]]);
const slideIn = (el, t, d = 1, x = 200) => K(el, [[t, { opacity: 0, transform: \`translateX(\${x}px)\` }], [t + d, { opacity: 1, transform: "translateX(0)" }]]);

// 1 intro 0-5.4
scene("#s1", 0, 5.4, 0.01);
K("#s1logo", [[0.2, { opacity: 0, transform: "scale(.6) rotate(-12deg)" }], [1.2, { opacity: 1, transform: "scale(1) rotate(0)" }]]);
rise("#s1t", 0.8); rise("#s1a", 1.3); rise("#s1g", 1.9, 0.9, 30); rise("#s1ga", 2.2, 0.9, 30);
K("#s1f", [[0.4, { transform: "scaleX(0)" }], [2.4, { transform: "scaleX(1)" }]]);
// 2 pillars + stats 5-11
scene("#s2", 5, 11);
rise("#p1", 5.3); rise("#p2", 5.6); rise("#p3", 5.9);
["#st1", "#st2", "#st3", "#st4"].forEach((q, i) => rise(q, 6.8 + i * 0.2, 0.8, 30));
// 3 home 10.6-17
scene("#s3", 10.6, 17);
K("#s3 .cap", [[10.9, { opacity: 0, transform: "translate(-60px,-50%)" }], [11.8, { opacity: 1, transform: "translate(0,-50%)" }]]);
slideIn("#s3 .browser", 11, 1.1);
K("#s3 .vp img", [[12.3, { transform: "translateY(0)" }], [16.6, { transform: "translateY(-38%)" }]]);
// 4 leader 16.6-22.5
scene("#s4", 16.6, 22.5);
K("#s4 .cap", [[16.9, { opacity: 0, transform: "translate(-60px,-50%)" }], [17.8, { opacity: 1, transform: "translate(0,-50%)" }]]);
slideIn("#s4 .browser", 17, 1.1);
K("#s4 .vp img", [[18.5, { transform: "scale(1) translateY(0)" }], [22.3, { transform: "scale(1.04) translateY(-14%)" }]]);
// 5 woredas 22.1-29
scene("#s5", 22.1, 29);
K("#s5 .cap", [[22.4, { opacity: 0, transform: "translate(-60px,-50%)" }], [23.3, { opacity: 1, transform: "translate(0,-50%)" }]]);
slideIn("#s5 .b1", 22.5, 1.1);
K("#s5 .b2", [[25.4, { opacity: 0, transform: "translate(120px,90px) scale(.92)" }], [26.4, { opacity: 1, transform: "translate(60px,50px) scale(.92)" }]]);
// 6 opportunities 28.6-35.5
scene("#s6", 28.6, 35.5);
K("#s6 .cap", [[28.9, { opacity: 0, transform: "translate(-60px,-50%)" }], [29.8, { opacity: 1, transform: "translate(0,-50%)" }]]);
slideIn("#s6 .b1", 29, 1.1);
K("#s6 .b2", [[30.6, { opacity: 0 }], [31.2, { opacity: 1 }]]);
K("#cnt", [[31.6, { opacity: 0, transform: "translateY(60px)" }], [32.4, { opacity: 1, transform: "translateY(0)" }]]);
// 7 announcements 35.1-41.5
scene("#s7", 35.1, 41.5);
K("#s7 .cap", [[35.4, { opacity: 0, transform: "translate(-60px,-50%)" }], [36.3, { opacity: 1, transform: "translate(0,-50%)" }]]);
slideIn("#s7 .b1", 35.5, 1.1);
K("#s7 .b2", [[38.2, { opacity: 0, transform: "scale(.97)" }], [38.9, { opacity: 1, transform: "scale(1)" }]]);
// 8 phones 41.1-46.4
scene("#s8", 41.1, 46.4);
rise("#s8 .toptitle", 41.3, 0.8, 30);
["#ph1", "#ph2", "#ph3"].forEach((q, i) => rise(q, 41.6 + i * 0.25, 1, 160));
// 9 outro 46-50
scene("#s9", 46, 50.01, 0.6);
K("#s9logo", [[46.3, { opacity: 0, transform: "scale(.6)" }], [47.1, { opacity: 1, transform: "scale(1)" }]]);
rise("#s9t", 46.6); rise("#s9a", 46.9); rise("#s9u", 47.3, 0.8, 30); rise("#s9c", 47.6, 0.8, 30);
// watermark during the screenshot scenes
K("#bug", [[11, { opacity: 0 }], [11.8, { opacity: 1 }], [45.6, { opacity: 1 }], [46.2, { opacity: 0 }]]);

const counters = [...document.querySelectorAll("[data-count]")];
window.seek = (t) => {
  document.getAnimations().forEach((a) => (a.currentTime = t * 1000));
  for (const c of counters) {
    const p = Math.max(0, Math.min(1, (t - +c.dataset.start) / +c.dataset.dur));
    const e = 1 - Math.pow(1 - p, 3);
    c.textContent = Math.round(+c.dataset.count * e).toLocaleString("en-US") + (c.dataset.suffix || "");
  }
};
window.DURATION = T;
</script></body></html>`;

const file = path.join(OUT, "promo.html");
fs.writeFileSync(file, html);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(pathToFileURL(file).href);
await p.evaluate(() => document.fonts.ready);
await p.waitForLoadState("networkidle");
const T = await p.evaluate(() => window.DURATION);

const mp4 = path.join(OUT, "south-omo-promo.mp4");
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
  "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], { stdio: ["pipe", "inherit", "inherit"] });

const frames = Math.round(T * FPS);
for (let i = 0; i < frames; i++) {
  const t = i / FPS;
  await p.evaluate((t) => window.seek(t), t);
  const buf = await p.screenshot({ type: "jpeg", quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  // a few stills for review
  if ([2.5, 8.5, 14, 20, 27, 33.5, 39.5, 44, 48.5].some((x) => Math.abs(x - t) < 0.5 / FPS))
    fs.writeFileSync(path.join(OUT, `promo-still-${String(Math.round(t * 10)).padStart(3, "0")}.jpg`), buf);
  if (i % 300 === 0) console.log(`frame ${i}/${frames}`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await b.close();
console.log("video:", mp4);
