import { ExternalLink } from "lucide-react";
import { useLang } from "../i18n";
import { useAsync } from "../hooks";
import { getCredits } from "../api";
import { Loading, PageHero, Photo } from "../components/ui";

export default function Credits() {
  const { t } = useLang();
  const { data, loading } = useAsync(getCredits);
  return (
    <>
      <PageHero eyebrow={t("credits")} title={t("credits")} lead={t("creditsLead")} />
      {loading ? <Loading /> : (
        <section className="py-20">
          <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <a key={c.id} href={c.source} target="_blank" rel="noreferrer" className="card group flex gap-4 p-3 pr-5">
                <Photo id={c.id} className="h-20 w-24 shrink-0 rounded-xl" showCredit={false} />
                <div className="min-w-0 text-sm">
                  <p className="truncate font-semibold text-royal-950">{c.author}</p>
                  <p className="text-ink-mute">{c.license}</p>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-royal-600 group-hover:underline">{t("source")}: Wikimedia Commons <ExternalLink size={11} /></p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
