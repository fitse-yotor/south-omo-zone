import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "../i18n";
import { zone } from "../data/content";
import { PageHero, Reveal } from "../components/ui";

export default function Contact() {
  const { t, tx } = useLang();
  const [sent, setSent] = useState(false);
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
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-royal-950">{t("name")}<input required className={field} /></label>
                <label className="text-sm font-medium text-royal-950">{t("email")}<input required type="email" className={field} /></label>
                <label className="text-sm font-medium text-royal-950 sm:col-span-2">{t("subject")}
                  <select className={field}>{["general", "investDesk", "tourismDesk"].map((k) => <option key={k}>{t(k)}</option>)}</select>
                </label>
                <label className="text-sm font-medium text-royal-950 sm:col-span-2">{t("message")}<textarea required rows={6} className={field} /></label>
                <button className="btn-primary sm:col-span-2 sm:justify-self-start">{t("send")}</button>
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
