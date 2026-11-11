import { CalendarDays, Camera, Compass, Plane, ShoppingBasket, Sun as SunIcon, HeartHandshake } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getTourism } from "../api";
import { Loading, PageHero, Photo, Reveal, SectionHeading } from "../components/ui";
import { CTA } from "./Home";

const DAYS = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], am: ["እሑድ", "ሰኞ", "ማክሰ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"] };
const ETI_ICONS = [Camera, Compass, ShoppingBasket, HeartHandshake];

export default function Tourism() {
  const { t, tx, lang } = useLang();
  const { data, loading } = useAsync(getTourism);
  const today = new Date().getDay();
  return (
    <>
      <PageHero eyebrow={t("tourismEyebrow")} title={t("tourismTitle")} lead={t("tourismLead")} image="omo-river-omorate" />
      {loading ? <Loading /> : (
        <>
          <section className="py-24">
            <div className="container space-y-24">
              {data.attractions.map((a, i) => (
                <div key={a.id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <Reveal className={i % 2 ? "lg:order-2" : ""}><Photo id={a.image} className="aspect-[4/3] rounded-[1.75rem] shadow-lift" /></Reveal>
                  <Reveal delay={0.1}>
                    <span className="text-xs font-semibold uppercase tracking-eyebrow text-sun-600">{String(i + 1).padStart(2, "0")} · {tx(a.tag)}</span>
                    <h2 className="h-section mt-3">{tx(a.title)}</h2>
                    <p className="lead mt-5">{tx(a.text)}</p>
                  </Reveal>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-royal-950 py-24 text-white">
            <div className="container grid gap-14 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionHeading eyebrow={t("attractions")} title={t("markets")} lead={t("marketsLead")} light />
                <Reveal className="overflow-x-auto">
                  <table className="w-full min-w-[540px] text-sm">
                    <thead><tr>
                      <th className="pb-4 text-left font-medium text-white/50"></th>
                      {DAYS[lang].map((d, k) => <th key={k} className={`pb-4 text-center font-medium ${k === today ? "text-sun-400" : "text-white/50"}`}>{d}{k === today && <span className="block text-[10px] font-normal">{t("today")}</span>}</th>)}
                    </tr></thead>
                    <tbody>
                      {data.markets.map((m) => (
                        <tr key={m.place.en} className="border-t border-white/10">
                          <td className="py-4 pr-4"><p className="font-serif text-lg text-white">{tx(m.place)}</p><p className="text-xs text-white/50">{tx(data.woredas.find((w) => w.id === m.woreda).name)}</p></td>
                          {DAYS.en.map((_, k) => <td key={k} className={`text-center ${k === today ? "bg-white/[0.04]" : ""}`}>{m.days.includes(k) ? <span className={`inline-block h-3 w-3 rounded-full ${k === today ? "bg-sun-400 ring-4 ring-sun-400/25" : "bg-royal-400"}`} /> : <span className="text-white/15">·</span>}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Reveal>
              </div>
              <div className="space-y-5 lg:col-span-5">
                {[[Plane, t("gettingThere"), t("gettingThereText")], [SunIcon, t("bestTime"), t("bestTimeText")], [CalendarDays, t("markets"), t("marketsLead")]].map(([I, h, p], k) => (
                  <Reveal key={k} delay={k * 0.08} className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                    <I className="text-sun-400" size={20} /><h3 className="mt-3 font-serif text-xl">{h}</h3><p className="mt-2 text-sm leading-relaxed text-white/70">{p}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24">
            <div className="container">
              <SectionHeading eyebrow={t("tourism")} title={t("etiquetteTitle")} align="center" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {data.etiquette[lang].map(([h, d], k) => { const I = ETI_ICONS[k]; return (
                  <Reveal key={k} delay={k * 0.07} className="card p-7"><span className="grid h-11 w-11 place-items-center rounded-full bg-royal-50 text-royal-600"><I size={19} /></span><h3 className="mt-5 font-serif text-xl text-royal-950">{h}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p></Reveal>
                ); })}
              </div>
              <Reveal className="mt-20">
                <h3 className="text-center text-xs font-semibold uppercase tracking-eyebrow text-royal-600">{t("peoplesTitle")}</h3>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {["dassanech-mother", "hamer-boys", "banna-woman", "dassanech-elder"].map((id) => <Photo key={id} id={id} className="aspect-[3/4] rounded-2xl" imgClass="transition duration-700 hover:scale-105" />)}
                </div>
                <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-ink-mute">{(lang === "am" ? data.peoplesAm : data.peoples).join(" · ")}</p>
              </Reveal>
            </div>
          </section>
          <CTA />
        </>
      )}
    </>
  );
}
