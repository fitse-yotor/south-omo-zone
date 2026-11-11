import { useState } from "react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getWoredas, getOpportunities } from "../api";
import { Loading } from "../components/Common";
import { WoredaCard } from "../components/Cards";

export default function Woredas() {
  const { t, tx } = useLang();
  const w = useAsync(getWoredas);
  const o = useAsync(getOpportunities);
  const [q, setQ] = useState("");
  if (w.loading || o.loading) return <Loading />;
  const list = w.data.filter((x) => (tx(x.name) + tx(x.town)).toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="wrap section">
      <h1 className="h1">{t("woredaList")}</h1>
      <p className="muted">{t("woredaIntro")}</p>
      <input className="input" placeholder={t("search") + "…"} value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 ? <p className="muted">{t("noResults")}</p> : (
        <div className="grid">
          {list.map((x) => <WoredaCard key={x.id} w={x} count={o.data.filter((p) => p.woreda === x.id).length} />)}
        </div>
      )}
    </section>
  );
}
