"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronLeft as Back, Loader2,
  ImageIcon, FileText, ExternalLink, Upload, Check, Minus,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { isAdminUser } from "@/lib/auth/isAdmin"
import { getCmsCollection, columnType, columnLabel } from "@/lib/cms/config"
import { createCrud, fileUrl, parseError } from "@/lib/cms/client"
import { toast } from "@/lib/toast"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const PER_PAGE = 20

const formatDate = (d, withTime) => {
  if (!d) return "—"
  const date = new Date(String(d).replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  })
}

function Cell({ cfg, record, column }) {
  const type = columnType(cfg, column)
  const v = record[column]

  switch (type) {
    case "image":
      return v ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fileUrl(record, v, "100x100")} alt="" loading="lazy" className="h-10 w-14 rounded-md object-cover" />
      ) : (
        <span className="flex h-10 w-14 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
          <ImageIcon size={15} className="text-slate-400" />
        </span>
      )
    case "pdf":
      return v ? (
        <a href={fileUrl(record, v)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-400">
          <FileText size={13} /> PDF
        </a>
      ) : <span className="text-slate-400">—</span>
    case "bool":
      return v ? <Check size={16} className="text-emerald-600" /> : <Minus size={16} className="text-slate-300 dark:text-slate-600" />
    case "date":
      return formatDate(v)
    case "datetime":
      return formatDate(v, true)
    case "url":
      return v ? (
        <a href={v} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[16rem] items-center gap-1 truncate text-xs text-cyan-700 hover:underline dark:text-cyan-400">
          <span className="truncate">{v.replace(/^https?:\/\/(www\.)?/, "")}</span>
          <ExternalLink size={11} className="shrink-0" />
        </a>
      ) : <span className="text-slate-400">—</span>
    case "select":
      return v ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{v}</span>
      ) : <span className="text-slate-400">—</span>
    default:
      return v === "" || v === null || v === undefined ? (
        <span className="text-slate-400">—</span>
      ) : (
        <span className={column === cfg.titleField ? "line-clamp-2 font-medium text-slate-900 dark:text-white" : ""}>{String(v)}</span>
      )
  }
}

