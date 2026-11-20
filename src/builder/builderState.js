// The builder's state as plain, testable functions (no React, no network).
//
// `signals` are the user's choices: website type, industry, style, brand, modules,
// optional rooms on/off. Every edit changes the signals; the server then rebuilds
// the config from them, so the screen never invents a config itself.

export const STEPS = ["describe", "plan", "result"];

export const initialState = {
  step: "describe",
  description: "",
  styleChoice: "auto", // "auto" lets the planner decide, otherwise a style level id
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

// ---- edits (each returns NEW signals) ----

export function setBrand(signals, brandName) {
  return { ...signals, brandName };
}

export function setIndustry(signals, industry) {
  return { ...signals, industry };
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

/** Modules the user could still add (library minus those already chosen), home-industry first. */
export function addableModules(options, signals) {
  const chosen = new Set(signals.moduleIds);
  const industry = signals.industry;
  return (options?.modules || [])
    .filter((m) => !chosen.has(m.id))
    .sort((a, b) => Number(b.industries.includes(industry)) - Number(a.industries.includes(industry)) || a.pluralName.localeCompare(b.pluralName));
}

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
  return `${style} ${config.websiteType} site with ${sections} sections`;
}

export function canBuild(state) {
  return Boolean(state.config) && state.errors.length === 0 && !state.busy;
}

// ---- reducer ----

export function reduce(state, action) {
  switch (action.type) {
    case "description":
      return { ...state, description: action.value };
    case "styleChoice":
      return { ...state, styleChoice: action.value };
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
        projectName: slugify(plan.signals.brandName?.startsWith("Your") ? state.description.split(/\s+/).slice(0, 3).join(" ") : plan.signals.brandName),
        buildResult: null,
        repo: null,
        deployment: null,
      };
    }
    case "edited":
      // The user changed a choice: keep it, drop anything built from the old one.
      return { ...state, signals: action.signals, buildResult: null, repo: null, deployment: null };
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
      return { ...initialState };
    default:
      return state;
  }
}
