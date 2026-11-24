// A small form engine: describe a form as data (sections of fields and repeatable
// lists) and it draws the inputs. The same engine fills every kind of website, so
// all of them are filled in the same easy way.
//
// section: { id, title, hint?, when?(value) -> bool, fields?: Field[], lists?: List[] }
// Field:   { path, label, type, help?, placeholder?, options?, half? }
//          type: text | textarea | url | number | select | color | toggle | csv | lines | weekdays
// List:    { path, label, itemLabel, titleKey, fields: Field[] (paths relative to the item), newItem(items) }
//          adapter?: { toList(value) -> array, fromList(array) -> value }  (for data stored in another shape)
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Section, inputCls, label as labelCls } from "../builder/ui";
import { csvToList, getIn, linesToList, listToCsv, listToLines, setIn } from "./paths";

const DAYS = [
  [1, "Mon"],
  [2, "Tue"],
  [3, "Wed"],
  [4, "Thu"],
  [5, "Fri"],
  [6, "Sat"],
  [0, "Sun"],
];

/**
 * A text box that edits a list ("React, Vite" <-> ["React", "Vite"]). It keeps what the
 * user typed (including a trailing comma or blank line) and only updates the list, so
 * typing is never interrupted. If the list changes from outside, the text follows it.
 */
function ListText({ id, value, onChange, parse, format, multiline, rows, placeholder }) {
  const list = Array.isArray(value) ? value : [];
  const [text, setText] = useState(() => format(list));
  const [seen, setSeen] = useState(list);
  if (JSON.stringify(seen) !== JSON.stringify(list) && JSON.stringify(parse(text)) !== JSON.stringify(list)) {
    setText(format(list)); // the list was changed elsewhere
    setSeen(list);
  }
  const change = (next) => {
    setText(next);
    const parsed = parse(next);
    setSeen(parsed);
    onChange(parsed);
  };
  return multiline ? (
    <textarea id={id} className={inputCls} rows={rows || 4} placeholder={placeholder} value={text} onChange={(e) => change(e.target.value)} />
  ) : (
    <input id={id} className={inputCls} placeholder={placeholder} value={text} onChange={(e) => change(e.target.value)} />
  );
}

