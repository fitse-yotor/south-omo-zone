import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { routeStops, woredas } from "../data/content";
import { Bi, Card, Chip, PageHead, SaveBar, Select, Tabs, Text, today, useDraft } from "./kit";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TOWNS = Object.keys(routeStops);
const townName = (k) => routeStops[k]?.en ?? k;
const legName = (k) => k.split("-").map(townName).join(" – ");
const asBi = (v) => (typeof v === "string" ? { en: v, am: v } : v || { en: "", am: "" });

function Roads() {
  const legs = useDraft("roadLegs");
  const info = useDraft("roadInfo");
  const STATUS = [["open", "Open", "good"], ["slow", "Slow", "warn"], ["closed", "Closed", "bad"]];
  return (
    <>
      <Card title="Road status" description="Shown on the Tourism page map and journey card. Visitors see a flag on any road that isn't open.">
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-ink-mute"><th className="px-2 pb-2 font-medium">Road</th><th className="px-2 pb-2 font-medium">Surface</th><th className="px-2 pb-2 font-medium">Drive time (min)</th><th className="px-2 pb-2 font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-sand-200">
              {Object.entries(legs.draft).map(([k, v]) => (
                <tr key={k}>
                  <td className="px-2 py-3 font-medium text-royal-950">{legName(k)}</td>
                  <td className="px-2 py-3">
                    <select aria-label={`Surface of ${legName(k)}`} value={v.surface} onChange={(e) => legs.update([k, "surface"], e.target.value)} className="rounded-lg border-0 bg-sand-50 py-1.5 text-sm ring-1 ring-royal-950/10 focus:ring-2 focus:ring-royal-400">
                      <option value="asphalt">Asphalt</option><option value="gravel">Gravel</option>
                    </select>
                  </td>
                  <td className="px-2 py-3"><input type="number" min="5" step="5" aria-label={`Drive time for ${legName(k)}`} value={v.minutes} onChange={(e) => legs.update([k, "minutes"], Number(e.target.value))} className="w-24 rounded-lg border-0 bg-sand-50 py-1.5 text-sm tabular-nums ring-1 ring-royal-950/10 focus:ring-2 focus:ring-royal-400" /></td>
                  <td className="px-2 py-3">
                    <div className="inline-flex rounded-full bg-sand-100 p-0.5" role="radiogroup" aria-label={`Status of ${legName(k)}`}>
                      {STATUS.map(([s, l, tone]) => (
                        <button key={s} type="button" role="radio" aria-checked={v.status === s} onClick={() => legs.update([k, "status"], s)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${v.status === s ? (tone === "good" ? "bg-leaf-500 text-white" : tone === "warn" ? "bg-sun-500 text-white" : "bg-ember-500 text-white") : "text-ink-soft hover:text-royal-950"}`}>{l}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-t border-sand-200 pt-5">
          <Text label="Last checked by the roads office" type="date" value={info.draft.updated || ""} onChange={(v) => info.update(["updated"], v || null)} className="w-60" hint="Until this is set, the site says the status isn't confirmed." />
          <button type="button" onClick={() => info.update(["updated"], today())} className="btn-outline mb-6 !py-2.5">Checked today</button>
        </div>
      </Card>
      <SaveBar drafts={[legs, info]} />
    </>
  );
}

function Stays() {
  const d = useDraft("stays");
  const towns = TOWNS.filter((k) => k !== "weyto");
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {towns.map((town) => {
          const list = d.draft[town] || [];
          return (
            <Card key={town} title={townName(town)} actions={<button type="button" onClick={() => d.update([town], [...list, { name: { en: "", am: "" }, type: { en: "Hotel", am: "ሆቴል" } }])} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-royal-600 hover:bg-royal-50"><Plus size={15} />Add place</button>}>
              {list.length ? list.map((h, i) => (
                <div key={i} className="relative rounded-xl bg-sand-50 p-4 pr-12">
                  <button type="button" onClick={() => d.update([town], list.filter((_, j) => j !== i))} aria-label="Remove place" className="absolute right-3 top-3 rounded-full p-1.5 text-ink-mute hover:bg-ember-50 hover:text-ember-500"><Trash2 size={15} /></button>
                  <div className="space-y-3">
                    <Bi label="Name" value={asBi(h.name)} onChange={(v) => d.update([town, i, "name"], v)} />
                    <Bi label="Type" value={asBi(h.type)} onChange={(v) => d.update([town, i, "type"], v)} />
                  </div>
                </div>
              )) : <p className="text-sm text-ink-mute">No places listed. The map shows a bed icon only for towns with places to stay.</p>}
            </Card>
          );
        })}
      </div>
      <SaveBar drafts={d} />
    </>
  );
}

function Markets() {
  const d = useDraft("markets");
  return (
    <>
      <Card title="Weekly markets" description="Used for the market table, the 'market today' banner and the itinerary planner." actions={
        <button type="button" onClick={() => d.setDraft([...d.draft, { place: { en: "", am: "" }, woreda: woredas[0].id, stop: "", days: [] }])} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-royal-600 hover:bg-royal-50"><Plus size={15} />Add market</button>
      }>
        {d.draft.map((m, i) => (
          <div key={i} className="relative rounded-xl bg-sand-50 p-4 pr-12">
            <button type="button" onClick={() => d.setDraft(d.draft.filter((_, j) => j !== i))} aria-label="Remove market" className="absolute right-3 top-3 rounded-full p-1.5 text-ink-mute hover:bg-ember-50 hover:text-ember-500"><Trash2 size={15} /></button>
            <div className="space-y-4">
              <Bi label="Market town" value={m.place} onChange={(v) => d.update([i, "place"], v)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Woreda" value={m.woreda} onChange={(v) => d.update([i, "woreda"], v)} options={woredas.map((w) => [w.id, w.name.en])} />
                <Select label="Town on the route map" value={m.stop || ""} onChange={(v) => d.update([i, "stop"], v || undefined)} options={[["", "Not on the map"], ...TOWNS.filter((k) => k !== "jinka").map((k) => [k, townName(k)])]} />
              </div>
              <fieldset>
                <legend className="text-[13px] font-medium text-royal-950">Market days</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DAYS.map((day, k) => {
                    const on = m.days.includes(k);
                    return <button key={k} type="button" aria-pressed={on} onClick={() => d.update([i, "days"], on ? m.days.filter((x) => x !== k) : [...m.days, k].sort())}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition ${on ? "bg-sun-400 text-royal-950 ring-sun-400" : "bg-white text-ink-soft ring-royal-950/10 hover:ring-royal-300"}`}>{day}</button>;
                  })}
                </div>
              </fieldset>
            </div>
          </div>
        ))}
      </Card>
      <SaveBar drafts={d} />
    </>
  );
}

