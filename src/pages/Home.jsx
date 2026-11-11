import { Link } from "react-router-dom";
import { useState } from "react";
import { useLang } from "../i18n";
import { useAsync, daysLeft } from "../hooks";
import { getHome, getWoredas, getOpportunities, getSectors, getAnnouncements } from "../api";
import { Loading } from "../components/Common";
import VideoPlayer from "../components/VideoPlayer";
import { WoredaCard, OppCard } from "../components/Cards";
import { SITE } from "../config";

export default function Home() {
  const { t, tx, fmtDate } = useLang();
  const home = useAsync(getHome);
  const woredas = useAsync(getWoredas);
  const opps = useAsync(getOpportunities);
  const sectors = useAsync(getSectors);
  const anns = useAsync(getAnnouncements);
  const [expanded, setExpanded] = useState(false);

  if ([home, woredas, opps, sectors, anns].some((x) => x.loading)) return <Loading />;
  const { leader, stats } = home.data;
  const msg = tx(leader.message);
  const shown = expanded ? msg : msg.slice(0, 1);
  const latest = anns.data.filter((a) => daysLeft(a.deadline) >= 0).sort((a, b) => b.posted.localeCompare(a.posted)).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="kicker">{t("heroKicker")}</p>
          <h1>{tx(SITE.name)}</h1>
          <p className="lead">{tx(SITE.tagline)}</p>
          <div className="row gap">
            <Link className="btn gold" to="/opportunities">{t("invest")}</Link>
            <Link className="btn ghost" to="/announcements">{t("announcements")}</Link>
          </div>
          <div className="stats">
            {stats.map((s, i) => <div key={i}><b>{s.value}</b><span>{tx(s.label)}</span></div>)}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <h2 className="h2">{t("leaderMsg")}</h2>
        <div className="leader">
          <figure>
            <img src={leader.photo} alt={tx(leader.name)} />
            <figcaption><b>{tx(leader.name)}</b><span>{tx(leader.title)}</span></figcaption>
          </figure>
          <div className="text">
            <span className="quote">“</span>
            {shown.map((p, i) => <p key={i}>{p}</p>)}
            {msg.length > 1 && (
              <button className="link btnlink" onClick={() => setExpanded(!expanded)}>
                {expanded ? "−" : t("readMore") + " →"}
              </button>
            )}
          </div>
          <div className="vid">
            <h4>{t("watch")}</h4>
            <VideoPlayer src={leader.video} poster={leader.videoPoster} />
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap section">
          <div className="row between end">
            <h2 className="h2">{t("woredaList")}</h2>
            <Link className="link" to="/woredas">{t("all_")} →</Link>
          </div>
          <div className="grid">
            {woredas.data.slice(0, 4).map((w) => (
              <WoredaCard key={w.id} w={w} count={opps.data.filter((o) => o.woreda === w.id).length} />
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="row between end">
          <h2 className="h2">{t("featured")}</h2>
          <Link className="link" to="/opportunities">{t("all_")} →</Link>
        </div>
        <div className="grid">
          {opps.data.filter((o) => o.investmentUsdM >= 5).slice(0, 3).map((o) => (
            <OppCard key={o.id} o={o} sectors={sectors.data} woredas={woredas.data} />
          ))}
        </div>
      </section>

      <section className="band">
        <div className="wrap section">
          <div className="row between end">
            <h2 className="h2">{t("latestAnn")}</h2>
            <Link className="link" to="/announcements">{t("all_")} →</Link>
          </div>
          <ul className="annlist">
            {latest.map((a) => (
              <li key={a.id}>
                <span className={"pill " + a.type}>{a.type === "vacancy" ? t("vacancies") : t("tenders")}</span>
                <Link to="/announcements" state={{ open: a.id }}>{tx(a.title)}</Link>
                <small className="muted">{t("deadline")}: {fmtDate(a.deadline)}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
