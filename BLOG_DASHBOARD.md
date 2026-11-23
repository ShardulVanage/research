# Blog dashboard: build guide

This file is the brief for building the blog dashboard (create, edit and publish posts). The public blog is already built and is described in section 1. Sections 2–5 say exactly what to change in PocketBase. Sections 6–9 describe the dashboard itself.

---

## 1. How the public blog works today

| Piece | File | What it does |
|---|---|---|
| Data | `lib/blog.js` | Reads the `Blogs` collection on the server. Lists never download post bodies; each post is fetched once. |
| Cleaning | `lib/blog-content.js` | Sanitises the editor HTML (only reading tags survive), fixes structure, builds the table of contents, FAQ data and reading time. |
| Index | `app/blog/page.js` | Hero (Hairline "leaves" figure), latest/featured post, searchable list of all posts. |
| Article | `app/blog/[slug]/page.js` | Canonical URL, SEO metadata, JSON-LD, table of contents, reading progress, share links, related posts. |
| Embedded images | `app/blog/media/[id]/[version]/[n]/route.js` | Serves images that were pasted into a post as base64, so the page HTML stays small. |
| Refresh | `app/api/revalidate/route.js` | `POST` with the secret clears the blog cache immediately. |
| SEO files | `app/sitemap.js`, `app/robots.js`, `app/blog/feed.xml/route.js`, `app/llms.txt/route.js` | Sitemap, robots (AI crawlers welcome), RSS feed, and a plain-text site summary for AI assistants. |

**Speed and freshness.** Every blog request is cached by Next.js and tagged `blog`. Pages are served prebuilt, so a reload never waits for PocketBase. The cache refreshes itself every 10 minutes, and the dashboard makes changes appear **immediately** by calling the revalidate endpoint after every save (section 7).

**URLs.** Today a post lives at `/blog/<title-slug>-<id>`, e.g. `/blog/virtual-vs-face-to-face-learning-7okiibem78zxgwl`. Old links (`/blog/<id>`) and links with an out-of-date title redirect permanently (308) to the current address. Once posts have a `slug` field (section 3), they live at `/blog/<slug>`.

**Which PocketBase.** The blog reads `BLOG_POCKETBASE_URL`, falling back to `NEXT_PUBLIC_POCKETBASE_URL` (currently `https://admin.zepresearch.com`, 26 posts). Note that `https://zep-research.pockethost.io` has 29 posts, three of them newer. Decide which server is the real one and point both variables at it.

---

## 2. Do this first: lock the collection

The `Blogs` collection currently has **empty Create, Update and Delete rules**. In PocketBase an empty rule means "anyone, without logging in". Anyone on the internet can publish, change or delete posts.

The website sanitises everything it shows, so a malicious post cannot run code on the site. It can still deface the blog or spam it, so close it now:

| Rule | Set to (today) | Set to (after section 3) |
|---|---|---|
| List | `""` (public) | `status = "published"` |
| View | `""` (public) | `status = "published"` |
| Create | **null (admins only)** | `@request.auth.id != "" && @request.auth.role ?= "editor"` |
| Update | **null (admins only)** | same as Create |
| Delete | **null (admins only)** | `@request.auth.id != "" && @request.auth.role = "admin"` |

The same applies to `gallery` (open Create/Update/Delete) and `Conference`.

---

## 3. Collection changes

Keep every existing field (`Title`, `Description`, `author`, `Content`, `img`, `imageUrl`): the site and the old posts depend on them. Add these. The website already reads each of them when present and ignores them when absent, so they can be added one at a time.

