// Renders the 60 s promo film (1920x1080, 30 fps) in English and Amharic editions, with an original music bed.
// Each frame is drawn by seeking a paused Web Animations timeline in Chromium, then piped to ffmpeg.
// Usage: node marketing/capture.cjs && node marketing/video.mjs [en|am ...]
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import { spawn, execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Sprout, Beef, Factory, Fish, Binoculars, Sun, MapPin, Globe, Phone, Play } from "lucide-react";
import { zone, facts, leader, sectors, woredas } from "../src/data/content.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "output");
const FPS = Number(process.env.FPS || 30);
const T = 60;
const SITE = (process.env.SITE_URL || "https://southomo.gov.et").replace(/^https?:\/\//, "");
const LANGS = process.argv.slice(2).length ? process.argv.slice(2) : ["en", "am"];
fs.mkdirSync(OUT, { recursive: true });

const f = (p) => pathToFileURL(path.join(ROOT, p)).href;
const photo = (id) => f(`public/images/${id}.jpg`);
const shot = (n) => pathToFileURL(path.join(HERE, "screenshots", n)).href;
const ICONS = { Sprout, Beef, Factory, Fish, Binoculars, Sun };
const icon = (I, size = 28) => renderToStaticMarkup(React.createElement(I, { size, strokeWidth: 1.6 }));
const credits = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/credits.json"), "utf8"));
const credit = (id) => { const c = credits.find((x) => x.id === id); return c ? `© ${c.author} · ${c.license} · Wikimedia Commons` : ""; };

// Copy written for the film. Each line exists in both languages; the edition's language is primary, the other is the subtitle.
const C = {
  region: zone.region,
  hero: zone.tagline,
  heroSub: { en: "From cool highlands to the shores of Lake Turkana", am: "ከቀዝቃዛው ደጋ እስከ ቱርካና ሐይቅ ዳርቻ" },
  factsH: { en: "A land of firsts", am: "የብዙ ቀዳሚነቶች ምድር" },
  leaderH: { en: "A message from the Chief Administrator", am: "የዋና አስተዳዳሪው መልዕክት" },
  sectorsH: { en: "Six sectors ready for investment", am: "ለኢንቨስትመንት ዝግጁ ስድስት ዘርፎች" },
  woredasH: { en: "Eight woredas, each with its own strengths", am: "የየራሳቸው ጥንካሬ ያላቸው ስምንት ወረዳዎች" },
  tour: [
    { id: "lower-omo-aerial", h: { en: "Lower Valley of the Omo", am: "የታችኛው ኦሞ ሸለቆ" }, s: { en: "UNESCO World Heritage Site since 1980", am: "ከ1980 ጀምሮ በዩኔስኮ የተመዘገበ የዓለም ቅርስ" } },
    { id: "omo-savanna", h: { en: "Mago National Park", am: "የማጎ ብሔራዊ ፓርክ" }, s: { en: "Buffalo, giraffe and elephant on open savanna", am: "ጎሽ፣ ቀጭኔና ዝሆን በሰፊው ሳቫና" } },
    { id: "hamer-ceremony", h: { en: "Living heritage", am: "ህያው ቅርስ" }, s: { en: "More than fifteen peoples, markets and ceremonies", am: "ከአሥራ አምስት በላይ ሕዝቦች፣ ገበያዎችና ሥነ ሥርዓቶች" } },
  ],
  portalH: { en: "One portal, two languages", am: "አንድ ፖርታል፣ ሁለት ቋንቋዎች" },
  portalS: { en: "Woredas, opportunities and travel information in English and Amharic", am: "ወረዳዎች፣ ዕድሎችና የጉዞ መረጃ በአማርኛና በእንግሊዝኛ" },
  noticeH: { en: "Vacancies & tenders", am: "ክፍት የሥራ ቦታዎችና ጨረታዎች" },
  noticeS: { en: "Published with live deadlines and full requirements", am: "ከመጨረሻ ቀንና ሙሉ መስፈርቶች ጋር ይወጣሉ" },
  outroH: { en: "Invest in South Omo", am: "በደቡብ ኦሞ ኢንቨስት ያድርጉ" },
  outroS: { en: "Grow with our communities", am: "ከማህበረሰቦቻችን ጋር ያድጉ" },
  photos: { en: "Photography: Wikimedia Commons contributors (CC BY / CC BY-SA). Music: original composition.", am: "ፎቶዎች፦ የዊኪሚዲያ ኮመንስ አበርካቾች (CC BY / CC BY-SA)። ሙዚቃ፦ ኦሪጅናል ቅንብር።" },
};

function page(lang) {
  const other = lang === "en" ? "am" : "en";
  const P = (o) => o[lang], S = (o) => o[other];
  const words = (text, cls = "") => `<span class="words ${cls}">${text.split(/\s+/).map((w) => `<span class="wd"><span>${w}</span></span>`).join(" ")}</span>`;
  const amP = lang === "am";
  const sec = sectors.map((s, i) => `
    <section class="scene" id="sec${i}">
      <div class="photo"><img src="${photo(s.image)}"></div><div class="shade side"></div>
      <div class="sector-card">
        <div class="ico">${icon(ICONS[s.icon], 34)}</div>
        <div class="num">0${i + 1} / 06</div>
        <h2 class="serif">${words(P(s.title))}</h2>
        <p class="sub">${S(s.title)}</p>
      </div>
      <div class="credit">${credit(s.image)}</div>
    </section>`).join("");
  const tour = C.tour.map((x, i) => `
    <section class="scene" id="tour${i}">
      <div class="photo"><img src="${photo(x.id)}"></div><div class="shade bottom"></div>
      <div class="lower">
        <span class="kicker">${String(i + 1).padStart(2, "0")} / 03</span>
        <h2 class="serif big">${words(P(x.h))}</h2>
        <p class="lead">${P(x.s)}</p><p class="sub">${S(x.h)} · ${S(x.s)}</p>
      </div>
      <div class="credit">${credit(x.id)}</div>
    </section>`).join("");

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
${["inter/400", "inter/500", "inter/600", "playfair-display/400", "playfair-display/400-italic", "playfair-display/500", "noto-sans-ethiopic/400", "noto-sans-ethiopic/600", "noto-serif-ethiopic/400", "noto-serif-ethiopic/600"]
  .map((x) => `<link rel="stylesheet" href="${f(`node_modules/@fontsource/${x}.css`)}">`).join("")}
<style>
:root{--r95:#0b1a3d;--r9:#142a5c;--r7:#22459a;--r6:#2a55bd;--r4:#5286fe;--sun:#e0a82e;--sun4:#f2c94c;--leaf:#2a9104}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1920px;height:1080px;overflow:hidden;background:var(--r95);color:#fff;font-family:${amP ? '"Noto Sans Ethiopic",Inter' : 'Inter,"Noto Sans Ethiopic"'},sans-serif}
.serif{font-family:${amP ? '"Noto Serif Ethiopic","Playfair Display"' : '"Playfair Display","Noto Serif Ethiopic"'},serif;font-weight:400}
.sub{font-family:${amP ? 'Inter,"Noto Sans Ethiopic"' : '"Noto Sans Ethiopic",Inter'};color:rgba(255,255,255,.72);font-size:30px;margin-top:18px}
.scene{position:absolute;inset:0;opacity:0;overflow:hidden}
.photo{position:absolute;inset:-2%;}
.photo img{width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0}
.shade.side{background:linear-gradient(90deg,rgba(11,26,61,.92) 0%,rgba(11,26,61,.55) 45%,rgba(11,26,61,.05) 80%)}
.shade.bottom{background:linear-gradient(0deg,rgba(11,26,61,.95) 0%,rgba(11,26,61,.4) 45%,rgba(11,26,61,.1) 75%,rgba(11,26,61,.35) 100%)}
.shade.full{background:linear-gradient(135deg,rgba(11,26,61,.82),rgba(20,42,92,.55))}
.words{display:inline}
.wd{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;margin-bottom:-.08em}
.wd>span{display:inline-block}
.kicker{display:inline-flex;align-items:center;gap:18px;color:var(--sun4);font-size:${amP ? "26px" : "20px"};font-weight:600;letter-spacing:${amP ? "0" : ".28em"};text-transform:uppercase}
.kicker::before{content:"";width:70px;height:2px;background:currentColor}
.credit{position:absolute;right:40px;bottom:30px;font-size:15px;color:rgba(255,255,255,.55);font-family:Inter,sans-serif}
.rings{position:absolute;color:rgba(255,255,255,.08)}
.band{position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(90deg,var(--r6),var(--sun),var(--leaf));transform-origin:left}
/* intro */
#s1{background:radial-gradient(circle at 50% 45%,#22459a 0%,#0b1a3d 62%)}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.seal{width:250px;height:250px;border-radius:50%;background:#fff;padding:6px;box-shadow:0 30px 80px rgba(0,0,0,.45)}
h1{font-size:${amP ? "118px" : "132px"};line-height:1;margin-top:46px;letter-spacing:-.01em}
.alt{font-size:${amP ? "52px" : "60px"};color:var(--sun4);margin-top:16px}
.reg{margin-top:34px;font-size:${amP ? "28px" : "24px"};letter-spacing:${amP ? "0" : ".2em"};text-transform:uppercase;color:rgba(255,255,255,.7)}
/* hero */
.lower{position:absolute;left:130px;right:130px;bottom:130px}
.big{font-size:${amP ? "104px" : "118px"};line-height:1.04;margin-top:26px;max-width:1500px}
.lead{font-size:${amP ? "38px" : "40px"};margin-top:26px;color:rgba(255,255,255,.92)}
/* facts */
.facts{position:absolute;left:130px;right:130px;bottom:150px;display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.fact{border-top:2px solid rgba(255,255,255,.35);padding-top:26px}
.fact b{display:block;font-size:96px;line-height:1;color:#fff}
.fact span{display:block;font-size:${amP ? "28px" : "26px"};margin-top:16px;color:rgba(255,255,255,.85);line-height:1.3}
.fact small{display:block;font-size:20px;margin-top:6px;color:rgba(255,255,255,.55)}
.toph{position:absolute;left:130px;top:120px}
.toph h2{font-size:${amP ? "68px" : "76px"};margin-top:22px}
/* leader */
#s4{background:linear-gradient(140deg,#2a55bd 0%,#142a5c 55%,#0b1a3d 100%)}
.lq{position:absolute;left:560px;right:150px;top:50%;transform:translateY(-50%)}
.lq .q{font-size:200px;line-height:.5;color:var(--sun4);height:90px}
.lq p.ex{font-size:${amP ? "50px" : "56px"};line-height:1.32;font-style:${amP ? "normal" : "italic"}}
.lq .who{display:flex;align-items:center;gap:22px;margin-top:50px;font-size:28px}
.lq .who i{width:60px;height:2px;background:var(--sun4)}
.lseal{position:absolute;left:150px;top:50%;width:300px;height:300px;margin-top:-150px;border-radius:50%;background:#fff;padding:7px;box-shadow:0 30px 80px rgba(0,0,0,.4)}
.lplay{position:absolute;left:150px;top:calc(50% + 190px);display:flex;align-items:center;gap:16px;font-size:24px;color:rgba(255,255,255,.85)}
.lplay span{width:56px;height:56px;border-radius:50%;background:var(--sun4);color:var(--r95);display:grid;place-items:center}
/* sectors */
#secIntro{background:var(--r95)}
.sector-card{position:absolute;left:130px;top:50%;transform:translateY(-50%);max-width:900px}
.sector-card .ico{width:84px;height:84px;border-radius:50%;background:rgba(255,255,255,.14);display:grid;place-items:center;color:var(--sun4);backdrop-filter:blur(6px)}
.sector-card .num{margin-top:34px;font-size:22px;letter-spacing:.3em;color:rgba(255,255,255,.6);font-family:Inter}
.sector-card h2{font-size:${amP ? "92px" : "104px"};line-height:1.05;margin-top:14px}
/* woredas */
.wgrid{position:absolute;left:130px;right:130px;top:380px;display:grid;grid-template-columns:repeat(4,1fr);gap:26px}
.wcell{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:30px 30px 26px;backdrop-filter:blur(10px)}
.wcell b{display:block;font-size:${amP ? "44px" : "46px"};line-height:1.1}
.wcell span{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:21px;color:rgba(255,255,255,.7)}
.wcell span svg{color:var(--sun4)}
.wcell small{display:block;font-size:20px;color:rgba(255,255,255,.5);margin-top:4px}
/* portal */
#s8,#s9{background:radial-gradient(circle at 75% 40%,#22459a 0%,#0b1a3d 60%)}
.cap{position:absolute;left:130px;top:50%;transform:translateY(-50%);width:640px}
.cap h2{font-size:${amP ? "72px" : "80px"};line-height:1.08;margin-top:26px}
.cap p{font-size:${amP ? "32px" : "30px"};margin-top:26px;color:rgba(255,255,255,.85);line-height:1.4}
.browser{position:absolute;left:850px;top:150px;width:1000px;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 50px 120px rgba(0,0,0,.5)}
.browser .bar{height:44px;background:#eef1f7;display:flex;align-items:center;gap:9px;padding-left:18px}
.browser .bar i{width:13px;height:13px;border-radius:50%;background:#c6cbd8}
.browser .bar span{margin-left:20px;background:#fff;border-radius:20px;padding:5px 22px;font-size:16px;color:#7a8296;font-family:Inter}
.browser .vp{height:640px;overflow:hidden;background:#fbf8f3}
.browser .vp img{display:block;width:100%}
.phone{position:absolute;width:290px;height:600px;border:13px solid #151b2c;border-radius:46px;overflow:hidden;background:#fff;box-shadow:0 40px 90px rgba(0,0,0,.55)}
.phone img{width:100%;display:block}
/* outro */
#s10{background:radial-gradient(circle at 50% 40%,#2a55bd 0%,#142a5c 45%,#0b1a3d 100%)}
.url{margin-top:44px;display:inline-flex;align-items:center;gap:16px;background:#fff;color:var(--r95);border-radius:60px;padding:18px 44px;font-size:38px;font-weight:600;font-family:Inter}
.url svg{color:var(--r6)}
.contact{margin-top:30px;display:flex;gap:44px;font-size:26px;color:rgba(255,255,255,.8);font-family:Inter}
.contact span{display:flex;align-items:center;gap:10px}
.fine{position:absolute;bottom:44px;left:0;right:0;text-align:center;font-size:17px;color:rgba(255,255,255,.5)}
.flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
</style></head><body>

<section class="scene" id="s1">
  <svg class="rings" id="ring1" style="left:50%;top:50%;width:1300px;height:1300px;margin:-650px 0 0 -650px" viewBox="0 0 400 400" fill="none" stroke="currentColor"><circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="160" stroke-dasharray="2 10"/><circle cx="200" cy="200" r="130"/><circle cx="200" cy="200" r="100" stroke-width="18" stroke-dasharray="6 9"/></svg>
  <div class="center">
    <img class="seal" id="seal" src="${f("public/brand/logo.png")}">
    <h1 class="serif">${words(P(zone.name), "h1w")}</h1>
    <div class="alt serif" id="alt">${S(zone.name)}</div>
    <div class="reg" id="reg">${P(C.region)}</div>
  </div>
  <div class="band" id="band1"></div>
</section>

<section class="scene" id="s2">
  <div class="photo"><img src="${photo("turmi-hills")}"></div><div class="shade bottom"></div>
  <div class="lower">
    <span class="kicker" id="s2k">${P(zone.name)}</span>
    <h2 class="serif big">${words(P(C.hero), "s2w")}</h2>
    <p class="sub" id="s2s">${S(C.hero)}</p>
    <p class="lead" id="s2l">${P(C.heroSub)}</p>
  </div>
  <div class="credit">${credit("turmi-hills")}</div>
</section>

<section class="scene" id="s3">
  <div class="photo"><img src="${photo("omo-river-omorate")}"></div><div class="shade full"></div>
  <div class="toph"><span class="kicker">${P(zone.name)}</span><h2 class="serif">${words(P(C.factsH), "s3w")}</h2><p class="sub">${S(C.factsH)}</p></div>
  <div class="facts">${facts.map((x, i) => {
    const n = x.value.replace(/\D/g, ""); const plus = x.value.endsWith("+") ? "+" : "";
    return `<div class="fact" id="f${i}"><b class="serif" data-count="${n}" data-plain="${n.length === 4 ? 1 : 0}" data-suffix="${plus}" data-start="${11 + i * 0.35}" data-dur="1.8">0</b><span>${P(x.label)}</span><small>${S(x.label)}</small></div>`;
  }).join("")}</div>
  <div class="credit">${credit("omo-river-omorate")}</div>
</section>

<section class="scene" id="s4">
  <svg class="rings" style="left:-200px;top:-200px;width:1000px;height:1000px" viewBox="0 0 400 400" fill="none" stroke="currentColor"><circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="160" stroke-dasharray="2 10"/><circle cx="200" cy="200" r="130"/></svg>
  <img class="lseal" id="lseal" src="${f("public/brand/logo.png")}">
  <div class="lplay" id="lplay"><span>${icon(Play, 22)}</span>${amP ? "ቪዲዮ" : "Video message"}</div>
  <div class="lq">
    <span class="kicker" id="lk">${P(C.leaderH)}</span>
    <div class="q serif" style="margin-top:40px">“</div>
    <p class="ex serif">${words(P(leader.excerpt), "s4w")}</p>
    <div class="who" id="who"><i></i><span>${P(leader.name)} · ${P(leader.title)}</span></div>
  </div>
</section>

<section class="scene" id="secIntro">
  <div class="center"><span class="kicker" id="siK">${amP ? "ኢንቨስትመንት" : "Invest"}</span><h2 class="serif" style="font-size:${amP ? "84px" : "92px"};margin-top:30px">${words(P(C.sectorsH), "siw")}</h2><p class="sub" id="siS">${S(C.sectorsH)}</p></div>
</section>
${sec}

<section class="scene" id="s6">
  <div class="photo"><img src="${photo("hamer-village")}" style="filter:blur(6px) brightness(.8)"></div><div class="shade full"></div>
  <div class="toph"><span class="kicker">${amP ? "ወረዳዎች" : "Woredas"}</span><h2 class="serif">${words(P(C.woredasH), "s6w")}</h2><p class="sub">${S(C.woredasH)}</p></div>
  <div class="wgrid">${woredas.map((w, i) => `<div class="wcell" id="w${i}"><b class="serif">${P(w.name)}</b>${w.seat ? `<span>${icon(MapPin, 18)}${P(w.seat)}</span>` : `<span>${P(w.peoples)}</span>`}<small>${S(w.name)}</small></div>`).join("")}</div>
</section>
${tour}

<section class="scene" id="s8">
  <div class="cap"><span class="kicker">${SITE}</span><h2 class="serif">${words(P(C.portalH), "s8w")}</h2><p>${P(C.portalS)}</p><p class="sub">${S(C.portalS)}</p></div>
  <div class="browser" id="br8"><div class="bar"><i></i><i></i><i></i><span>${SITE}</span></div><div class="vp"><img id="scroll8" src="${shot(`${lang}-home-full.png`)}"></div></div>
  <div class="phone" id="ph8" style="left:1600px;top:370px"><img src="${shot(`${other}-mobile-home.png`)}"></div>
</section>

<section class="scene" id="s9">
  <div class="cap"><span class="kicker">${amP ? "የማስታወቂያ ሰሌዳ" : "Notice board"}</span><h2 class="serif">${words(P(C.noticeH), "s9w")}</h2><p>${P(C.noticeS)}</p><p class="sub">${S(C.noticeS)}</p></div>
  <div class="browser" id="br9"><div class="bar"><i></i><i></i><i></i><span>${SITE}/announcements</span></div><div class="vp"><img src="${shot(`${lang}-home-notices.png`)}"></div></div>
  <div class="browser" id="br9b" style="top:190px;left:900px;width:960px"><div class="bar"><i></i><i></i><i></i><span>${SITE}/announcements</span></div><div class="vp" style="height:600px"><img src="${shot(`${lang}-announcement-detail.png`)}"></div></div>
</section>

<section class="scene" id="s10">
  <svg class="rings" id="ring10" style="left:50%;top:50%;width:1500px;height:1500px;margin:-750px 0 0 -750px" viewBox="0 0 400 400" fill="none" stroke="currentColor"><circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="160" stroke-dasharray="2 10"/><circle cx="200" cy="200" r="130"/><circle cx="200" cy="200" r="100" stroke-width="18" stroke-dasharray="6 9"/></svg>
  <div class="center">
    <img class="seal" id="seal10" src="${f("public/brand/logo.png")}" style="width:170px;height:170px">
    <h1 class="serif" style="font-size:${amP ? "100px" : "112px"};margin-top:36px">${words(P(C.outroH), "s10w")}</h1>
    <div id="o1"><p class="lead" style="margin-top:22px">${P(C.outroS)}</p><p class="sub" style="font-size:26px;margin-top:10px">${S(C.outroH)} · ${S(C.outroS)}</p></div>
    <div class="url" id="o2">${icon(Globe, 34)}${SITE}</div>
    <div class="contact" id="o3"><span>${icon(MapPin, 24)}${P(zone.capital)}, ${P(zone.name)}</span><span>${icon(Phone, 24)}${zone.contact.phone}</span></div>
  </div>
  <div class="fine">${P(C.photos)}</div>
  <div class="band" id="band10"></div>
</section>
<div class="flash" id="flash"></div>

<script>
const T = ${T}, ease = "cubic-bezier(.2,.75,.2,1)", $ = (q) => document.querySelector(q), $$ = (q) => [...document.querySelectorAll(q)];
// One animation per element over the whole timeline, so values hold before and after each keyframe.
function K(el, frames, e = ease) {
  if (typeof el === "string") el = $(el);
  const kf = frames.map(([t, st]) => ({ ...st, offset: Math.min(1, Math.max(0, t / T)), easing: e }));
  if (kf[0].offset > 0) kf.unshift({ ...frames[0][1], offset: 0 });
  if (kf[kf.length - 1].offset < 1) kf.push({ ...frames[frames.length - 1][1], offset: 1 });
  el.animate(kf, { duration: T * 1000, fill: "both" }).pause();
}
const scene = (id, a, b, fade = 0.55) => K(id, [[a, { opacity: 0 }], [a + fade, { opacity: 1 }], [b - fade, { opacity: 1 }], [b, { opacity: 0 }]], "linear");
const rise = (el, t, d = 0.9, y = 40) => K(el, [[t, { opacity: 0, transform: \`translateY(\${y}px)\` }], [t + d, { opacity: 1, transform: "translateY(0)" }]]);
const words = (cls, t, step = 0.07) => $$("." + cls + " .wd>span").forEach((w, i) => K(w, [[t + i * step, { transform: "translateY(110%)" }], [t + i * step + 0.75, { transform: "translateY(0)" }]]));
// Slow camera move on a photo during its scene
const kb = (sel, a, b, from = "scale(1.12) translate(0,0)", to = "scale(1.0) translate(0,0)") => K(sel, [[a, { transform: from }], [b, { transform: to }]], "linear");

// 1 · seal reveal 0–5
scene("#s1", 0, 5.1, 0.01);
K("#seal", [[0.3, { opacity: 0, transform: "scale(.6) rotate(-25deg)" }], [1.6, { opacity: 1, transform: "scale(1) rotate(0)" }]]);
K("#ring1", [[0, { transform: "rotate(0) scale(.8)", opacity: 0 }], [1.2, { opacity: 1 }], [5.1, { transform: "rotate(40deg) scale(1.05)", opacity: 1 }]], "linear");
words("h1w", 1.3, 0.12); rise("#alt", 2.1); rise("#reg", 2.6, 0.9, 20);
K("#band1", [[0.6, { transform: "scaleX(0)" }], [3.2, { transform: "scaleX(1)" }]]);
// 2 · hero 4.6–10.2
scene("#s2", 4.6, 10.2); kb("#s2 .photo", 4.6, 10.2, "scale(1.18) translate(2%,1%)", "scale(1.02) translate(0,0)");
rise("#s2k", 5.2, 0.8, 20); words("s2w", 5.4, 0.1); rise("#s2s", 7.0, 0.8, 20); rise("#s2l", 7.4, 0.8, 20);
// 3 · facts 9.7–16
scene("#s3", 9.7, 16); kb("#s3 .photo", 9.7, 16, "scale(1.05) translate(-1%,0)", "scale(1.15) translate(1%,0)");
words("s3w", 10.2, 0.1); [0, 1, 2, 3].forEach((i) => rise("#f" + i, 10.8 + i * 0.3, 0.8, 50));
// 4 · leader 15.5–23
scene("#s4", 15.5, 23);
K("#lseal", [[15.8, { opacity: 0, transform: "scale(.8)" }], [16.8, { opacity: 1, transform: "scale(1)" }]]);
rise("#lplay", 16.6, 0.8, 20); rise("#lk", 16.0, 0.8, 20); words("s4w", 16.6, 0.085); rise("#who", 20.6, 0.8, 20);
// 5 · sectors 22.5–32.2
scene("#secIntro", 22.5, 24.6); rise("#siK", 22.8, 0.7, 20); words("siw", 22.9, 0.08); rise("#siS", 23.5, 0.7, 20);
for (let i = 0; i < 6; i++) {
  const a = 24.2 + i * 1.35, b = a + 1.75;
  scene("#sec" + i, a, b, 0.35);
  kb(\`#sec\${i} .photo\`, a, b, i % 2 ? "scale(1.04) translate(-2%,0)" : "scale(1.16) translate(2%,0)", i % 2 ? "scale(1.16) translate(2%,0)" : "scale(1.04) translate(-2%,0)");
  K(\`#sec\${i} .sector-card\`, [[a + 0.1, { opacity: 0, transform: "translate(-40px,-50%)" }], [a + 0.6, { opacity: 1, transform: "translate(0,-50%)" }]]);
  $$(\`#sec\${i} .wd>span\`).forEach((w, k) => K(w, [[a + 0.2 + k * 0.06, { transform: "translateY(110%)" }], [a + 0.75 + k * 0.06, { transform: "translateY(0)" }]]));
}
// 6 · woredas 31.8–38
scene("#s6", 31.8, 38); kb("#s6 .photo", 31.8, 38);
words("s6w", 32.2, 0.08); for (let i = 0; i < 8; i++) rise("#w" + i, 33 + i * 0.18, 0.8, 60);
// 7 · tourism 37.6–46
for (let i = 0; i < 3; i++) {
  const a = 37.6 + i * 2.8, b = a + 3.2;
  scene("#tour" + i, a, b, 0.45);
  kb(\`#tour\${i} .photo\`, a, b, "scale(1.18) translate(0,1%)", "scale(1.02) translate(0,0)");
  $$(\`#tour\${i} .wd>span\`).forEach((w, k) => K(w, [[a + 0.35 + k * 0.09, { transform: "translateY(110%)" }], [a + 1.0 + k * 0.09, { transform: "translateY(0)" }]]));
  [".kicker", ".lead", ".sub"].forEach((q, k) => rise(\`#tour\${i} \${q}\`, a + 0.3 + k * 0.35, 0.7, 20));
}
// 8 · portal 45.6–51.4
scene("#s8", 45.6, 51.4); words("s8w", 46, 0.08);
K("#br8", [[45.8, { opacity: 0, transform: "translateX(120px)" }], [46.9, { opacity: 1, transform: "translateX(0)" }]]);
K("#scroll8", [[47.2, { transform: "translateY(0)" }], [51.2, { transform: "translateY(-46%)" }]], "cubic-bezier(.45,0,.55,1)");
K("#ph8", [[47.6, { opacity: 0, transform: "translateY(160px) rotate(4deg)" }], [48.6, { opacity: 1, transform: "translateY(0) rotate(0)" }]]);
// 9 · notices 51–55.6
scene("#s9", 51, 55.6); words("s9w", 51.4, 0.08);
K("#br9", [[51.2, { opacity: 0, transform: "translateY(60px)" }], [52.2, { opacity: 1, transform: "translateY(0)" }]]);
K("#br9b", [[53.2, { opacity: 0, transform: "scale(.94) translateY(40px)" }], [54, { opacity: 1, transform: "scale(1) translateY(0)" }]]);
// 10 · outro 55.2–60
scene("#s10", 55.2, 60.01, 0.5);
K("#ring10", [[55.2, { transform: "rotate(0)" }], [60, { transform: "rotate(-30deg)" }]], "linear");
K("#seal10", [[55.4, { opacity: 0, transform: "scale(.7)" }], [56.3, { opacity: 1, transform: "scale(1)" }]]);
words("s10w", 55.8, 0.1); rise("#o1", 56.8, 0.8, 20); rise("#o2", 57.2, 0.8, 30); rise("#o3", 57.6, 0.8, 20);
K("#band10", [[55.5, { transform: "scaleX(0)" }], [57.5, { transform: "scaleX(1)" }]]);
// soft white flash on two big cuts
[[4.6, 0.18], [55.2, 0.12]].forEach(([t, o], i) => { const d = document.createElement("div"); d.className = "flash"; document.body.appendChild(d); K(d, [[t - 0.05, { opacity: 0 }], [t + 0.12, { opacity: o }], [t + 0.7, { opacity: 0 }]], "linear"); });

const counters = $$("[data-count]");
window.seek = (t) => {
  document.getAnimations().forEach((a) => (a.currentTime = t * 1000));
  for (const c of counters) {
    const p = Math.max(0, Math.min(1, (t - +c.dataset.start) / +c.dataset.dur)), e = 1 - Math.pow(1 - p, 3);
    const v = Math.round(+c.dataset.count * e);
    c.textContent = (c.dataset.plain === "1" ? String(v) : v.toLocaleString("en-US")) + (p > 0.98 ? c.dataset.suffix : "");
  }
};
</script></body></html>`;
}

const b = await chromium.launch();
for (const lang of LANGS) {
  const html = path.join(OUT, `promo-${lang}.html`);
  fs.writeFileSync(html, page(lang));
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(pathToFileURL(html).href);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForLoadState("networkidle");

  if (process.env.STILLS) { // preview mode: render a few frames only
    for (const t of process.env.STILLS.split(",").map(Number)) {
      await p.evaluate((t) => window.seek(t), t);
      await p.screenshot({ path: path.join(OUT, `still-${lang}-${String(t).padStart(5, "0")}.jpg`), type: "jpeg", quality: 80 });
    }
    await p.close(); continue;
  }
  const wav = path.join(OUT, "music.wav");
  if (!fs.existsSync(wav)) execFileSync("python3", [path.join(HERE, "music.py"), String(T), wav], { stdio: "inherit" });
  const mp4 = path.join(OUT, `south-omo-promo-${lang}.mp4`);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p",
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", mp4], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = T * FPS;
  for (let i = 0; i < frames; i++) {
    const t = i / FPS;
    await p.evaluate((t) => window.seek(t), t);
    const buf = await p.screenshot({ type: "jpeg", quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 450 === 0) console.log(lang, `frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  // thumbnail at the hero title
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", "8.2", "-i", mp4, "-frames:v", "1", "-q:v", "3", path.join(OUT, `south-omo-promo-${lang}-thumbnail.jpg`)]);
  console.log("video:", mp4);
  await p.close();
}
await b.close();
