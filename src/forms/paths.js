// Small helpers for editing a nested config with forms. No React in here, so they are easy to test.

/** Read a value by path, e.g. getIn(cfg, "sections.hero.title"). */
export function getIn(obj, path) {
  return String(path)
    .split(".")
    .reduce((o, k) => (o === undefined || o === null ? undefined : o[k]), obj);
}

/** A copy of obj with the value at path set (objects on the way are created). */
export function setIn(obj, path, value) {
  const keys = String(path).split(".");
  const next = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cur = next;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    const child = cur[k];
    cur[k] = Array.isArray(child) ? [...child] : { ...(child && typeof child === "object" ? child : {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return next;
}

/**
 * Drop empty strings, empty lists and empty objects (so a half-filled form never
 * leaves a blank button or an empty item in the website). Numbers and booleans stay.
 */
export function prune(value) {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const p = prune(v);
      if (p !== undefined) out[k] = p;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (typeof value === "string") return value.trim() === "" ? undefined : value;
  if (value === null || value === undefined || (typeof value === "number" && Number.isNaN(value))) return undefined;
  return value;
}

/** prune() for a whole config: it never returns undefined. */
export const cleanConfig = (config) => prune(config) ?? {};

// ---- text <-> list ----
export const csvToList = (text) =>
  String(text ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export const listToCsv = (list) => (Array.isArray(list) ? list.join(", ") : "");
export const linesToList = (text) =>
  String(text ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
export const listToLines = (list) => (Array.isArray(list) ? list.join("\n") : "");

/** Lowercase-with-dashes id from a name ("Assam Breakfast" -> "assam-breakfast"). */
export function slugId(text, fallback = "item") {
  const s = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s || fallback;
}

/** An id that is not in use yet: base, base-2, base-3... */
export function uniqueId(base, taken) {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
