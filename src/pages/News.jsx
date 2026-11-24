import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Info, Link2 } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getNews, getNewsItem } from "../api";
import { img } from "../data/content";
import credits from "../data/credits.json";
import { Loading, PageHero, Photo, Reveal } from "../components/ui";

const readMinutes = (n, lang) => Math.max(1, Math.round([n.summary?.[lang], ...(n.body?.[lang] || [])].join(" ").split(/\s+/).length / 200));

export function NewsCard({ n, big }) {
  const { t, tx, fmtDate } = useLang();
  return (
    <Link to={`/news/${n.id}`} className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Photo id={n.image} className={big ? "aspect-[16/9]" : "aspect-[4/3]"} imgClass="transition duration-700 group-hover:scale-105" />
      <span className="flex flex-1 flex-col p-6">
        <span className="text-xs font-medium text-sun-600">{fmtDate(n.date)}</span>
        <span className={`mt-2 font-serif leading-snug text-royal-950 ${big ? "text-2xl" : "text-xl"}`}>{tx(n.title)}</span>
        <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{tx(n.summary)}</span>
        <span className="link-arrow mt-auto pt-5">{t("readMore")}<ArrowRight size={15} /></span>
      </span>
    </Link>
  );
}

export default function News() {
  const { t } = useLang();
  const { data, loading } = useAsync(getNews);
  return (
    <>
      <PageHero eyebrow={t("newsEyebrow")} title={t("newsTitle")} image="banna-village" />
      {loading ? <Loading /> : (
        <section className="py-20">
          <div className="container">
            <p className="mb-8 flex items-start gap-2 text-sm text-ink-mute"><Info size={15} className="mt-0.5 shrink-0" />{t("sampleNews")}</p>
            {data.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.map((n, i) => <Reveal key={n.id} delay={(i % 3) * 0.07} className={i === 0 ? "md:col-span-2" : ""}><NewsCard n={n} big={i === 0} /></Reveal>)}
              </div>
            ) : <p className="py-16 text-center text-ink-mute">{t("noNews")}</p>}
          </div>
        </section>
      )}
    </>
  );
}

function CopyLink() {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setDone(true); setTimeout(() => setDone(false), 2200); }
    catch { window.prompt?.(t("copyLink"), window.location.href); }
  };
  return (
    <button type="button" onClick={copy} className="btn-outline !px-4 !py-2">
      {done ? <Check size={15} className="text-leaf-500" /> : <Link2 size={15} />}{done ? t("linkCopied") : t("copyLink")}
    </button>
  );
}

export function NewsArticle() {
  const { id } = useParams();
  const { t, tx, lang, fmtDate } = useLang();
  const { data, loading } = useAsync(() => getNewsItem(id), [id]);
  if (loading) return <div className="pt-32"><Loading /></div>;
  if (!data.item) {
    return (
      <>
        <PageHero eyebrow={t("news")} title={t("newsNotFound")} image="banna-village" />
        <div className="container py-16"><Link to="/news" className="link-arrow"><ArrowLeft size={15} />{t("backToNews")}</Link></div>
      </>
    );
  }
  const n = data.item;
  const c = credits.find((x) => x.id === n.image);
  const body = tx(n.body) || [];

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-royal-950 pb-16 pt-36 text-white sm:pb-24 sm:pt-44">
        <img src={img(n.image)} alt="" className="absolute inset-0 -z-10 h-full w-full scale-105 object-cover opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-royal-950 via-royal-950/60 to-royal-950/30" />
        <div className="container max-w-3xl">
          <Link to="/news" className="inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"><ArrowLeft size={15} />{t("backToNews")}</Link>
          <h1 className="mt-6 text-balance font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">{tx(n.title)}</h1>
          <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
            <span className="flex items-center gap-2"><CalendarDays size={15} className="text-sun-400" />{fmtDate(n.date)}</span>
            <span className="flex items-center gap-2"><Clock size={15} className="text-sun-400" />{readMinutes(n, lang)} {t("minRead")}</span>
          </p>
        </div>
      </header>

      <div className="container max-w-3xl py-14 sm:py-20">
        {tx(n.summary) && <p className="font-serif text-xl leading-relaxed text-royal-950 sm:text-2xl">{tx(n.summary)}</p>}
        <figure className="my-10">
          <Photo id={n.image} className="aspect-[16/9] rounded-[1.5rem] shadow-soft" showCredit={false} />
          {c && <figcaption className="mt-3 text-xs text-ink-mute">{t("photo")}: {c.author} · {c.license} · <a href={c.source} target="_blank" rel="noreferrer" className="underline decoration-sand-300 underline-offset-2 hover:text-royal-700">Wikimedia Commons</a></figcaption>}
        </figure>
        <div className="space-y-6 text-[17px] leading-[1.8] text-ink-soft">
          {body.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-sand-200 pt-8">
          <Link to="/news" className="link-arrow"><ArrowLeft size={15} />{t("backToNews")}</Link>
          <CopyLink />
        </div>
      </div>

      {data.more.length > 0 && (
        <section className="bg-sand-100 py-20">
          <div className="container">
            <h2 className="h-section">{t("moreNews")}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {data.more.map((m, i) => <Reveal key={m.id} delay={i * 0.07}><NewsCard n={m} /></Reveal>)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