| Field | Type | Settings | Why |
|---|---|---|---|
| `slug` | Text | Pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 120, **unique index** (section 4) | Clean, permanent URL: `/blog/how-to-respond-to-peer-reviewers` |
| `status` | Select (single) | `draft`, `published`, `scheduled`; default `draft` | Drafts never reach the site |
| `published_at` | Date | | The public date. Lets you schedule, and keeps the date stable when a post is edited |
| `category` | Select (single) | e.g. `Conferences`, `Publishing`, `Peer review`, `Careers`, `Research trends`, `News` | Category filter on `/blog`, breadcrumbs, related posts |
| `tags` | Select (multiple) or JSON | | Search, keywords in structured data |
| `cover_alt` | Text | max 160 | Describes the cover image for screen readers and search engines |
| `featured` | Bool | | Pins a post to the large slot at the top of `/blog` |
| `seo_title` | Text | max 60 | Search-result title, when it should differ from the headline |
| `seo_description` | Text | max 160 | Search-result and social description |
| `updated_at` | Date | | "Updated on" date shown to readers; set it only for meaningful edits (the automatic `updated` changes on every save) |

**Recommended: a separate `authors` collection** (`name`, `role`, `bio`, `avatar` file, `linkedin` url, `slug`), and later turn `author` into a relation to it. Real, named authors with a bio help both search ranking and how AI assistants weigh a source. When you switch, update `shape()` in `lib/blog.js` to read `expand.author.name` and add `expand=author` to the request.

**Images.** Upload covers to the `img` file field rather than pasting links into `imageUrl`: files on PocketBase are resized and served as AVIF/WebP automatically. Links to other websites (Freepik, LinkedIn, Google thumbnails…) are shown unoptimised and can disappear at any time. Covers should be at least 1200 × 630 px.

**Never paste images into the editor as data.** Two current posts carry megabytes of base64 images inside their HTML (one is 10.6 MB). The site works around it, but the dashboard should upload images as files (section 6).

---

## 4. Indexes

```sql
CREATE UNIQUE INDEX idx_blogs_slug ON Blogs (slug) WHERE slug != '';
CREATE INDEX idx_blogs_status_pub ON Blogs (status, published_at);
```

---

## 5. Filling the new fields for existing posts

1. **`slug`:** generate it from the title with the same rule the site uses, `slugify()` in `lib/blog.js`. Old `/blog/<title>-<id>` links keep working, because the site still recognises the id at the end of a URL and redirects it to the new slug.
2. **`status`:** set every existing post to `published`.
3. **`published_at`:** copy it from `created`.
4. **`category`:** assign one category to each post.
5. **Revalidate:** call the revalidate endpoint once (section 7).

---

## 6. The dashboard: what to build

**Where.** `/dashboard` inside this Next.js app is simplest: it reuses the components, the content cleaner and the preview styles. Keep it out of search with `robots: { index: false }` in its layout, and block `/dashboard` in `app/robots.js`.

**Sign-in.**
- Use PocketBase auth for users with a `role` field (`editor`, `admin`).
- Keep the token in an **httpOnly, secure, SameSite=Lax cookie** set by a server action, never in `localStorage`.
- Every server action re-checks the user's role. PocketBase's API rules (section 2) are the final guard.

**Editor.**
- Use a structured editor such as **TipTap**, configured to allow only what the site renders: paragraphs, H2, H3, H4, bold, italic, links, bulleted and numbered lists, blockquote, images with alt text, tables, horizontal rule and code.
- No font, colour or size controls. The site's typography handles that, and inline styles are stripped anyway.
- Leave H1 out of the toolbar: the title is the H1.

**Images in posts.**
- Upload each image to a `blog_media` collection (`file`, `alt`, `post` relation) and insert its PocketBase URL.
- Never insert base64.
- Add `admin.zepresearch.com` paths to the allowlist in `lib/blog-content.js` (`OPTIMISABLE`) if you use a different host.

**Forms.**
- Title.
- Slug, auto-filled from the title and editable while the post is a draft; warn before changing it once published.
- Summary, 120–160 characters, with a live counter. This becomes `Description`.
- Category, tags.
- Cover upload with required alt text.
- Author.
- Status, plus `published_at` (with a date picker for scheduling).
- `featured`.
- SEO title and description, with a live search-result preview: 60 / 160 character counters, truncated the way Google truncates.

**Preview.**
- Render the draft with `renderContent()` from `lib/blog-content.js` inside a `.prose-zep` container, so the preview is exactly what readers will see.
- For a shareable preview link, add a signed, expiring token route (for example `/blog/preview/<id>?token=…`) that bypasses the `status` filter, marked `noindex`.

