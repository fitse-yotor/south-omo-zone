// Data access layer. Functions are async so they can be swapped for fetch() calls to a CMS or API.
import * as c from "./data/content";
import credits from "./data/credits.json";

const wait = (v, ms = 120) => new Promise((r) => setTimeout(() => r(v), ms));
export const getHome = () => wait({ news: publishedNews().slice(0, 3), opportunities: c.opportunities, leader: c.leader, facts: c.facts, sectors: c.sectors, woredas: c.woredas, attractions: c.attractions, announcements: c.announcements });
export const getWoredas = () => wait({ woredas: c.woredas, opportunities: c.opportunities });
export const getWoreda = (id) => wait({ woreda: c.woredas.find((w) => w.id === id) || null, opportunities: c.opportunities.filter((o) => o.woreda === id), sectors: c.sectors });
export const getInvest = () => wait({ sectors: c.sectors, opportunities: c.opportunities, woredas: c.woredas, steps: c.investSteps, principles: c.principles });
export const getTourism = () => wait({ journeys: c.journeys, itineraries: c.itineraries, attractionJourney: c.attractionJourney, attractions: c.attractions, markets: c.markets, etiquette: c.etiquette, peoples: c.peoples, peoplesAm: c.peoplesAm, woredas: c.woredas });
const publishedNews = () => c.news.filter((n) => n.published).sort((a, b) => b.date.localeCompare(a.date));
export const getNews = () => wait(publishedNews());
export const getNewsItem = (id) => wait({ item: publishedNews().find((n) => n.id === id) || null, more: publishedNews().filter((n) => n.id !== id).slice(0, 3) });
export const getAnnouncements = () => wait(c.announcements);
export const getAbout = () => wait({ leader: c.leader, facts: c.facts, woredas: c.woredas, peoples: c.peoples, peoplesAm: c.peoplesAm });
export const getCredits = () => wait(credits, 0);
