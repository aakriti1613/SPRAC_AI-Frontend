import { useState } from "react";
import { ArrowLeft, ArrowRight, HelpCircle, Plus, X } from "lucide-react";
import {
  addModule,
  addableModules,
  allowedStyles,
  canBuild,
  pickedRooms,
  removeModule,
  roomIsOn,
  setBrand,
  setIndustry,
  setStyle,
  setWebsiteType,
  summarize,
  toggleRoom,
} from "./builderState";
import { Badge, ErrorBox, Spinner, card, ghostBtn, inputCls, label, primaryBtn } from "./ui";

const LEVEL_TONE = { basic: "slate", good: "sky", amazing: "green", astonishing: "amber" };

function BrandField({ value, onCommit }) {
  const [text, setText] = useState(value);
  const commit = () => text.trim() && text.trim() !== value && onCommit(text.trim());
  return (
    <div>
      <label htmlFor="brand-name" className={label}>
        Name
      </label>
      <input
        id="brand-name"
        className={inputCls}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit())}
        maxLength={60}
      />
    </div>
  );
}

export default function StepPlan({ state, options, dispatch, onEdit, onReplan }) {
  const { signals, config, plan } = state;
  const type = options?.websiteTypes?.find((w) => w.id === signals.websiteType);
  const levels = allowedStyles(options, signals.websiteType);
  const rebuilding = state.busy === "rebuilding";
  const rooms = pickedRooms(state.composition);
  const addable = addableModules(options, signals);
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-6">
      {/* What will be built */}
      <div className={card}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="sky">{plan.engine}</Badge>
          {plan.reuse && <Badge tone="green">{plan.reuse.note}</Badge>}
          {plan.repaired && <Badge tone="amber">fixed up automatically</Badge>}
        </div>
        <p className="mt-3 text-lg font-semibold text-white" data-testid="plan-summary">
          {summarize(config)}
        </p>
        {plan.fallbackReason && <p className="mt-1 text-xs text-amber-300">{plan.fallbackReason}</p>}
      </div>

      {plan.questions.length > 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-5" role="note">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-100">
            <HelpCircle className="h-4 w-4" /> The planner wasn't sure about:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100/90">
            {plan.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-100/70">Change the choices below, or go back, add detail to your description, and plan again.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Choices */}
        <div className={`${card} space-y-4`}>
          <h2 className="text-sm font-semibold text-white">Your choices</h2>
          <BrandField key={signals.brandName} value={signals.brandName} onCommit={(v) => onEdit(setBrand(signals, v))} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="website-type" className={label}>
                Kind of website
              </label>
              <select id="website-type" className={inputCls} value={signals.websiteType} onChange={(e) => onEdit(setWebsiteType(options, signals, e.target.value))}>
                {options.websiteTypes.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="industry" className={label}>
                Industry
              </label>
              <select id="industry" className={inputCls} value={signals.industry} onChange={(e) => onEdit(setIndustry(signals, e.target.value))}>
                {options.industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {type && <p className="text-xs text-slate-500">{type.description}</p>}

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
                    title={ok ? s.summary : `Not available for this kind of website (max ${type?.maxStyleLevel})`}
                    onClick={() => onEdit(setStyle(options, signals, s.id))}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border-sky-400 bg-sky-400/15 text-white" : "border-white/[0.1] text-slate-300 hover:border-white/[0.25]"}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {type?.optionalRooms?.length > 0 && (
            <fieldset>
              <legend className={label}>Optional parts</legend>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {type.optionalRooms.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-white/[0.04]" title={r.description}>
                    <input type="checkbox" checked={roomIsOn(config, r.id)} onChange={() => onEdit(toggleRoom(signals, config, r.id))} className="h-4 w-4 accent-sky-400" />
                    {r.id}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        {/* Modules or sections */}
        <div className={`${card} space-y-4`}>
          {signals.websiteType === "admin-portal" ? (
            <>
              <h2 className="text-sm font-semibold text-white">Modules (reused from the library)</h2>
              <ul className="flex flex-wrap gap-2" aria-label="Chosen modules">
                {config.modules.map((m) => (
                  <li key={m.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] py-1 pl-3 pr-1.5 text-sm text-slate-200">
                    {m.pluralName} <span className="text-xs text-slate-500">· {m.fields.length} fields</span>
                    <button type="button" aria-label={`Remove ${m.pluralName}`} onClick={() => onEdit(removeModule(signals, m.id))} disabled={config.modules.length <= 1} className="rounded-full p-0.5 text-slate-400 hover:bg-white/[0.1] hover:text-white disabled:opacity-30">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <div>
                <label htmlFor="add-module" className={label}>
                  Add a module
                </label>
                <div className="flex gap-2">
                  <select id="add-module" className={inputCls} value="" onChange={(e) => e.target.value && onEdit(addModule(signals, e.target.value))}>
                    <option value="">Choose…</option>
                    {addable.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.pluralName} — {m.summary}
                      </option>
                    ))}
                  </select>
                  <span className="flex items-center text-slate-500">
                    <Plus className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-white">Sections on the page</h2>
              <ul className="flex flex-wrap gap-2" aria-label="Sections">
                {Object.keys(config.sections).map((s) => (
                  <li key={s} className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-sm text-slate-200">
                    {s}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">Sections start with sample text you can edit after the site is generated.</p>
            </>
          )}
        </div>
      </div>

      {/* Which component fills each room */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Components that will be used</h2>
          {rebuilding && <Spinner text="Updating…" />}
        </div>
        {rooms.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{rebuilding ? "Choosing components…" : "Components appear once the plan is valid."}</p>
        ) : (
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3" data-testid="picked-rooms">
            {rooms.map((r) => (
              <li key={r.room} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-400">{r.room}</span>
                <Badge tone={LEVEL_TONE[r.level] || "slate"}>{r.level}</Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-500">Only verified components are used. If a room has no version at your style, the closest lower style is used.</p>
      </div>

      {state.errors.length > 0 && <ErrorBox title="This plan has a problem" message={state.errors.join("\n")} />}
      <ErrorBox message={state.error} />

      <div>
        <button type="button" className="text-xs text-slate-500 underline hover:text-slate-300" onClick={() => setShowJson((v) => !v)}>
          {showJson ? "Hide" : "Show"} the config
        </button>
        {showJson && <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-white/[0.08] bg-black/40 p-3 text-xs text-slate-300">{JSON.stringify(config, null, 2)}</pre>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
