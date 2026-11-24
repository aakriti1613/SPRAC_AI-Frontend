// Template gallery: pick one ready-made design. Each card shows a small drawn preview.
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import GenerateModal from "../components/GenerateModal";
import { siteTypeById, templatesFor } from "./siteTypes";

const bar = "rounded-sm bg-white/25";

/** A tiny drawn picture of each template's layout (no image files needed). */
function Preview({ template }) {
  const c = template.accent || "#38bdf8";
  const kind = template.id;
  if (kind === "landing-temp-2") {
    return (
      <div className="h-full w-full bg-[#f4efe6] p-3 text-[#2a2118]">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-10 rounded-sm" style={{ background: c }} />
          <div className="flex gap-1.5"><div className="h-1 w-5 rounded-sm bg-black/25" /><div className="h-1 w-5 rounded-sm bg-black/25" /><div className="h-1 w-5 rounded-sm bg-black/25" /></div>
        </div>
        <div className="mt-4 font-serif text-[22px] font-bold italic leading-none">Hello, I&apos;m</div>
        <div className="font-serif text-[22px] font-bold leading-none" style={{ color: c }}>an editor.</div>
        <div className="mt-3 space-y-1"><div className="h-1 w-3/4 rounded-sm bg-black/20" /><div className="h-1 w-1/2 rounded-sm bg-black/20" /></div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (<div key={i} className="h-9 rounded-sm border border-black/15 bg-white/60" />))}
        </div>
      </div>
    );
  }
  if (kind === "landing-modern") {
    return (
      <div className="h-full w-full bg-[#0b0f1a] p-3">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-8 rounded-sm" style={{ background: c }} />
          <div className="flex gap-1.5"><div className={`h-1 w-5 ${bar}`} /><div className={`h-1 w-5 ${bar}`} /><div className={`h-1 w-5 ${bar}`} /></div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-3 w-4/5 rounded-sm bg-white/80" />
            <div className="mt-1.5 h-3 w-3/5 rounded-sm" style={{ background: c }} />
            <div className="mt-2.5 space-y-1"><div className="h-1 w-full rounded-sm bg-white/20" /><div className="h-1 w-2/3 rounded-sm bg-white/20" /></div>
            <div className="mt-3 h-4 w-14 rounded-full" style={{ background: c }} />
          </div>
          <div className="h-16 w-16 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, ${c}, #1e293b)` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (<div key={i} className="h-7 rounded-md border border-white/10 bg-white/[0.05]" />))}
        </div>
      </div>
    );
  }
  if (kind === "crud-modern-new-temp") {
    return (
      <div className="h-full w-full bg-[#0d1424]">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <div className="h-2 w-2 rounded-sm" style={{ background: c }} />
          <div className="h-1.5 w-8 rounded-sm bg-white/60" />
          <div className="ml-2 flex gap-1.5"><div className="h-1.5 w-6 rounded-sm" style={{ background: c }} /><div className={`h-1.5 w-6 ${bar}`} /><div className={`h-1.5 w-6 ${bar}`} /></div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {[0, 1, 2].map((i) => (<div key={i} className="h-8 rounded-md border border-white/10 bg-white/[0.05]" />))}
        </div>
        <div className="mx-3 space-y-1.5 rounded-md border border-white/10 bg-white/[0.03] p-2">
          {[0, 1, 2].map((i) => (<div key={i} className="flex gap-2"><div className="h-1.5 w-1/4 rounded-sm bg-white/30" /><div className="h-1.5 w-1/2 rounded-sm bg-white/15" /></div>))}
        </div>
      </div>
    );
  }
  // default: sidebar admin portal
  return (
    <div className="flex h-full w-full bg-[#0d1424]">
      <div className="w-[30%] space-y-1.5 border-r border-white/10 p-2.5">
        <div className="h-2 w-10 rounded-sm" style={{ background: c }} />
        {[0, 1, 2, 3].map((i) => (<div key={i} className={`h-1.5 rounded-sm ${i === 0 ? "" : bar}`} style={i === 0 ? { background: c } : undefined} />))}
      </div>
      <div className="flex-1 p-3">
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (<div key={i} className="h-8 rounded-md border border-white/10 bg-white/[0.05]" />))}
        </div>
        <div className="mt-2 space-y-1.5 rounded-md border border-white/10 bg-white/[0.03] p-2">
          {[0, 1, 2].map((i) => (<div key={i} className="flex gap-2"><div className="h-1.5 w-1/4 rounded-sm bg-white/30" /><div className="h-1.5 w-1/2 rounded-sm bg-white/15" /></div>))}
        </div>
      </div>
    </div>
  );
}

const HOW = {
  wizard: "You pick modules and fill in a form. It becomes a working portal with a database.",
  ai: "You fill in a form with your details. It becomes a finished website you can deploy.",
};

export default function TemplateGallery() {
  const { type: typeId } = useParams();
  const type = siteTypeById(typeId);
  const navigate = useNavigate();
  const templates = templatesFor(typeId);
  const [modalTemplate, setModalTemplate] = useState(null);

  if (!type) return <Navigate to="/" replace />;
  if (templates.length === 0) return <Navigate to={`/new/${typeId}`} replace />;

  function choose(template) {
    if (template.inputMode === "wizard") navigate(`/portal/new/${template.id}`);
    else setModalTemplate(template);
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 antialiased">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <Link to={`/new/${typeId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Choose a template</h1>
        <p className="mt-2 text-slate-400">Ready-made designs for a {type.name.toLowerCase()}. Pick one, then fill in a form.</p>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {templates.map((t, i) => (
            <motion.li key={t.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <button
                type="button"
                onClick={() => choose(t)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03] text-left transition hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_18px_50px_-24px_rgba(56,189,248,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <div className="aspect-[16/10] w-full overflow-hidden border-b border-white/[0.08]" aria-hidden>
                  <div className="h-full w-full transition duration-500 group-hover:scale-[1.04]">
                    <Preview template={t} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.accent }} aria-hidden />
                    <h2 className="text-base font-semibold text-white">{t.name}</h2>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-400">{t.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{HOW[t.inputMode] || HOW.ai}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-sky-300">
                    Use this template <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>

        <p className="mt-8 flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="h-4 w-4" aria-hidden /> Want something different?{" "}
          <Link to={`/builder?type=${typeId}`} className="text-sky-300 hover:underline">Build with SPARC AI</Link>
        </p>
      </div>

      <AnimatePresence>{modalTemplate && <GenerateModal template={modalTemplate} onClose={() => setModalTemplate(null)} />}</AnimatePresence>
    </main>
  );
}
