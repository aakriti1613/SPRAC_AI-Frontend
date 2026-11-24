// The home page: the original hero and "how it works" blocks, then the five kinds
// of website to choose from (the template library now opens after you pick a kind).
import { motion } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  CalendarCheck,
  Database,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  Rocket,
  ShoppingCart,
  SlidersHorizontal,
  UserRound,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { SITE_TYPES } from "./siteTypes";

const ICONS = { LayoutDashboard, UserRound, Globe, ShoppingCart, CalendarCheck };

const gridVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } } };
const sectionReveal = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } } };

const howItWorks = [
  { icon: LayoutTemplate, step: "01", title: "Pick a kind of website", text: "Admin portal, portfolio, landing page, online store or booking site." },
  { icon: SlidersHorizontal, step: "02", title: "Fill in or describe", text: "Start from a template, or describe it and let SPARC AI assemble it. Both use simple forms." },
  { icon: Rocket, step: "03", title: "Deploy", text: "Get a live URL and a GitHub repo, and for portals a database, without touching a server." },
];

const heroConfigLines = [
  ["appName", '"Acme Admin"', "text-sky-300"],
  ["industry", '"crm"', "text-sky-300"],
  ["themeColor", '"#2563eb"', "text-sky-300"],
  ["dashboard", "{ enabled: true }", "text-indigo-300"],
  ["modules", "[ Customers, Deals, Tasks ]", "text-indigo-300"],
];

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative hidden min-h-[26rem] lg:block"
      aria-hidden="true"
    >
      <div className="absolute left-0 top-0 w-[68%] rounded-2xl border border-white/[0.08] bg-[#0b1120]/95 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_48px_-12px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-3">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="ml-2 font-mono text-[11px] text-slate-500">portal-config.json</span>
        </div>
        <div className="mt-3 space-y-1.5 font-mono text-[11px] leading-relaxed">
          <p className="text-slate-500">{"{"}</p>
          {heroConfigLines.map(([key, value, color]) => (
            <p key={key} className="pl-4 text-slate-400">
              <span className="text-slate-300">"{key}"</span>
              <span className="text-slate-500">: </span>
              <span className={color}>{value}</span>
              <span className="text-slate-500">,</span>
            </p>
          ))}
          <p className="text-slate-500">{"}"}</p>
        </div>
      </div>

      <div className="absolute left-[52%] top-[46%] flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/30 bg-[#070b14] text-sky-300 shadow-[0_0_24px_-6px_rgba(56,189,248,0.7)]">
        <ArrowRight className="h-4 w-4" />
      </div>

      <div className="absolute bottom-0 right-0 w-[72%] overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950 shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_32px_64px_-16px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          <span className="h-5 w-5 rounded-md bg-sky-500" />
          <span className="h-2 w-16 rounded-full bg-white/20" />
          <span className="ml-auto h-2 w-10 rounded-full bg-white/10" />
        </div>
        <div className="grid grid-cols-[3.5rem_1fr]">
          <div className="space-y-2 border-r border-white/[0.06] p-3">
            <span className="block h-2 w-full rounded-full bg-sky-400/70" />
            <span className="block h-2 w-full rounded-full bg-white/10" />
            <span className="block h-2 w-full rounded-full bg-white/10" />
            <span className="block h-2 w-full rounded-full bg-white/10" />
          </div>
          <div className="space-y-3 p-3">
            <div className="grid grid-cols-3 gap-2">
              {["bg-sky-400/80", "bg-indigo-400/70", "bg-emerald-400/70"].map((color) => (
                <div key={color} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
                  <span className="block h-1.5 w-8 rounded-full bg-white/10" />
                  <span className={`mt-2 block h-2.5 w-12 rounded-full ${color}`} />
                </div>
              ))}
            </div>
            <div className="space-y-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="h-1.5 w-1/3 rounded-full bg-white/15" />
                  <span className="h-1.5 w-1/4 rounded-full bg-white/10" />
                  <span className="ml-auto h-1.5 w-8 rounded-full bg-emerald-400/50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TypeCard({ type }) {
  const Icon = ICONS[type.icon] || LayoutDashboard;
  return (
    <motion.li variants={cardVariants}>
      <Link
        to={`/new/${type.id}`}
        className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_32px_-12px_rgba(0,0,0,0.5)] transition duration-200 hover:-translate-y-1.5 hover:border-white/[0.2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${type.accent}22`, color: type.accent }}>
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{type.name}</h3>
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_90%_55%_at_50%_0%,black_35%,transparent_100%)]" />
        <div className="absolute left-1/2 top-[-22rem] h-[44rem] w-[72rem] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,rgba(56,189,248,0.14),transparent)] blur-3xl" />
        <div className="absolute -right-48 top-48 h-[30rem] w-[30rem] rounded-full bg-indigo-500/[0.07] blur-[140px]" />
        <div className="absolute -left-48 top-[36rem] h-[26rem] w-[26rem] rounded-full bg-sky-500/[0.05] blur-[140px]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#070b14]/65 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#070b14]/55">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5 sm:px-10">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-b from-sky-400 via-sky-500 to-indigo-600 shadow-[0_0_20px_-4px_rgba(56,189,248,0.6),0_1px_2px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/25 transition-shadow duration-300 group-hover:shadow-[0_0_28px_-4px_rgba(56,189,248,0.85),0_1px_2px_rgba(0,0,0,0.4)]">
              <Blocks className="h-[18px] w-[18px] text-white" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">SPARC AI</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm text-slate-400 sm:gap-2">
            <a className="hidden rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white sm:block" href="#types">
              Website types
            </a>
            <Link className="hidden rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white sm:block" to="/portal/demo-admin">
              Demo portal
            </Link>
            <a
              href="#types"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-8px_rgba(255,255,255,0.3)] transition-all duration-200 hover:bg-slate-100 active:scale-[0.98]"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={logout}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-red-400/30 hover:bg-red-500/[0.08] hover:text-red-300 active:scale-[0.98]"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-8 pt-16 sm:px-10 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }} className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/[0.08] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-200 shadow-[0_0_24px_-8px_rgba(56,189,248,0.5)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
              </span>
              Website Builder
            </span>

            <h1 className="mt-7 text-balance text-5xl font-bold leading-[1.03] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]">
              What do you want to{" "}
              <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent [text-shadow:0_0_48px_rgba(56,189,248,0.25)]">build</span>?
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
              Build portals, portfolios, landing pages, online stores and booking sites from reusable configuration. Pick a kind, fill in a few forms or describe what you need, and deploy.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href="#types"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-indigo-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(129,140,248,0.45),0_8px_24px_-8px_rgba(99,102,241,0.55)] transition-all duration-200 hover:from-indigo-300 hover:to-indigo-400 active:scale-[0.98]"
              >
                Choose a website type
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/portal/demo-admin"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.07] hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4 text-sky-300" />
                Open demo portal
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              {[
                { icon: LayoutTemplate, label: `${SITE_TYPES.length} kinds of website` },
                { icon: Zap, label: "Config-driven" },
                { icon: Database, label: "Database ready" },
              ].map(({ icon: BadgeIcon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-slate-300 backdrop-blur-sm transition-colors duration-200 hover:border-white/[0.16] hover:text-white">
                  <BadgeIcon className="h-3.5 w-3.5 text-sky-300" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <HeroPreview />
        </div>
      </section>

      {/* how it works */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 sm:px-10 sm:pt-24">
        <motion.ol variants={gridVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2 md:grid-cols-3">
          {howItWorks.map(({ icon: StepIcon, step, title, text }) => (
            <motion.li key={step} variants={cardVariants} className="flex gap-4 rounded-xl p-4 transition-colors duration-200 hover:bg-white/[0.03] sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/[0.08] text-sky-300">
                <StepIcon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Step {step}</p>
                <h3 className="mt-1 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* the five kinds of website */}
      <section id="types" className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-6 pb-24 pt-20 sm:px-10" aria-labelledby="types-title">
        <motion.div variants={sectionReveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
          <div className="mb-8">
            <div className="mb-3 h-px w-12 bg-gradient-to-r from-sky-400 to-transparent" />
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="types-title" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Pick a kind of website
              </h2>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-400">{SITE_TYPES.length} kinds</span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">Next you choose how to build it: from a template, or with SPARC AI.</p>
          </div>
          <motion.ul variants={gridVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {SITE_TYPES.map((type) => (
              <TypeCard key={type.id} type={type} />
            ))}
          </motion.ul>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#05080f]/80 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
        <div className="mx-auto w-full max-w-7xl px-6 py-14 sm:px-10">
          <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
            <div className="max-w-sm">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-b from-sky-400 via-sky-500 to-indigo-600 shadow-[0_0_20px_-4px_rgba(56,189,248,0.6),0_1px_2px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/25">
                  <Blocks className="h-[18px] w-[18px] text-white" strokeWidth={2} />
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-white">SPARC AI</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">Build websites from reusable, tested parts. Portals, portfolios, landing pages, online stores and booking sites.</p>
              <div className="mt-6 flex items-center gap-2.5">
                <a href="mailto:hello@myplatform.dev" aria-label="Email" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Build</h3>
              <ul className="mt-5 space-y-3.5 text-sm text-slate-400">
                {SITE_TYPES.map((t) => (
                  <li key={t.id}>
                    <Link className="transition-colors duration-200 hover:text-white" to={`/new/${t.id}`}>
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Explore</h3>
              <ul className="mt-5 space-y-3.5 text-sm text-slate-400">
                <li>
                  <Link className="transition-colors duration-200 hover:text-white" to="/portal/demo-admin">
                    Demo portal
                  </Link>
                </li>
                <li>
                  <a className="transition-colors duration-200 hover:text-white" href="#types">
                    Get started
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/[0.06] pt-6 text-sm text-slate-500">© {new Date().getFullYear()} SPARC AI. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
