import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Beef, Binoculars, CalendarClock, Factory, Fish, MapPin, Sprout, Sun, X, FileText, Briefcase } from "lucide-react";
import { useLang } from "../i18n";
import { daysLeft } from "../hooks";
import { img } from "../data/content";
import credits from "../data/credits.json";

export const icons = { Sprout, Beef, Factory, Fish, Binoculars, Sun };
const creditOf = (id) => credits.find((c) => c.id === id);

export function Reveal({ children, delay = 0, y = 24, className = "", as = "div" }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  );
}

export function SectionHeading({ eyebrow, title, lead, align = "left", light = false, children }) {
  const center = align === "center";
  return (
    <Reveal className={`${center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} mb-12`}>
      {eyebrow && <span className={`eyebrow ${light ? "!text-sun-400" : ""}`}>{eyebrow}</span>}
      <h2 className={`h-section mt-4 ${light ? "!text-white" : ""}`}>{title}</h2>
      {lead && <p className={`lead mt-5 ${light ? "!text-white/75" : ""}`}>{lead}</p>}
      {children}
    </Reveal>
  );
}

// Photo with automatic CC attribution on hover
export function Photo({ id, alt = "", className = "", imgClass = "", showCredit = true }) {
  const c = creditOf(id);
  return (
    <div className={`group/photo overflow-hidden bg-royal-900 ${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} ${className}`}>
      <img src={img(id)} alt={alt} loading="lazy" className={`h-full w-full object-cover ${imgClass}`} />
      {showCredit && c && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/45 px-2 py-0.5 text-[10px] text-white/80 opacity-0 backdrop-blur transition group-hover/photo:opacity-100">
          © {c.author} · {c.license}
        </span>
      )}
    </div>
  );
}

// Decorative ring motif, echoing the gear ring of the emblem
export function Rings({ className = "" }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none" stroke="currentColor">
      <circle cx="200" cy="200" r="190" strokeWidth="1" />
      <circle cx="200" cy="200" r="160" strokeWidth="1" strokeDasharray="2 10" />
      <circle cx="200" cy="200" r="130" strokeWidth="1" />
      <circle cx="200" cy="200" r="100" strokeWidth="18" strokeDasharray="6 9" opacity=".5" />
    </svg>
  );
}

