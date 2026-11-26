// Exports the site's built-in content (src/data/content.js) to JSON for the Laravel database seeder.
// Usage: node scripts/export-content.mjs  →  backend/database/data/content.json
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as c from "../src/data/content.js";
import credits from "../src/data/credits.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "backend/database/data/content.json");
const data = {
  // Built-in photos shipped with the site, offered in the admin panel's photo picker.
  photos: credits.map((p) => ({ id: p.id, credit: `${p.author}, ${p.license}` })),
  exportedOn: new Date().toISOString().slice(0, 10),
  contact: c.zone.contact,
  leader: c.leader,
  sectors: c.sectors,
  woredas: c.woredas,
  opportunities: c.opportunities,
  attractions: c.attractions,
  announcements: c.announcements,
  roadLegs: Object.fromEntries(Object.entries(c.roadLegs).map(([k, v]) => [k, { status: v.status, note: v.note || null }])),
  roadStatusUpdated: c.roadStatusUpdated,
};
fs.writeFileSync(out, JSON.stringify(data, null, 1) + "\n");
console.log("wrote", path.relative(root, out), Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.length : typeof v])));
