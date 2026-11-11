import { useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLang } from "../i18n";
import { LOGO_SRC, SITE } from "../config";

export default function Layout() {
  const { lang, setLang, t, tx } = useLang();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  const links = [["/", "home"], ["/woredas", "woredas"], ["/opportunities", "opportunities"], ["/announcements", "announcements"], ["/contact", "contact"]];
  return (
    <>
      <header className="header">
        <div className="wrap bar">
          <Link to="/" className="brand">
            <img src={LOGO_SRC} alt="" width="44" height="44" />
            <span><b>{tx(SITE.name)}</b><small>{lang === "en" ? SITE.name.am : SITE.name.en}</small></span>
          </Link>
          <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>☰</button>
          <nav className={open ? "nav open" : "nav"}>
            {links.map(([to, k]) => (
              <NavLink key={to} to={to} end={to === "/"}>{t(k)}</NavLink>
            ))}
            <div className="lang" role="group" aria-label="Language">
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
              <button className={lang === "am" ? "on" : ""} onClick={() => setLang("am")}>አማ</button>
            </div>
          </nav>
        </div>
        <div className="flagbar" />
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <div className="wrap grid3">
          <div>
            <div className="brand light"><img src={LOGO_SRC} alt="" width="40" height="40" /><b>{tx(SITE.name)}</b></div>
            <p>{t("footerAbout")}</p>
          </div>
          <div>
            <h4>{t("quickLinks")}</h4>
            {links.map(([to, k]) => <Link key={to} to={to}>{t(k)}</Link>)}
          </div>
          <div>
            <h4>{t("contact")}</h4>
            <p>{tx(SITE.contact.address)}</p>
            <p>{SITE.contact.phone}</p>
            <p>{SITE.contact.email}</p>
          </div>
        </div>
        <div className="wrap legal">© {new Date().getFullYear()} {tx(SITE.name)} · {t("mock")}</div>
      </footer>
    </>
  );
}
