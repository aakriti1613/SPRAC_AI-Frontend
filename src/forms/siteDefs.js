// What to ask for each kind of website made with SPARC AI. Each section edits one
// part of the site config (the same part the website's room shows), and only the
// sections that are on the page are asked for.
import { cleanConfig, slugId, uniqueId } from "./paths";

const SOCIAL = ["email", "phone", "github", "linkedin", "twitter", "instagram", "website", "other"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const has = (room) => (cfg) => Boolean(cfg?.sections && cfg.sections[room]);
const f = (path, label, type = "text", extra = {}) => ({ path, label, type, half: !["textarea", "lines"].includes(type), ...extra });
const cta = (base, name) => [f(`${base}.label`, `${name} text`, "text", { placeholder: "e.g. Get in touch" }), f(`${base}.href`, `${name} link`, "text", { placeholder: "e.g. #contact or https://..." })];

const ROOMS = {
  hero: {
    id: "hero",
    title: "Top of the page (hero)",
    hint: "The first thing visitors see.",
    when: has("hero"),
    fields: [
      f("sections.hero.title", "Main headline", "text", { half: false, placeholder: "A short, clear promise" }),
      f("sections.hero.highlight", "Word to highlight", "text", { help: "Must appear in the headline." }),
      f("sections.hero.eyebrow", "Small label above", "text"),
      f("sections.hero.subtitle", "Supporting text", "textarea"),
      ...cta("sections.hero.primaryCta", "Main button"),
      ...cta("sections.hero.secondaryCta", "Second button"),
    ],
  },
  about: {
    id: "about",
    title: "About",
    when: has("about"),
    fields: [f("sections.about.heading", "Heading"), f("sections.about.body", "Text", "textarea", { rows: 5 })],
    lists: [{ path: "sections.about.highlights", label: "Highlights", itemLabel: "Highlight", titleKey: "label", newItem: () => ({ value: "", label: "" }), fields: [f("value", "Number or word", "text", { placeholder: "e.g. 10+" }), f("label", "What it means", "text", { placeholder: "e.g. Years of experience" })] }],
  },
  projects: {
    id: "projects",
    title: "Projects",
    when: has("projects"),
    fields: [f("sections.projects.heading", "Heading")],
    lists: [
      {
        path: "sections.projects.items",
        label: "Projects",
        itemLabel: "Project",
        titleKey: "title",
        newItem: () => ({ title: "", description: "" }),
        fields: [f("title", "Name"), f("tags", "Tags (comma separated)", "csv", { placeholder: "React, Node" }), f("description", "What it is", "textarea"), f("href", "Live link", "url"), f("repoHref", "Code link", "url"), f("image", "Image link", "url"), f("featured", "Highlight this project", "toggle")],
      },
    ],
  },
  skills: {
    id: "skills",
    title: "Skills",
    when: has("skills"),
    fields: [f("sections.skills.heading", "Heading")],
    lists: [{ path: "sections.skills.groups", label: "Skill groups", itemLabel: "Group", titleKey: "name", newItem: () => ({ name: "", items: [] }), fields: [f("name", "Group name", "text", { placeholder: "e.g. Frontend" }), f("items", "Skills (comma separated)", "csv", { placeholder: "React, CSS, TypeScript" })] }],
  },
  experience: {
    id: "experience",
    title: "Experience",
    when: has("experience"),
    fields: [f("sections.experience.heading", "Heading")],
    lists: [{ path: "sections.experience.items", label: "Jobs", itemLabel: "Job", titleKey: "title", newItem: () => ({ title: "", organization: "", period: "" }), fields: [f("title", "Role"), f("organization", "Company"), f("period", "When", "text", { placeholder: "2022 to now" }), f("location", "Where"), f("description", "Summary", "textarea"), f("bullets", "Highlights (one per line)", "lines")] }],
  },
  education: {
    id: "education",
    title: "Education",
    when: has("education"),
    fields: [f("sections.education.heading", "Heading")],
    lists: [{ path: "sections.education.items", label: "Education", itemLabel: "Course", titleKey: "title", newItem: () => ({ title: "", organization: "", period: "" }), fields: [f("title", "Degree or course"), f("organization", "School"), f("period", "When"), f("location", "Where"), f("description", "Notes", "textarea")] }],
  },
  services: {
    id: "services",
    title: "Services",
    when: has("services"),
    fields: [f("sections.services.heading", "Heading"), f("sections.services.subtitle", "Short intro")],
    lists: [{ path: "sections.services.items", label: "Services", itemLabel: "Service", titleKey: "title", newItem: () => ({ title: "", description: "" }), fields: [f("title", "Name"), f("icon", "Icon name", "text", { help: "Optional, e.g. Sparkles or Code." }), f("description", "Description", "textarea")] }],
  },
  stats: {
    id: "stats",
    title: "Numbers",
    when: has("stats"),
    lists: [{ path: "sections.stats.items", label: "Numbers", itemLabel: "Number", titleKey: "label", newItem: () => ({ value: "", label: "" }), fields: [f("value", "Number", "text", { placeholder: "e.g. 100+" }), f("label", "What it counts", "text", { placeholder: "e.g. Happy clients" })] }],
  },
  testimonials: {
    id: "testimonials",
    title: "Reviews",
    when: has("testimonials"),
    fields: [f("sections.testimonials.heading", "Heading")],
    lists: [{ path: "sections.testimonials.items", label: "Reviews", itemLabel: "Review", titleKey: "author", newItem: () => ({ quote: "", author: "" }), fields: [f("quote", "What they said", "textarea"), f("author", "Who said it"), f("role", "Their role")] }],
  },
  pricing: {
    id: "pricing",
    title: "Pricing",
    when: has("pricing"),
    fields: [f("sections.pricing.heading", "Heading"), f("sections.pricing.subtitle", "Short intro")],
    lists: [{ path: "sections.pricing.plans", label: "Plans", itemLabel: "Plan", titleKey: "name", newItem: () => ({ name: "", price: "", features: [], cta: { label: "Choose", href: "#contact-form" } }), fields: [f("name", "Plan name"), f("price", "Price", "text", { placeholder: "e.g. 999" }), f("period", "Per", "text", { placeholder: "month" }), f("highlighted", "Recommended plan", "toggle"), f("features", "What is included (one per line)", "lines"), ...cta("cta", "Button")] }],
  },
  faq: {
    id: "faq",
    title: "Questions and answers",
    when: has("faq"),
    fields: [f("sections.faq.heading", "Heading")],
    lists: [{ path: "sections.faq.items", label: "Questions", itemLabel: "Question", titleKey: "question", newItem: () => ({ question: "", answer: "" }), fields: [f("question", "Question"), f("answer", "Answer", "textarea")] }],
  },
  team: {
    id: "team",
    title: "Team",
    when: has("team"),
    fields: [f("sections.team.heading", "Heading")],
    lists: [{ path: "sections.team.members", label: "People", itemLabel: "Person", titleKey: "name", newItem: () => ({ name: "", role: "" }), fields: [f("name", "Name"), f("role", "Role"), f("photo", "Photo link", "url")] }],
  },
  gallery: {
    id: "gallery",
    title: "Gallery",
    when: has("gallery"),
    fields: [f("sections.gallery.heading", "Heading")],
    lists: [{ path: "sections.gallery.images", label: "Pictures", itemLabel: "Picture", titleKey: "alt", newItem: () => ({ src: "", alt: "" }), fields: [f("src", "Picture link", "url"), f("alt", "Describe it", "text", { help: "Read aloud for people who cannot see it." }), f("caption", "Caption")] }],
  },
  "location-map": {
    id: "location-map",
    title: "Where to find you",
    when: has("location-map"),
    fields: [f("sections.location-map.heading", "Heading"), f("sections.location-map.address", "Address", "textarea"), f("sections.location-map.hours", "Opening hours (one per line)", "lines")],
  },
  "cta-banner": {
    id: "cta-banner",
    title: "Call-to-action banner",
    when: has("cta-banner"),
    fields: [f("sections.cta-banner.title", "Headline", "text", { half: false }), f("sections.cta-banner.subtitle", "Supporting text"), ...cta("sections.cta-banner.cta", "Button")],
  },
  contact: {
    id: "contact",
    title: "Contact",
    when: has("contact"),
    fields: [f("sections.contact.heading", "Heading"), f("sections.contact.text", "Short text"), f("sections.contact.availability", "Availability", "text", { placeholder: "e.g. Open to new projects" })],
    lists: [{ path: "sections.contact.links", label: "Ways to reach you", itemLabel: "Link", titleKey: "label", newItem: () => ({ type: "email", label: "", href: "" }), fields: [{ path: "type", label: "Kind", type: "select", options: SOCIAL, half: true }, f("label", "Shown as", "text", { placeholder: "e.g. hello@example.com" }), f("href", "Link", "text", { placeholder: "mailto:... or https://..." })] }],
  },
  "resume-download": {
    id: "resume-download",
    title: "Resume download",
    when: has("resume-download"),
    fields: [f("sections.resume-download.label", "Button text"), f("sections.resume-download.href", "File link", "url"), f("sections.resume-download.note", "Note")],
  },
  "contact-form": {
    id: "contact-form",
    title: "Message form",
    when: has("contact-form"),
    fields: [f("sections.contact-form.heading", "Heading"), f("sections.contact-form.text", "Short text")],
  },
  newsletter: {
    id: "newsletter",
    title: "Email sign-up",
    when: has("newsletter"),
    fields: [f("sections.newsletter.heading", "Heading"), f("sections.newsletter.text", "Short text")],
  },

  // ---- online store ----
  store: {
    id: "store",
    title: "Store settings",
    hint: "Money and payment.",
    when: (cfg) => cfg?.websiteType === "ecommerce",
    fields: [
      f("store.currency", "Currency", "text", { placeholder: "INR", help: "3 letters, like INR or USD." }),
      f("store.payment.mode", "Payment", "select", { options: [{ value: "test", label: "Practice mode (no real money)" }, { value: "razorpay", label: "Razorpay (needs your server)" }, { value: "stripe", label: "Stripe (needs your server)" }] }),
      f("store.payment.endpoint", "Payment server link", "url", { help: "Only for Razorpay or Stripe. See docs/PAYMENTS.md." }),
    ],
  },
  products: {
    id: "products",
    title: "Products",
    hint: "What you sell.",
    when: has("product-list"),
    fields: [f("sections.product-list.heading", "Heading"), f("sections.product-list.subtitle", "Short intro")],
    lists: [
      {
        path: "sections.product-list.products",
        label: "Products",
        itemLabel: "Product",
        titleKey: "name",
        newItem: () => ({ name: "", description: "", price: undefined }),
        fields: [f("name", "Name"), f("price", "Price", "number"), f("compareAtPrice", "Old price (shown crossed out)", "number"), f("category", "Category"), f("badge", "Small label", "text", { placeholder: "e.g. New" }), f("image", "Picture link", "url"), f("description", "Description", "textarea"), f("inStock", "In stock", "toggle", { defaultOn: true })],
      },
    ],
  },

  // ---- booking site ----
  services_booking: {
    id: "booking-services",
    title: "What people can book",
    hint: "Services and how long each takes.",
    when: (cfg) => cfg?.websiteType === "booking",
    fields: [f("booking.currency", "Currency", "text", { placeholder: "INR" })],
    lists: [{ path: "booking.services", label: "Services", itemLabel: "Service", titleKey: "name", newItem: () => ({ name: "", durationMin: 30 }), fields: [f("name", "Name"), f("durationMin", "Minutes it takes", "number"), f("price", "Price (empty = free)", "number"), f("description", "Description", "textarea")] }],
  },
  hours: {
    id: "hours",
    title: "Opening hours",
    hint: "When people can book.",
    when: (cfg) => cfg?.websiteType === "booking",
    fields: [
      f("booking.availability.days", "Open days", "weekdays", { half: false }),
      f("booking.availability.open", "Opens", "text", { placeholder: "09:00", help: "24-hour time, like 09:00." }),
      f("booking.availability.close", "Closes", "text", { placeholder: "17:00" }),
      f("booking.availability.stepMin", "Time between slots (minutes)", "number"),
      f("booking.availability.leadHours", "Notice needed (hours)", "number"),
      f("booking.availability.horizonDays", "How far ahead people can book (days)", "number"),
    ],
  },
};

const SITE_ENDING = [
  {
    id: "header-footer",
    title: "Page title, header button and footer",
    hint: "Browser tab, top-right button and the bottom of the page.",
    when: () => true,
    fields: [
      f("meta.title", "Page title (browser tab)"),
      f("meta.description", "Short description for search engines", "textarea"),
      ...cta("nav.cta", "Header button"),
      f("footer.text", "Footer text"),
      f("footer.copyright", "Copyright line"),
    ],
    lists: [{ path: "footer.socialLinks", label: "Footer links", itemLabel: "Link", titleKey: "label", newItem: () => ({ type: "email", label: "", href: "" }), fields: [{ path: "type", label: "Kind", type: "select", options: SOCIAL, half: true }, f("label", "Shown as"), f("href", "Link", "text", { placeholder: "mailto:... or https://..." })] }],
  },
];

const ORDER = {
  portfolio: ["hero", "about", "projects", "skills", "experience", "education", "services", "stats", "testimonials", "resume-download", "contact", "contact-form"],
  landing: ["hero", "about", "stats", "services", "pricing", "team", "gallery", "testimonials", "faq", "cta-banner", "location-map", "contact", "contact-form", "newsletter"],
  ecommerce: ["store", "products", "hero", "testimonials", "faq", "cta-banner", "newsletter"],
  booking: ["services_booking", "hours", "hero", "team", "testimonials", "faq", "location-map"],
};

/** The form sections for a kind of website ("portfolio", "landing", "ecommerce", "booking"). */
export const formFor = (websiteType) => [...(ORDER[websiteType] || []).map((id) => ROOMS[id]), ...SITE_ENDING];

/** Kinds that have a content form (portals are edited with modules). */
export const hasContentForm = (websiteType) => Boolean(ORDER[websiteType]);

/**
 * Tidy a form-edited config before it is checked or built: drop empty things, give every
 * product and service a clean unique id, and make sure numbers are numbers.
 */
export function finalizeSite(config) {
  const c = cleanConfig(config);
  const fixIds = (items, nameKey, fallback) => {
    const taken = [];
    return items.map((item) => {
      const valid = typeof item.id === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id) && !taken.includes(item.id);
      const id = valid ? item.id : uniqueId(slugId(item[nameKey], fallback), taken);
      taken.push(id);
      return { ...item, id };
    });
  };
  const products = c.sections?.["product-list"]?.products;
  if (products) c.sections["product-list"].products = fixIds(products, "name", "product");
  const services = c.booking?.services;
  if (services) c.booking.services = fixIds(services, "name", "service");
  return c;
}
