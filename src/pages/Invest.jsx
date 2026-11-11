import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Check, Info, Search } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getInvest } from "../api";
import { icons, Loading, OppCard, PageHero, Photo, Reveal, SectionHeading } from "../components/ui";
import { CTA } from "./Home";

export default function Invest() {
  const { t, tx, lang } = useLang();
  const { data, loading } = useAsync(getInvest);
  const [sector, setSector] = useState("all");
  const [woreda, setWoreda] = useState("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => !data ? [] : data.opportunities.filter((o) =>
    (sector === "all" || o.sector === sector) && (woreda === "all" || o.woreda === woreda) &&
    (tx(o.title) + " " + tx(o.summary)).toLowerCase().includes(q.toLowerCase())), [data, sector, woreda, q, lang]);

  return (
    <>
      <PageHero eyebrow={t("sectorsEyebrow")} title={t("sectorsTitle")} lead={t("sectorsLead")} image="banna-village" />
      {loading ? <Loading /> : (
        <>
          <section className="py-24">
            <div className="container grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {data.sectors.map((s, i) => {
                const Icon = icons[s.icon];
                return (
                  <Reveal key={s.id} delay={(i % 3) * 0.08}>
                    <Photo id={s.image} className="aspect-[16/10] rounded-2xl" />
                    <div className="mt-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-royal-50 text-royal-600"><Icon size={18} /></span><h3 className="font-serif text-2xl text-royal-950">{tx(s.title)}</h3></div>
                    <p className="mt-3 leading-relaxed text-ink-soft">{tx(s.text)}</p>
                  </Reveal>
                );
              })}
            </div>
          </section>

          <section id="opportunities" className="bg-sand-100 py-24">
            <div className="container">
              <SectionHeading eyebrow={t("invest")} title={t("opportunities")}>
                <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-sun-100 px-4 py-3 text-sm text-sun-600"><Info size={16} className="mt-0.5 shrink-0" />{t("sample")}</p>
              </SectionHeading>
              <div className="mb-6 grid gap-3 md:grid-cols-[1fr_240px]">
                <label className="relative">
                  <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="w-full rounded-full border-0 bg-white py-3.5 pl-11 pr-4 shadow-soft ring-1 ring-royal-950/5 focus:ring-2 focus:ring-royal-400" />
                </label>
                <select value={woreda} onChange={(e) => setWoreda(e.target.value)} aria-label={t("woreda")} className="rounded-full border-0 bg-white px-5 py-3.5 shadow-soft ring-1 ring-royal-950/5 focus:ring-2 focus:ring-royal-400">
                  <option value="all">{t("woreda")}: {t("all")}</option>
                  {data.woredas.map((w) => <option key={w.id} value={w.id}>{tx(w.name)}</option>)}
                </select>
              </div>
              <div className="mb-10 flex flex-wrap gap-2">
                {[["all", t("all")], ...data.sectors.map((s) => [s.id, tx(s.title)])].map(([k, l]) => (
                  <button key={k} onClick={() => setSector(k)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${sector === k ? "bg-royal-600 text-white shadow-soft" : "bg-white text-ink-soft ring-1 ring-royal-950/5 hover:text-royal-700"}`}>{l}</button>
                ))}
              </div>
              {list.length === 0 ? <p className="py-16 text-center text-ink-mute">{t("noResults")}</p> : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">{list.map((o) => <OppCard key={o.id} o={o} sectors={data.sectors} woredas={data.woredas} />)}</AnimatePresence>
                </div>
              )}
            </div>
          </section>

          <section className="py-24">
            <div className="container grid gap-16 lg:grid-cols-2">
              <div>
                <SectionHeading eyebrow={t("stepsEyebrow")} title={t("stepsTitle")} />
                <ol className="relative space-y-8 border-l border-royal-100 pl-10">
                  {data.steps[lang].map(([h, d], i) => (
                    <Reveal as="li" key={i} delay={i * 0.06} className="relative">
                      <span className="absolute -left-[3.6rem] grid h-9 w-9 place-items-center rounded-full bg-royal-600 font-serif text-white ring-8 ring-sand-50">{i + 1}</span>
                      <h3 className="font-serif text-xl text-royal-950">{h}</h3>
                      <p className="mt-1 text-ink-soft">{d}</p>
                    </Reveal>
                  ))}
                </ol>
              </div>
              <div>
                <SectionHeading eyebrow={t("principlesEyebrow")} title={t("principlesTitle")} />
                <div className="grid gap-4">
                  {data.principles[lang].map(([h, d], i) => (
                    <Reveal key={i} delay={i * 0.06} className="card flex gap-4 p-6">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-600"><Check size={17} /></span>
                      <div><h3 className="font-semibold text-royal-950">{h}</h3><p className="mt-1 text-sm leading-relaxed text-ink-soft">{d}</p></div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <CTA />
        </>
      )}
    </>
  );
}
