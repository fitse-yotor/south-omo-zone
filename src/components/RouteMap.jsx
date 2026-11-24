import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RotateCcw } from "lucide-react";
import { useLang } from "../i18n";
import { img, roadLegs, routeStops, stays } from "../data/content";
import routes from "../data/routes.json";

// Animated journeys from Jinka Airport on satellite imagery.
// A plane lands at Jinka, then a 4×4 drives the real road to the chosen destination.

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ATTRIBUTION = "Imagery © Esri, Maxar, Earthstar Geographics · Roads © OpenStreetMap";
const S = routes.stops;
const TOWN = { jinka: { en: "Jinka", am: "ጂንካ" }, mago: { en: "Mago N.P.", am: "ማጎ ፓርክ" } };

const PLANE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>`;
const BED = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`;
const CAR = `<svg class="rm-vehicle" viewBox="0 0 20 38"><rect x=".5" y="6" width="3" height="7" rx="1.2" fill="#111"/><rect x="16.5" y="6" width="3" height="7" rx="1.2" fill="#111"/><rect x=".5" y="25" width="3" height="7" rx="1.2" fill="#111"/><rect x="16.5" y="25" width="3" height="7" rx="1.2" fill="#111"/><rect x="2" y="1" width="16" height="36" rx="4.5" fill="#f4f1ea" stroke="#9a958a" stroke-width=".8"/><path d="M4 10.5Q10 7.5 16 10.5L15 14Q10 12.6 5 14Z" fill="#1d2a3a"/><rect x="4.5" y="15.5" width="11" height="15" rx="1.5" fill="#e3ded2"/><g stroke="#8d877b" stroke-width=".9"><path d="M5.5 18h9M5.5 21.5h9M5.5 25h9M5.5 28.5h9"/></g><path d="M5 33.5Q10 35 15 33.5V31.5H5Z" fill="#1d2a3a"/><rect x="3.2" y="1.6" width="3.2" height="1.6" rx=".8" fill="#fff6c8"/><rect x="13.6" y="1.6" width="3.2" height="1.6" rx=".8" fill="#fff6c8"/></svg>`;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const hav = (a, b) => {
  const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};

export function journeyStats(j) {
  const legs = j.stops.slice(1).map((s, i) => `${j.stops[i]}-${s}`);
  let km = 0, minutes = 0, asphalt = 0, gravel = 0;
  const pos = [0];
  legs.forEach((k) => {
    const d = routes.legs[k].km;
    km += d; minutes += roadLegs[k].minutes;
    roadLegs[k].surface === "asphalt" ? (asphalt += d) : (gravel += d);
  });
  let acc = 0;
  legs.forEach((k) => { acc += routes.legs[k].km; pos.push(acc / km); });
  return { legs, km, minutes, asphalt, gravel, pos };
}

function roadLayers(map) {
  const o = (x) => ({ interactive: false, lineCap: "round", lineJoin: "round", ...x });
  Object.entries(routes.legs).forEach(([k, l]) => {
    if (roadLegs[k]?.surface === "asphalt") {
      L.polyline(l.path, o({ color: "#15181d", weight: 7, opacity: 0.9 })).addTo(map);
      L.polyline(l.path, o({ color: "#50555e", weight: 5 })).addTo(map);
      L.polyline(l.path, o({ color: "#ffffff", weight: 1, opacity: 0.85, dashArray: "5 7", lineCap: "butt" })).addTo(map);
    } else {
      L.polyline(l.path, o({ color: "#3b2a14", weight: 6, opacity: 0.6 })).addTo(map);
      L.polyline(l.path, o({ color: "#e2bd76", weight: 3, dashArray: "1 6" })).addTo(map);
    }
  });
}

