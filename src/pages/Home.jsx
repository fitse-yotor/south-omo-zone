import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Play, Quote } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync, daysLeft } from "../hooks";
import { getHome } from "../api";
import { img, zone } from "../data/content";
import credits from "../data/credits.json";
import { AnnDetail, AnnRow, icons, Loading, Modal, Photo, Reveal, Rings, SectionHeading, VideoPlayer, WoredaCard } from "../components/ui";
import { LOGO } from "../components/Layout";

const SLIDES = [
  { id: "turmi-hills", caption: { en: "Hills near Turmi, Hamer", am: "በቱርሚ አቅራቢያ ያሉ ኮረብቶች፣ ሐመር" } },
  { id: "omo-river-omorate", caption: { en: "The Omo River at Omorate", am: "የኦሞ ወንዝ በኦሞራቴ" } },
  { id: "banna-village", caption: { en: "Farmland and homesteads, Bena Tsemay", am: "የእርሻ መሬትና መንደሮች፣ በና ጸማይ" } },
  { id: "hamer-village", caption: { en: "A Hamer village near Turmi", am: "በቱርሚ አቅራቢያ የሐመር መንደር" } },
];

function Hero() {
  const { t, tx } = useLang();
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 7000); return () => clearInterval(id); }, []);
  const s = SLIDES[i];
  const c = credits.find((x) => x.id === s.id);
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-royal-950 text-white">
      <AnimatePresence initial={false}>
        <motion.img key={s.id} src={img(s.id)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.6 }, scale: { duration: 9, ease: "linear" } }} />
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-royal-950 via-royal-950/40 to-royal-950/50" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-royal-950/70 to-transparent" />

      <div className="container pb-40 pt-36 sm:pb-48 sm:pt-40">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
          <span className="eyebrow !text-sun-400">{tx(zone.region)}</span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">{tx(zone.tagline)}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/80">{tx(zone.intro)}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/invest" className="btn-light">{t("exploreInvest")}<ArrowRight size={16} /></Link>
            <Link to="/tourism" className="btn-ghost">{t("planVisit")}</Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-24 left-0 right-0">
        <div className="container flex items-end justify-between gap-6">
          <div className="flex gap-2">
            {SLIDES.map((x, k) => (
              <button key={x.id} onClick={() => setI(k)} aria-label={tx(x.caption)} className="h-1 w-10 overflow-hidden rounded-full bg-white/25">
                {k === i && <motion.span key={i} className="block h-full bg-sun-400" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 7, ease: "linear" }} />}
              </button>
            ))}
          </div>
          <p className="hidden text-right text-xs text-white/60 sm:block">{tx(s.caption)}<span className="hidden sm:inline"> · © {c?.author}, {c?.license}</span></p>
        </div>
      </div>
    </section>
  );
}

