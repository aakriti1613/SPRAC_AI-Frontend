// The form for the portfolio templates (their content.json). The form works on a
// "model" where the skill groups are a list; toContent() turns it back into the
// shape the template expects (skills as an object, numbered projects, full links).
import { cleanConfig } from "./paths";

const SOCIAL = ["email", "phone", "github", "linkedin", "twitter", "instagram", "website", "other"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const f = (path, label, type = "text", extra = {}) => ({ path, label, type, half: !["textarea", "lines"].includes(type), ...extra });

export const CONTENT_FORM = [
  {
    id: "you",
    title: "About you",
    hint: "Your name and the first lines visitors read.",
    fields: [
      f("siteName", "Site name", "text", { placeholder: "e.g. Priya Sharma" }),
      f("profile.fullName", "Full name"),
      f("profile.firstName", "First name"),
      f("profile.role", "What you do", "text", { placeholder: "e.g. Frontend Developer" }),
      f("profile.currentTitle", "Current job title"),
      f("profile.company", "Company"),
      f("profile.period", "Since when", "text", { placeholder: "2022 to now" }),
      f("profile.location", "City"),
      f("profile.email", "Email", "text"),
      f("profile.phone", "Phone"),
      f("profile.heroHeadline", "Headline", "text", { half: false, help: "A short line, up to about 7 words." }),
      f("profile.heroSummary", "Short introduction", "textarea"),
      f("profile.availability", "Availability", "text", { half: false, placeholder: "e.g. Open to new roles" }),
      f("meta.title", "Page title (browser tab)"),
      f("meta.description", "Description for search engines", "textarea"),
    ],
  },
  {
    id: "education",
    title: "Education",
    fields: [f("education.degree", "Degree"), f("education.school", "School"), f("education.period", "When"), f("education.cgpa", "Grade"), f("education.summary", "One-line summary", "text", { half: false })],
  },
  {
    id: "stats",
    title: "Numbers about you",
    hint: "Short facts shown as big numbers.",
    lists: [{ path: "stats", label: "Numbers", itemLabel: "Number", titleKey: "label", newItem: () => ({ value: "", label: "" }), fields: [f("value", "Number", "text", { placeholder: "e.g. 4+" }), f("label", "What it counts", "text", { placeholder: "Years of experience" })] }],
  },
  {
    id: "skills",
    title: "Skills",
    lists: [{ path: "skillGroups", label: "Skill groups", itemLabel: "Group", titleKey: "name", newItem: () => ({ name: "", items: [] }), fields: [f("name", "Group name", "text", { placeholder: "e.g. Frontend" }), f("items", "Skills (comma separated)", "csv", { placeholder: "React, CSS" })] }],
    fields: [f("supportingSkills", "Other skills (comma separated)", "csv", { half: false })],
  },
  {
    id: "projects",
    title: "Projects",
    lists: [
      {
        path: "projects",
        label: "Projects",
        itemLabel: "Project",
        titleKey: "title",
        newItem: () => ({ title: "", description: "" }),
        fields: [f("title", "Name"), f("type", "Kind", "text", { placeholder: "e.g. Web app" }), f("description", "What it is", "textarea"), f("tech", "Built with (comma separated)", "csv"), f("metrics", "Key facts (comma separated)", "csv"), f("features", "What you did (one per line)", "lines"), f("note", "Short note"), f("featured", "Show first", "toggle")],
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    lists: [{ path: "experience", label: "Jobs", itemLabel: "Job", titleKey: "title", newItem: () => ({ title: "", company: "", period: "" }), fields: [f("title", "Role"), f("company", "Company"), f("period", "When"), f("location", "Where"), f("description", "Summary", "textarea"), f("bullets", "Highlights (one per line)", "lines"), f("skills", "Skills used (comma separated)", "csv")] }],
  },
  {
    id: "services",
    title: "What you offer",
    lists: [{ path: "services", label: "Services", itemLabel: "Service", titleKey: "title", newItem: () => ({ title: "", description: "" }), fields: [f("title", "Name"), f("icon", "Icon", "text", { help: "Optional, e.g. monitor or code." }), f("description", "Description", "textarea")] }],
  },
  {
    id: "contact",
    title: "Ways to reach you",
    lists: [{ path: "contactLinks", label: "Links", itemLabel: "Link", titleKey: "label", newItem: () => ({ type: "email", label: "Email", value: "" }), fields: [{ path: "type", label: "Kind", type: "select", options: SOCIAL, half: true }, f("label", "Shown as"), f("value", "Address or username"), f("href", "Link (optional)", "text", { help: "Filled in for you when left empty." })] }],
    fields: [f("footerCopyright", "Footer line", "text", { half: false })],
  },
];

/** A blank model for a new site. */
export const emptyContentModel = () => ({ siteName: "", profile: {}, meta: {}, education: {}, stats: [], skillGroups: [], supportingSkills: [], projects: [], experience: [], services: [], contactLinks: [] });

/** content.json (or a validated config) -> the form model. */
export function toModel(content) {
  const { skills, ...rest } = content || {};
  return { ...emptyContentModel(), ...rest, skillGroups: Object.entries(skills || {}).map(([name, items]) => ({ name, items })) };
}

const linkFor = (l) => {
  if (l.href) return l.href;
  const v = String(l.value || "").trim();
  if (!v) return undefined;
  if (l.type === "email") return `mailto:${v}`;
  if (l.type === "phone") return `tel:${v.replace(/\s+/g, "")}`;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

/** The form model -> content for the template: tidy, numbered projects, skills as an object. */
export function toContent(model) {
  const { skillGroups, ...rest } = model;
  const skills = {};
  (skillGroups || []).forEach((g, i) => {
    const name = (g.name || "").trim() || `Group ${i + 1}`;
    let key = name;
    for (let n = 2; skills[key]; n += 1) key = `${name} ${n}`;
    if (g.items?.length) skills[key] = g.items;
  });
  const next = {
    ...rest,
    skills,
    projects: (rest.projects || []).map((p, i) => ({ ...p, id: p.id ?? i + 1 })),
    contactLinks: (rest.contactLinks || []).map((l) => ({ ...l, href: linkFor(l) })),
  };
  return cleanConfig(next);
}
