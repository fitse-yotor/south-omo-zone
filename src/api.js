// Data access layer. Functions are async so they can be swapped for fetch() calls to a CMS or API.
import * as c from "./data/content";
import credits from "./data/credits.json";

const wait = (v, ms = 120) => new Promise((r) => setTimeout(() => r(v), ms));
export const getHome = () => wait({ opportunities: c.opportunities, leader: c.leader, facts: c.facts, sectors: c.sectors, woredas: c.woredas, attractions: c.attractions, announcements: c.announcements });
export const getWoredas = () => wait({ woredas: c.woredas, opportunities: c.opportunities });
export const getWoreda = (id) => wait({ woreda: c.woredas.find((w) => w.id === id) || null, opportunities: c.opportunities.filter((o) => o.woreda === id), sectors: c.sectors });
export const getInvest = () => wait({ sectors: c.sectors, opportunities: c.opportunities, woredas: c.woredas, steps: c.investSteps, principles: c.principles });
export const getTourism = () => wait({ attractions: c.attractions, markets: c.markets, etiquette: c.etiquette, peoples: c.peoples, peoplesAm: c.peoplesAm, woredas: c.woredas });
export const getAnnouncements = () => wait(c.announcements);
export const getAbout = () => wait({ leader: c.leader, facts: c.facts, woredas: c.woredas, peoples: c.peoples, peoplesAm: c.peoplesAm });
export const getCredits = () => wait(credits, 0);
