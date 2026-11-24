// One module picker for both ways of building (templates and SPARC AI).
// It only shows what it is given, so each flow decides which modules are relevant
// (for example, only the clinic's modules for a clinic). It never lists extras.
import { useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] py-1 pl-3 pr-1.5 text-sm text-slate-100";

/**
 * selected   [{ id, name, detail? }]            what is already in the website
 * available  [{ id, name, summary? }]           modules that can be added (already filtered by the caller)
 * general    [{ id, name, summary? }]           optional extra group, hidden until the user asks
 * onAdd(id), onRemove(id)
 * minSelected  how many must stay (the remove button is disabled at this count)
 * noun         what to call them, e.g. "module"
 */
export default function ModulePicker({ selected, available, general = [], onAdd, onRemove, minSelected = 0, noun = "module", reasonLabel }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showGeneral, setShowGeneral] = useState(false);

  const matches = (m) => !query.trim() || `${m.name} ${m.summary || ""}`.toLowerCase().includes(query.trim().toLowerCase());
  const pool = useMemo(() => (showGeneral ? [...available, ...general] : available).filter(matches), [available, general, showGeneral, query]); // eslint-disable-line react-hooks/exhaustive-deps
  const LIMIT = 6;
  const shown = showAll || query.trim() ? pool : pool.slice(0, LIMIT);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          In your website <span className="ml-1 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] normal-case text-slate-300">{selected.length}</span>
        </p>
        {selected.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No {noun}s yet. Add one below.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2" aria-label={`Chosen ${noun}s`}>
            {selected.map((m) => (
              <li key={m.id} className={chip}>
                <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                {m.name}
                {m.detail && <span className="text-xs text-slate-500">· {m.detail}</span>}
                <button
                  type="button"
                  aria-label={`Remove ${m.name}`}
                  onClick={() => onRemove(m.id)}
                  disabled={selected.length <= minSelected}
                  className="rounded-full p-0.5 text-slate-400 transition hover:bg-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Add more{reasonLabel ? ` for ${reasonLabel}` : ""}
          </p>
          {available.length + general.length > LIMIT && (
            <label className="relative">
              <span className="sr-only">Search {noun}s</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${noun}s`}
                className="w-44 rounded-md border border-white/[0.1] bg-[#0b1120] py-1.5 pl-8 pr-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none"
              />
            </label>
          )}
        </div>

        {pool.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{available.length + general.length === 0 ? `Every ${noun} for this choice is already added.` : `No ${noun} matches "${query}".`}</p>
        ) : (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2" aria-label={`Available ${noun}s`}>
            {shown.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onAdd(m.id)}
                  className="group flex w-full items-start gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-left transition hover:border-sky-400/40 hover:bg-sky-400/[0.06]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/[0.15] text-slate-400 transition group-hover:border-sky-400/60 group-hover:text-sky-300">
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">{m.name}</span>
                    {m.summary && <span className="mt-0.5 line-clamp-2 block text-xs text-slate-400">{m.summary}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {!query.trim() && pool.length > LIMIT && (
            <button type="button" className="text-sky-300 hover:underline" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show fewer" : `Show all ${pool.length}`}
            </button>
          )}
          {general.length > 0 && (
            <button type="button" className="text-slate-400 hover:text-white hover:underline" onClick={() => setShowGeneral((v) => !v)}>
              {showGeneral ? "Hide general-purpose modules" : "Also show general-purpose modules (tasks, documents...)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
