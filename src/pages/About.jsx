import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Play } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getAbout } from "../api";
import { zone } from "../data/content";
import { Loading, Modal, PageHero, Photo, Reveal, Rings, SectionHeading, VideoPlayer, WoredaCard } from "../components/ui";
import { LOGO } from "../components/Layout";
import { CTA } from "./Home";

export default function About() {
  const { t, tx, lang } = useLang();
  const { data, loading } = useAsync(getAbout);
  const [video, setVideo] = useState(false);
  const { hash } = useLocation();
  useEffect(() => {
    if (!loading && hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [loading, hash]);
  return (
    <>
      <PageHero eyebrow={t("aboutEyebrow")} title={tx(zone.name)} lead={tx(zone.intro)} image="lower-omo-aerial" />
      {loading ? <Loading /> : (
        <>
          <section className="py-24">
            <div className="container grid gap-16 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionHeading eyebrow={t("aboutEyebrow")} title={t("aboutTitle")} />
                <Reveal className="card divide-y divide-sand-200">
                  {[[t("capital"), tx(zone.capital)], [t("region"), tx(zone.region)], [t("woredas"), data.woredas.length], ...data.facts.slice(1).map((f) => [tx(f.label), f.value])].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-6 px-6 py-4"><span className="text-sm text-ink-soft">{k}</span><span className="text-right font-serif text-lg text-royal-900">{v}</span></div>
                  ))}
                </Reveal>
              </div>
              <div className="lg:col-span-7">
                <Reveal className="grid grid-cols-2 gap-4">
                  <Photo id="omo-river-banks" className="col-span-2 aspect-[16/8] rounded-2xl" />
                  <Photo id="dassanech-elder" className="aspect-square rounded-2xl" />
                  <Photo id="banna-woman" className="aspect-square rounded-2xl" />
                </Reveal>
                <Reveal className="mt-10">
                  <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-royal-600">{t("peoplesTitle")}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">{(lang === "am" ? data.peoplesAm : data.peoples).map((p) => <span key={p} className="chip bg-white text-royal-800 ring-1 ring-royal-100">{p}</span>)}</div>
                </Reveal>
              </div>
            </div>
          </section>

          <section id="message" className="scroll-mt-24 bg-white py-24">
            <div className="container grid gap-14 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <div className="sticky top-28">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-royal-600 to-royal-950 text-white">
                    {data.leader.photo ? <img src={data.leader.photo} alt="" className="h-full w-full object-cover" /> : (
                      <div className="flex h-full flex-col items-center justify-center">
                        <Rings className="absolute h-[130%] w-[130%] text-white/10" />
                        <img src={LOGO} alt="" className="relative h-28 w-28 rounded-full bg-white p-1" />
                      </div>
                    )}
                  </div>
                  <p className="mt-5 font-serif text-xl text-royal-950">{tx(data.leader.name)}</p>
                  <p className="text-sm text-ink-mute">{tx(data.leader.title)}</p>
                  <button onClick={() => setVideo(true)} className="btn-primary mt-6"><Play size={15} fill="currentColor" />{t("watchVideo")}</button>
                </div>
              </Reveal>
              <div className="lg:col-span-8">
                <Reveal><span className="eyebrow">{t("leaderEyebrow")}</span><h2 className="h-section mt-4">{t("leaderTitle")}</h2></Reveal>
                <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink-soft">
                  {tx(data.leader.message).map((p, i) => (
                    <Reveal key={i} delay={i * 0.05}><p className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[.85] first-letter:text-royal-600" : ""}>{p}</p></Reveal>
                  ))}
                </div>
                <Reveal className="mt-10 border-t border-sand-200 pt-6 font-serif text-xl italic text-royal-900">{tx(data.leader.name)}</Reveal>
              </div>
            </div>
            <Modal open={video} onClose={() => setVideo(false)} wide><VideoPlayer src={data.leader.video} poster="omo-river-omorate" /></Modal>
          </section>

          <section className="py-24">
            <div className="container">
              <SectionHeading eyebrow={t("woredasEyebrow")} title={t("woredasTitle")} />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{data.woredas.map((w, i) => <WoredaCard key={w.id} w={w} index={i} />)}</div>
            </div>
          </section>
          <CTA />
        </>
      )}
    </>
  );
}
