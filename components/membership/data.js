export const featureCategories = [
  {
    name: "Publishing & Submission",
    features: [
      { name: "Unlimited paper submissions", note: "All disciplines, no per-paper fees" },
      { name: "DOI assignment", note: "Crossref-registered permanent identifier for every paper" },
      { name: "Open access publishing", note: "CC BY 4.0 — freely accessible globally" },
      { name: "Pre-print posting", note: "Share manuscripts before formal peer review" },
      { name: "Plagiarism checker", note: "iThenticate-powered similarity check, unlimited uses", tag: "UNLIMITED" },
    ],
  },
  {
    name: "Indexing & Discoverability",
    features: [
      { name: "Multi-database indexing", note: "Scopus, DOAJ, Google Scholar, PubMed, Web of Science", tag: "HIGH VALUE" },
      { name: "ISSN registration", note: "Print & online serial number for your journal" },
      { name: "SEO-optimized paper pages", note: "Schema.org markup and sitemaps for max visibility" },
    ],
  },
  {
    name: "Peer Review",
    features: [
      { name: "Double-blind peer review", note: "Anonymous expert review — 4–6 week standard turnaround" },
      { name: "Fast-track peer review", note: "Expedited review for urgent research — 10–14 days", tag: "PRIORITY" },
      { name: "AI reviewer matching", note: "ML-powered expert matching via keywords & citation graph" },
    ],
  },
  {
    name: "Early Access & Reading",
    features: [
      { name: "Early access to accepted papers", note: "Read manuscripts before formal publication" },
      { name: "Full journal archive access", note: "Unlimited downloads from our entire library" },
      { name: "Reading list & saved papers", note: "Annotate and organize into personal collections, synced" },
    ],
  },
  {
    name: "Conferences & Events",
    features: [
      { name: "1 international conference hosting", note: "Virtual or hybrid — up to 500 attendees", tag: "EXCLUSIVE" },
      { name: "Conference proceedings publishing", note: "All accepted papers indexed & published with DOI" },
      { name: "Call for papers promotion", note: "Reach 200,000+ researchers via email + platform" },
    ],
  },
  {
    name: "Profile & Analytics",
    features: [
      { name: "Researcher profile page", note: "Public page with bio, affiliations, works, h-index" },
      { name: "Citation & impact analytics", note: "Real-time dashboard — citations, reads, downloads, altmetrics" },
      { name: "ORCID integration", note: "Two-way sync with your ORCID profile" },
    ],
  },
  {
    name: "Support & Compliance",
    features: [
      { name: "Priority support", note: "Dedicated queue — < 4 hr response on business days", tag: "PRIORITY" },
      { name: "Certificate of publication", note: "Digitally signed PDF certificate for every accepted paper" },
    ],
  },
];

// ─── Plan definitions ────────────────────────────────────────────────────────

export const plans = {
  yearly: {
    label: "RESEARCHER ANNUAL",
    badge: "MOST POPULAR",
    price: "₹4,999",
    period: "/ year",
    description: "Everything a researcher needs — publish, connect, and get recognized globally.",
    cta: "Get annual access →",
    savings: [
      { label: "Per-paper submission fees", value: "₹600 saved / paper" },
      { label: "Journal indexing",          value: "₹2,000 saved" },
      { label: "Conference hosting",         value: "₹8,000 saved" },
      { label: "Fast-track peer review",     value: "₹1,200 saved" },
      { label: "Effective total value",      value: "₹14,000+", highlight: true },
    ],
    perks: [
      "Unlimited paper submissions",
      "Journal indexing (Scopus, DOAJ & more)",
      "Peer review + fast-track option",
      "Early access to pre-prints",
      "1 international conference hosting",
      "DOI assignment for all papers",
      "Profile & citation analytics",
      "Priority customer support",
    ],
  },
  lifetime: {
    label: "RESEARCHER LIFETIME",
    badge: "BEST VALUE",
    price: "₹11,999",
    period: "one-time",
    description: "Pay once, publish forever. Never worry about renewals again.",
    cta: "Get lifetime access →",
    savings: [
      { label: "Equivalent yearly plans (3×)", value: "₹14,997 value" },
      { label: "Journal indexing (lifetime)",   value: "₹6,000 saved" },
      { label: "Conference hosting (3×)",        value: "₹24,000 saved" },
      { label: "Fast-track reviews (lifetime)",  value: "₹4,800 saved" },
      { label: "Lifetime total value",           value: "₹49,000+", highlight: true },
    ],
    perks: [
      "Everything in Annual — forever",
      "3× international conference hosting",
      "Lifetime DOI & archive access",
      "Priority support — dedicated manager",
      "All future features included",
      "Unlimited plagiarism checks, always",
      "Institutional invoice & GST receipt",
      "Early-bird access to new products",
    ],
  },
};

export const trustItems = [
  { icon: "🔒", label: "Secure checkout" },
  { icon: "🔁", label: "Renews annually" },
  { icon: "🛡️", label: "Cancel anytime" },
  { icon: "📄", label: "Official receipts" },
  { icon: "🌍", label: "200,000+ researchers" },
];

export const paymentMethods = ["Visa", "Mastercard", "UPI", "Net Banking", "Razorpay"];