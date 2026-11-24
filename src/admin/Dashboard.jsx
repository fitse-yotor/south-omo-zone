import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Map, Megaphone, Newspaper } from "lucide-react";
import * as store from "../cms/store";
import { daysLeft } from "../hooks";
import { routeStops } from "../data/content";
import { Card, Chip, PageHead } from "./kit";

const leg = (k) => k.split("-").map((s) => routeStops[s]?.en ?? s).join(" – ");

export default function Dashboard() {
  const news = store.get("news"), ann = store.get("announcements"), legs = store.get("roadLegs"), opps = store.get("opportunities");
  const open = ann.filter((a) => daysLeft(a.deadline) >= 0);
  const closingSoon = open.filter((a) => daysLeft(a.deadline) <= 7).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const notOpen = Object.entries(legs).filter(([, v]) => v.status !== "open");
  const changes = store.changes();
  const stats = [
    ["/admin/news", Newspaper, "Published news", news.filter((n) => n.published).length, `${news.filter((n) => !n.published).length} drafts`],
    ["/admin/announcements", Megaphone, "Open notices", open.length, `${open.filter((a) => a.type === "vacancy").length} vacancies · ${open.filter((a) => a.type === "tender").length} tenders`],
    ["/admin/tourism", Map, "Roads not open", notOpen.length, store.get("roadInfo").updated ? `Checked ${store.get("roadInfo").updated}` : "Not yet checked"],
    ["/admin/investment", Briefcase, "Opportunities", opps.length, `${store.get("woredas").length} woredas`],
  ];
  return (
    <>
      <PageHead title="Dashboard" description="What's on the site now, and what needs attention." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([to, I, label, value, sub]) => (
          <Link key={to} to={to} className="group rounded-2xl bg-white p-5 shadow-soft ring-1 ring-royal-950/5 transition hover:ring-royal-200">
            <span className="flex items-center justify-between text-sm text-ink-soft"><span className="flex items-center gap-2"><I size={16} className="text-royal-600" />{label}</span><ArrowRight size={15} className="opacity-0 transition group-hover:opacity-100" /></span>
            <span className="mt-3 block font-serif text-4xl tabular-nums text-royal-950">{value}</span>
            <span className="mt-1 block text-xs text-ink-mute">{sub}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Closing within 7 days" description="Vacancies and tenders that close soon.">
          {closingSoon.length ? (
            <ul className="divide-y divide-sand-200">
              {closingSoon.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0"><span className="block truncate font-medium text-royal-950">{a.title.en}</span><span className="text-xs text-ink-mute">{a.type === "vacancy" ? "Vacancy" : "Tender"} · closes {a.deadline}</span></span>
                  <Chip tone={daysLeft(a.deadline) <= 2 ? "bad" : "warn"}>{daysLeft(a.deadline) === 0 ? "Today" : `${daysLeft(a.deadline)} days`}</Chip>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-mute">Nothing closes in the next 7 days.</p>}
        </Card>
        <Card title="Roads" description="Status shown on the Tourism page map.">
          {notOpen.length ? (
            <ul className="space-y-2 text-sm">{notOpen.map(([k, v]) => <li key={k} className="flex items-center justify-between"><span>{leg(k)}</span><Chip tone={v.status === "closed" ? "bad" : "warn"}>{v.status === "closed" ? "Closed" : "Slow"}</Chip></li>)}</ul>
          ) : <p className="text-sm text-ink-soft">All roads are marked open.{!store.get("roadInfo").updated && " The roads office hasn't confirmed this yet."}</p>}
          <Link to="/admin/tourism" className="link-arrow">Update road status<ArrowRight size={15} /></Link>
        </Card>
      </div>

      <Card className="mt-6" title="Your edits" description="Saved in this browser. Export them from Publish & data to put them on the live site.">
        {changes.length ? (
          <ul className="flex flex-wrap gap-2">{changes.map((c) => <li key={c.key}><Chip tone="blue">{c.label}{c.at ? ` · ${new Date(c.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}</Chip></li>)}</ul>
        ) : <p className="text-sm text-ink-mute">No edits yet. The site shows its original content.</p>}
      </Card>
    </>
  );
}
