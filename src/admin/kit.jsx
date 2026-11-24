// Shared building blocks for the admin panel: form fields, draft state and the save bar.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, Plus, Search, Trash2, X } from "lucide-react";
import * as store from "../cms/store";

export const inputCls = "mt-1.5 w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm ring-1 ring-inset ring-royal-950/10 placeholder:text-ink-mute/70 focus:outline-none focus:ring-2 focus:ring-royal-400";
const labelCls = "block text-[13px] font-medium text-royal-950";

// Immutable update of a nested value: setIn(obj, ["a", 0, "en"], "x")
export function setIn(obj, path, value) {
  if (!path.length) return value;
  const [k, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[k] = setIn(obj?.[k] ?? (typeof rest[0] === "number" ? [] : {}), rest, value);
  return copy;
}
export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}`;
export const today = () => new Date().toISOString().slice(0, 10);

// Toasts
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(id); }, [msg]);
  return (
    <ToastCtx.Provider value={setMsg}>
      {children}
      {msg && (
        <div role="status" className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-royal-950 px-5 py-3 text-sm font-medium text-white shadow-lift">
          <Check size={16} className="text-leaf-500" />{msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

// Draft of one collection: edit freely, then save or discard
export function useDraft(key) {
  const toast = useToast();
  const [draft, setDraft] = useState(() => store.getCopy(key));
  const [base, setBase] = useState(() => JSON.stringify(store.get(key)));
  const dirty = JSON.stringify(draft) !== base;
  const save = () => {
    const ok = store.save(key, draft);
    setBase(JSON.stringify(draft));
    toast(ok ? "Changes saved" : "Saved for this visit only: the browser blocked storage");
  };
  const discard = () => setDraft(store.getCopy(key));
  const update = (path, value) => setDraft((d) => setIn(d, path, value));
  return { draft, setDraft, update, dirty, save, discard };
}

export function SaveBar({ drafts }) {
  const list = [].concat(drafts);
  const dirty = list.some((d) => d.dirty);
  if (!dirty) return null;
  return (
    <div className="sticky bottom-4 z-30 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-royal-950 px-5 py-3.5 text-white shadow-lift">
      <span className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-sun-400" />Unsaved changes</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => list.forEach((d) => d.dirty && d.discard())} className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">Discard</button>
        <button type="button" onClick={() => list.forEach((d) => d.dirty && d.save())} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-royal-900 hover:bg-sand-100">Save changes</button>
      </div>
    </div>
  );
}

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
    </label>
  );
}
export function Text({ label, hint, value, onChange, type = "text", className, ...rest }) {
  return <Field label={label} hint={hint} className={className}><input type={type} value={value ?? ""} onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} className={inputCls} {...rest} /></Field>;
}
export function Area({ label, hint, value, onChange, rows = 4, className, ...rest }) {
  return <Field label={label} hint={hint} className={className}><textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} leading-relaxed`} {...rest} /></Field>;
}
export function Select({ label, hint, value, onChange, options, className }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );
}
export function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)} className="flex items-center gap-3 text-[13px] font-medium text-royal-950">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-leaf-500" : "bg-sand-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

// English + Amharic side by side
export function Bi({ label, hint, value, onChange, area, rows = 3 }) {
  const v = value || {};
  const Input = area ? "textarea" : "input";
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div className="mt-1.5 grid gap-3 md:grid-cols-2">
        {[["en", "English"], ["am", "አማርኛ"]].map(([k, l]) => (
          <div key={k} className="relative">
            <span className="pointer-events-none absolute right-3 top-2.5 rounded bg-sand-100 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-mute">{l}</span>
            <Input rows={area ? rows : undefined} value={v[k] ?? ""} onChange={(e) => onChange({ ...v, [k]: e.target.value })} lang={k} aria-label={`${label} (${l})`}
              className={`${inputCls} !mt-0 pr-20 ${k === "am" ? "font-sans-am" : ""} ${area ? "leading-relaxed" : ""}`} />
          </div>
        ))}
      </div>
      {hint && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
    </fieldset>
  );
}

// Bilingual list of lines or paragraphs: { en: [...], am: [...] }
export function BiLines({ label, hint = "One item per line.", value, onChange, rows = 5, paragraphs }) {
  const v = value || {};
  const sep = paragraphs ? "\n\n" : "\n";
  const toText = (arr) => (arr || []).join(sep);
  const toArr = (s) => s.split(paragraphs ? /\n\s*\n/ : "\n").map((x) => (paragraphs ? x.trim() : x)).filter((x, i, a) => x !== "" || i < a.length - 1);
  return <Bi label={label} hint={paragraphs ? "Leave a blank line between paragraphs." : hint} area rows={rows}
    value={{ en: toText(v.en), am: toText(v.am) }} onChange={(t) => onChange({ en: toArr(t.en), am: toArr(t.am) })} />;
}