/** One input. value is read from `data` at field.path; changes call onSet(path, newValue). */
export function FieldInput({ field, data, onSet, idBase }) {
  const raw = getIn(data, field.path);
  const id = `${idBase}-${field.path.replace(/[^a-z0-9]/gi, "-")}`;
  const set = (v) => onSet(field.path, v);
  const common = { id, className: inputCls, placeholder: field.placeholder };

  let control;
  switch (field.type) {
    case "textarea":
      control = <textarea {...common} rows={field.rows || 3} value={raw ?? ""} onChange={(e) => set(e.target.value)} />;
      break;
    case "number":
      control = <input {...common} type="number" step="any" value={raw ?? ""} onChange={(e) => set(e.target.value === "" ? undefined : Number(e.target.value))} />;
      break;
    case "select":
      control = (
        <select id={id} className={inputCls} value={raw ?? ""} onChange={(e) => set(e.target.value)}>
          {field.optional && <option value="">None</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "color":
      control = <input id={id} type="color" value={raw || "#2563eb"} onChange={(e) => set(e.target.value)} className="h-10 w-16 cursor-pointer rounded-md border border-white/[0.1] bg-transparent p-1" />;
      break;
    case "toggle":
      return (
        <label className="flex cursor-pointer items-center gap-2.5 py-2 text-sm text-slate-200">
          <input id={id} type="checkbox" checked={raw ?? field.defaultOn ?? false} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-sky-400" />
          {field.label}
          {field.help && <span className="text-xs text-slate-500">{field.help}</span>}
        </label>
      );
    case "csv":
      control = <ListText id={id} value={raw} onChange={set} parse={csvToList} format={listToCsv} placeholder={field.placeholder} />;
      break;
    case "lines":
      control = <ListText id={id} value={raw} onChange={set} parse={linesToList} format={listToLines} multiline rows={field.rows} placeholder={field.placeholder} />;
      break;
    case "weekdays": {
      const on = new Set(raw || []);
      control = (
        <div className="flex flex-wrap gap-2" role="group" aria-label={field.label}>
          {DAYS.map(([n, name]) => (
            <label key={n} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition ${on.has(n) ? "border-sky-400 bg-sky-400/15 text-white" : "border-white/[0.1] text-slate-400 hover:border-white/[0.25]"}`}>
              <input type="checkbox" className="sr-only" checked={on.has(n)} onChange={() => set([...(on.has(n) ? [...on].filter((d) => d !== n) : [...on, n])].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)))} />
              {name}
            </label>
          ))}
        </div>
      );
      break;
    }
    default:
      control = <input {...common} type={field.type === "url" ? "url" : "text"} value={raw ?? ""} onChange={(e) => set(e.target.value)} />;
  }
  return (
    <div className={field.half ? "" : "sm:col-span-2"}>
      <label htmlFor={id} className={labelCls}>
        {field.label}
      </label>
      {control}
      {field.help && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{field.help}</p>}
    </div>
  );
}

function FieldGrid({ fields, data, onSet, idBase }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <FieldInput key={f.path} field={f} data={data} onSet={onSet} idBase={idBase} />
      ))}
    </div>
  );
}

/** A repeatable group: each item is a small card with its own fields, a remove button and up/down. */
export function ListEditor({ list, data, onChange, idBase }) {
  const items = getIn(data, list.path) || [];
  const write = (next) => onChange(list.path, next);
  const move = (i, d) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    write(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          {list.label} <span className="ml-1 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-slate-300">{items.length}</span>
        </p>
        <button type="button" onClick={() => write([...items, list.newItem(items)])} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-400/[0.08] px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/[0.16]">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add {list.itemLabel.toLowerCase()}
        </button>
      </div>
      {items.length === 0 && <p className="rounded-lg border border-dashed border-white/[0.12] p-4 text-center text-sm text-slate-500">No {list.label.toLowerCase()} yet. Click "Add {list.itemLabel.toLowerCase()}".</p>}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-slate-200">
              {list.itemLabel} {i + 1}
              {item?.[list.titleKey] ? <span className="text-slate-500"> · {String(item[list.titleKey]).slice(0, 40)}</span> : null}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" aria-label={`Move ${list.itemLabel.toLowerCase()} ${i + 1} up`} onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white disabled:opacity-25">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" aria-label={`Move ${list.itemLabel.toLowerCase()} ${i + 1} down`} onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-md p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white disabled:opacity-25">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" aria-label={`Remove ${list.itemLabel.toLowerCase()} ${i + 1}`} onClick={() => write(items.filter((_, k) => k !== i))} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <FieldGrid fields={list.fields} data={item} idBase={`${idBase}-${i}`} onSet={(path, v) => write(items.map((it, k) => (k === i ? setIn(it, path, v) : it)))} />
        </div>
      ))}
    </div>
  );
}

/**
 * Draw every section of a form definition (the ones whose `when` is true).
 * value is the whole config; onChange(newValue) gets a new copy after each edit.
 */
export function FormSections({ defs, value, onChange, firstOpen = true, idBase = "f" }) {
  const set = (path, v) => onChange(setIn(value, path, v));
  const visible = defs.filter((s) => !s.when || s.when(value));
  return (
    <div className="space-y-3">
      {visible.map((s, i) => (
        <Section key={s.id} title={s.title} defaultOpen={firstOpen && i === 0} summary={s.hint}>
          <div className="space-y-5">
            {s.hint && <p className="text-xs leading-relaxed text-slate-500">{s.hint}</p>}
            {s.fields?.length > 0 && <FieldGrid fields={s.fields} data={value} onSet={set} idBase={`${idBase}-${s.id}`} />}
            {(s.lists || []).map((l) => (
              <ListEditor key={l.path} list={l} data={value} onChange={set} idBase={`${idBase}-${s.id}-${l.path}`} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

