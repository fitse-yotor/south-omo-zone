import { useState } from "react";
import { sectors } from "../data/content";
import * as store from "../cms/store";
import { Bi, BiLines, Chip, ImagePicker, ListEditor, newId, PageHead, SaveBar, Select, Tabs, Text, useDraft } from "./kit";

function Opportunities() {
  const d = useDraft("opportunities");
  const wor = store.get("woredas");
  return (
    <>
      <ListEditor
        items={d.draft}
        onChange={d.setDraft}
        newLabel="New opportunity"
        makeNew={() => ({ id: newId("opp"), woreda: wor[0].id, sector: sectors[0].id, title: { en: "New opportunity", am: "" }, summary: { en: "", am: "" }, landHa: 0, investmentUsdM: 0, jobs: 0 })}
        searchText={(o) => `${o.title.en} ${o.title.am} ${o.woreda} ${o.sector}`}
        renderRow={(o) => (
          <span className="block">
            <span className="block truncate text-sm font-medium text-royal-950">{o.title.en || "Untitled"}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-mute"><Chip tone="blue">{wor.find((w) => w.id === o.woreda)?.name.en ?? o.woreda}</Chip><Chip>{sectors.find((s) => s.id === o.sector)?.title.en ?? o.sector}</Chip></span>
          </span>
        )}
        render={(o, set) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Woreda" value={o.woreda} onChange={(v) => set(["woreda"], v)} options={wor.map((w) => [w.id, w.name.en])} />
              <Select label="Sector" value={o.sector} onChange={(v) => set(["sector"], v)} options={sectors.map((s) => [s.id, s.title.en])} />
            </div>
            <Bi label="Title" value={o.title} onChange={(v) => set(["title"], v)} />
            <Bi label="Summary" area rows={3} value={o.summary} onChange={(v) => set(["summary"], v)} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Text label="Land (ha)" type="number" min="0" value={o.landHa} onChange={(v) => set(["landHa"], v)} />
              <Text label="Investment (million USD)" type="number" min="0" step="0.1" value={o.investmentUsdM} onChange={(v) => set(["investmentUsdM"], v)} />
              <Text label="Jobs" type="number" min="0" value={o.jobs} onChange={(v) => set(["jobs"], v)} />
            </div>
          </>
        )}
      />
      <SaveBar drafts={d} />
    </>
  );
}

function Woredas() {
  const d = useDraft("woredas");
  return (
    <>
      <ListEditor
        fixed
        items={d.draft}
        onChange={d.setDraft}
        searchText={(w) => `${w.name.en} ${w.name.am}`}
        renderRow={(w) => <span className="block"><span className="block text-sm font-medium text-royal-950">{w.name.en}</span><span className="text-xs text-ink-mute">Seat: {w.seat.en}</span></span>}
        render={(w, set) => (
          <>
            <div className="grid gap-4"><Bi label="Name" value={w.name} onChange={(v) => set(["name"], v)} /><Bi label="Administrative seat" value={w.seat} onChange={(v) => set(["seat"], v)} /></div>
            <Bi label="Peoples" value={w.peoples} onChange={(v) => set(["peoples"], v)} />
            <Bi label="Tagline" value={w.tagline} onChange={(v) => set(["tagline"], v)} />
            <Bi label="About" area rows={5} value={w.about} onChange={(v) => set(["about"], v)} />
            <BiLines label="Highlights" value={w.highlights} onChange={(v) => set(["highlights"], v)} />
            <ImagePicker value={w.image} onChange={(v) => set(["image"], v)} />
          </>
        )}
      />
      <SaveBar drafts={d} />
    </>
  );
}

export default function InvestmentAdmin() {
  const [tab, setTab] = useState("opps");
  return (
    <>
      <PageHead title="Investment" description="Opportunities listed on the Invest and woreda pages, and each woreda's profile." />
      <Tabs value={tab} onChange={setTab} tabs={[["opps", "Opportunities"], ["woredas", "Woredas"]]} />
      <div hidden={tab !== "opps"}><Opportunities /></div>
      <div hidden={tab !== "woredas"}><Woredas /></div>
    </>
  );
}
