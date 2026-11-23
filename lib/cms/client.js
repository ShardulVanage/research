import pb from "@/lib/pocketbase"

const FILE_TYPES = new Set(["image", "pdf"])

export const isFileField = (field) => FILE_TYPES.has(field.type)

// PocketBase date "2027-10-30 10:23:13.000Z" -> "2027-10-30" for <input type="date">
export const toDateInput = (d) => (d ? String(d).slice(0, 10) : "")

// Noon UTC keeps the calendar day the same in every timezone the site is viewed from.
const fromDateInput = (d) => (d ? `${d} 12:00:00.000Z` : "")

export const fileUrl = (record, filename, thumb) =>
  record && filename ? pb.files.getURL(record, filename, thumb ? { thumb } : {}) : ""

// Turn a record into form values (dates trimmed for date inputs, files kept as filenames).
export function recordToValues(record, fields) {
  const values = {}
  for (const f of fields) {
    const v = record?.[f.name]
    if (f.type === "date") values[f.name] = toDateInput(v)
    else if (f.type === "bool") values[f.name] = Boolean(v)
    else if (f.type === "number") values[f.name] = v ?? ""
    else values[f.name] = v ?? ""
  }
  return values
}

// Build FormData for the given fields only.
// File fields: File = new upload, null = remove, string = existing file (left untouched).
export function toFormData(values, fields) {
  const fd = new FormData()

  for (const f of fields) {
    const v = values[f.name]

    if (isFileField(f)) {
      if (v instanceof File) fd.append(f.name, v)
      else if (v === null) fd.append(f.name, "")
      continue
    }

    if (v === undefined) continue

    if (f.type === "bool") fd.append(f.name, v ? "true" : "false")
    else if (f.type === "date") fd.append(f.name, fromDateInput(v))
    else if (f.type === "number") fd.append(f.name, v === "" || v === null ? "" : String(v))
    else fd.append(f.name, v ?? "")
  }

  return fd
}

export function createCrud(cfg) {
  const col = pb.collection(cfg.name)

  return {
    list: (page = 1, search = "", perPage = 20) =>
      col.getList(page, perPage, {
        sort: cfg.defaultSort,
        filter:
          search && cfg.searchFields.length
            ? pb.filter(cfg.searchFields.map((f) => `${f} ~ {:q}`).join(" || "), { q: search })
            : "",
      }),
    count: () => col.getList(1, 1, { fields: "id" }).then((r) => r.totalItems),
    get: (id) => col.getOne(id),
    create: (values) => col.create(toFormData(values, cfg.fields)),
    // Only the fields the user actually changed are sent, so untouched values
    // (e.g. a date's original time, existing files) are never overwritten.
    update: (id, values, changedFieldNames) =>
      col.update(
        id,
        toFormData(values, changedFieldNames ? cfg.fields.filter((f) => changedFieldNames.includes(f.name)) : cfg.fields),
      ),
    remove: (id) => col.delete(id),
  }
}

// Turn a PocketBase ClientResponseError into { message, fieldErrors }.
export function parseError(err, action = "save") {
  const fieldErrors = {}
  const data = err?.response?.data || {}
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === "object" && val.message) fieldErrors[key] = val.message
  }

  let message = err?.response?.message || err?.message || "Something went wrong."
  const status = err?.status

  if (status === 403 || ((status === 404 || status === 400) && !Object.keys(fieldErrors).length && action !== "load")) {
    message =
      action === "delete"
        ? "PocketBase refused the delete. Deleting needs an admin account with a verified @zepresearch.com email."
        : `PocketBase refused to ${action} this record. Check the collection's API rules and that your @zepresearch.com email is verified.`
  }
  if (status === 0) message = "Could not reach PocketBase. Check your connection and try again."

  return { message, fieldErrors }
}
