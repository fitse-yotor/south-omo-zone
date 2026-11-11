import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync, daysLeft } from "../hooks";
import { getAnnouncements } from "../api";
import { AnnDetail, AnnRow, Loading, Modal, PageHero, Reveal } from "../components/ui";

export default function Announcements() {
  const { t } = useLang();
  const { data, loading } = useAsync(getAnnouncements);
  const [tab, setTab] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const [sel, setSel] = useState(null);
  const list = useMemo(() => (data || [])
    .filter((a) => (tab === "all" || a.type === tab) && (showClosed || daysLeft(a.deadline) >= 0))
    .sort((a, b) => (daysLeft(a.deadline) < 0) - (daysLeft(b.deadline) < 0) || a.deadline.localeCompare(b.deadline)), [data, tab, showClosed]);
  const count = (type) => (data || []).filter((a) => a.type === type && daysLeft(a.deadline) >= 0).length;
  return (
    <>
      <PageHero eyebrow={t("annEyebrow")} title={t("annTitle")} image="dassanech-elder" />
      {loading ? <Loading /> : (
        <section className="py-20">
          <div className="container max-w-4xl">
            <Reveal className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex rounded-full bg-white p-1 shadow-soft ring-1 ring-royal-950/5">
                {[["all", t("all")], ["vacancy", t("vacancies")], ["tender", t("tenders")]].map(([k, l]) => (
                  <button key={k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2 text-sm font-medium transition ${tab === k ? "bg-royal-600 text-white" : "text-ink-soft hover:text-royal-700"}`}>
                    {l}{k !== "all" && <span className={`ml-2 rounded-full px-1.5 text-xs ${tab === k ? "bg-white/20" : "bg-sand-100"}`}>{count(k)}</span>}
                  </button>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} className="h-4 w-4 rounded border-royal-200 text-royal-600 focus:ring-royal-400" />{t("showClosed")}
              </label>
            </Reveal>
            <p className="mt-6 flex items-start gap-2 text-sm text-ink-mute"><Info size={15} className="mt-0.5 shrink-0" />{t("sampleAnn")}</p>
            <div className="mt-6 divide-y divide-sand-200 rounded-3xl bg-sand-100 p-3">
              {list.length ? list.map((a) => <AnnRow key={a.id} a={a} onOpen={setSel} />) : <p className="p-10 text-center text-ink-mute">{t("noResults")}</p>}
            </div>
          </div>
          <Modal open={!!sel} onClose={() => setSel(null)}><AnnDetail a={sel} /></Modal>
        </section>
      )}
    </>
  );
}
