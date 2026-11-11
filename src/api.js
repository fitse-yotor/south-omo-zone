// Mock API layer. Every function is async so the UI is already written
// the way it will work with a real backend: swap the bodies for fetch() calls.
import { leader, stats, sectors, woredas, opportunities, announcements } from "./data/mock";

const wait = (v, ms = 250) => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms));

export const getHome = () => wait({ leader, stats });
export const getLeader = () => wait(leader);
export const getSectors = () => wait(sectors, 0);
export const getWoredas = () => wait(woredas);
export const getWoreda = (id) =>
  wait({
    woreda: woredas.find((w) => w.id === id) || null,
    opportunities: opportunities.filter((o) => o.woreda === id),
  });
export const getOpportunities = () => wait(opportunities);
export const getAnnouncements = () => wait(announcements);
