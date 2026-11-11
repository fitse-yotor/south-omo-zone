import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "../i18n";
import { useAsync, daysLeft } from "../hooks";
import { getAnnouncements } from "../api";
import { Loading } from "../components/Common";
import { AnnCard } from "../components/Cards";

export default function Announcements() {
  const { t, tx, fmtDate } = useLang();
  const a = useAsync(getAnnouncements);
  const loc = useLocation();
  const [tab, setTab] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    if (a.data && loc.state?.open) setSel(a.data.find((x) => x.id === loc.state.open) || null);
  }, [a.data, loc.state]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (a.loading) return <Loading />;
  const list = a.data
    .filter((x) => (tab === "all" || x.type === tab) && (showClosed || daysLeft(x.deadline) >= 0))
    .sort((x, y) => x.deadline.localeCompare(y.deadline));
  const tabs = [["all", t("all")], ["vacancy", t("vacancies")], ["tender", t("tenders")]];

  return (
    <section className="wrap section">
      <h1 className="h1">{t("announcements")}</h1>
      <p className="muted">{t("annIntro")}</p>
      <div className="row between wrapflex">
        <div className="chips">
          {tabs.map(([k, l]) => (
            <button key={k} className={tab === k ? "chipbtn on" : "chipbtn"} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <label className="check"><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> {t("showClosed")}</label>
      </div>
      {list.length === 0 ? <p className="muted">{t("noResults")}</p> : (
        <div className="grid">{list.map((x) => <AnnCard key={x.id} a={x} onOpen={setSel} />)}</div>
      )}

      {sel && (
        <div className="modal" onClick={() => setSel(null)} role="dialog" aria-modal="true">
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <span className={"pill " + sel.type}>{sel.type === "vacancy" ? t("vacancies") : t("tenders")}</span>
            <h2>{tx(sel.title)}</h2>
            <dl className="facts">
              <div><dt>{t("organization")}</dt><dd>{tx(sel.org)}</dd></div>
              <div><dt>{t("location")}</dt><dd>{tx(sel.location)}</dd></div>
              {sel.ref && <div><dt>{t("reference")}</dt><dd>{sel.ref}</dd></div>}
              <div><dt>{t("posted")}</dt><dd>{fmtDate(sel.posted)}</dd></div>
              <div><dt>{t("deadline")}</dt><dd>{fmtDate(sel.deadline)}</dd></div>
            </dl>
            <p>{tx(sel.description)}</p>
            <h4>{t("requirements")}</h4>
            <ul>{tx(sel.details).map((d, i) => <li key={i}>{d}</li>)}</ul>
            <button className="btn green" onClick={() => setSel(null)}>{t("close")}</button>
          </div>
        </div>
      )}
    </section>
  );
}
