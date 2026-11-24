// The builder's state as plain, testable functions (no React, no network).
//
// `signals` are the user's choices: website type, industry, style, brand, modules,
// optional rooms on/off. Every edit changes the signals; the server then rebuilds
// the config from them, so the screen never invents a config itself.

export const STEPS = ["describe", "plan", "result"];

export const initialState = {
  step: "describe",
  description: "",
  chosenType: null, // website type picked on the home screen (null = let the planner decide)
  nameChoice: "", // optional name typed before planning
  industryChoice: "auto", // "auto" lets the planner decide, otherwise an industry id
  colorChoice: "", // optional brand colour (#rrggbb)
  styleChoice: "auto", // "auto" lets the planner decide, otherwise a style level id
  manual: false, // true after the config was edited by hand (form or JSON)
  details: null, // the content the user edited by hand (sections, store, booking...), kept when choices change
  plan: null, // { engine, questions, reuse, fallbackReason }
  signals: null,
  config: null,
  errors: [],
  composition: null,
  lock: null,
  projectName: "",
  buildResult: null,
  repo: null,
  deployment: null,
  busy: null, // "planning" | "rebuilding" | "building" | "pushing" | "deploying"
  error: "",
};

/** A short URL-safe name for the generated project. */
export function slugify(text, fallback = "my-site") {
  const s = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s || fallback;
}

/** Style levels a website type allows (from the server's options). */
export function allowedStyles(options, websiteType) {
  return options?.websiteTypes?.find((w) => w.id === websiteType)?.styleLevels || ["basic", "good"];
}

/** Keep a style level inside what the website type allows (portals stop at Amazing). */
export function clampStyle(options, websiteType, level) {
  const allowed = allowedStyles(options, websiteType);
  if (allowed.includes(level)) return level;
  return allowed[allowed.length - 1];
}

/** First few modules of an industry, to seed a portal that has none. */
export function homeModules(options, industry, count = 3) {
  const mods = options?.modules || [];
  const home = mods.filter((m) => m.industries[0] === industry).map((m) => m.id);
  const fallback = mods.filter((m) => m.industries.includes("generic")).map((m) => m.id);
  return [...new Set([...home, ...fallback])].slice(0, count);
}

/** Friendly names for the kinds of website (the server's own names are longer). */
export const TYPE_NAMES = { "admin-portal": "Admin portal", portfolio: "Portfolio", landing: "Landing page", ecommerce: "Online store", booking: "Booking site" };
export const typeName = (options, id) => TYPE_NAMES[id] || options?.websiteTypes?.find((w) => w.id === id)?.name || id;

/** Friendly names for the industries (the ids are what the server uses). */
export const INDUSTRY_LABELS = {
  generic: "General business",
  healthcare: "Healthcare",
  crm: "Sales and customers (CRM)",
  hrms: "HR and staff",
  school: "School and education",
  inventory: "Inventory and shop stock",
  erp: "Finance and purchasing",
};
export const industryLabel = (id) => INDUSTRY_LABELS[id] || id;

/** Industries a website type can use (portfolios have none). */
export function industriesFor(options, websiteType) {
  return options?.websiteTypes?.find((w) => w.id === websiteType)?.industries || [];
}

/** Example descriptions to click, per website type (empty type = a mix). */
export const EXAMPLES = {
  "admin-portal": ["A clinic website to manage patients and appointments", "A school portal for students, fees and exam results", "A small shop back office for products, orders and suppliers"],
  portfolio: ["A personal portfolio for a frontend developer with projects and skills", "A photographer portfolio with a gallery and a contact form"],
  landing: ["A one-page landing site for my coaching institute", "A landing page for a dental clinic with services and pricing"],
  ecommerce: ["An online store to sell handmade candles with a cart and checkout", "A shop for organic spices with a shopping cart and payment"],
  booking: ["Let patients book appointments online for my dental clinic", "A salon with online booking and time slots"],
};
export const examplesFor = (type) => EXAMPLES[type] || Object.values(EXAMPLES).map((list) => list[0]);

// ---- edits (each returns NEW signals) ----

export function setBrand(signals, brandName) {
  return { ...signals, brandName };
}

export function setIndustry(signals, industry) {
  return { ...signals, industry };
}

/**
 * Change the industry of a portal. Modules from another industry are dropped (a clinic
 * keeps no trading modules), and a portal left with none gets the industry's usual ones.
 */
