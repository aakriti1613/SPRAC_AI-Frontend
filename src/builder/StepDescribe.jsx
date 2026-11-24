import { Sparkles } from "lucide-react";
import { examplesFor, industriesFor, industryLabel, typeName } from "./builderState";
import { ErrorBox, Hint, Spinner, card, inputCls, label, primaryBtn } from "./ui";

const AUTO_STYLE = { id: "auto", label: "Let SPARC AI choose", summary: "Picks from your words. Good if unsure." };

export default function StepDescribe({ state, options, dispatch, onPlan }) {
  const type = options?.websiteTypes?.find((w) => w.id === state.chosenType);
  const styles = [AUTO_STYLE, ...(options?.styleLevels || [])];
  const allowed = type?.styleLevels;
  const industries = state.chosenType ? industriesFor(options, state.chosenType) : options?.industries || [];
  const busy = state.busy === "planning";
  const tooShort = state.description.trim().length < 5;
  const examples = examplesFor(state.chosenType);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!tooShort && !busy) onPlan();
      }}
      className="space-y-5"
    >
      {/* 1. The description */}
      <div className={card}>
        <label htmlFor="builder-description" className="text-base font-semibold text-white">
          Describe your {state.chosenType ? typeName(options, state.chosenType).toLowerCase() : "website"}
        </label>
        <Hint>Write one or two sentences: what it is, who it is for, and what people should be able to do on it.</Hint>
        <textarea
          id="builder-description"
          rows={4}
          className={`${inputCls} mt-3`}
          placeholder={examples[0]}
          value={state.description}
          onChange={(e) => dispatch({ type: "description", value: e.target.value })}
          disabled={busy}
        />
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-400">Not sure what to write? Click an example to use it:</p>
          <div className="mt-2 flex flex-wrap gap-2" aria-label="Example descriptions">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => dispatch({ type: "description", value: ex })}
                className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-left text-xs text-slate-300 transition hover:border-sky-400/50 hover:bg-sky-400/[0.08] hover:text-white"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Basics, the same ones the template wizard asks for */}
      <fieldset className={card} disabled={busy}>
        <legend className="px-1 text-base font-semibold text-white">Basics <span className="text-xs font-normal text-slate-500">(optional)</span></legend>
        <Hint>Leave these empty and SPARC AI works them out from your description. You can change everything on the next screen.</Hint>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name-choice" className={label}>
              Name
            </label>
            <input id="name-choice" className={inputCls} maxLength={60} placeholder="e.g. Sunrise Clinic" value={state.nameChoice} onChange={(e) => dispatch({ type: "choice", key: "nameChoice", value: e.target.value })} />
          </div>
          {industries.length > 0 && (
            <div>
              <label htmlFor="industry-choice" className={label}>
                Industry
              </label>
              <select id="industry-choice" className={inputCls} value={state.industryChoice} onChange={(e) => dispatch({ type: "choice", key: "industryChoice", value: e.target.value })}>
                <option value="auto">Let SPARC AI decide</option>
                {industries.map((i) => (
                  <option key={i} value={i}>
                    {industryLabel(i)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="color-choice" className={label}>
              Brand colour
            </label>
            <div className="flex items-center gap-3">
              <input id="color-choice" type="color" value={state.colorChoice || "#2563eb"} onChange={(e) => dispatch({ type: "choice", key: "colorChoice", value: e.target.value })} className="h-10 w-14 cursor-pointer rounded-md border border-white/[0.1] bg-transparent p-1" />
              <span className="text-xs text-slate-400">{state.colorChoice || "Chosen from the industry"}</span>
              {state.colorChoice && (
                <button type="button" className="text-xs text-sky-300 hover:underline" onClick={() => dispatch({ type: "choice", key: "colorChoice", value: "" })}>
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {/* 3. Style */}
      <fieldset className={card} disabled={busy}>
        <legend className="px-1 text-base font-semibold text-white">How fancy should it look?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {styles.map((s) => {
            const ok = s.id === "auto" || !allowed || allowed.includes(s.id);
            const on = state.styleChoice === s.id;
            return (
              <label
                key={s.id}
                title={ok ? s.summary : `Not available for this kind of website (up to ${type?.maxStyleLevel})`}
                className={`rounded-lg border p-3 text-sm transition ${ok ? "cursor-pointer" : "cursor-not-allowed opacity-40"} ${on ? "border-sky-400 bg-sky-400/10" : "border-white/[0.08] hover:border-white/[0.2]"}`}
              >
                <input type="radio" name="style" value={s.id} disabled={!ok} checked={on} onChange={() => dispatch({ type: "styleChoice", value: s.id })} className="sr-only" />
                <span className="block font-semibold text-white">{s.label}</span>
                <span className="mt-1 block text-xs text-slate-400">{s.summary}</span>
              </label>
            );
          })}
        </div>
        {type && <Hint>{typeName(options, state.chosenType)} goes up to {type.maxStyleLevel === "astonishing" ? "Astonishing" : "Amazing"}.</Hint>}
      </fieldset>

      <ErrorBox message={state.error} />

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={primaryBtn} disabled={tooShort || busy}>
          <Sparkles className="h-4 w-4" /> Make a plan
        </button>
        {busy && <Spinner text="Reading your description…" />}
        {tooShort && !busy && <span className="text-xs text-slate-500">Write a few words to begin.</span>}
      </div>
    </form>
  );
}
