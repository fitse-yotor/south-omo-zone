import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { sendContact } from "../api";
import { useLang } from "../i18n";
import { zone } from "../data/content";
import { PageHero, Reveal } from "../components/ui";

export default function Contact() {
  const { t, tx } = useLang();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError(null);
    try {
      const r = await sendContact({ name: f.get("name"), email: f.get("email"), desk: f.get("desk"), message: f.get("message"), website: f.get("website") });
      if (r.ok) setSent(true);
      else setError(r.status === 429 ? t("sendTooMany") : Object.values(r.errors).flat()[0] || t("sendError"));
    } catch {
      setError(t("sendError"));
    } finally {
      setBusy(false);
    }
  };
  const field = "mt-2 w-full rounded-xl border-0 bg-sand-50 px-4 py-3 ring-1 ring-sand-200 focus:bg-white focus:ring-2 focus:ring-royal-400";
  return (
    <>
      <PageHero eyebrow={t("reachUs")} title={t("contactTitle")} lead={t("contactLead")} image="omo-river-banks" />
      <section className="py-20">
        <div className="container grid gap-10 lg:grid-cols-12">
          <Reveal className="card p-8 sm:p-10 lg:col-span-7">
            {sent ? (
              <div className="flex flex-col items-center py-16 text-center"><CheckCircle2 size={48} className="text-leaf-500" /><p className="mt-5 font-serif text-2xl text-royal-950">{t("sent")}</p></div>
            ) : (
              <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                {/* honeypot: hidden from people, filled by bots */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
                <label className="text-sm font-medium text-royal-950">{t("name")}<input name="name" required maxLength={120} className={field} /></label>
                <label className="text-sm font-medium text-royal-950">{t("email")}<input name="email" required type="email" maxLength={190} className={field} /></label>
                <label className="text-sm font-medium text-royal-950 sm:col-span-2">{t("subject")}
                  <select name="desk" className={field}>{[["general", "general"], ["invest", "investDesk"], ["tourism", "tourismDesk"]].map(([v, k]) => <option key={v} value={v}>{t(k)}</option>)}</select>
                </label>
                <label className="text-sm font-medium text-royal-950 sm:col-span-2">{t("message")}<textarea name="message" required minLength={5} maxLength={5000} rows={6} className={field} /></label>
                {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-ember-50 px-4 py-3 text-sm text-ember-600 sm:col-span-2"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</p>}
                <button disabled={busy} className="btn-primary sm:col-span-2 sm:justify-self-start disabled:opacity-60">{busy ? "…" : t("send")}</button>
              </form>
            )}
          </Reveal>
          <Reveal delay={0.1} className="space-y-4 lg:col-span-5">
            {[[MapPin, t("address"), tx(zone.contact.address)], [Phone, t("phone"), zone.contact.phone], [Mail, t("investDesk"), zone.contact.invest], [Mail, t("tourismDesk"), zone.contact.tourism], [Clock, t("hours"), tx(zone.contact.hours)]].map(([I, k, v]) => (
              <div key={k} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-royal-950/5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-royal-50 text-royal-600"><I size={17} /></span>
                <div><p className="text-xs uppercase tracking-wider text-ink-mute">{k}</p><p className="mt-1 font-medium text-royal-950">{v}</p></div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