export function setIndustryAndModules(options, signals, industry) {
  if (industry === signals.industry) return signals;
  if (signals.websiteType !== "admin-portal") return { ...signals, industry };
  const keep = signals.moduleIds.filter((id) => (options?.modules || []).find((m) => m.id === id)?.industries.includes(industry));
  return { ...signals, industry, moduleIds: keep.length ? keep : homeModules(options, industry) };
}

/** An optional brand colour, #rrggbb only (anything else is ignored). */
export function setThemeColor(signals, hex) {
  const ok = /^#[0-9a-f]{6}$/i.test(hex || "");
  const next = { ...signals };
  if (ok) next.themeColor = hex.toLowerCase();
  else delete next.themeColor;
  return next;
}

/** Apply what the user chose before planning on top of what the planner decided. */
export function applyChoices(options, signals, { chosenType, nameChoice, industryChoice, colorChoice } = {}) {
  let s = signals;
  if (chosenType && s.websiteType !== chosenType) s = setWebsiteType(options, s, chosenType);
  if (nameChoice && nameChoice.trim()) s = setBrand(s, nameChoice.trim().slice(0, 60));
  if (industryChoice && industryChoice !== "auto" && industriesFor(options, s.websiteType).includes(industryChoice)) s = setIndustryAndModules(options, s, industryChoice);
  if (colorChoice) s = setThemeColor(s, colorChoice);
  return s;
}

export function setStyle(options, signals, level) {
  return { ...signals, styleLevel: clampStyle(options, signals.websiteType, level) };
}

export function setWebsiteType(options, signals, websiteType) {
  if (websiteType === signals.websiteType) return signals;
  return {
    ...signals,
    websiteType,
    styleLevel: clampStyle(options, websiteType, signals.styleLevel),
    // Modules only belong to portals; a portal with none gets the industry's usual ones.
    moduleIds: websiteType === "admin-portal" ? (signals.moduleIds.length ? signals.moduleIds : homeModules(options, signals.industry)) : [],
    enabledOptional: [],
    disabledOptional: [],
  };
}

/** Is this optional room on right now? (Read from the real config, which includes the defaults.) */
export function roomIsOn(config, roomId) {
  return Boolean(config?.rooms?.enabled?.includes(roomId));
}

export function toggleRoom(signals, config, roomId) {
  const on = roomIsOn(config, roomId);
  const enabled = new Set(signals.enabledOptional || []);
  const disabled = new Set(signals.disabledOptional || []);
  if (on) {
    enabled.delete(roomId);
    disabled.add(roomId);
  } else {
    disabled.delete(roomId);
    enabled.add(roomId);
  }
  return { ...signals, enabledOptional: [...enabled], disabledOptional: [...disabled] };
}

export function removeModule(signals, moduleId) {
  return { ...signals, moduleIds: signals.moduleIds.filter((id) => id !== moduleId) };
}

export function addModule(signals, moduleId) {
  if (signals.moduleIds.includes(moduleId)) return signals;
  return { ...signals, moduleIds: [...signals.moduleIds, moduleId] };
}

/**
 * Modules the user can still add. Only modules that belong to the chosen industry are
 * offered (a clinic is never shown trading modules). With includeGeneral, the modules whose main
 * industry is "general" (tasks, documents, projects...) are offered too. A module only tagged
 * "generic" as a second industry (products, orders, invoices...) still belongs to its own industry.
 */
export function relevantModules(options, signals, { includeGeneral = false } = {}) {
  if (signals.websiteType !== "admin-portal") return [];
  const chosen = new Set(signals.moduleIds);
  const industry = signals.industry;
  return (options?.modules || [])
    .filter((m) => !chosen.has(m.id))
    .filter((m) => m.industries.includes(industry) || (includeGeneral && m.industries[0] === "generic"))
    .sort((a, b) => Number(b.industries.includes(industry)) - Number(a.industries.includes(industry)) || a.pluralName.localeCompare(b.pluralName));
}

/** Kept for older callers: the strict list. */
export const addableModules = (options, signals) => relevantModules(options, signals);

// ---- summaries for the screen ----

