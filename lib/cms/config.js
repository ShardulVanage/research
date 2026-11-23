// CMS collection definitions for the PocketBase instance at NEXT_PUBLIC_POCKETBASE_URL.
// Field types: text, textarea, richtext, url, number, date, bool, select, image, pdf.
// Every list page and form under /admin/cms is rendered from this file.

export const cmsCollections = [
  {
    name: "Blogs",
    label: "Blogs",
    singular: "blog post",
    route: "blogs",
    description: "Blog posts shown on the public blog.",
    titleField: "Title",
    listColumns: ["img", "Title", "author", "created"],
    defaultSort: "-created",
    searchFields: ["Title", "author"],
    fields: [
      { name: "Title", label: "Title", type: "text", required: true },
      { name: "Description", label: "Short description", type: "textarea", required: true, help: "One or two sentences shown in blog lists." },
      { name: "author", label: "Author", type: "text", required: true },
      { name: "Content", label: "Content", type: "richtext", required: true },
      { name: "img", label: "Cover image (upload)", type: "image", help: "Preferred. At least 1200 × 630 px, max 5 MB." },
      { name: "imageUrl", label: "Cover image (URL)", type: "url", help: "Used only if no image is uploaded." },
    ],
  },
  {
    name: "Conference",
    label: "Conferences",
    singular: "conference",
    route: "conferences",
    description: "Upcoming conferences, dates, venues and links.",
    titleField: "title",
    listColumns: ["img", "order", "short_form", "title", "date", "format"],
    defaultSort: "order,date",
    searchFields: ["title", "short_form", "Venue"],
    fields: [
      { name: "short_form", label: "Short form", type: "text", required: true, help: "e.g. ICETMR" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "order", label: "Order", type: "number", help: "Lower numbers are shown first." },
      { name: "date", label: "Conference date", type: "date", required: true },
      { name: "abstract_deadline", label: "Abstract deadline", type: "text", required: true, help: "Free text, e.g. 30 Oct 2027" },
      { name: "Venue", label: "Venue", type: "text", required: true },
      { name: "format", label: "Format", type: "select", options: ["In-person", "Hybrid", "Online"] },
      { name: "description", label: "Description", type: "textarea" },
      { name: "websiteUrl", label: "Website URL", type: "url", required: true },
      { name: "website_submittion_url", label: "Submission URL", type: "url" },
      { name: "registration_url", label: "Registration URL", type: "url" },
      { name: "cpd_accredited", label: "CPD accredited", type: "bool" },
      { name: "cpd_hours", label: "CPD hours", type: "number", showIf: (v) => v.cpd_accredited },
      { name: "img", label: "Banner image", type: "image", required: true },
    ],
  },
  {
    name: "Journals",
    label: "Journals",
    singular: "journal",
    route: "journals",
    description: "Journal listings with indexing information.",
    titleField: "title",
    listColumns: ["imgs", "title", "issncode", "indexType", "by_zep", "not_visible"],
    defaultSort: "title",
    searchFields: ["title", "issncode"],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "issncode", label: "ISSN", type: "text" },
      { name: "indexType", label: "Index", type: "select", options: ["ABDC", "Scopus", "GoogleScholar", "Wos"] },
      { name: "web_url", label: "Website", type: "url" },
      { name: "imgs", label: "Image (upload)", type: "image", help: "Preferred, max 5 MB." },
      { name: "img", label: "Image (URL)", type: "url", help: "Used only if no image is uploaded." },
      { name: "by_zep", label: "Published by Zep", type: "bool" },
      { name: "not_visible", label: "Hide from public site", type: "bool" },
    ],
  },
  {
    name: "gallery",
    label: "Gallery",
    singular: "image",
    route: "gallery",
    description: "Photos shown in the website gallery.",
    layout: "grid",
    bulkUploadField: "field",
    listColumns: ["field", "created"],
    defaultSort: "-created",
    searchFields: [],
    fields: [{ name: "field", label: "Image", type: "image", required: true, help: "Max 5 MB." }],
  },
  {
    name: "last_conf_proceedings",
    label: "Proceedings",
    singular: "proceeding",
    route: "proceedings",
    description: "Past conference proceedings (PDF and cover).",
    titleField: "title",
    listColumns: ["img", "title", "location", "field", "proceedings"],
    defaultSort: "-field",
    searchFields: ["title", "location"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "field", label: "Conference date", type: "date" },
      { name: "proceedings", label: "Proceedings (PDF)", type: "pdf", help: "Max 5 MB." },
      { name: "img", label: "Cover image", type: "image" },
    ],
  },
  {
    name: "yt_short_section_testomonial",
    label: "Testimonials (Shorts)",
    singular: "testimonial",
    route: "testimonials",
    description: "YouTube Shorts testimonials.",
    titleField: "title",
    listColumns: ["img", "title", "url"],
    defaultSort: "-created",
    searchFields: ["title"],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "url", label: "YouTube Shorts URL", type: "url" },
      { name: "img", label: "Thumbnail", type: "image" },
    ],
  },
  {
    name: "yt_video_section",
    label: "Videos",
    singular: "video",
    route: "videos",
    description: "YouTube videos section.",
    titleField: "title",
    listColumns: ["img", "title", "url"],
    defaultSort: "-created",
    searchFields: ["title"],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "url", label: "YouTube URL", type: "url" },
      { name: "img", label: "Thumbnail", type: "image" },
    ],
  },
]

export const getCmsCollection = (route) => cmsCollections.find((c) => c.route === route)

// Column type lookup; `created` / `updated` are system fields not in `fields`.
export function columnType(cfg, column) {
  if (column === "created" || column === "updated") return "datetime"
  return cfg.fields.find((f) => f.name === column)?.type || "text"
}

export function columnLabel(cfg, column) {
  if (column === "created") return "Created"
  if (column === "updated") return "Updated"
  return cfg.fields.find((f) => f.name === column)?.label || column
}
