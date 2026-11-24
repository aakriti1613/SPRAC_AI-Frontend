// The five kinds of website SPARC AI can build, in plain words, and which ready
// templates exist for each. Templates exist only for some kinds; the others are
// built with SPARC AI.
import { templates } from "../templates";

export const SITE_TYPES = [
  {
    id: "admin-portal",
    name: "Admin portal",
    tagline: "Manage records, like patients, students, orders or staff.",
    goodFor: "Clinics, schools, shops, teams",
    includes: ["Login and users", "Tables and forms", "Dashboard"],
    icon: "LayoutDashboard",
    accent: "#38bdf8",
    templateIds: ["portal-admin", "crud-modern-new-temp"],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    tagline: "Show who you are, what you built and how to reach you.",
    goodFor: "Students, freelancers, job seekers",
    includes: ["About and skills", "Projects", "Contact form"],
    icon: "UserRound",
    accent: "#f97316",
    templateIds: ["landing-modern", "landing-temp-2"],
  },
  {
    id: "landing",
    name: "Landing page",
    tagline: "One page that explains a business and gets enquiries.",
    goodFor: "Clinics, coaching centres, startups",
    includes: ["Services and pricing", "FAQ and reviews", "Contact"],
    icon: "Globe",
    accent: "#a78bfa",
    templateIds: [],
  },
  {
    id: "ecommerce",
    name: "Online store",
    tagline: "Sell products with a cart, checkout and payment.",
    goodFor: "Shops selling online",
    includes: ["Product pages", "Cart and checkout", "Order confirmation"],
    icon: "ShoppingCart",
    accent: "#34d399",
    templateIds: [],
  },
  {
    id: "booking",
    name: "Booking site",
    tagline: "Let customers pick a service and a time.",
    goodFor: "Clinics, salons, tutors, gyms",
    includes: ["Services list", "Day and time picker", "Booking confirmation"],
    icon: "CalendarCheck",
    accent: "#f472b6",
    templateIds: [],
  },
];

export const siteTypeById = (id) => SITE_TYPES.find((t) => t.id === id) || null;

/** The ready templates for a website kind (may be empty). */
export const templatesFor = (typeId) => {
  const type = siteTypeById(typeId);
  return type ? templates.filter((t) => type.templateIds.includes(t.id)) : [];
};
