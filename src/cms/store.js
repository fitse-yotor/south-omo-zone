// Content store for the admin panel.
//
// DEMO MODE: edits are saved in this browser's localStorage and applied on top of the defaults
// in src/data/content.js. Nobody else sees them. To publish, export the data from /admin/data
// and replace the defaults, or connect a real backend by replacing readSaved/writeSaved below.
//
// Edits are applied in place to the objects exported from content.js, so every page and
// component that imports them shows the edited content without further changes.
import * as content from "../data/content";

const STORAGE_KEY = "som-cms-v1";

export const COLLECTIONS = {
  news: "News",
  announcements: "Announcements",
  roadLegs: "Road status",
  roadInfo: "Road check date",
  stays: "Places to stay",
  markets: "Market days",
  journeys: "Destinations & tips",
  opportunities: "Investment opportunities",
  woredas: "Woredas",
  leader: "Leader's message",
  facts: "Key facts",
  zone: "Zone & contact details",
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const defaults = {};
const listeners = new Set();

function readSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function writeSaved(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch { return false; }
}
function replaceInPlace(target, value) {
  const v = clone(value);
  if (Array.isArray(target)) target.splice(0, target.length, ...v);
  else { Object.keys(target).forEach((k) => delete target[k]); Object.assign(target, v); }
}
const emit = () => listeners.forEach((fn) => fn());

// Call once before the app renders
export function initStore() {
  Object.keys(COLLECTIONS).forEach((k) => { defaults[k] = clone(content[k]); });
  const saved = readSaved();
  Object.keys(COLLECTIONS).forEach((k) => { if (saved[k] !== undefined) replaceInPlace(content[k], saved[k]); });
}

export const get = (key) => content[key];
export const getCopy = (key) => clone(content[key]);
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function save(key, value) {
  replaceInPlace(content[key], value);
  const saved = readSaved();
  saved[key] = clone(value);
  saved._updated = { ...(saved._updated || {}), [key]: new Date().toISOString() };
  const ok = writeSaved(saved);
  emit();
  return ok;
}

export function reset(key) {
  replaceInPlace(content[key], defaults[key]);
  const saved = readSaved();
  delete saved[key];
  if (saved._updated) delete saved._updated[key];
  writeSaved(saved);
  emit();
}
export function resetAll() { Object.keys(COLLECTIONS).forEach(reset); }

// Which collections have edits, and when each was last saved
export function changes() {
  const saved = readSaved();
  return Object.keys(COLLECTIONS).filter((k) => saved[k] !== undefined).map((k) => ({ key: k, label: COLLECTIONS[k], at: saved._updated?.[k] }));
}

export function exportData() {
  return { app: "south-omo-zone-cms", version: 1, exportedAt: new Date().toISOString(), data: Object.fromEntries(Object.keys(COLLECTIONS).map((k) => [k, clone(content[k])])) };
}

// Returns the list of collections imported; throws with a readable message if the file is wrong
export function importData(obj) {
  if (!obj || obj.app !== "south-omo-zone-cms" || typeof obj.data !== "object") throw new Error("This file is not a South Omo content export.");
  const keys = Object.keys(obj.data).filter((k) => k in COLLECTIONS);
  keys.forEach((k) => {
    if (Array.isArray(content[k]) !== Array.isArray(obj.data[k])) throw new Error(`"${COLLECTIONS[k]}" has the wrong shape.`);
  });
  keys.forEach((k) => save(k, obj.data[k]));
  return keys.map((k) => COLLECTIONS[k]);
}
