// After picking a kind of website: build it from a template, or with SPARC AI.
// Both ways ask for the same basics (name, industry, colour, modules); they differ
// only in how the website is put together.
import { ArrowLeft, ArrowRight, Check, LayoutTemplate, Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { siteTypeById, templatesFor } from "./siteTypes";

const option = "flex h-full flex-col rounded-2xl border bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6";

function Point({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
      {children}
    </li>
  );
}

export default function ChooseMode() {
  const { type: typeId } = useParams();
  const type = siteTypeById(typeId);
  const templates = templatesFor(typeId);

  if (!type) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 antialiased">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All kinds of website
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">{type.name}</h1>
        <p className="mt-2 text-slate-400">{type.tagline}</p>
        <p className="mb-8 mt-6 text-sm font-medium text-slate-300">How do you want to build it?</p>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Template */}
          <section aria-labelledby="mode-template" className={`${option} ${templates.length ? "border-white/[0.1]" : "border-white/[0.06] opacity-80"}`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-slate-200">
              <LayoutTemplate className="h-5 w-5" aria-hidden />
            </span>
            <h2 id="mode-template" className="mt-4 text-lg font-semibold text-white">
              Use a template
            </h2>
            <p className="mt-1 text-sm text-slate-400">Start from a ready-made design and add your own details.</p>
            <ul className="mt-4 space-y-2">
              <Point>A finished design you pick</Point>
              <Point>You fill in your name, content and modules</Point>
              <Point>Quick and predictable</Point>
            </ul>

            {templates.length > 0 ? (
              <div className="mt-auto pt-6">
                <Link
                  to={`/new/${type.id}/templates`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 active:scale-[0.98]"
                >
                  See {templates.length} template{templates.length > 1 ? "s" : ""} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <p className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-slate-400" role="note">
                There is no ready template for {/^[aeiou]/i.test(type.name) ? "an" : "a"} {type.name.toLowerCase()} yet. Build it with SPARC AI instead.
              </p>
            )}
          </section>

          {/* SPARC AI */}
          <section aria-labelledby="mode-ai" className={`${option} border-sky-400/40 shadow-[0_0_40px_-18px_rgba(56,189,248,0.6)]`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <h2 id="mode-ai" className="mt-4 text-lg font-semibold text-white">
              Build with SPARC AI
            </h2>
            <p className="mt-1 text-sm text-slate-400">Describe it in your own words. SPARC AI assembles it from tested, reusable parts.</p>
            <ul className="mt-4 space-y-2">
              <Point>Plain-language description</Point>
              <Point>You review the plan before anything is built</Point>
              <Point>Choose a style, from Basic to Astonishing</Point>
            </ul>
            <div className="mt-auto pt-6">
              <Link
                to={`/builder?type=${type.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-sky-400 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(56,189,248,0.45)] transition hover:from-sky-300 hover:to-sky-400 active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4" aria-hidden /> Build with SPARC AI
              </Link>
            </div>
          </section>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">Both ways ask for the same basics: name, industry, colour and, for portals, the modules. In both you can also edit the JSON by hand.</p>
      </div>

    </main>
  );
}
