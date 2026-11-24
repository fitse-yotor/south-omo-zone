import { Bi, BiLines, Chip, ImagePicker, ListEditor, newId, PageHead, SaveBar, Text, Toggle, today, useDraft } from "./kit";

export default function NewsAdmin() {
  const d = useDraft("news");
  return (
    <>
      <PageHead title="News" description="Stories shown on the home page and the News page. Unpublished items stay hidden from visitors." />
      <ListEditor
        items={d.draft}
        onChange={d.setDraft}
        newLabel="New story"
        makeNew={() => ({ id: newId("n"), date: today(), published: false, image: "turmi-hills", title: { en: "Untitled story", am: "" }, summary: { en: "", am: "" }, body: { en: [], am: [] } })}
        searchText={(n) => `${n.title.en} ${n.title.am}`}
        sort={(a, b) => b.date.localeCompare(a.date)}
        renderRow={(n) => (
          <span className="block">
            <span className="block truncate text-sm font-medium text-royal-950">{n.title.en || "Untitled"}</span>
            <span className="mt-1 flex items-center gap-2 text-xs text-ink-mute">{n.date}<Chip tone={n.published ? "good" : "neutral"}>{n.published ? "Published" : "Draft"}</Chip></span>
          </span>
        )}
        render={(n, set) => (
          <>
            <div className="flex flex-wrap items-end gap-6">
              <Text label="Date" type="date" value={n.date} onChange={(v) => set(["date"], v)} className="w-48" />
              <div className="pb-2"><Toggle label={n.published ? "Published" : "Draft (hidden)"} checked={n.published} onChange={(v) => set(["published"], v)} /></div>
            </div>
            <Bi label="Headline" value={n.title} onChange={(v) => set(["title"], v)} />
            <Bi label="Summary" hint="One or two sentences shown on cards." area rows={3} value={n.summary} onChange={(v) => set(["summary"], v)} />
            <BiLines label="Full story" paragraphs rows={8} value={n.body} onChange={(v) => set(["body"], v)} />
            <ImagePicker value={n.image} onChange={(v) => set(["image"], v)} />
          </>
        )}
      />
      <SaveBar drafts={d} />
    </>
  );
}
