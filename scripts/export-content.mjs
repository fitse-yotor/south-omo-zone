// Exports the site's built-in content to JSON for the Laravel database seeder.
// Usage: node scripts/export-content.mjs  →  backend/database/data/content.json
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as c from "../src/data/content.js";
import { labels } from "../src/data/labels.js";
import credits from "../src/data/credits.json" with { type: "json" };
import routes from "../src/data/routes.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "backend/database/data/content.json");
const both = (v) => (v && typeof v === "object" ? v : { en: v ?? "", am: v ?? "" }); // "Buska Lodge" → { en, am }

const data = {
  exportedOn: new Date().toISOString().slice(0, 10),
  // Built-in photos shipped with the site (photo picker + credits page)
  photos: credits.map((p) => ({ id: p.id, credit: `${p.author}, ${p.license}` })),
  credits,
  zone: { name: c.zone.name, admin: c.zone.admin, region: c.zone.region, capital: c.zone.capital, tagline: c.zone.tagline, intro: c.zone.intro },
  contact: c.zone.contact,
  heroSlides: c.heroSlides,
  facts: c.facts,
  leader: c.leader,
  sectors: c.sectors,
  woredas: c.woredas,
  opportunities: c.opportunities,
  attractions: c.attractions.map((a) => ({ ...a, journey: c.attractionJourney[a.id] || null })),
  announcements: c.announcements,
  markets: c.markets,
  peoples: c.peoples.map((en, i) => ({ en, am: c.peoplesAm[i] || en })),
  guide: { etiquette: c.etiquette, step: c.investSteps, principle: c.principles },
  // Towns on the tourism map. Their positions and the road shapes come from src/data/routes.json (OpenStreetMap).
  stops: Object.keys(routes.stops).map((key, i) => ({
    key, sort: i, name: c.routeStops[key] || { en: key, am: key },
    services: c.townServices[key] || [], photo: c.townPhotos[key] || null,
    stays: (c.stays[key] || []).map((s) => ({ name: both(s.name), type: both(s.type) })),
  })),
  legs: Object.keys(routes.legs),
  roadLegs: Object.fromEntries(Object.entries(c.roadLegs).map(([k, v]) => [k, { status: v.status, note: v.note || null, surface: v.surface, minutes: v.minutes }])),
  roadStatusUpdated: c.roadStatusUpdated,
  rainyMonths: c.rainyMonths,
  journeys: c.journeys,
  itineraries: c.itineraries,
  labels,
};
fs.writeFileSync(out, JSON.stringify(data, null, 1) + "\n");
console.log("wrote", path.relative(root, out));
console.log(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.length : v && typeof v === "object" ? Object.keys(v).length : v])));
