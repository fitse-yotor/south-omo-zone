import { createContext, useContext, useEffect, useState } from "react";

import { labels } from "./data/labels";

const dict = labels;

const Ctx = createContext(null);
export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lang") || "en"; } catch { return "en"; }
  });
  useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);
  const t = (k) => dict[lang][k] ?? dict.en[k] ?? k;
  const tx = (o) => (o && typeof o === "object" && !Array.isArray(o) ? o[lang] ?? o.en : o);
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString(lang === "am" ? "am-ET" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  return <Ctx.Provider value={{ lang, setLang, t, tx, fmtDate }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
