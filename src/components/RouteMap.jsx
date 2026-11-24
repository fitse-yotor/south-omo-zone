import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, CheckCircle2, Fuel, Moon, RotateCcw } from "lucide-react";
import { useLang } from "../i18n";
import { img, markets, rainyMonths, roadInfo, roadLegs, routeStops, stays, townPhotos, townServices } from "../data/content";
import credits from "../data/credits.json";
import routes from "../data/routes.json";

// Animated trips from Jinka Airport on satellite imagery: a plane lands at Jinka, then a 4×4
// drives the real roads. A trip is a single drive (destination) or several days (itinerary).

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ATTRIBUTION = "Imagery © Esri, Maxar, Earthstar Geographics · Roads © OpenStreetMap";
const S = routes.stops;
const TOWN = { jinka: { en: "Jinka", am: "ጂንካ" }, mago: { en: "Mago N.P.", am: "ማጎ ፓርክ" } };
const WEEKDAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  am: ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"],
};
const WD_SHORT = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], am: ["እሑድ", "ሰኞ", "ማክ", "ረቡ", "ሐሙ", "ዓርብ", "ቅዳ"] };

const svg = (body, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${body}</svg>`;
const PLANE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>`;
const BED = svg('<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>');
const MOON = svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>');
const ICONS = {
  fuel: svg('<path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17M3 22h12M6 8h6M15 12h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V9l-3-3"/>'),
  bank: svg('<path d="M3 21h18M5 21V10M10 21V10M14 21V10M19 21V10M2 10l10-6 10 6"/>'),
  health: svg('<path d="M12 5v14M5 12h14"/>', 'stroke-width="3"'),
  gate: svg('<path d="M4 22V4M4 4h13l-3 4 3 4H4"/>'),
};
const CAR = `<svg class="rm-vehicle" viewBox="0 0 20 38"><rect x=".5" y="6" width="3" height="7" rx="1.2" fill="#111"/><rect x="16.5" y="6" width="3" height="7" rx="1.2" fill="#111"/><rect x=".5" y="25" width="3" height="7" rx="1.2" fill="#111"/><rect x="16.5" y="25" width="3" height="7" rx="1.2" fill="#111"/><rect x="2" y="1" width="16" height="36" rx="4.5" fill="#f4f1ea" stroke="#9a958a" stroke-width=".8"/><path d="M4 10.5Q10 7.5 16 10.5L15 14Q10 12.6 5 14Z" fill="#1d2a3a"/><rect x="4.5" y="15.5" width="11" height="15" rx="1.5" fill="#e3ded2"/><g stroke="#8d877b" stroke-width=".9"><path d="M5.5 18h9M5.5 21.5h9M5.5 25h9M5.5 28.5h9"/></g><path d="M5 33.5Q10 35 15 33.5V31.5H5Z" fill="#1d2a3a"/><rect x="3.2" y="1.6" width="3.2" height="1.6" rx=".8" fill="#fff6c8"/><rect x="13.6" y="1.6" width="3.2" height="1.6" rx=".8" fill="#fff6c8"/></svg>`;
const STATUS_COLOR = { slow: "#f59e0b", closed: "#ef4444" };

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const hav = (a, b) => {
  const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};
const legKey = (a, b) => (routes.legs[`${a}-${b}`] ? `${a}-${b}` : `${b}-${a}`);
const legPath = (a, b) => (routes.legs[`${a}-${b}`] ? routes.legs[`${a}-${b}`].path : [...routes.legs[`${b}-${a}`].path].reverse());
const credit = (id) => credits.find((c) => c.id === id);

// Today in Ethiopia: weekday (0 = Sunday) and month (0 = January)
function addisNow() {
  const parts = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "numeric", timeZone: "Africa/Addis_Ababa" }).formatToParts(new Date());
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.find((p) => p.type === "weekday").value);
  return { weekday: wd, month: Number(parts.find((p) => p.type === "month").value) - 1 };
}
const marketAt = (stop, wd) => markets.some((m) => m.stop === stop && m.days.includes(wd));
export function nextMarket(stop, from) {
  const m = markets.find((x) => x.stop === stop);
  if (!m) return null;
  for (let k = 0; k < 7; k++) if (m.days.includes((from + k) % 7)) return { weekday: (from + k) % 7, inDays: k };
  return null;
}

