import { motion } from "framer-motion";
import { ArrowRight, Blocks, CalendarCheck, Globe, LayoutDashboard, LogOut, ShoppingCart, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { SITE_TYPES } from "./siteTypes";

const ICONS = { LayoutDashboard, UserRound, Globe, ShoppingCart, CalendarCheck };

const steps = [
  ["1", "Pick a kind of website", "Five kinds to choose from."],
  ["2", "Choose how to build it", "Start from a template, or let SPARC AI assemble it."],
  ["3", "Review and go live", "Check the plan, then publish."],
];

function TypeCard({ type }) {
  const Icon = ICONS[type.icon] || LayoutDashboard;
  return (
    <motion.li initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4 }}>
      <Link
        to={`/new/${type.id}`}
        className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/[0.2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${type.accent}22`, color: type.accent }}>
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">{type.name}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{type.tagline}</p>
        <p className="mt-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Good for:</span> {type.goodFor}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {type.includes.map((item) => (
            <li key={item} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-300">
              {item}
            </li>
          ))}
        </ul>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: type.accent }}>
          Choose this
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </span>
      </Link>
    </motion.li>
  );
}

export default function Home() {
  const { logout } = useAuth();
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b14] text-slate-100 antialiased">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[-22rem] h-[40rem] w-[64rem] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,rgba(56,189,248,0.12),transparent)] blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#070b14]/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-b from-sky-400 via-sky-500 to-indigo-600 ring-1 ring-inset ring-white/25">
              <Blocks className="h-[18px] w-[18px] text-white" strokeWidth={2} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">SPARC AI</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link className="rounded-md px-3 py-1.5 transition hover:bg-white/[0.06] hover:text-white" to="/portal/demo-admin">
              Demo portal
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 font-medium text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/[0.08] hover:text-red-300"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-14 text-center sm:pt-20">
        <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
          What kind of website do you want to{" "}
          <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">build</span>?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-slate-400">
          Pick one below. Next you choose how to build it: start from a ready template, or describe it and let SPARC AI assemble it from tested parts.
        </p>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-10" aria-label="Kinds of website">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_TYPES.map((type) => (
            <TypeCard key={type.id} type={type} />
          ))}
        </ul>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20" aria-label="How it works">
        <ol className="grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 md:grid-cols-3">
          {steps.map(([n, title, text]) => (
            <li key={n} className="flex gap-3 rounded-xl p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/[0.08] text-xs font-bold text-sky-300">{n}</span>
              <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-0.5 text-sm text-slate-400">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#05080f]/80">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-sm text-slate-500">© {new Date().getFullYear()} SPARC AI. Websites built from reusable, verified parts.</div>
      </footer>
    </main>
  );
}
