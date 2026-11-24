import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import * as store from "../cms/store";
import { Card, Chip, PageHead, useToast } from "./kit";

export default function DataAdmin() {
  const toast = useToast();
  const file = useRef(null);
  const [, refresh] = useState(0);
  const [confirmAll, setConfirmAll] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const changes = store.changes();

  const download = () => {
    const blob = new Blob([JSON.stringify(store.exportData(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `south-omo-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Export downloaded");
  };
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const done = store.importData(JSON.parse(await f.text()));
      setImportMsg({ ok: true, text: `Imported: ${done.join(", ")}.` });
      refresh((x) => x + 1);
    } catch (err) {
      setImportMsg({ ok: false, text: err instanceof SyntaxError ? "That file isn't valid JSON. Choose a file exported from this panel." : err.message });
    }
  };

  return (
    <>
      <PageHead title="Publish & data" description="Edits are saved in this browser only. Export them to put them on the live site, or to move them to another computer." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Export content" description="Downloads every section as one JSON file.">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-soft">
            <li>Download the export.</li>
            <li>Send it to the site's developer. They copy it into the site and redeploy.</li>
            <li>Once a real backend is connected, this step goes away and saves publish directly.</li>
          </ol>
          <button type="button" onClick={download} className="btn-primary"><Download size={16} />Download export</button>
        </Card>
        <Card title="Import content" description="Load an export from another browser or computer. It replaces the sections it contains.">
          <input ref={file} type="file" accept="application/json,.json" onChange={onFile} className="sr-only" id="import-file" />
          <button type="button" onClick={() => file.current?.click()} className="btn-outline"><Upload size={16} />Choose a file</button>
          {importMsg && <p role="status" className={`rounded-xl px-3.5 py-2.5 text-sm ${importMsg.ok ? "bg-leaf-50 text-leaf-700" : "bg-ember-50 text-ember-600"}`}>{importMsg.text}</p>}
        </Card>
      </div>

      <Card className="mt-6" title="Edited sections" description="Sections that differ from the site's original content.">
        {changes.length ? (
          <ul className="divide-y divide-sand-200">
            {changes.map((c) => (
              <li key={c.key} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="flex items-center gap-3"><span className="font-medium text-royal-950">{c.label}</span>{c.at && <Chip>{new Date(c.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Chip>}</span>
                <button type="button" onClick={() => { store.reset(c.key); refresh((x) => x + 1); toast(`${c.label} restored`); }} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-ink-soft hover:bg-sand-100"><RotateCcw size={14} />Restore original</button>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-ink-mute">No edits yet.</p>}
        {changes.length > 0 && (
          <div className="border-t border-sand-200 pt-5">
            {confirmAll ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-ink-soft">Discard every edit in this browser?</span>
                <button type="button" onClick={() => { store.resetAll(); setConfirmAll(false); refresh((x) => x + 1); toast("All sections restored"); }} className="rounded-full bg-ember-500 px-4 py-2 font-semibold text-white hover:bg-ember-600">Discard all edits</button>
                <button type="button" onClick={() => setConfirmAll(false)} className="rounded-full px-4 py-2 font-medium text-ink-soft hover:bg-sand-100">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmAll(true)} className="text-sm font-semibold text-ember-500 hover:text-ember-600">Restore all sections…</button>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