function Facts({ facts }) {
  const { tx } = useLang();
  return (
    <section className="relative z-10 -mt-16">
      <div className="container">
        <Reveal className="card grid grid-cols-2 divide-sand-200 overflow-hidden lg:grid-cols-4 lg:divide-x">
          {facts.map((f, i) => (
            <div key={i} className={`p-6 sm:p-8 ${i < 2 ? "border-b border-sand-200 lg:border-b-0" : ""} ${i % 2 === 0 ? "border-r border-sand-200 lg:border-r-0" : ""}`}>
              <p className="font-serif text-3xl text-royal-700 sm:text-4xl">{f.value}</p>
              <p className="mt-2 text-sm leading-snug text-ink-soft">{tx(f.label)}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Leader({ leader }) {
  const { t, tx } = useLang();
  const [video, setVideo] = useState(false);
  return (
    <section className="py-24 sm:py-32">
      <div className="container grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-[2rem] border border-royal-200 sm:block" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-royal-600 to-royal-950 shadow-lift">
              {leader.photo ? <img src={leader.photo} alt={tx(leader.name)} className="h-full w-full object-cover" /> : (
                <div className="flex h-full flex-col items-center justify-center text-center text-white">
                  <Rings className="absolute h-[130%] w-[130%] text-white/10" />
                  <img src={LOGO} alt="" className="relative h-32 w-32 rounded-full bg-white p-1 shadow-lift" />
                  <p className="relative mt-6 font-serif text-xl">{tx(leader.name)}</p>
                  <p className="relative text-sm text-white/60">{tx(leader.title)}</p>
                </div>
              )}
              <button onClick={() => setVideo(true)} className="absolute bottom-5 left-5 right-5 flex items-center gap-4 rounded-2xl bg-white/95 p-3 pr-5 text-left shadow-soft backdrop-blur transition hover:bg-white">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-royal-600 text-white"><Play size={18} className="ml-0.5" fill="currentColor" /></span>
                <span className="text-sm font-semibold text-royal-950">{t("watchVideo")}</span>
              </button>
            </div>
          </div>
        </Reveal>
        <div className="lg:col-span-7">
          <Reveal><span className="eyebrow">{t("leaderEyebrow")}</span><h2 className="h-section mt-4">{t("leaderTitle")}</h2></Reveal>
          <Reveal delay={0.1} className="relative mt-10">
            <Quote className="mb-4 h-10 w-10 text-sun-500" />
            <p className="relative font-serif text-2xl italic leading-relaxed text-royal-900 sm:text-[1.7rem]">{tx(leader.excerpt)}</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center gap-6 border-t border-sand-200 pt-8">
            <div><p className="font-serif text-lg text-royal-950">{tx(leader.name)}</p><p className="text-sm text-ink-mute">{tx(leader.title)}</p></div>
            <Link to="/about#message" className="link-arrow ml-auto">{t("readFull")}<ArrowRight size={15} /></Link>
          </Reveal>
        </div>
      </div>
      <Modal open={video} onClose={() => setVideo(false)} wide><VideoPlayer src={leader.video} poster="omo-river-omorate" /></Modal>
    </section>
  );
}

function Sectors({ sectors }) {
  const { t, tx } = useLang();
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t("sectorsEyebrow")} title={t("sectorsTitle")} lead={t("sectorsLead")} />
          <Reveal className="mb-12"><Link to="/invest" className="btn-outline">{t("exploreInvest")}<ArrowRight size={15} /></Link></Reveal>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((s, i) => {
            const Icon = icons[s.icon];
            return (
              <Reveal key={s.id} delay={(i % 3) * 0.08}>
                <Link to="/invest" className="group relative block aspect-[4/3] overflow-hidden rounded-2xl">
                  <Photo id={s.image} className="absolute inset-0" imgClass="transition duration-[1.2s] group-hover:scale-110" showCredit={false} />
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/55 to-royal-950/5 transition duration-500 group-hover:via-royal-950/70" />
                  <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"><Icon size={19} /></span>
                    <h3 className="mt-4 font-serif text-2xl">{tx(s.title)}</h3>
                    <p className="mt-2 max-h-0 overflow-hidden text-sm leading-relaxed text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100">{tx(s.text)}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Tourism({ attractions }) {
  const { t, tx } = useLang();
  const pick = (id) => attractions.find((x) => x.id === id);
  const [a, b, c, d] = ["hamer", "omo-river", "mago", "markets"].map(pick);
  const Tile = ({ x, className, big }) => (
    <Link to="/tourism" className={`group relative overflow-hidden rounded-2xl ${className}`}>
      <Photo id={x.image} className="absolute inset-0" imgClass="transition duration-[1.2s] group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-royal-950/85 via-transparent to-transparent" />
      <div className="absolute bottom-0 p-6 text-white">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sun-400">{tx(x.tag)}</span>
        <h3 className={`mt-1 font-serif ${big ? "text-3xl" : "text-xl"}`}>{tx(x.title)}</h3>
      </div>
    </Link>
  );
  return (
    <section className="relative overflow-hidden bg-royal-950 py-24 text-white sm:py-32">
      <Rings className="absolute -left-40 top-10 h-[34rem] w-[34rem] text-white/[0.04]" />
      <div className="container relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t("tourismEyebrow")} title={t("tourismTitle")} lead={t("tourismLead")} light />
          <Reveal className="mb-12"><Link to="/tourism" className="btn-ghost">{t("exploreTourism")}<ArrowRight size={15} /></Link></Reveal>
        </div>
        <Reveal className="grid auto-rows-[220px] gap-4 md:grid-cols-4">
          <Tile x={a} big className="md:col-span-2 md:row-span-2" />
          <Tile x={b} className="md:col-span-2" />
          <Tile x={c} className="" />
          <Tile x={d} className="" />
        </Reveal>
      </div>
    </section>
  );
}

function Notices({ announcements }) {
  const { t } = useLang();
  const [sel, setSel] = useState(null);
  const open = announcements.filter((a) => daysLeft(a.deadline) >= 0).sort((a, b) => b.posted.localeCompare(a.posted));
  const col = (type) => open.filter((a) => a.type === type).slice(0, 3);
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t("annEyebrow")} title={t("annTitle")} />
          <Reveal className="mb-12"><Link to="/announcements" className="link-arrow">{t("allAnn")}<ArrowRight size={15} /></Link></Reveal>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {["vacancy", "tender"].map((type, k) => (
            <Reveal key={type} delay={k * 0.1} className="rounded-3xl bg-sand-100 p-3">
              <h3 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-eyebrow text-royal-600">{type === "vacancy" ? t("vacancies") : t("tenders")}</h3>
              {col(type).map((a) => <AnnRow key={a.id} a={a} onOpen={setSel} />)}
            </Reveal>
          ))}
        </div>
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)}><AnnDetail a={sel} /></Modal>
    </section>
  );
}

export function CTA() {
  const { t } = useLang();
  return (
    <section className="pb-24 sm:pb-32">
      <div className="container">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-royal-600 via-royal-700 to-royal-900 px-8 py-16 text-white sm:px-16">
          <Rings className="absolute -right-20 -top-20 h-96 w-96 text-white/10" />
          <div className="relative max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl">{t("ctaTitle")}</h2>
            <p className="mt-4 text-lg text-white/80">{t("ctaText")}</p>
            <Link to="/contact" className="btn-light mt-8">{t("ctaBtn")}<ArrowRight size={16} /></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLang();
  const { data, loading } = useAsync(getHome);
  return (
    <>
      <Hero />
      {loading ? <Loading /> : (
        <>
          <Facts facts={data.facts} />
          <Leader leader={data.leader} />
          <Sectors sectors={data.sectors} />
          <section className="bg-sand-100 py-24 sm:py-32">
            <div className="container">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading eyebrow={t("woredasEyebrow")} title={t("woredasTitle")} />
                <Reveal className="mb-12"><Link to="/woredas" className="link-arrow">{t("allWoredas")}<ArrowRight size={15} /></Link></Reveal>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {data.woredas.slice(0, 4).map((w, i) => <WoredaCard key={w.id} w={w} index={i} count={data.opportunities.filter((o) => o.woreda === w.id).length} />)}
              </div>
            </div>
          </section>
          <Tourism attractions={data.attractions} />
          <Notices announcements={data.announcements} />
          <CTA />
        </>
      )}
    </>
  );
}
