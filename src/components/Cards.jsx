import { Link } from "react-router-dom";
import { useLang } from "../i18n";
import { SectorTag, WoredaArt } from "./Common";
import { daysLeft } from "../hooks";

export function WoredaCard({ w, count }) {
  const { t, tx } = useLang();
  return (
    <Link to={`/woredas/${w.id}`} className="card woreda">
      <WoredaArt hue={w.hue} name={tx(w.name)} />
      <div className="body">
        <h3>{tx(w.name)}</h3>
        <p className="muted">{tx(w.tagline)}</p>
        <div className="row between">
          <span className="chip">{count} {t("opps")}</span>
          <span className="link">{t("viewWoreda")} →</span>
        </div>
      </div>
    </Link>
  );
}

export function OppCard({ o, sectors, woredas, showWoreda = true }) {
  const { t, tx } = useLang();
  const w = woredas?.find((x) => x.id === o.woreda);
  return (
    <article className="card opp">
      <div className="row between">
        <SectorTag id={o.sector} sectors={sectors} />
        <span className={"status " + o.status}>{o.status === "limited" ? t("limited") : t("available")}</span>
      </div>
      <h3>{tx(o.title)}</h3>
      {showWoreda && w && <Link className="link small" to={`/woredas/${w.id}`}>📍 {tx(w.name)}</Link>}
      <p className="muted">{tx(o.summary)}</p>
      <dl className="facts">
        <div><dt>{t("land")}</dt><dd>{o.landHa.toLocaleString()} {t("ha")}</dd></div>
        <div><dt>{t("investment")}</dt><dd>{o.investmentUsdM} {t("musd")}</dd></div>
        <div><dt>{t("jobs")}</dt><dd>{o.jobs.toLocaleString()}</dd></div>
      </dl>
    </article>
  );
}

export function AnnCard({ a, onOpen }) {
  const { t, tx, fmtDate } = useLang();
  const d = daysLeft(a.deadline);
  const closed = d < 0;
  return (
    <article className={"card ann" + (closed ? " isclosed" : "")} onClick={() => onOpen(a)} tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(a)}>
      <div className="row between">
        <span className={"pill " + a.type}>{a.type === "vacancy" ? t("vacancies") : t("tenders")}</span>
        <span className={"status " + (closed ? "closed" : "available")}>
          {closed ? t("closed") : d === 0 ? t("closesToday") : `${d} ${t("daysLeft")}`}
        </span>
      </div>
      <h3>{tx(a.title)}</h3>
      <p className="muted small">{tx(a.org)}</p>
      <p>{tx(a.description)}</p>
      <div className="row between small muted">
        <span>{t("deadline")}: {fmtDate(a.deadline)}</span>
        <span className="link">{t("viewDetails")} →</span>
      </div>
    </article>
  );
}