export function Card({ title, description, actions, children, className = "" }) {
  return (
    <section className={`rounded-2xl bg-white p-6 shadow-soft ring-1 ring-royal-950/5 ${className}`}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>{title && <h2 className="font-serif text-xl text-royal-950">{title}</h2>}{description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}</div>
          {actions}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function PageHead({ title, description, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-royal-950">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-soft ring-1 ring-royal-950/5 sm:inline-flex" role="tablist">
      {tabs.map(([k, l]) => (
        <button key={k} type="button" role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${value === k ? "bg-royal-600 text-white" : "text-ink-soft hover:text-royal-700"}`}>{l}</button>
      ))}
    </div>
  );
}

// Two-pane editor for a list of records: list on the left, form on the right
export function ListEditor({ items, onChange, render, renderRow, makeNew, fixed, newLabel = "Add new", searchText, empty = "Nothing here yet.", sort }) {
  const [sel, setSel] = useState(items[0]?.id ?? null);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(false);
  const shown = useMemo(() => {
    let list = items.map((it, index) => ({ it, index }));
    if (q && searchText) list = list.filter(({ it }) => searchText(it).toLowerCase().includes(q.toLowerCase()));
    if (sort) list.sort((a, b) => sort(a.it, b.it));
    return list;
  }, [items, q, searchText, sort]);
  const index = items.findIndex((x) => x.id === sel);
  const current = index >= 0 ? items[index] : null;
  useEffect(() => setConfirm(false), [sel]);
  const add = () => { const n = makeNew(); onChange([n, ...items]); setSel(n.id); };
  const remove = () => { const next = items.filter((x) => x.id !== sel); onChange(next); setSel(next[0]?.id ?? null); };
  const updateCurrent = (path, value) => onChange(items.map((x, i) => (i === index ? setIn(x, path, value) : x)));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="min-w-0 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-royal-950/5 lg:sticky lg:top-6 lg:self-start">
        <div className="flex gap-2 p-1">
          {searchText && (
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" className={`${inputCls} !mt-0 pl-9`} />
            </div>
          )}
          {!fixed && <button type="button" onClick={add} className="btn-primary !px-4 !py-2.5" title={newLabel}><Plus size={16} /><span className="sr-only sm:not-sr-only">{newLabel}</span></button>}
        </div>
        <ul className="mt-2 max-h-[60vh] space-y-1 overflow-y-auto">
          {shown.length ? shown.map(({ it }) => (
            <li key={it.id}>
              <button type="button" onClick={() => setSel(it.id)} aria-current={it.id === sel}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition ${it.id === sel ? "bg-royal-50 ring-1 ring-royal-200" : "hover:bg-sand-100"}`}>
                {renderRow(it)}
              </button>
            </li>
          )) : <li className="px-3 py-8 text-center text-sm text-ink-mute">{empty}</li>}
        </ul>
      </div>
      <div className="min-w-0">
        {current ? (
          <Card actions={fixed ? null : (
            confirm ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink-soft">Delete this item?</span>
                <button type="button" onClick={remove} className="rounded-full bg-ember-500 px-3.5 py-1.5 font-semibold text-white hover:bg-ember-600">Delete</button>
                <button type="button" onClick={() => setConfirm(false)} className="rounded-full p-1.5 text-ink-mute hover:bg-sand-100" aria-label="Cancel"><X size={16} /></button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirm(true)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ember-500 hover:bg-ember-50"><Trash2 size={15} />Delete</button>
            ))
          }>
            {render(current, updateCurrent)}
          </Card>
        ) : (
          <div className="grid h-64 place-items-center rounded-2xl border-2 border-dashed border-sand-300 text-sm text-ink-mute">Select an item, or add a new one.</div>
        )}
      </div>
    </div>
  );
}

export const IMAGES = ["turmi-hills", "omo-river-omorate", "omo-river-banks", "banna-village", "hamer-village", "omo-savanna", "lower-omo-aerial", "omo-river-aerial", "hamer-ceremony", "banna-enterprise", "lake-turkana-dusk", "dassanech-mother", "dassanech-elder", "banna-woman", "hamer-boys", "mursi-woman"];

export function ImagePicker({ label = "Photo", value, onChange }) {
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {IMAGES.map((id) => (
          <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id} title={id}
            className={`relative aspect-square overflow-hidden rounded-xl ring-2 transition ${value === id ? "ring-royal-600" : "ring-transparent hover:ring-royal-200"}`}>
            <img src={`./images/${id}.jpg`} alt={id} loading="lazy" className="h-full w-full object-cover" />
            {value === id && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-royal-600 text-white"><Check size={12} /></span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// Small status chip
export function Chip({ tone = "neutral", children }) {
  const tones = { neutral: "bg-sand-100 text-ink-soft", good: "bg-leaf-50 text-leaf-700", warn: "bg-sun-100 text-sun-600", bad: "bg-ember-50 text-ember-600", blue: "bg-royal-50 text-royal-700" };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}