// A destination is a one-day trip; an itinerary has several days
export const asTrip = (x, kind) => ({ ...x, kind, days: x.days || [{ stops: x.stops, night: null }] });

export function tripStats(trip) {
  let km = 0, minutes = 0, asphalt = 0, gravel = 0;
  const legs = [], dayKm = [];
  trip.days.forEach((d, di) => {
    let dk = 0;
    d.stops.slice(1).forEach((to, i) => {
      const from = d.stops[i], key = legKey(from, to), l = routes.legs[key], info = roadLegs[key];
      legs.push({ from, to, key, km: l.km, day: di, info });
      km += l.km; dk += l.km; minutes += info.minutes;
      info.surface === "asphalt" ? (asphalt += l.km) : (gravel += l.km);
    });
    dayKm.push(dk);
  });
  let acc = 0;
  const pos = [0, ...legs.map((l) => (acc += l.km) / km)];
  const dayStart = [];
  acc = 0;
  dayKm.forEach((d) => { dayStart.push(acc / km); acc += d; });
  return { km, minutes, asphalt, gravel, legs, pos, dayKm, dayStart };
}

function lastFuel(trip) {
  const stops = trip.days.flatMap((d, i) => (i ? d.stops.slice(1) : d.stops));
  const end = stops[stops.length - 1];
  if (townServices[end]?.includes("fuel") || trip.kind === "itin") return null;
  for (let i = stops.length - 2; i >= 0; i--) if (townServices[stops[i]]?.includes("fuel")) return stops[i];
  return null;
}