**Quality checklist before Publish.** Block publishing, or warn, when any of these is missing:
- [ ] Title 30–70 characters
- [ ] Summary 120–160 characters
- [ ] Cover image with alt text
- [ ] At least two H2 sections, used in order (no H3 before the first H2)
- [ ] Every image has alt text
- [ ] At least one link to a relevant Zep page (conference, service, proceedings)
- [ ] Category chosen
- [ ] Slug set and unique

**Also useful.**
- Autosave every 20 seconds while drafting.
- A "last edited by" line.
- A list view with filters by status and category.
- Duplicate post.
- Revision history (a `blog_revisions` collection that stores the previous `Content` on each publish).

---

## 7. After every save: refresh the site

```http
POST /api/revalidate
x-revalidate-secret: <REVALIDATE_SECRET>
content-type: application/json

{ "tag": "blog" }
```

- **Set the secret:** put `REVALIDATE_SECRET` (a long random string) in the website's environment.
- **Call it from the dashboard's server action:** after create, update, delete and every status change. Never call it from the browser, where the secret would be exposed.
- **Or from PocketBase,** so edits made in the PocketBase admin also refresh the site. Add `pb_hooks/blogs.pb.js`, with `REVALIDATE_SECRET` set in PocketBase's environment:

```js
/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => { e.next(); $http.send({ url: "https://www.zepresearch.com/api/revalidate", method: "POST", headers: { "x-revalidate-secret": $os.getenv("REVALIDATE_SECRET"), "content-type": "application/json" }, body: JSON.stringify({ tag: "blog" }), timeout: 10 }); }, "Blogs");
onRecordAfterUpdateSuccess((e) => { e.next(); $http.send({ url: "https://www.zepresearch.com/api/revalidate", method: "POST", headers: { "x-revalidate-secret": $os.getenv("REVALIDATE_SECRET"), "content-type": "application/json" }, body: JSON.stringify({ tag: "blog" }), timeout: 10 }); }, "Blogs");
onRecordAfterDeleteSuccess((e) => { e.next(); $http.send({ url: "https://www.zepresearch.com/api/revalidate", method: "POST", headers: { "x-revalidate-secret": $os.getenv("REVALIDATE_SECRET"), "content-type": "application/json" }, body: JSON.stringify({ tag: "blog" }), timeout: 10 }); }, "Blogs");
```

Without either, changes still appear within 10 minutes.

---

## 8. Writing for search engines and AI assistants

The site already handles the technical side:
- Canonical URLs, Open Graph and Twitter cards.
- `BlogPosting`, `BreadcrumbList` and `Blog` structured data.
- A sitemap with last-modified dates and an RSS feed.
- `robots.txt` that explicitly welcomes GPTBot, ClaudeBot, PerplexityBot and Google-Extended.
- `/llms.txt`, which lists every article with its summary.

What remains is the writing. These habits make a post rank, and make assistants such as ChatGPT, Gemini and Perplexity quote it:

1. **Answer first.** The first paragraph answers the question in the title in two or three plain sentences. Assistants quote openings.
2. **Real structure.** H2 for each main step or idea, H3 inside it. The site builds the table of contents from these.
3. **An FAQ section.** End with three to six questions as H3 headings ending in "?", each followed by a short answer. The site turns these into `FAQPage` structured data automatically.
4. **Specifics.** Numbers, dates, named conferences, real examples. Generic text is ignored by both search and AI.
5. **Named author with credentials.** See the `authors` collection in section 3.
6. **Cite sources** with links. Link to your own pages too: conferences, services, proceedings.
7. **Update, don't duplicate.** Refresh an old post and set `updated_at`, rather than writing a near-copy.
8. **One topic per post,** matched to a phrase a researcher would actually search or ask.

---

## 9. Environment variables

| Variable | Used by | Required |
|---|---|---|
| `BLOG_POCKETBASE_URL` | Blog data (falls back to `NEXT_PUBLIC_POCKETBASE_URL`) | Recommended |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, feeds (default `https://www.zepresearch.com`) | In staging |
| `REVALIDATE_SECRET` | `/api/revalidate` | Yes, for instant updates |
