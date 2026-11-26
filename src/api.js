// Data access layer. Functions are async so they can be swapped for fetch() calls to a CMS or API.
import * as c from "./data/content";
import credits from "./data/credits.json";

// Backend (Laravel) address. Set VITE_API_URL at build time, e.g. "./api" when the site is served by Laravel.
// When it is not set, or the API cannot be reached, the site uses its built-in content.
const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const apiEnabled = Boolean(API);

export async function loadRemote(timeoutMs = 5000) {
  if (!API) return false;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}/content`, { signal: ctl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    c.applyRemote(await res.json());
    return true;
  } catch (e) {
    console.warn("Portal API unavailable, using built-in content:", e.message);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Sends the contact form. Without an API it resolves as a demo so the form still works.
export async function sendContact(payload) {
  if (!API) return { ok: true, demo: true };
  const res = await fetch(`${API}/contact`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
  if (res.ok) return { ok: true };
  const body = await res.json().catch(() => ({}));
  return { ok: false, status: res.status, errors: body.errors || {} };
}

const wait = (v, ms = 120) => new Promise((r) => setTimeout(() => r(v), ms));
export const getHome = () => wait({ opportunities: c.opportunities, leader: c.leader, facts: c.facts, sectors: c.sectors, woredas: c.woredas, attractions: c.attractions, announcements: c.announcements });
export const getWoredas = () => wait({ woredas: c.woredas, opportunities: c.opportunities });
export const getWoreda = (id) => wait({ woreda: c.woredas.find((w) => w.id === id) || null, opportunities: c.opportunities.filter((o) => o.woreda === id), sectors: c.sectors });
export const getInvest = () => wait({ sectors: c.sectors, opportunities: c.opportunities, woredas: c.woredas, steps: c.investSteps, principles: c.principles });
export const getTourism = () => wait({ journeys: c.journeys, itineraries: c.itineraries, attractionJourney: c.attractionJourney, attractions: c.attractions, markets: c.markets, etiquette: c.etiquette, peoples: c.peoples, peoplesAm: c.peoplesAm, woredas: c.woredas });
export const getAnnouncements = () => wait(c.announcements);
export const getAbout = () => wait({ leader: c.leader, facts: c.facts, woredas: c.woredas, peoples: c.peoples, peoplesAm: c.peoplesAm });
export const getCredits = () => wait(credits, 0);
