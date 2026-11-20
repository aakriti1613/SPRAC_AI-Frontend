import { Sparkles } from "lucide-react";
import { ErrorBox, Spinner, card, inputCls, label, primaryBtn } from "./ui";

const EXAMPLES = [
  "A clinic website to manage patients and appointments",
  "A school portal for students, fees and exam results",
  "A personal portfolio for a frontend developer",
  "A one-page landing site for my coaching institute",
];

const AUTO = { id: "auto", label: "Let the AI choose", summary: "The planner picks a style from your words (default: Good)." };

export default function StepDescribe({ state, options, dispatch, onPlan }) {
  const styles = [AUTO, ...(options?.styleLevels || [])];
  const busy = state.busy === "planning";
  const tooShort = state.description.trim().length < 5;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!tooShort && !busy) onPlan();
      }}
      className="space-y-6"
    >
      <div className={card}>
        <label htmlFor="builder-description" className={label}>
          What do you want to build?
        </label>
        <textarea
          id="builder-description"
          rows={4}
          className={inputCls}
          placeholder="e.g. A clinic website to manage patients and appointments"
          value={state.description}
          onChange={(e) => dispatch({ type: "description", value: e.target.value })}
          disabled={busy}
        />
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Examples">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => dispatch({ type: "description", value: ex })}
              className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-slate-300 transition hover:border-sky-400/40 hover:text-white"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <fieldset className={card} disabled={busy}>
        <legend className={`${label} px-1`}>How fancy should it look?</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {styles.map((s) => {
            const on = state.styleChoice === s.id;
            return (
              <label
                key={s.id}
                className={`cursor-pointer rounded-lg border p-3 text-sm transition ${on ? "border-sky-400 bg-sky-400/10" : "border-white/[0.08] hover:border-white/[0.2]"}`}
              >
                <input type="radio" name="style" value={s.id} checked={on} onChange={() => dispatch({ type: "styleChoice", value: s.id })} className="sr-only" />
                <span className="block font-semibold text-white">{s.label}</span>
                <span className="mt-1 block text-xs text-slate-400">{s.summary}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">Admin portals go up to Amazing; portfolios and landing pages can use Astonishing.</p>
      </fieldset>

      <ErrorBox message={state.error} />

      <div className="flex items-center gap-4">
        <button type="submit" className={primaryBtn} disabled={tooShort || busy}>
          <Sparkles className="h-4 w-4" /> Make a plan
        </button>
        {busy && <Spinner text="Reading your description…" />}
        {tooShort && !busy && <span className="text-xs text-slate-500">Describe it in a few words to begin.</span>}
      </div>
    </form>
  );
}
