import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { useLang } from "../i18n";
import { zone } from "../data/content";

export const LOGO = "./brand/logo.png";
const NAV = [["/", "home"], ["/about", "about"], ["/invest", "invest"], ["/woredas", "woredas"], ["/tourism", "tourism"], ["/announcements", "announcements"], ["/contact", "contact"]];

function LangSwitch({ dark }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex rounded-full p-0.5 text-xs font-semibold ring-1 ${dark ? "ring-royal-200" : "ring-white/30"}`} role="group" aria-label="Language">
      {[["en", "EN"], ["am", "አማ"]].map(([k, l]) => (
        <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k}
          className={`rounded-full px-3 py-1 transition ${lang === k ? (dark ? "bg-royal-600 text-white" : "bg-white text-royal-900") : dark ? "text-royal-700" : "text-white/80 hover:text-white"}`}>{l}</button>
      ))}
    </div>
  );
}

function Brand({ dark }) {
  const { tx, lang } = useLang();
  return (
    <Link to="/" className="flex items-center gap-3">
      <img src={LOGO} alt="" className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full bg-white object-contain p-0.5 shadow-soft" />
      <span className="leading-tight">
        <span className={`block whitespace-nowrap font-serif text-base sm:text-lg ${dark ? "text-royal-950" : "text-white"}`}>{tx(zone.name)}</span>
        <span className={`block text-[11px] ${dark ? "text-ink-mute" : "text-white/70"}`}>{lang === "en" ? zone.name.am : zone.name.en}</span>
      </span>
    </Link>
  );
}

export default function Layout() {
  const { t, tx } = useLang();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const solid = scrolled || open;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className={`hidden bg-royal-950 text-[12px] text-white/70 transition-all duration-500 md:block ${scrolled ? "h-0 overflow-hidden opacity-0" : "h-9 opacity-100"}`}>
          <div className="container flex h-9 items-center justify-between">
            <span>{t("region")} · {t("officialPortal")}</span>
            <span className="flex items-center gap-5">
              <a href={`tel:${zone.contact.phone}`} className="flex items-center gap-1.5 hover:text-white"><Phone size={12} />{zone.contact.phone}</a>
              <a href={`mailto:${zone.contact.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail size={12} />{zone.contact.email}</a>
            </span>
          </div>
        </div>
        <div className={`transition-all duration-500 ${solid ? "bg-white/95 shadow-soft backdrop-blur-md" : "bg-gradient-to-b from-royal-950/60 to-transparent"}`}>
          <div className="container flex h-20 items-center justify-between gap-6">
            <Brand dark={solid} />
            <nav className="hidden items-center gap-1 xl:flex">
              {NAV.map(([to, k]) => (
                <NavLink key={to} to={to} end={to === "/"}
                  className={({ isActive }) => `relative rounded-full px-3.5 py-2 text-sm font-medium transition ${solid ? "text-ink-soft hover:text-royal-700" : "text-white/85 hover:text-white"} ${isActive ? (solid ? "!text-royal-700" : "!text-white") : ""}`}>
                  {({ isActive }) => (<>{t(k)}{isActive && <motion.span layoutId="nav-dot" className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full ${solid ? "bg-royal-600" : "bg-sun-400"}`} />}</>)}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <LangSwitch dark={solid} />
              <button onClick={() => setOpen(!open)} aria-label={t("menu")} className={`grid h-10 w-10 place-items-center rounded-full xl:hidden ${solid ? "text-royal-900 hover:bg-sand-100" : "text-white hover:bg-white/10"}`}>
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {open && (
              <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-sand-200 xl:hidden">
                <div className="container grid gap-1 py-4">
                  {NAV.map(([to, k]) => (
                    <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `rounded-xl px-4 py-3 font-medium ${isActive ? "bg-royal-50 text-royal-700" : "text-ink-soft"}`}>{t(k)}</NavLink>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="relative overflow-hidden bg-royal-950 text-white/70">
        <div className="h-1 bg-gradient-to-r from-royal-600 via-sun-500 to-leaf-500" />
        <div className="container grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img src={LOGO} alt="" className="h-14 w-14 rounded-full bg-white p-0.5" />
              <div><p className="font-serif text-xl text-white">{tx(zone.name)}</p><p className="text-xs">{tx(zone.region)}</p></div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed">{t("footerAbout")}</p>
          </div>
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-eyebrow text-sun-400">{t("quickLinks")}</h4>
            <ul className="mt-5 grid gap-2.5 text-sm">
              {NAV.slice(1).map(([to, k]) => <li key={to}><Link to={to} className="hover:text-white">{t(k)}</Link></li>)}
              <li><Link to="/credits" className="hover:text-white">{t("credits")}</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-eyebrow text-sun-400">{t("reachUs")}</h4>
            <ul className="mt-5 grid gap-3 text-sm">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-royal-400" />{tx(zone.contact.address)}</li>
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-royal-400" />{zone.contact.phone}</li>
              <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-royal-400" />{zone.contact.invest}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container flex flex-col justify-between gap-2 py-6 text-xs sm:flex-row">
            <span>© {new Date().getFullYear()} {t("rights")}</span>
            <Link to="/credits" className="hover:text-white">{t("credits")}: Wikimedia Commons (CC BY / CC BY-SA)</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
