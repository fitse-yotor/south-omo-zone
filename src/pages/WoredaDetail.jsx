import { Link, useParams } from "react-router-dom";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getWoreda, getSectors, getWoredas } from "../api";
import { Loading, WoredaArt } from "../components/Common";
import { OppCard } from "../components/Cards";

export default function WoredaDetail() {
  const { id } = useParams();
  const { t, tx } = useLang();
  const d = useAsync(() => getWoreda(id), [id]);
  const s = useAsync(getSectors);
  const ws = useAsync(getWoredas);
  if (d.loading || s.loading || ws.loading) return <Loading />;
  const { woreda: w, opportunities } = d.data;
  if (!w) return <p className="wrap pad">{t("notFound")}</p>;
  return (
    <>
      <div className="woredahead" style={{ "--h": w.hue }}>
        <WoredaArt hue={w.hue} name={tx(w.name)} />
        <div className="wrap over">
          <Link to="/woredas" className="backlink">← {t("back")}</Link>
          <h1>{tx(w.name)}</h1>
          <p>{tx(w.tagline)}</p>
        </div>
      </div>
      <section className="wrap section">
        <div className="twocol">
          <div>
            <p className="big">{tx(w.about)}</p>
          </div>
          <dl className="facts box">
            <div><dt>{t("centre")}</dt><dd>{tx(w.town)}</dd></div>
            <div><dt>{t("population")}</dt><dd>{w.population.toLocaleString()}</dd></div>
            <div><dt>{t("area")}</dt><dd>{w.areaKm2.toLocaleString()} km²</dd></div>
          </dl>
        </div>
        <h2 className="h2">{t("opportunities")} ({opportunities.length})</h2>
        <div className="grid">
          {opportunities.map((o) => <OppCard key={o.id} o={o} sectors={s.data} woredas={ws.data} showWoreda={false} />)}
        </div>
      </section>
    </>
  );
}
