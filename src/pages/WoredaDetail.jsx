import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getWoreda } from "../api";
import { icons, Loading, OppCard, PageHero, Reveal, SectionHeading } from "../components/ui";
import { CTA } from "./Home";

export default function WoredaDetail() {
  const { id } = useParams();
  const { t, tx } = useLang();
  const { data, loading } = useAsync(() => getWoreda(id), [id]);
  if (loading) return <><PageHero eyebrow={t("woredas")} title="…" /><Loading /></>;
  const { woreda: w, opportunities, sectors } = data;
  if (!w) return <PageHero eyebrow="404" title={t("notFound")} />;
  return (
    <>
      <PageHero eyebrow={`${t("woredas")} · ${tx(w.tagline)}`} title={tx(w.name)} image={w.image || "turmi-hills"} />
      <section className="py-20">
        <div className="container grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Link to="/woredas" className="link-arrow mb-8"><ArrowLeft size={15} />{t("backWoredas")}</Link>
            <p className="font-serif text-2xl leading-relaxed text-royal-900">{tx(w.about)}</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="card divide-y divide-sand-200">
              {w.seat && <div className="flex gap-4 p-6"><MapPin className="mt-0.5 shrink-0 text-royal-500" size={18} /><div><p className="text-xs uppercase tracking-wider text-ink-mute">{t("seat")}</p><p className="mt-1 font-semibold text-royal-950">{tx(w.seat)}</p></div></div>}
              <div className="flex gap-4 p-6"><Users className="mt-0.5 shrink-0 text-royal-500" size={18} /><div><p className="text-xs uppercase tracking-wider text-ink-mute">{t("peoples")}</p><p className="mt-1 font-semibold text-royal-950">{tx(w.peoples)}</p></div></div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-ink-mute">{t("highlights")}</p>
                <ul className="mt-3 space-y-2">{tx(w.highlights).map((h) => <li key={h} className="flex gap-3 text-sm text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />{h}</li>)}</ul>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-ink-mute">{t("keySectors")}</p>
                <div className="mt-3 flex flex-wrap gap-2">{w.sectors.map((sid) => { const s = sectors.find((x) => x.id === sid); const I = icons[s.icon]; return <span key={sid} className="chip bg-royal-50 text-royal-700"><I size={13} />{tx(s.title)}</span>; })}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      {opportunities.length > 0 && (
        <section className="bg-sand-100 py-24">
          <div className="container">
            <SectionHeading eyebrow={tx(w.name)} title={`${t("opportunities")} (${opportunities.length})`} lead={t("sample")} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{opportunities.map((o) => <OppCard key={o.id} o={o} sectors={sectors} showWoreda={false} />)}</div>
          </div>
        </section>
      )}
      <div className="pt-24"><CTA /></div>
    </>
  );
}
