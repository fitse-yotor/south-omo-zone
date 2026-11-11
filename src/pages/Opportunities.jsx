import { useState } from "react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getOpportunities, getSectors, getWoredas } from "../api";
import { Loading } from "../components/Common";
import { OppCard } from "../components/Cards";

export default function Opportunities() {
  const { t, tx } = useLang();
  const o = useAsync(getOpportunities);
  const s = useAsync(getSectors);
  const w = useAsync(getWoredas);
  const [sector, setSector] = useState("all");
  const [woreda, setWoreda] = useState("all");
  const [q, setQ] = useState("");
  if (o.loading || s.loading || w.loading) return <Loading />;
  const list = o.data.filter((x) =>
    (sector === "all" || x.sector === sector) &&
    (woreda === "all" || x.woreda === woreda) &&
    (tx(x.title) + tx(x.summary)).toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="wrap section">
      <h1 className="h1">{t("opportunities")}</h1>
      <div className="filters">
        <input className="input" placeholder={t("search") + "…"} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={woreda} onChange={(e) => setWoreda(e.target.value)} aria-label={t("woreda")}>
          <option value="all">{t("woreda")}: {t("all")}</option>
          {w.data.map((x) => <option key={x.id} value={x.id}>{tx(x.name)}</option>)}
        </select>
      </div>
      <div className="chips">
        <button className={sector === "all" ? "chipbtn on" : "chipbtn"} onClick={() => setSector("all")}>{t("all")}</button>
        {Object.entries(s.data).map(([k, v]) => (
          <button key={k} className={sector === k ? "chipbtn on" : "chipbtn"} onClick={() => setSector(k)}>{tx(v)}</button>
        ))}
      </div>
      {list.length === 0 ? <p className="muted">{t("noResults")}</p> : (
        <div className="grid">{list.map((x) => <OppCard key={x.id} o={x} sectors={s.data} woredas={w.data} />)}</div>
      )}
    </section>
  );
}