export function Loading() {
  const { t } = useLang();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-ink-mute">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-royal-200 border-t-royal-600" />{t("loading")}
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, lead, image }) {
  return (
    <section className="relative isolate overflow-hidden bg-royal-950 pb-20 pt-40 text-white sm:pb-28 sm:pt-48">
      {image && <Photo id={image} className="absolute inset-0 -z-10 !bg-royal-950" imgClass="opacity-45 scale-105" showCredit={false} />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-royal-950 via-royal-950/60 to-royal-950/30" />
      <Rings className="absolute -right-24 -top-24 -z-10 h-[28rem] w-[28rem] text-white/10" />
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
          <span className="eyebrow !text-sun-400">{eyebrow}</span>
          <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
          {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{lead}</p>}
        </motion.div>
      </div>
    </section>
  );
}

export function Modal({ open, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-royal-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true">
          <motion.div className={`relative max-h-[90vh] w-full overflow-auto rounded-3xl bg-white shadow-lift ${wide ? "max-w-4xl" : "max-w-2xl"}`}
            initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-royal-900 shadow-soft hover:bg-sand-100">
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const ytEmbed = (u) => {
  const m = u?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : null;
};
export function VideoPlayer({ src, poster }) {
  const { t } = useLang();
  if (!src)
    return (
      <div className="relative grid aspect-video place-items-center overflow-hidden bg-royal-950 text-center text-white">
        {poster && <Photo id={poster} className="absolute inset-0" imgClass="opacity-35" showCredit={false} />}
        <div className="relative px-8">
          <Rings className="mx-auto h-24 w-24 text-sun-400/70" />
          <p className="mt-4 font-serif text-2xl">{t("watchVideo")}</p>
          <p className="mt-2 text-sm text-white/70">{t("videoSoon")}</p>
        </div>
      </div>
    );
  const yt = ytEmbed(src);
  return (
    <div className="aspect-video bg-black">
      {yt ? <iframe className="h-full w-full" src={yt} title="Video" allow="autoplay; fullscreen" allowFullScreen />
        : <video className="h-full w-full" src={src} controls autoPlay />}
    </div>
  );
}

export function WoredaCard({ w, count, index = 0 }) {
  const { t, tx } = useLang();
  return (
    <Reveal delay={(index % 4) * 0.08}>
      <Link to={`/woredas/${w.id}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          {w.image ? (
            <Photo id={w.image} alt={tx(w.name)} className="h-full" imgClass="transition duration-[1.2s] ease-out group-hover:scale-110" showCredit={false} />
          ) : (
            <div className="relative h-full bg-gradient-to-br from-royal-700 to-royal-950">
              <Rings className="absolute -bottom-16 -right-16 h-72 w-72 text-white/10" />
              <span className="absolute left-6 top-6 font-serif text-7xl text-white/15">{tx(w.name).slice(0, 1)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-royal-950/90 via-royal-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            {w.seat && <p className="flex items-center gap-1.5 text-xs text-white/70"><MapPin size={12} />{tx(w.seat)}</p>}
            <h3 className="mt-1 font-serif text-2xl">{tx(w.name)}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-white/75">{tx(w.tagline)}</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs">
              <span className="text-white/70">{count != null ? `${count} ${t("opportunities").toLowerCase()}` : tx(w.peoples)}</span>
              <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function OppCard({ o, sectors, woredas, showWoreda = true }) {
  const { t, tx } = useLang();
  const s = sectors.find((x) => x.id === o.sector);
  const Icon = icons[s.icon];
  const w = woredas?.find((x) => x.id === o.woreda);
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="chip bg-royal-50 text-royal-700"><Icon size={13} />{tx(s.title)}</span>
        {showWoreda && w && <Link to={`/woredas/${w.id}`} className="flex items-center gap-1 text-xs text-ink-mute hover:text-royal-600"><MapPin size={12} />{tx(w.name)}</Link>}
      </div>
      <h3 className="mt-4 font-serif text-xl leading-snug text-royal-950">{tx(o.title)}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{tx(o.summary)}</p>
      <dl className="mt-5 grid grid-cols-3 divide-x divide-sand-200 border-t border-sand-200 pt-4 text-center">
        {[[t("land"), o.landHa ? `${o.landHa.toLocaleString()} ${t("ha")}` : "—"], [t("investment"), `${o.investmentUsdM} ${t("musd")}`], [t("jobs"), o.jobs.toLocaleString()]].map(([k, v]) => (
          <div key={k} className="px-1"><dt className="text-[10px] uppercase tracking-wider text-ink-mute">{k}</dt><dd className="mt-1 text-sm font-semibold text-royal-900">{v}</dd></div>
        ))}
      </dl>
    </motion.article>
  );
}

export function Deadline({ date }) {
  const { t } = useLang();
  const d = daysLeft(date);
  if (d < 0) return <span className="chip bg-sand-100 text-ink-mute">{t("closed")}</span>;
  const urgent = d <= 7;
  return (
    <span className={`chip ${urgent ? "bg-ember-50 text-ember-600" : "bg-leaf-50 text-leaf-700"}`}>
      <CalendarClock size={12} />{d === 0 ? t("closesToday") : `${d} ${d === 1 ? t("dayLeft") : t("daysLeft")}`}
    </span>
  );
}

export function AnnRow({ a, onOpen }) {
  const { t, tx, fmtDate } = useLang();
  const closed = daysLeft(a.deadline) < 0;
  const Icon = a.type === "vacancy" ? Briefcase : FileText;
  return (
    <button onClick={() => onOpen(a)} className={`group flex w-full items-start gap-4 rounded-2xl p-5 text-left transition hover:bg-white hover:shadow-soft ${closed ? "opacity-60" : ""}`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${a.type === "vacancy" ? "bg-royal-50 text-royal-600" : "bg-sun-100 text-sun-600"}`}><Icon size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">{a.type === "vacancy" ? t("vacancies") : t("tenders")}</span>
          <Deadline date={a.deadline} />
        </span>
        <span className="mt-1.5 block font-serif text-lg leading-snug text-royal-950 group-hover:text-royal-600">{tx(a.title)}</span>
        <span className="mt-1 block text-sm text-ink-mute">{tx(a.org)} · {t("deadline")} {fmtDate(a.deadline)}</span>
      </span>
      <ArrowRight size={18} className="mt-3 shrink-0 text-royal-300 transition group-hover:translate-x-1 group-hover:text-royal-600" />
    </button>
  );
}

export function AnnDetail({ a }) {
  const { t, tx, fmtDate } = useLang();
  if (!a) return null;
  return (
    <div className="p-8 sm:p-10">
      <span className={`chip ${a.type === "vacancy" ? "bg-royal-50 text-royal-700" : "bg-sun-100 text-sun-600"}`}>{a.type === "vacancy" ? t("vacancies") : t("tenders")}</span>
      <h2 className="mt-4 pr-10 font-serif text-3xl leading-tight text-royal-950">{tx(a.title)}</h2>
      <p className="mt-3 text-ink-soft">{tx(a.summary)}</p>
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-sand-200 sm:grid-cols-3">
        {[[t("organization"), tx(a.org)], [t("location"), tx(a.location)], a.ref && [t("reference"), a.ref], [t("posted"), fmtDate(a.posted)], [t("deadline"), fmtDate(a.deadline)]].filter(Boolean).map(([k, v]) => (
          <div key={k} className="bg-sand-50 p-4"><dt className="text-[10px] uppercase tracking-wider text-ink-mute">{k}</dt><dd className="mt-1 text-sm font-semibold text-royal-950">{v}</dd></div>
        ))}
      </dl>
      <h3 className="mt-8 text-xs font-semibold uppercase tracking-eyebrow text-royal-600">{t("requirements")}</h3>
      <ul className="mt-3 space-y-2">
        {tx(a.details).map((d, i) => <li key={i} className="flex gap-3 text-sm text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />{d}</li>)}
      </ul>
      <div className="mt-6"><Deadline date={a.deadline} /></div>
    </div>
  );
}
