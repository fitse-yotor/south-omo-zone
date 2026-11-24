import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Bi, BiLines, Card, PageHead, SaveBar, Tabs, Text, useDraft } from "./kit";

function Leader() {
  const d = useDraft("leader");
  const l = d.draft;
  return (
    <>
      <Card title="Chief Administrator's message" description="Shown on the home page and the About page.">
        <Bi label="Name" value={l.name} onChange={(v) => d.update(["name"], v)} />
        <Bi label="Title" value={l.title} onChange={(v) => d.update(["title"], v)} />
        <Bi label="Short excerpt" hint="Shown on the home page." area rows={3} value={l.excerpt} onChange={(v) => d.update(["excerpt"], v)} />
        <BiLines label="Full message" paragraphs rows={10} value={l.message} onChange={(v) => d.update(["message"], v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Photo" placeholder="./images/leader.jpg" hint="Path or link to a portrait photo." value={l.photo} onChange={(v) => d.update(["photo"], v)} />
          <Text label="Video message" placeholder="https://www.youtube.com/watch?v=…" hint="An mp4 link or a YouTube link." value={l.video} onChange={(v) => d.update(["video"], v)} />
        </div>
      </Card>
      <SaveBar drafts={d} />
    </>
  );
}

function Facts() {
  const d = useDraft("facts");
  const move = (i, by) => { const a = [...d.draft]; [a[i], a[i + by]] = [a[i + by], a[i]]; d.setDraft(a); };
  return (
    <>
      <Card title="Key facts" description="The numbers strip on the home page." actions={
        <button type="button" onClick={() => d.setDraft([...d.draft, { value: "", label: { en: "", am: "" } }])} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-royal-600 hover:bg-royal-50"><Plus size={15} />Add fact</button>
      }>
        {d.draft.map((f, i) => (
          <div key={i} className="grid gap-4 rounded-xl bg-sand-50 p-4 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
            <Text label="Number" value={f.value} onChange={(v) => d.update([i, "value"], v)} />
            <Bi label="Label" value={f.label} onChange={(v) => d.update([i, "label"], v)} />
            <div className="flex items-start gap-1 sm:pt-7">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" className="rounded-full p-1.5 text-ink-mute hover:bg-white disabled:opacity-30"><ArrowUp size={15} /></button>
              <button type="button" disabled={i === d.draft.length - 1} onClick={() => move(i, 1)} aria-label="Move down" className="rounded-full p-1.5 text-ink-mute hover:bg-white disabled:opacity-30"><ArrowDown size={15} /></button>
              <button type="button" onClick={() => d.setDraft(d.draft.filter((_, j) => j !== i))} aria-label="Remove fact" className="rounded-full p-1.5 text-ink-mute hover:bg-ember-50 hover:text-ember-500"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </Card>
      <SaveBar drafts={d} />
    </>
  );
}

function Contact() {
  const d = useDraft("zone");
  const z = d.draft;
  return (
    <>
      <div className="space-y-6">
        <Card title="Home page" description="The headline and introduction over the home page photos.">
          <Bi label="Tagline" value={z.tagline} onChange={(v) => d.update(["tagline"], v)} />
          <Bi label="Introduction" area rows={4} value={z.intro} onChange={(v) => d.update(["intro"], v)} />
        </Card>
        <Card title="Contact details" description="Shown in the header, footer and on the Contact page.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Phone" value={z.contact.phone} onChange={(v) => d.update(["contact", "phone"], v)} />
            <Text label="General email" type="email" value={z.contact.email} onChange={(v) => d.update(["contact", "email"], v)} />
            <Text label="Investment desk email" type="email" value={z.contact.invest} onChange={(v) => d.update(["contact", "invest"], v)} />
            <Text label="Tourism office email" type="email" value={z.contact.tourism} onChange={(v) => d.update(["contact", "tourism"], v)} />
          </div>
          <Bi label="Address" value={z.contact.address} onChange={(v) => d.update(["contact", "address"], v)} />
          <Bi label="Office hours" value={z.contact.hours} onChange={(v) => d.update(["contact", "hours"], v)} />
        </Card>
      </div>
      <SaveBar drafts={d} />
    </>
  );
}

export default function SiteAdmin() {
  const [tab, setTab] = useState("leader");
  return (
    <>
      <PageHead title="Site text & leader" description="The leader's message, the home page facts and headline, and contact details." />
      <Tabs value={tab} onChange={setTab} tabs={[["leader", "Leader's message"], ["facts", "Key facts"], ["contact", "Home page & contact"]]} />
      <div hidden={tab !== "leader"}><Leader /></div>
      <div hidden={tab !== "facts"}><Facts /></div>
      <div hidden={tab !== "contact"}><Contact /></div>
    </>
  );
}
