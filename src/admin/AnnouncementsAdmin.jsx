import { useState } from "react";
import { daysLeft } from "../hooks";
import { Bi, BiLines, Chip, ListEditor, newId, PageHead, SaveBar, Select, Tabs, Text, today, useDraft } from "./kit";

const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default function AnnouncementsAdmin() {
  const d = useDraft("announcements");
  const [type, setType] = useState("all");
  const items = d.draft.filter((a) => type === "all" || a.type === type);
  const setItems = (next) => d.setDraft([...next, ...d.draft.filter((a) => !(type === "all" || a.type === type))]);
  return (
    <>
      <PageHead title="Announcements" description="Vacancies and tenders. A notice closes automatically after its deadline." />
      <Tabs value={type} onChange={setType} tabs={[["all", "All"], ["vacancy", "Vacancies"], ["tender", "Tenders"]]} />
      <ListEditor
        key={type}
        items={items}
        onChange={setItems}
        newLabel="New notice"
        makeNew={() => ({ id: newId(type === "tender" ? "t" : "v"), type: type === "tender" ? "tender" : "vacancy", posted: today(), deadline: inDays(14), title: { en: "New notice", am: "" }, org: { en: "", am: "" }, location: { en: "", am: "" }, summary: { en: "", am: "" }, details: { en: [], am: [] } })}
        searchText={(a) => `${a.title.en} ${a.title.am} ${a.ref || ""}`}
        sort={(a, b) => b.posted.localeCompare(a.posted)}
        renderRow={(a) => {
          const left = daysLeft(a.deadline);
          return (
            <span className="block">
              <span className="block truncate text-sm font-medium text-royal-950">{a.title.en || "Untitled"}</span>
              <span className="mt-1 flex items-center gap-2 text-xs text-ink-mute">
                <Chip tone="blue">{a.type === "vacancy" ? "Vacancy" : "Tender"}</Chip>
                {left < 0 ? <Chip>Closed</Chip> : <Chip tone={left <= 3 ? "warn" : "good"}>{left === 0 ? "Closes today" : `${left} days left`}</Chip>}
              </span>
            </span>
          );
        }}
        render={(a, set) => (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Type" value={a.type} onChange={(v) => set(["type"], v)} options={[["vacancy", "Vacancy"], ["tender", "Tender"]]} />
              <Text label="Posted" type="date" value={a.posted} onChange={(v) => set(["posted"], v)} />
              <Text label="Deadline" type="date" value={a.deadline} onChange={(v) => set(["deadline"], v)} />
            </div>
            {a.type === "tender" && <Text label="Tender reference" placeholder="SOZ/NCB/W/000/2026" value={a.ref} onChange={(v) => set(["ref"], v)} />}
            <Bi label="Title" value={a.title} onChange={(v) => set(["title"], v)} />
            <Bi label="Office" value={a.org} onChange={(v) => set(["org"], v)} />
            <Bi label="Location" value={a.location} onChange={(v) => set(["location"], v)} />
            <Bi label="Summary" area rows={3} value={a.summary} onChange={(v) => set(["summary"], v)} />
            <BiLines label={a.type === "vacancy" ? "Requirements" : "Details"} value={a.details} onChange={(v) => set(["details"], v)} />
          </>
        )}
      />
      <SaveBar drafts={d} />
    </>
  );
}
