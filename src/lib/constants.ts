// ── Brand Constants ────────────────────────────────────────────────────────────
// Single source of truth for contact info, brand details, and shared config.
// Import from here instead of hardcoding across multiple files.

export const BRAND = {
  name: "Lattév Jouel",
  tagline: "Fine contemporary jewellery · Mumbai",
  founder: "Lavanya Pahwa",
  instagram: "@lattevjouel",
  instagramUrl: "https://instagram.com/lattevjouel",
  email: "lavanyapahwa717@gmail.com",
  website: "https://lattevjouel.com",
} as const;

export const WHATSAPP = {
  phone: "918077762221", // +91 country code, no spaces or dashes
  greeting: "Hi Lavanya! I found Lattév Jouel online and I have a question 😊",
  sizeGuide: "Hi, can you help me find my ring size?",
  productInquiry: (name: string) =>
    `Hi! I'm interested in "${name}" on lattevjouel.com — could you tell me more?`,
  reviewCTA: "Hi! I'd love to share my experience with Lattév Jouel 😊",
};

export const WHATSAPP_URL = {
  general: `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(WHATSAPP.greeting)}`,
  sizeGuide: `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(WHATSAPP.sizeGuide)}`,
  product: (name: string) =>
    `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(WHATSAPP.productInquiry(name))}`,
  review: `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(WHATSAPP.reviewCTA)}`,
};

export const CATEGORIES = ["all", "rings", "cuffs", "bangles", "bracelets", "pendants"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  all: "The Collection",
  rings: "Rings",
  cuffs: "Cuffs",
  bangles: "Bangles",
  bracelets: "Bracelets",
  pendants: "Pendants",
};
