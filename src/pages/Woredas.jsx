import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getWoredas } from "../api";
import { Loading, PageHero, WoredaCard } from "../components/ui";
import { CTA } from "./Home";

export default function Woredas() {
  const { t } = useLang();
  const { data, loading } = useAsync(getWoredas);
  return (
    <>
      <PageHero eyebrow={t("woredasEyebrow")} title={t("woredasTitle")} image="turmi-hills" />
      {loading ? <Loading /> : (
        <section className="py-24">
          <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.woredas.map((w, i) => <WoredaCard key={w.id} w={w} index={i} count={data.opportunities.filter((o) => o.woreda === w.id).length} />)}
          </div>
        </section>
      )}
      <CTA />
    </>
  );
}
