import { useState } from "react";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import ModulePicker from "../shared/ModulePicker";
import {
  addModule,
  allowedStyles,
  canBuild,
  industriesFor,
  industryLabel,
  pickedRooms,
  relevantModules,
  removeModule,
  roomIsOn,
  setBrand,
  setIndustryAndModules,
  setStyle,
  setThemeColor,
  setWebsiteType,
  summarize,
  toggleRoom,
  typeName,
} from "./builderState";
import { Badge, ErrorBox, Hint, Section, Spinner, card, ghostBtn, inputCls, label, primaryBtn } from "./ui";

const LEVEL_TONE = { basic: "slate", good: "sky", amazing: "green", astonishing: "amber" };
const ENGINE_TEXT = { gemini: "Planned with AI (Gemini)", "offline-rules": "Planned with built-in rules", "offline-rules+gemini-embed": "Planned with built-in rules" };

function BrandField({ value, onCommit }) {
  const [text, setText] = useState(value);
  const commit = () => text.trim() && text.trim() !== value && onCommit(text.trim());
  return (
    <div>
      <label htmlFor="brand-name" className={label}>
        Name
      </label>
      <input id="brand-name" className={inputCls} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit())} maxLength={60} />
    </div>
  );
}

/** Edit the whole config as JSON. Nothing is used until it passes the server's checks. */
function JsonEditor({ config, manual, onApply }) {
  const original = JSON.stringify(config, null, 2);
  const [text, setText] = useState(original);
  const [result, setResult] = useState(null); // { ok, errors }
  const [busy, setBusy] = useState(false);
  // When the config changes because a choice above changed, show the new one.
  const [shown, setShown] = useState(original);
  if (shown !== original && !busy) {
    setShown(original);
    setText(original);
    if (!manual) setResult(null);
  }
  const apply = async () => {
    setBusy(true);
    try {
      setResult(await onApply(text));
    } catch (e) {
      setResult({ ok: false, errors: [e.message] });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3">
      <Hint>For people who know the format. Your changes are checked before they are used. Changing a choice above afterwards rebuilds the config and replaces these edits.</Hint>
      <label htmlFor="config-json" className="sr-only">
        Config as JSON
      </label>
      <textarea id="config-json" spellCheck={false} rows={14} value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} font-mono text-xs leading-relaxed`} />
      {result && !result.ok && <ErrorBox title="This config cannot be used yet" message={result.errors.slice(0, 6).join("\n")} />}
      {result?.ok && (
        <p role="status" className="text-sm text-emerald-300">
          Checked and in use. The components below were updated.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={ghostBtn} onClick={apply} disabled={busy || text === original}>
          Check and use my edits
        </button>
        <button type="button" className="text-xs text-slate-400 hover:text-white hover:underline" onClick={() => (setText(original), setResult(null))} disabled={text === original}>
          Undo my edits
        </button>
        {manual && <Badge tone="amber">using your JSON</Badge>}
      </div>
    </div>
  );
}

export default function StepPlan({ state, options, dispatch, onEdit, onReplan, onManualApply }) {
  const { signals, config, plan } = state;
  const type = options?.websiteTypes?.find((w) => w.id === signals.websiteType);
  const levels = allowedStyles(options, signals.websiteType);
  const industries = industriesFor(options, signals.websiteType);
  const rebuilding = state.busy === "rebuilding";
  const rooms = pickedRooms(state.composition);
  const isPortal = signals.websiteType === "admin-portal";
  const available = relevantModules(options, signals).map((m) => ({ id: m.id, name: m.pluralName, summary: m.summary }));
  const general = relevantModules(options, signals, { includeGeneral: true })
    .filter((m) => !m.industries.includes(signals.industry))
    .map((m) => ({ id: m.id, name: m.pluralName, summary: m.summary }));
  const selected = (config?.modules || []).map((m) => ({ id: m.id, name: m.pluralName, detail: `${m.fields.length} fields` }));
  const optional = type?.optionalRooms || [];
  const onCount = optional.filter((r) => roomIsOn(config, r.id)).length;

  return (
    <div className="space-y-5">
      {/* What will be built */}
      <div className={card}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="sky">{ENGINE_TEXT[plan.engine] || plan.engine}</Badge>
          {plan.repaired && <Badge tone="amber">adjusted automatically</Badge>}
        </div>
        <p className="mt-3 text-lg font-semibold text-white" data-testid="plan-summary">
          {summarize(config)}
        </p>
        {plan.fallbackReason && <p className="mt-1 text-xs text-amber-300">{plan.fallbackReason}</p>}
      </div>

      {plan.questions.length > 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-5" role="note">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-100">
            <HelpCircle className="h-4 w-4" /> SPARC AI was not sure about:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100/90">
            {plan.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-100/70">Change the choices below, or go back, add detail to your description and plan again.</p>
        </div>
      )}

      {/* Basics */}
      <Section title="Basics" defaultOpen summary={`${config?.brand?.name} · ${signals.styleLevel}`}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <BrandField key={signals.brandName} value={signals.brandName} onCommit={(v) => onEdit(setBrand(signals, v))} />
            {state.chosenType ? (
              <div>
                <span className={label}>Kind of website</span>
                <p className="flex h-10 items-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-slate-200">{typeName(options, signals.websiteType)}</p>
              </div>
            ) : (
              <div>
                <label htmlFor="website-type" className={label}>
                  Kind of website
                </label>
                <select id="website-type" className={inputCls} value={signals.websiteType} onChange={(e) => onEdit(setWebsiteType(options, signals, e.target.value))}>
                  {options.websiteTypes.map((w) => (
                    <option key={w.id} value={w.id}>
                      {typeName(options, w.id)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {industries.length > 0 && (
              <div>
                <label htmlFor="industry" className={label}>
                  Industry
                </label>
                <select id="industry" className={inputCls} value={signals.industry} onChange={(e) => onEdit(setIndustryAndModules(options, signals, e.target.value))}>
                  {industries.map((i) => (
                    <option key={i} value={i}>
                      {industryLabel(i)}
                    </option>
                  ))}
                </select>
                {isPortal && <Hint>Changing the industry keeps only the modules that belong to it.</Hint>}
              </div>
            )}
            <div>
              <label htmlFor="theme-color" className={label}>
                Brand colour
              </label>
              <div className="flex items-center gap-3">
                <input id="theme-color" type="color" value={config?.theme?.primary || "#2563eb"} onChange={(e) => onEdit(setThemeColor(signals, e.target.value))} className="h-10 w-14 cursor-pointer rounded-md border border-white/[0.1] bg-transparent p-1" />
                <span className="text-xs text-slate-400">{config?.theme?.primary}</span>
              </div>
            </div>
          </div>

          <fieldset>
            <legend className={label}>Style</legend>
            <div className="flex flex-wrap gap-2">
              {options.styleLevels.map((s) => {
                const ok = levels.includes(s.id);
                const on = signals.styleLevel === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!ok}
                    aria-pressed={on}
                    title={ok ? s.summary : `Not available for this kind of website (up to ${type?.maxStyleLevel})`}
                    onClick={() => onEdit(setStyle(options, signals, s.id))}
                    className={`rounded-lg border px-3.5 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border-sky-400 bg-sky-400/15 text-white" : "border-white/[0.1] text-slate-300 hover:border-white/[0.25]"}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <Hint>{options.styleLevels.find((s) => s.id === signals.styleLevel)?.summary}</Hint>
          </fieldset>
        </div>
      </Section>

      {/* Modules or sections */}
      {isPortal ? (
        <Section title="Modules" defaultOpen badge={selected.length} summary={selected.map((m) => m.name).join(", ")}>
          <ModulePicker
            selected={selected}
            available={available}
            general={general}
            minSelected={1}
            reasonLabel={industryLabel(signals.industry).toLowerCase()}
            onAdd={(id) => onEdit(addModule(signals, id))}
            onRemove={(id) => onEdit(removeModule(signals, id))}
          />
          <Hint>Each module becomes a menu item, a table and a form. Only modules that belong to your industry are listed.</Hint>
        </Section>
      ) : (
        <Section title="Sections on the page" badge={Object.keys(config?.sections || {}).length} summary={Object.keys(config?.sections || {}).join(", ")}>
          <ul className="flex flex-wrap gap-2" aria-label="Sections">
            {Object.keys(config?.sections || {}).map((s) => (
              <li key={s} className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-sm text-slate-200">
                {s}
              </li>
            ))}
          </ul>
          <Hint>Sections start with sample text. Change them in the JSON editor below, or after the site is generated.</Hint>
        </Section>
      )}

      {/* Optional parts */}
      {optional.length > 0 && (
        <Section title="Optional parts" badge={`${onCount} on`} summary="Extra sections you can switch on or off">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {optional.map((r) => (
              <label key={r.id} className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-300 hover:bg-white/[0.04]">
                <input type="checkbox" checked={roomIsOn(config, r.id)} onChange={() => onEdit(toggleRoom(signals, config, r.id))} className="mt-0.5 h-4 w-4 accent-sky-400" />
                <span>
                  <span className="block text-slate-100">{r.id.replace(/-/g, " ")}</span>
                  {r.description && <span className="block text-xs text-slate-500">{r.description}</span>}
                </span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Which component fills each room */}
      <Section title="Parts that will be used" badge={rooms.length || undefined} summary="Tested, reusable components chosen for each part of the page">
        <div className="flex items-center justify-end">{rebuilding && <Spinner text="Updating…" />}</div>
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-500">{rebuilding ? "Choosing components…" : "Components appear once the plan is valid."}</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3" data-testid="picked-rooms">
            {rooms.map((r) => (
              <li key={r.room} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-400">{r.room.replace(/-/g, " ")}</span>
                <Badge tone={LEVEL_TONE[r.level] || "slate"}>{r.level}</Badge>
              </li>
            ))}
          </ul>
        )}
        <Hint>Only verified components are used. If a part has no version at your style, the closest simpler style is used.</Hint>
      </Section>

      {/* Manual JSON */}
      <Section title="Advanced: edit as JSON" summary="Change anything by hand. It is checked first.">
        <JsonEditor config={config} manual={state.manual} onApply={onManualApply} />
      </Section>

      {state.errors.length > 0 && <ErrorBox title="This plan has a problem" message={state.errors.join("\n")} />}
      <ErrorBox message={state.error} />

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="button" className={ghostBtn} onClick={() => dispatch({ type: "goto", step: "describe" })}>
          <ArrowLeft className="h-4 w-4" /> Edit description
        </button>
        <button type="button" className={ghostBtn} onClick={onReplan} disabled={Boolean(state.busy)}>
          Plan again
        </button>
        <button type="button" className={`${primaryBtn} ml-auto`} disabled={!canBuild(state)} onClick={() => dispatch({ type: "goto", step: "result" })}>
          Looks good, continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