export default function RouteMap({ journeys, itineraries, selected, onSelect }) {
  const { t, tx, lang } = useLang();
  const box = useRef(null);
  const mapEl = useRef(null);
  const api = useRef(null);
  const fill = useRef(null);
  const kmEl = useRef(null);
  const [mode, setMode] = useState("dest");
  const [itin, setItin] = useState(itineraries[0].id);
  const [startDay, setStartDay] = useState(itineraries[0].start);
  const [reached, setReached] = useState(0);
  const [curDay, setCurDay] = useState(0);
  const [visible, setVisible] = useState(false);
  const [replay, setReplay] = useState(0);
  const now = useMemo(addisNow, []);

  // A route link from an attraction switches back to destinations
  useEffect(() => { setMode("dest"); }, [selected]);

  const trip = mode === "dest"
    ? asTrip(journeys.find((x) => x.id === selected) || journeys[0], "dest")
    : asTrip(itineraries.find((x) => x.id === itin), "itin");
  const st = tripStats(trip);
  const fuelStop = lastFuel(trip);
  const tripKey = `${mode}:${trip.id}`;
  const notOpen = st.legs.filter((l) => l.info.status && l.info.status !== "open");
  const rainy = rainyMonths.includes(now.month) && st.gravel > 0;
  const fill2 = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);

  const fmt = (m) => {
    m = Math.round(m / 15) * 15;
    const h = Math.floor(m / 60), r = m % 60;
    return h ? `${h} ${t("hr")}${r ? ` ${r}` : ""}` : `${r} ${t("min")}`;
  };
  const town = (k) => tx(TOWN[k] || routeStops[k]);

  // Today's markets banner
  const todayMarkets = markets.filter((m) => m.days.includes(now.weekday));
  let marketLine;
  if (todayMarkets.length) {
    marketLine = fill2(t("marketsToday"), { day: WEEKDAYS[lang][now.weekday], places: todayMarkets.map((m) => tx(m.place)).join(lang === "am" ? "፣ " : ", ") });
  } else {
    const next = markets.map((m) => ({ m, n: nextMarket(m.stop, now.weekday) })).sort((a, b) => a.n.inDays - b.n.inDays)[0];
    marketLine = fill2(t("noMarketToday"), { day: WEEKDAYS[lang][next.n.weekday], place: tx(next.m.place) });
  }

  // Create the map (again when the language changes, so labels follow it)
  useEffect(() => {
    const map = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: false, zoomSnap: 1 }).setView([5.25, 36.55], 9);
    map.attributionControl.setPrefix(false);
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer(TILE_URL, { maxZoom: 17, attribution: ATTRIBUTION }).addTo(map);
    map.createPane("rm-glow").style.zIndex = 390;

    const o = (x) => ({ interactive: false, lineCap: "round", lineJoin: "round", ...x });
    Object.entries(routes.legs).forEach(([k, l]) => {
      const info = roadLegs[k] || {};
      if (info.surface === "asphalt") {
        L.polyline(l.path, o({ color: "#15181d", weight: 7, opacity: 0.9 })).addTo(map);
        L.polyline(l.path, o({ color: "#50555e", weight: 5 })).addTo(map);
        L.polyline(l.path, o({ color: "#ffffff", weight: 1, opacity: 0.85, dashArray: "5 7", lineCap: "butt" })).addTo(map);
      } else {
        L.polyline(l.path, o({ color: "#3b2a14", weight: 6, opacity: 0.6 })).addTo(map);
        L.polyline(l.path, o({ color: "#e2bd76", weight: 3, dashArray: "1 6" })).addTo(map);
      }
      if (STATUS_COLOR[info.status]) {
        L.polyline(l.path, o({ color: STATUS_COLOR[info.status], weight: 3, dashArray: "8 6", opacity: 0.95 })).addTo(map);
        const mid = l.path[Math.floor(l.path.length / 2)];
        const label = info.status === "closed" ? t("roadClosed") : t("roadSlow");
        L.marker(mid, { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="rm-roadflag ${info.status}">${label}</div>` }), interactive: false, zIndexOffset: 800 }).addTo(map);
      }
    });

    const markers = {};
    Object.entries(S).forEach(([k, ll]) => {
      const svc = (townServices[k] || []).map((s) => `<i class="rm-svc" title="${t(s)}">${ICONS[s]}</i>`).join("");
      const mkt = marketAt(k, now.weekday) ? `<em class="rm-mkt">${t("marketToday")}</em>` : "";
      const html = k === "jinka"
        ? `<div class="rm-airport"><b>${PLANE}</b><span>${tx(routeStops.jinka)}${svc}</span></div>`
        : `<div class="rm-stop dim"><i></i><span>${tx(routeStops[k])}${svc}</span>${mkt}</div>`;
      markers[k] = L.marker(ll, { icon: L.divIcon({ className: "", iconSize: [0, 0], html }), interactive: false, zIndexOffset: k === "jinka" ? 1000 : 0 }).addTo(map);
    });
    const beds = {};
    Object.keys(stays).filter((k) => stays[k]?.length && S[k]).forEach((k) => {
      beds[k] = L.marker(S[k], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="rm-bed${k === "jinka" ? " j" : ""}">${BED}</div>` }), interactive: false, zIndexOffset: 900 }).addTo(map);
    });
    api.current = { map, markers, beds, layers: [], run: 0 };
    return () => { api.current.run++; map.remove(); api.current = null; };
  }, [lang]);

  // Start the first trip once the map scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  // Play the trip
  useEffect(() => {
    const a = api.current;
    if (!a || !visible) return;
    const { map, markers, beds } = a;
    const id = ++a.run;
    const alive = () => api.current === a && a.run === id;
    const el = (k) => markers[k].getElement()?.firstElementChild;
    const anim = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const f = (n) => { if (!alive()) return; const p = Math.min(1, (n - t0) / ms); fn(p); p < 1 ? requestAnimationFrame(f) : res(); };
      requestAnimationFrame(f);
    });
    const sleep = (ms) => new Promise((r) => setTimeout(() => r(alive()), ms));
    const moveEnd = () => new Promise((r) => map.once("moveend", () => r(alive())));
    const progress = (f) => {
      if (fill.current) fill.current.style.width = `${f * 100}%`;
      if (kmEl.current) kmEl.current.textContent = `${Math.round(f * st.km)} km`;
    };
    const add = (layer) => { a.layers.push(layer); return layer.addTo(map); };

    a.layers.forEach((l) => map.removeLayer(l));
    a.layers = [];
    const onTrip = new Set(trip.days.flatMap((d) => d.stops));
    const nights = trip.days.map((d) => d.night).filter(Boolean);
    Object.keys(S).forEach((k) => { if (k !== "jinka" && el(k)) el(k).className = `rm-stop ${onTrip.has(k) ? "" : "dim"}`; });
    const stayTowns = trip.kind === "itin" ? nights : trip.stayAt;
    Object.entries(beds).forEach(([k, m]) => m.getElement()?.firstElementChild.classList.toggle("on", stayTowns.includes(k)));
    setReached(0);
    setCurDay(0);
    progress(0);

    // Whole path with cumulative km, and where each stop falls along it
    let path = [];
    const stopAt = [];
    st.legs.forEach((l, i) => {
      const p = legPath(l.from, l.to);
      path = path.concat(i ? p.slice(1) : p);
      stopAt.push(path.length - 1);
    });
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + hav(path[i - 1], path[i]));
    const total = cum[cum.length - 1];
    const bounds = L.latLngBounds(path);
    const wide = box.current.clientWidth > 560;
    const fit = { paddingTopLeft: [50, 40], paddingBottomRight: [50, wide ? 190 : 95] };
    const halo = add(L.polyline([], { pane: "rm-glow", color: "#f2c94c", weight: 26, opacity: 0.18, lineCap: "round", lineJoin: "round", interactive: false }));
    const glow = add(L.polyline([], { pane: "rm-glow", color: "#f2c94c", weight: 14, opacity: 0.6, lineCap: "round", lineJoin: "round", interactive: false }));
    const dest = st.legs[st.legs.length - 1].to;
    const nightMarker = (k, n) => add(L.marker(S[k], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="rm-night">${MOON}<span>${t("night")} ${n}</span></div>` }), interactive: false, zIndexOffset: 1200 }));
    const finish = () => {
      st.legs.forEach((l) => el(l.to)?.classList.add("hit"));
      if (trip.kind === "dest") el(dest)?.classList.add("end");
      let n = 0;
      const placed = {};
      trip.days.forEach((d) => { if (d.night) { n++; placed[d.night] = n; } });
      Object.entries(placed).forEach(([k, last]) => {
        const first = trip.days.findIndex((d) => d.night === k) + 1;
        nightMarker(k, first === last ? `${first}` : `${first}–${last}`);
      });
      setReached(st.legs.length);
      setCurDay(trip.days.length - 1);
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.fitBounds(bounds, fit); halo.setLatLngs(path); glow.setLatLngs(path); progress(1); finish();
      return;
    }

    (async () => {
      // 1. Land at Jinka
      map.flyTo([S.jinka[0] - 0.05, S.jinka[1] + 0.1], 10, { duration: 1.1 });
      if (!(await moveEnd())) return;
      const A = [S.jinka[0] + 0.55, S.jinka[1] + 0.75], B = S.jinka, C = [S.jinka[0] + 0.42, S.jinka[1] + 0.05];
      const plane = add(L.marker(A, { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="rm-plane">${PLANE}</div>` }), interactive: false, zIndexOffset: 2000 }));
      const pe = plane.getElement().firstElementChild;
      await anim(1900, (p) => {
        const e = 1 - Math.pow(1 - p, 2.2), u = 1 - e;
        plane.setLatLng([u * u * A[0] + 2 * u * e * C[0] + e * e * B[0], u * u * A[1] + 2 * u * e * C[1] + e * e * B[1]]);
        const dLat = 2 * u * (C[0] - A[0]) + 2 * e * (B[0] - C[0]), dLon = 2 * u * (C[1] - A[1]) + 2 * e * (B[1] - C[1]);
        pe.style.transform = `rotate(${(Math.atan2(dLon, dLat) * 180) / Math.PI}deg) scale(${1.25 - 0.55 * e})`;
        pe.style.opacity = p > 0.92 ? (1 - p) / 0.08 : 1;
      });
      if (!alive()) return;
      map.removeLayer(plane);
      el("jinka")?.classList.add("land");
      setTimeout(() => el("jinka")?.classList.remove("land"), 2600);
      if (!(await sleep(350))) return;

      // 2. Frame the whole trip
      map.flyToBounds(bounds, { ...fit, duration: 1.2 });
      if (!(await moveEnd())) return;
      const car = add(L.marker(path[0], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: CAR }), interactive: false, zIndexOffset: 1500 }));
      const ve = car.getElement().firstElementChild;
      let heading = 0, from = 0, night = 0;
      const seenPhoto = new Set();
      const msPerKm = trip.kind === "itin" ? 13 : 26;

      // 3. Drive leg by leg, pausing in each town
      for (let s = 0; s < st.legs.length; s++) {
        const leg = st.legs[s];
        setCurDay(leg.day);
        const to = cum[stopAt[s]];
        await anim(Math.max(800, (to - from) * msPerKm), (p) => {
          const d = from + (to - from) * ease(p);
          let i = 1;
          while (i < cum.length - 1 && cum[i] < d) i++;
          const f = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
          const pt = [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f];
          const pts = path.slice(0, i).concat([pt]);
          halo.setLatLngs(pts); glow.setLatLngs(pts); car.setLatLng(pt);
          const dy = path[i][0] - path[i - 1][0], dx = (path[i][1] - path[i - 1][1]) * Math.cos((path[i][0] * Math.PI) / 180);
          if (Math.abs(dx) + Math.abs(dy) > 1e-6) {
            let ang = (Math.atan2(dx, dy) * 180) / Math.PI;
            while (ang - heading > 180) ang -= 360;
            while (ang - heading < -180) ang += 360;
            heading = ang;
            ve.style.transform = `rotate(${ang}deg)`;
          }
          progress(d / total);
        });
        if (!alive()) return;
        el(leg.to)?.classList.add("hit");
        setReached(s + 1);
        from = to;

        // Photo card the first time we reach a town
        let pause = 380;
        const photo = townPhotos[leg.to];
        if (photo && !seenPhoto.has(leg.to)) {
          seenPhoto.add(leg.to);
          const c = credit(photo);
          const card = add(L.marker(S[leg.to], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<figure class="rm-photo"><img src="${img(photo)}" alt=""><figcaption>${town(leg.to)}${c ? `<small>© ${c.author} · ${c.license}</small>` : ""}</figcaption></figure>` }), interactive: false, zIndexOffset: 3000 }));
          setTimeout(() => card.getElement()?.firstElementChild.classList.add("out"), 2100);
          setTimeout(() => alive() && map.removeLayer(card), 2600);
          pause = 1500;
        }
        // End of a day: mark the night
        const endOfDay = s === st.legs.length - 1 || st.legs[s + 1].day !== leg.day;
        if (endOfDay && trip.days[leg.day].night) { night++; nightMarker(trip.days[leg.day].night, night); pause = Math.max(pause, 900); }
        if (!(await sleep(pause))) return;
      }
      ve.style.transition = "opacity .6s";
      ve.style.opacity = 0;
      a.layers.filter((l) => l.getElement?.()?.firstElementChild?.classList.contains("rm-night")).forEach((l) => map.removeLayer(l));
      finish();
    })();
  }, [tripKey, visible, replay, lang]);

  // Places to stay: chosen destination's suggestion, or each night's town
  const stayTowns = trip.kind === "itin" ? [...new Set(trip.days.map((d) => d.night).filter(Boolean))] : trip.stayAt;
  const stayList = stayTowns.flatMap((k) => (stays[k] || []).map((h) => ({ ...h, town: k })));
  const towns = new Set(st.legs.slice(0, -1).map((l) => l.to)).size;
  const nightsCount = trip.days.filter((d) => d.night).length;

  return (
    <div ref={box} className="route-map grid gap-7 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="contents lg:block lg:min-w-0">
        <div className="order-1 min-w-0 space-y-3">
          <p className="rm-market"><span className="rm-mkt-dot" />{marketLine}</p>
          {rainy && <p className="rm-rain"><AlertTriangle size={15} className="mt-0.5 flex-none" />{t("rainyWarning")}</p>}
          <div className="rm-tabs" role="tablist">
            {[["dest", t("destinations")], ["itin", t("itinerariesTab")]].map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}>{label}</button>
            ))}
          </div>
          {mode === "dest" ? (
            <div className="rm-list" role="group" aria-label={t("destinations")}>
              {journeys.map((x) => {
                const end = x.stops[x.stops.length - 1], nm = nextMarket(end, now.weekday);
                return (
                  <button key={x.id} type="button" aria-pressed={x.id === trip.id} onClick={() => (x.id === trip.id ? setReplay((r) => r + 1) : onSelect(x.id))} className="rm-dest">
                    <img src={img(x.image)} alt="" loading="lazy" />
                    <span className="min-w-0">
                      <span className="block font-serif text-lg leading-snug">{tx(x.name)}</span>
                      <span className="rm-sub">{nm ? <span className={nm.inDays === 0 ? "text-sun-400" : ""}>{t("nextMarket")}: {nm.inDays === 0 ? t("today") : WEEKDAYS[lang][nm.weekday]}</span> : tx(x.sub)}</span>
                    </span>
                    <span className="rm-km">{tripStats(asTrip(x, "dest")).km} km</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rm-list" role="group" aria-label={t("itinerariesTab")}>
                {itineraries.map((x) => (
                  <button key={x.id} type="button" aria-pressed={x.id === itin} onClick={() => { if (x.id === itin) setReplay((r) => r + 1); else { setItin(x.id); setStartDay(x.start); } }} className="rm-dest">
                    <img src={img(x.image)} alt="" loading="lazy" />
                    <span className="min-w-0"><span className="block font-serif text-lg leading-snug">{tx(x.name)}</span><span className="rm-sub">{tx(x.sub)}</span></span>
                    <span className="rm-km">{tripStats(asTrip(x, "itin")).km} km</span>
                  </button>
                ))}
              </div>
              <div className="rm-startday">
                <span>{t("startOn")}</span>
                <div>
                  {WD_SHORT[lang].map((d, k) => (
                    <button key={k} type="button" aria-pressed={k === startDay} onClick={() => setStartDay(k)} title={k === itineraries.find((x) => x.id === itin).start ? t("bestStart") : undefined}>
                      {d}{k === itineraries.find((x) => x.id === itin).start && <i />}
                    </button>
                  ))}
                </div>
              </div>
              <ol className="rm-days">
                {trip.days.map((d, k) => {
                  const wd = (startDay + k) % 7;
                  const mk = [...new Set(d.stops)].filter((s) => marketAt(s, wd));
                  return (
                    <li key={k} className={k === curDay ? "on" : ""}>
                      <div className="flex items-baseline justify-between gap-3">
                        <b>{t("day")} {k + 1} · {WEEKDAYS[lang][wd]}</b>
                        <span className="tabular-nums">{st.dayKm[k]} km</span>
                      </div>
                      <p className="rm-path">{d.stops.map(town).join(" → ")}</p>
                      <p>{tx(d.note)}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {mk.map((s) => <span key={s} className="rm-chip mkt">{town(s)} · {t("market")}</span>)}
                        {d.night && <span className="rm-chip"><Moon size={11} />{t("night")}: {town(d.night)}</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
        {mode === "dest" && (
          <div className="rm-tip order-3 hidden lg:block">
            <small>{t("travelTip")}</small>
            <p>{tx(trip.tip)}</p>
          </div>
        )}
        {stayList.length > 0 && (
          <div className="rm-stays order-3">
            <small><span className="h-3.5 w-3.5" dangerouslySetInnerHTML={{ __html: BED }} />{t("whereToStay")}</small>
            <ul>{stayList.map((h, k) => <li key={k}><b>{tx(h.name)}</b><span>{tx(h.type)} · {town(h.town)}</span></li>)}</ul>
            {trip.stayNote && <p>{tx(trip.stayNote)}</p>}
            <em>{t("staysFlag")}</em>
          </div>
        )}
        <p className="rm-note hidden lg:block">{t("routeNote")} {t("servicesNote")}.</p>
      </div>

      <div className="rm-mapwrap order-2">
        <div ref={mapEl} className="rm-map" aria-label={t("mapLabel")} />
        <button type="button" className="rm-replay" onClick={() => setReplay((r) => r + 1)}><RotateCcw size={14} />{t("replay")}</button>
        <div className="rm-legend" aria-hidden>
          <div><svg width="30" height="8"><line x1="2" y1="4" x2="28" y2="4" stroke="#15181d" strokeWidth="7" strokeLinecap="round" /><line x1="2" y1="4" x2="28" y2="4" stroke="#50555e" strokeWidth="5" strokeLinecap="round" /><line x1="4" y1="4" x2="28" y2="4" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" /></svg>{t("asphaltRoad")}</div>
          <div><svg width="30" height="8"><line x1="2" y1="4" x2="28" y2="4" stroke="#3b2a14" strokeWidth="6" strokeLinecap="round" opacity=".7" /><line x1="3" y1="4" x2="28" y2="4" stroke="#e2bd76" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" /></svg>{t("gravelRoad")}</div>
          <div><span className="rm-key-bed" dangerouslySetInnerHTML={{ __html: BED }} />{t("placesToStay")}</div>
          <div className="rm-key-svc hidden lg:flex">
            {["fuel", "bank", "health"].map((s) => <span key={s}><i className="rm-svc" dangerouslySetInnerHTML={{ __html: ICONS[s] }} />{t(s)}</span>)}
          </div>
        </div>
        <div className="rm-card" aria-live="polite">
          <div className="min-w-0">
            <div className="rm-from">{trip.kind === "itin" ? `${t("day")} ${curDay + 1} / ${trip.days.length} · ${WEEKDAYS[lang][(startDay + curDay) % 7]}` : `${tx(routeStops.jinka)} →`}</div>
            <h3 className="font-serif text-2xl leading-tight sm:text-[1.65rem]">{tx(trip.name)}</h3>
            <div className="rm-surf">
              {st.asphalt > 0 && <span><svg width="22" height="6"><line x1="1" y1="3" x2="21" y2="3" stroke="#50555e" strokeWidth="5" strokeLinecap="round" /><line x1="3" y1="3" x2="21" y2="3" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" /></svg>{st.asphalt} {t("kmAsphalt")}</span>}
              {st.gravel > 0 && <span><svg width="22" height="6"><line x1="2" y1="3" x2="21" y2="3" stroke="#e2bd76" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" /></svg>{st.gravel} {t("kmGravel")}</span>}
              {notOpen.length === 0
                ? <span title={roadInfo.updated ? fill2(t("roadStatusAsOf"), { date: roadInfo.updated }) : t("roadStatusUnconfirmed")}><CheckCircle2 size={14} className="text-leaf-500" />{t("allRoadsOpen")}{!roadInfo.updated && <sup>*</sup>}</span>
                : [...new Map(notOpen.map((l) => [l.key, l])).values()].map((l) => <span key={l.key} className={l.info.status === "closed" ? "text-ember-500" : "text-sun-400"}><AlertTriangle size={14} />{town(l.key.split("-")[0])}–{town(l.key.split("-")[1])}: {t(l.info.status === "closed" ? "roadClosed" : "roadSlow")}</span>)}
              {fuelStop && <span><Fuel size={14} className="text-sun-400" />{t("lastFuel")}: {town(fuelStop)}</span>}
            </div>
          </div>
          <div className="rm-stats">
            <div><strong ref={kmEl}>0 km</strong><small>{t("byRoad")}</small></div>
            <div><strong>≈ {fmt(st.minutes)}</strong><small>{t("drive")}</small></div>
            {trip.kind === "itin"
              ? <div><strong>{nightsCount}</strong><small>{t("nights")}</small></div>
              : <div><strong>{towns > 0 ? `${towns} ${towns > 1 ? t("towns") : t("town")}` : t("direct")}</strong><small>{t("onTheWay")}</small></div>}
          </div>
          <div className="rm-rail">
            <div className="rm-track">
              <div ref={fill} className="rm-fill" />
              {(trip.kind === "itin" ? [...st.dayStart, 1] : st.pos).map((p, i) => (
                <span key={i} className={`rm-pt ${(trip.kind === "itin" ? i <= curDay + (reached === st.legs.length ? 1 : 0) : i <= reached) ? "on" : ""}`} style={{ left: `${p * 100}%` }} />
              ))}
            </div>
            <div className="rm-labels">
              {trip.kind === "itin"
                ? [...st.dayStart.map((p, i) => <span key={i} style={{ left: `${p * 100}%` }}>{t("day")} {i + 1}</span>), <span key="end" style={{ left: "100%" }}>{town("jinka")}</span>]
                : st.pos.map((p, i) => <span key={i} style={{ left: `${p * 100}%` }}>{i === 0 ? t("airport") : tx(routeStops[st.legs[i - 1].to])}</span>)}
            </div>
          </div>
          {!roadInfo.updated && notOpen.length === 0 && <p className="rm-foot">* {t("roadStatusUnconfirmed")}</p>}
        </div>
      </div>
    </div>
  );
}