/** Rooms of the composition grouped for display: [{ room, level, slug }] in a stable order. */
export function pickedRooms(composition) {
  return Object.entries(composition?.picks || {})
    .map(([room, p]) => ({ room, level: p.level, slug: p.slug, name: p.label?.name || p.slug }))
    .sort((a, b) => a.room.localeCompare(b.room));
}

/** Plain-English one-liner of what will be built. */
export function summarize(config) {
  if (!config) return "";
  const style = config.styleLevel;
  if (config.websiteType === "admin-portal") {
    const n = config.modules?.length || 0;
    return `${style} admin portal with ${n} ${n === 1 ? "module" : "modules"}: ${(config.modules || []).map((m) => m.pluralName).join(", ")}`;
  }
  const sections = Object.keys(config.sections || {}).length;
  return `${style} ${(TYPE_NAMES[config.websiteType] || config.websiteType).toLowerCase()} with ${sections} sections`;
}

export function canBuild(state) {
  return Boolean(state.config) && state.errors.length === 0 && !state.busy;
}

/** The parts of a config a person edits by hand (the rest is rebuilt from the choices). */
export function pickDetails(config) {
  const out = {};
  for (const k of ["sections", "store", "booking", "nav", "footer", "meta", "notFound"]) if (config?.[k] !== undefined) out[k] = config[k];
  return out;
}

/**
 * Put the user's hand-edited content back on top of a config rebuilt from the choices.
 * Sections that are no longer on the page are dropped; sections that are new keep the starter text.
 */
export function mergeDetails(config, details) {
  if (!details) return config;
  const next = { ...config };
  for (const k of ["store", "booking"]) if (details[k] !== undefined && config[k] !== undefined) next[k] = details[k];
  for (const k of ["nav", "footer", "meta", "notFound"]) if (details[k] !== undefined) next[k] = details[k];
  if (details.sections && config.sections) {
    next.sections = { ...config.sections };
    for (const room of Object.keys(config.sections)) if (room in details.sections) next.sections[room] = details.sections[room];
  }
  return next;
}

// ---- reducer ----

export function reduce(state, action) {
  switch (action.type) {
    case "description":
      return { ...state, description: action.value };
    case "styleChoice":
      return { ...state, styleChoice: action.value };
    case "choice": // { key: "nameChoice" | "industryChoice" | "colorChoice", value }
      return ["nameChoice", "industryChoice", "colorChoice"].includes(action.key) ? { ...state, [action.key]: action.value } : state;
    case "busy":
      return { ...state, busy: action.value, error: action.value ? "" : state.error };
    case "error":
      return { ...state, busy: null, error: action.message };
    case "planned": {
      const { plan } = action;
      return {
        ...state,
        step: "plan",
        busy: null,
        error: "",
        plan: { engine: plan.engine, questions: plan.questions || [], reuse: plan.reuse, fallbackReason: plan.fallbackReason, repaired: plan.repaired },
        signals: { ...plan.signals, disabledOptional: [] },
        config: plan.config,
        errors: plan.errors || [],
        composition: null,
        lock: null,
        details: null,
        manual: false,
        projectName: slugify(plan.signals.brandName?.startsWith("Your") ? state.description.split(/\s+/).slice(0, 3).join(" ") : plan.signals.brandName),
        buildResult: null,
        repo: null,
        deployment: null,
      };
    }
    case "edited":
      // The user changed a choice: keep it, drop anything built from the old one.
      return { ...state, signals: action.signals, buildResult: null, repo: null, deployment: null };
    case "manualApplied": // the config was edited by hand (form or JSON) and accepted
      return { ...state, busy: null, error: "", manual: true, details: pickDetails(action.config), config: action.config, errors: [], composition: action.composition, lock: action.lock, buildResult: null, repo: null, deployment: null };
    case "refreshed":
      return { ...state, busy: null, error: "", config: action.config, errors: action.errors || [], composition: action.composition, lock: action.lock };
    case "projectName":
      return { ...state, projectName: slugify(action.value, "") };
    case "built":
      return { ...state, busy: null, error: "", step: "result", buildResult: action.result };
    case "pushed":
      return { ...state, busy: null, error: "", repo: action.repo };
    case "deployed":
      return { ...state, busy: null, error: "", deployment: action.deployment };
    case "goto":
      return { ...state, step: action.step, error: "" };
    case "restart":
      return { ...initialState, chosenType: state.chosenType };
    default:
      return state;
  }
}