export default function CmsListPage() {
  const { collection } = useParams()
  const router = useRouter()
  const cfg = getCmsCollection(collection)
  const { user } = useAuth()
  const canDelete = isAdminUser(user)

  const [data, setData] = useState({ items: [], totalItems: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(null)

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    if (!cfg) return
    setLoading(true)
    setError("")
    try {
      const res = await createCrud(cfg).list(page, search, PER_PAGE)
      setData(res)
    } catch (err) {
      setError(parseError(err, "load").message)
    } finally {
      setLoading(false)
    }
  }, [cfg, page, search])

  useEffect(() => {
    load()
  }, [load])

  if (!cfg) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">Unknown content type.</p>
        <Link href="/admin/cms" className="mt-3 inline-block text-sm font-semibold text-cyan-700">Back to content</Link>
      </div>
    )
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await createCrud(cfg).remove(toDelete.id)
      toast.success(`Deleted ${cfg.singular}.`)
      setToDelete(null)
      if (data.items.length === 1 && page > 1) setPage(page - 1)
      else load()
    } catch (err) {
      toast.error(parseError(err, "delete").message)
    } finally {
      setDeleting(false)
    }
  }

  async function bulkUpload(files) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!list.length) return
    const crud = createCrud(cfg)
    let ok = 0
    const failed = []
    for (let i = 0; i < list.length; i++) {
      setUploading({ done: i, total: list.length })
      if (list[i].size > 5 * 1024 * 1024) {
        failed.push(`${list[i].name} (over 5 MB)`)
        continue
      }
      try {
        await crud.create({ [cfg.bulkUploadField]: list[i] })
        ok++
      } catch (err) {
        failed.push(`${list[i].name} (${parseError(err, "create").message})`)
      }
    }
    setUploading(null)
    if (ok) toast.success(`Uploaded ${ok} image${ok === 1 ? "" : "s"}.`)
    if (failed.length) toast.error(`Failed: ${failed.join(", ")}`)
    setPage(1)
    load()
  }

  const titleOf = (r) => (cfg.titleField ? r[cfg.titleField] : "") || `this ${cfg.singular}`
  const { items, totalItems, totalPages } = data
  const editHref = (r) => `/admin/cms/${cfg.route}/${r.id}`

  const actions = (r) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={editHref(r)}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        title="Edit"
        aria-label={`Edit ${titleOf(r)}`}
      >
        <Pencil size={15} />
      </Link>
      {canDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setToDelete(r)
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          title="Delete"
          aria-label={`Delete ${titleOf(r)}`}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full space-y-4">
      <Link href="/admin/cms" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <Back size={15} /> All content
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {cfg.label} <span className="font-normal text-slate-400 dark:text-slate-500">({totalItems})</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{cfg.description}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {cfg.searchFields.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder={`Search ${cfg.label.toLowerCase()}…`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/20"
                />
              </div>
            )}
            {cfg.bulkUploadField && (
              <label className={`inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${uploading ? "pointer-events-none opacity-70" : ""}`}>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? `Uploading ${uploading.done + 1}/${uploading.total}…` : "Upload images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    bulkUpload(e.target.files)
                    e.target.value = ""
                  }}
                />
              </label>
            )}
            <Link
              href={`/admin/cms/${cfg.route}/new`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 text-xs font-semibold text-white transition hover:bg-cyan-700"
            >
              <Plus size={15} /> New {cfg.singular}
            </Link>
          </div>
        </div>

        {error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={load} className="mt-3 text-sm font-semibold text-cyan-700 hover:underline">Try again</button>
          </div>
        ) : loading && !items.length ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : !items.length ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search ? `Nothing matches “${search}”.` : `No ${cfg.label.toLowerCase()} yet.`}
            </p>
            {!search && (
              <Link href={`/admin/cms/${cfg.route}/new`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:underline">
                <Plus size={14} /> Add the first {cfg.singular}
              </Link>
            )}
          </div>
        ) : cfg.layout === "grid" ? (
          <div className={`grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 ${loading ? "opacity-60" : ""}`}>
            {items.map((r) => {
              const file = r[cfg.fields[0].name]
              return (
                <div key={r.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                  <Link href={editHref(r)} className="block aspect-square">
                    {file ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fileUrl(r, file, "300x300")} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                    ) : (
                      <span className="flex h-full items-center justify-center"><ImageIcon className="text-slate-400" /></span>
                    )}
                  </Link>
                  <div className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 opacity-100 shadow-sm backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 dark:bg-slate-900/90">
                    {actions(r)}
                  </div>
                  <p className="truncate bg-white px-2 py-1 text-[11px] text-slate-500 dark:bg-slate-900 dark:text-slate-400">{formatDate(r.created)}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className={`overflow-x-auto ${loading ? "opacity-60" : ""}`}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                  {cfg.listColumns.map((c) => (
                    <th key={c} className="whitespace-nowrap px-4 py-3 font-semibold first:pl-6">
                      {columnType(cfg, c) === "image" ? <span className="sr-only">Image</span> : columnLabel(cfg, c)}
                    </th>
                  ))}
                  <th className="px-4 py-3 pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(editHref(r))}
                    className="cursor-pointer text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40"
                  >
                    {cfg.listColumns.map((c) => (
                      <td key={c} className={`px-4 py-3 align-middle first:pl-6 ${c === cfg.titleField ? "min-w-[16rem]" : "whitespace-nowrap"}`}>
                        <Cell cfg={cfg} record={r} column={c} />
                      </td>
                    ))}
                    <td className="px-4 py-3 pr-6">{actions(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {cfg.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete && titleOf(toDelete)}” will be removed from the website permanently, along with its uploaded files. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