function Tips() {
  const d = useDraft("journeys");
  return (
    <>
      <div className="space-y-6">
        {d.draft.map((j, i) => (
          <Card key={j.id} title={j.name.en} description={`Route: ${j.stops.map(townName).join(" → ")}`}>
            <Bi label="Travel tip" area rows={3} value={j.tip} onChange={(v) => d.update([i, "tip"], v)} />
            <Bi label="Where to stay: note" area rows={2} value={j.stayNote} onChange={(v) => d.update([i, "stayNote"], v)} />
            <fieldset>
              <legend className="text-[13px] font-medium text-royal-950">Suggest places to stay in</legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TOWNS.map((k) => {
                  const on = j.stayAt.includes(k);
                  return <button key={k} type="button" aria-pressed={on} onClick={() => d.update([i, "stayAt"], on ? j.stayAt.filter((x) => x !== k) : [...j.stayAt, k])}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition ${on ? "bg-royal-600 text-white ring-royal-600" : "bg-white text-ink-soft ring-royal-950/10 hover:ring-royal-300"}`}>{townName(k)}</button>;
                })}
              </div>
            </fieldset>
          </Card>
        ))}
      </div>
      <SaveBar drafts={d} />
    </>
  );
}

export default function TourismAdmin() {
  const [tab, setTab] = useState("roads");
  return (
    <>
      <PageHead title="Tourism & routes" description="Everything on the Tourism page map: road conditions, places to stay, market days and travel tips." />
      <Tabs value={tab} onChange={setTab} tabs={[["roads", "Road status"], ["stays", "Places to stay"], ["markets", "Market days"], ["tips", "Destinations & tips"]]} />
      <div hidden={tab !== "roads"}><Roads /></div>
      <div hidden={tab !== "stays"}><Stays /></div>
      <div hidden={tab !== "markets"}><Markets /></div>
      <div hidden={tab !== "tips"}><Tips /></div>
    </>
  );
}