export default function RouteMap({ journeys, selected, onSelect }) {
  const { t, tx, lang } = useLang();
  const box = useRef(null);
  const mapEl = useRef(null);
  const api = useRef(null);
  const fill = useRef(null);
  const kmEl = useRef(null);
  const [reached, setReached] = useState(0);
  const [visible, setVisible] = useState(false);
  const [replay, setReplay] = useState(0);
  const j = journeys.find((x) => x.id === selected) || journeys[0];
  const st = journeyStats(j);

  const fmt = (m) => {
    m = Math.round(m / 15) * 15;
    const h = Math.floor(m / 60), r = m % 60;
    return h ? `${h} ${t("hr")}${r ? ` ${r}` : ""}` : `${r} ${t("min")}`;
  };

  // Create the map (again when the language changes, so labels follow it)
  useEffect(() => {
    const map = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: false, zoomSnap: 1 }).setView([5.25, 36.55], 9);
    map.attributionControl.setPrefix(false);
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer(TILE_URL, { maxZoom: 17, attribution: ATTRIBUTION }).addTo(map);
    map.createPane("rm-glow").style.zIndex = 390;
    roadLayers(map);

    const markers = {};
    Object.entries(S).forEach(([k, ll]) => {
      const html = k === "jinka"
        ? `<div class="rm-airport"><b>${PLANE}</b><span>${tx(routeStops.jinka)}</span></div>`
        : `<div class="rm-stop dim"><i></i><span>${tx(routeStops[k])}</span></div>`;
      markers[k] = L.marker(ll, { icon: L.divIcon({ className: "", iconSize: [0, 0], html }), interactive: false, zIndexOffset: k === "jinka" ? 1000 : 0 }).addTo(map);
    });
    const beds = {};
    Object.keys(stays).forEach((k) => {
      beds[k] = L.marker(S[k], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="rm-bed${k === "jinka" ? " j" : ""}">${BED}</div>` }), interactive: false, zIndexOffset: 900 }).addTo(map);
    });
    api.current = { map, markers, beds, layers: [], run: 0 };
    return () => { api.current.run++; map.remove(); api.current = null; };
  }, [lang]);

  // Start the first journey once the map scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  // Play the journey
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

    a.layers.forEach((l) => map.removeLayer(l));
    a.layers = [];
    Object.keys(S).forEach((k) => { if (k !== "jinka" && el(k)) el(k).className = `rm-stop ${j.stops.includes(k) ? "" : "dim"}`; });
    Object.entries(beds).forEach(([k, m]) => m.getElement()?.firstElementChild.classList.toggle("on", j.stayAt.includes(k)));
    setReached(0);
    progress(0);

    let path = [];
    st.legs.forEach((k, i) => { const p = routes.legs[k].path; path = path.concat(i ? p.slice(1) : p); });
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + hav(path[i - 1], path[i]));
    const total = cum[cum.length - 1];
    const bounds = L.latLngBounds(path);
    const wide = box.current.clientWidth > 560;
    const fit = { paddingTopLeft: [60, 60], paddingBottomRight: [60, wide ? 200 : 60] };
    const halo = L.polyline([], { pane: "rm-glow", color: "#f2c94c", weight: 26, opacity: 0.18, lineCap: "round", lineJoin: "round", interactive: false }).addTo(map);
    const glow = L.polyline([], { pane: "rm-glow", color: "#f2c94c", weight: 14, opacity: 0.6, lineCap: "round", lineJoin: "round", interactive: false }).addTo(map);
    a.layers.push(halo, glow);
    const dest = j.stops[j.stops.length - 1];
    const finish = () => { j.stops.slice(1).forEach((k) => el(k)?.classList.add("hit")); el(dest)?.classList.add("end"); setReached(j.stops.length - 1); };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.fitBounds(bounds, fit); halo.setLatLngs(path); glow.setLatLngs(path); progress(1); finish();
      return;
    }

    (async () => {
      // 1. Land at Jinka
      map.flyTo([S.jinka[0] - 0.05, S.jinka[1] + 0.1], 10, { duration: 1.1 });
      if (!(await moveEnd())) return;
      const A = [S.jinka[0] + 0.55, S.jinka[1] + 0.75], B = S.jinka, C = [S.jinka[0] + 0.42, S.jinka[1] + 0.05];
      const plane = L.marker(A, { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="rm-plane">${PLANE}</div>` }), interactive: false, zIndexOffset: 2000 }).addTo(map);
      a.layers.push(plane);
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

      // 2. Frame the route
      map.flyToBounds(bounds, { ...fit, duration: 1.2 });
      if (!(await moveEnd())) return;
      const car = L.marker(path[0], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: CAR }), interactive: false, zIndexOffset: 1500 }).addTo(map);
      a.layers.push(car);
      const ve = car.getElement().firstElementChild;
      let heading = 0;

      // 3. Drive, pausing at each town
      let from = 0;
      for (let s = 1; s < st.pos.length; s++) {
        const to = st.pos[s] * total;
        await anim(Math.max(900, (to - from) * 26), (p) => {
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
        el(j.stops[s])?.classList.add("hit");
        setReached(s);
        from = to;
        if (!(await sleep(380))) return;
      }
      ve.style.transition = "opacity .6s";
      ve.style.opacity = 0;
      finish();
    })();
  }, [selected, visible, replay, lang]);

  const towns = j.stops.length - 2;
  const stayList = j.stayAt.flatMap((town) => stays[town].map((h) => ({ ...h, town })));

  return (
    <div ref={box} className="route-map grid gap-7 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="contents lg:block lg:min-w-0">
        <div className="rm-list order-1" role="group" aria-label={t("destinations")}>
          {journeys.map((x) => (
            <button key={x.id} type="button" aria-pressed={x.id === j.id} onClick={() => (x.id === j.id ? setReplay((r) => r + 1) : onSelect(x.id))} className="rm-dest">
              <img src={img(x.image)} alt="" loading="lazy" />
              <span className="min-w-0">
                <span className="block font-serif text-lg leading-snug">{tx(x.name)}</span>
                <span className="rm-sub">{tx(x.sub)}</span>
              </span>
              <span className="rm-km">{journeyStats(x).km} km</span>
            </button>
          ))}
        </div>
        <div className="rm-tip order-3 hidden lg:block">
          <small>{t("travelTip")}</small>
          <p>{tx(j.tip)}</p>
        </div>
        <div className="rm-stays order-3">
          <small><span className="h-3.5 w-3.5" dangerouslySetInnerHTML={{ __html: BED }} />{t("whereToStay")}</small>
          <ul>
            {stayList.map((h, k) => (
              <li key={k}><b>{tx(h.name)}</b><span>{tx(h.type)} · {tx(TOWN[h.town] || routeStops[h.town])}</span></li>
            ))}
          </ul>
          <p>{tx(j.stayNote)}</p>
          <em>{t("staysFlag")}</em>
        </div>
        <p className="rm-note hidden lg:block">{t("routeNote")}</p>
      </div>

      <div className="rm-mapwrap order-2">
        <div ref={mapEl} className="rm-map" aria-label={t("mapLabel")} />
        <button type="button" className="rm-replay" onClick={() => setReplay((r) => r + 1)}><RotateCcw size={14} />{t("replay")}</button>
        <div className="rm-legend" aria-hidden>
          <div><svg width="30" height="8"><line x1="2" y1="4" x2="28" y2="4" stroke="#15181d" strokeWidth="7" strokeLinecap="round" /><line x1="2" y1="4" x2="28" y2="4" stroke="#50555e" strokeWidth="5" strokeLinecap="round" /><line x1="4" y1="4" x2="28" y2="4" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" /></svg>{t("asphaltRoad")}</div>
          <div><svg width="30" height="8"><line x1="2" y1="4" x2="28" y2="4" stroke="#3b2a14" strokeWidth="6" strokeLinecap="round" opacity=".7" /><line x1="3" y1="4" x2="28" y2="4" stroke="#e2bd76" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" /></svg>{t("gravelRoad")}</div>
          <div><span className="rm-key-bed" dangerouslySetInnerHTML={{ __html: BED }} />{t("placesToStay")}</div>
        </div>
        <div className="rm-card" aria-live="polite">
          <div className="min-w-0">
            <div className="rm-from">{tx(routeStops.jinka)} →</div>
            <h3 className="font-serif text-2xl leading-tight sm:text-[1.65rem]">{tx(j.name)}</h3>
            <div className="rm-surf">
              {st.asphalt > 0 && <span><svg width="22" height="6"><line x1="1" y1="3" x2="21" y2="3" stroke="#50555e" strokeWidth="5" strokeLinecap="round" /><line x1="3" y1="3" x2="21" y2="3" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" /></svg>{st.asphalt} {t("kmAsphalt")}</span>}
              {st.gravel > 0 && <span><svg width="22" height="6"><line x1="2" y1="3" x2="21" y2="3" stroke="#e2bd76" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" /></svg>{st.gravel} {t("kmGravel")}</span>}
            </div>
          </div>
          <div className="rm-stats">
            <div><strong ref={kmEl}>0 km</strong><small>{t("byRoad")}</small></div>
            <div><strong>≈ {fmt(st.minutes)}</strong><small>{t("drive")}</small></div>
            <div><strong>{towns > 0 ? `${towns} ${towns > 1 ? t("towns") : t("town")}` : t("direct")}</strong><small>{t("onTheWay")}</small></div>
          </div>
          <div className="rm-rail">
            <div className="rm-track">
              <div ref={fill} className="rm-fill" />
              {st.pos.map((p, i) => <span key={i} className={`rm-pt ${i <= reached ? "on" : ""}`} style={{ left: `${p * 100}%` }} />)}
            </div>
            <div className="rm-labels">
              {st.pos.map((p, i) => <span key={i} style={{ left: `${p * 100}%` }}>{i === 0 ? t("airport") : tx(routeStops[j.stops[i]])}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
