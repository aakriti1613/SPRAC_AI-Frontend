// "Fill in your details": the form for the content of a portfolio, landing page,
// online store or booking site. It saves as you type (after a short pause): the
// server checks the result, and the components below update.
import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { FormSections } from "../forms/FormEngine";
import { finalizeSite, formFor } from "../forms/siteDefs";
import { ErrorBox } from "./ui";

/**
 * websiteType  which form to show
 * config       the config in use (already tidied)
 * onApply(config) -> Promise<{ ok, errors }>   check and use a new config
 */
export default function DetailsForm({ websiteType, config, onApply }) {
  const [draft, setDraft] = useState(config);
  const [known, setKnown] = useState([JSON.stringify(config)]); // configs that came from this form (or the last good one)
  const [status, setStatus] = useState({ state: "idle", errors: [] });
  const timer = useRef(null);
  const latest = useRef(0);

  // The config changed from somewhere else (a choice above, the JSON editor): follow it.
  const key = JSON.stringify(config);
  if (!known.includes(key)) {
    setKnown([key]);
    setDraft(config);
    setStatus({ state: "idle", errors: [] });
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function change(next) {
    setDraft(next);
    setStatus((s) => ({ ...s, state: "saving" }));
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const id = ++latest.current;
      const tidy = finalizeSite(next);
      const good = known[known.length - 1];
      setKnown([good, JSON.stringify(tidy)]);
      try {
        const r = await onApply(tidy);
        if (id !== latest.current) return;
        if (r.ok) {
          setKnown([JSON.stringify(tidy)]);
          setStatus({ state: "saved", errors: [] });
        } else {
          setKnown([good]);
          setStatus({ state: "problem", errors: r.errors });
        }
      } catch (e) {
        if (id !== latest.current) return;
        setKnown([good]);
        setStatus({ state: "problem", errors: [e.message] });
      }
    }, 700);
  }

  return (
    <div className="space-y-4">
      <div className="flex min-h-5 items-center gap-2 text-xs" role="status" aria-live="polite">
        {status.state === "saving" && (
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving…
          </span>
        )}
        {status.state === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <Check className="h-3.5 w-3.5" aria-hidden /> Saved and checked
          </span>
        )}
        {status.state === "idle" && <span className="text-slate-500">Changes are saved as you type.</span>}
      </div>
      {status.state === "problem" && <ErrorBox title="Fix this to keep going" message={status.errors.slice(0, 5).join("\n")} />}
      <FormSections defs={formFor(websiteType)} value={draft} onChange={change} firstOpen={false} idBase="details" />
    </div>
  );
}
