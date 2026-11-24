// Small shared pieces for the builder screens (same dark look as the rest of the platform).
import { useState } from "react";
import { AlertTriangle, ChevronDown, Loader2 } from "lucide-react";

export const card = "rounded-xl border border-white/[0.08] bg-white/[0.03] p-5";
export const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400";
export const inputCls =
  "w-full rounded-lg border border-white/[0.1] bg-[#0b1120] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20 disabled:opacity-50";
export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-sky-400 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(56,189,248,0.45)] transition hover:from-sky-300 hover:to-sky-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
export const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/[0.2] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50";

export function Spinner({ text }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-400" role="status">
      <Loader2 className="h-4 w-4 animate-spin" /> {text}
    </span>
  );
}

export function ErrorBox({ message, title = "Something went wrong" }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-3 rounded-lg border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 whitespace-pre-line text-rose-200/90">{message}</p>
      </div>
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "border-white/[0.1] bg-white/[0.05] text-slate-300",
    sky: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

/**
 * A card that opens and closes, so a long screen shows only what matters first.
 * summary is a short line shown while it is closed.
 */
export function Section({ title, summary, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={card}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            {title}
            {badge !== undefined && <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-slate-300">{badge}</span>}
          </span>
          {!open && summary && <span className="mt-0.5 block truncate text-xs text-slate-400">{summary}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

/** Small grey help text under a control. */
export function Hint({ children }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{children}</p>;
}

/** Step bar: 1 Describe, 2 Review, 3 Build. */
export function StepBar({ step }) {
  const items = [
    ["describe", "Describe"],
    ["plan", "Review"],
    ["result", "Build"],
  ];
  const current = items.findIndex(([id]) => id === step);
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm sm:gap-x-3" aria-label="Progress">
      {items.map(([id, text], i) => (
        <li key={id} className="flex items-center gap-2 sm:gap-3" aria-current={i === current ? "step" : undefined}>
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
              i < current ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" : i === current ? "border-sky-400 bg-sky-400/15 text-sky-100" : "border-white/[0.12] text-slate-500"
            }`}
          >
            {i + 1}
          </span>
          <span className={i === current ? "font-medium text-white" : "text-slate-500"}>{text}</span>
          {i < items.length - 1 && <span className="h-px w-4 bg-white/[0.1] sm:w-8" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
