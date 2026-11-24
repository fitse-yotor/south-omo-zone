import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getNews } from "../api";
import { Loading, Modal, PageHero, Photo, Reveal } from "../components/ui";

export function NewsCard({ n, onOpen, big }) {
  const { t, tx, fmtDate } = useLang();
  return (
    <button type="button" onClick={() => onOpen(n)} className="group card flex h-full flex-col overflow-hidden text-left transition hover:-translate-y-1 hover:shadow-lift">
      <Photo id={n.image} className={big ? "aspect-[16/9]" : "aspect-[4/3]"} imgClass="transition duration-700 group-hover:scale-105" />
      <span className="flex flex-1 flex-col p-6">
        <span className="text-xs font-medium text-sun-600">{fmtDate(n.date)}</span>
        <span className={`mt-2 font-serif leading-snug text-royal-950 ${big ? "text-2xl" : "text-xl"}`}>{tx(n.title)}</span>
        <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{tx(n.summary)}</span>
        <span className="link-arrow mt-auto pt-5">{t("readMore")}<ArrowRight size={15} /></span>
      </span>
    </button>
  );
}

export function NewsDetail({ n }) {
  const { tx, fmtDate } = useLang();
  if (!n) return null;
  return (
    <article>
      <Photo id={n.image} className="-mx-8 -mt-8 mb-8 aspect-[16/9] sm:-mx-10 sm:-mt-10" />
      <span className="text-xs font-medium text-sun-600">{fmtDate(n.date)}</span>
      <h2 className="mt-2 font-serif text-3xl leading-tight text-royal-950">{tx(n.title)}</h2>
      <div className="mt-5 space-y-4 leading-relaxed text-ink-soft">{(tx(n.body) || []).map((p, i) => <p key={i}>{p}</p>)}</div>
    </article>
  );
}

export default function News() {
  const { t } = useLang();
  const { data, loading } = useAsync(getNews);
  const [sel, setSel] = useState(null);
  return (
    <>
      <PageHero eyebrow={t("newsEyebrow")} title={t("newsTitle")} image="banna-village" />
      {loading ? <Loading /> : (
        <section className="py-20">
          <div className="container">
            <p className="mb-8 flex items-start gap-2 text-sm text-ink-mute"><Info size={15} className="mt-0.5 shrink-0" />{t("sampleNews")}</p>
            {data.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.map((n, i) => <Reveal key={n.id} delay={(i % 3) * 0.07} className={i === 0 ? "md:col-span-2" : ""}><NewsCard n={n} onOpen={setSel} big={i === 0} /></Reveal>)}
              </div>
            ) : <p className="py-16 text-center text-ink-mute">{t("noNews")}</p>}
          </div>
          <Modal open={!!sel} onClose={() => setSel(null)}><NewsDetail n={sel} /></Modal>
        </section>
      )}
    </>
  );
}
