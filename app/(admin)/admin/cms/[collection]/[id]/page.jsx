"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Save, Trash2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { isAdminUser } from "@/lib/auth/isAdmin"
import { getCmsCollection } from "@/lib/cms/config"
import { createCrud, parseError, recordToValues } from "@/lib/cms/client"
import { toast } from "@/lib/toast"
import CmsForm, { validate } from "@/components/cms/CmsForm"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formatDateTime = (d) => (d ? new Date(String(d).replace(" ", "T")).toLocaleString() : "")

export default function CmsEditPage() {
  const { collection, id } = useParams()
  const router = useRouter()
  const cfg = getCmsCollection(collection)
  const isNew = id === "new"
  const { user } = useAuth()
  const canDelete = isAdminUser(user)

  const [record, setRecord] = useState(null)
  const [values, setValues] = useState(() => (cfg ? recordToValues(null, cfg.fields) : {}))
  const [changed, setChanged] = useState([])
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState("")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!cfg || isNew) return
    let cancelled = false
    setLoading(true)
    createCrud(cfg)
      .get(id)
      .then((r) => {
        if (cancelled) return
        setRecord(r)
        setValues(recordToValues(r, cfg.fields))
      })
      .catch((err) => !cancelled && setLoadError(err?.status === 404 ? "This record doesn't exist or was deleted." : parseError(err, "load").message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [cfg, id, isNew])

  // Warn before leaving with unsaved changes.
  const dirty = changed.length > 0
  useEffect(() => {
    if (!dirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  if (!cfg) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">Unknown content type.</p>
        <Link href="/admin/cms" className="mt-3 inline-block text-sm font-semibold text-cyan-700">Back to content</Link>
      </div>
    )
  }

  const listHref = `/admin/cms/${cfg.route}`

  function onFieldChange(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
    setChanged((c) => (c.includes(name) ? c : [...c, name]))
    setErrors((e) => {
      if (!e[name]) return e
      const next = { ...e }
      delete next[name]
      return next
    })
  }

  async function save(e) {
    e?.preventDefault()
    setFormError("")
    const v = validate(cfg.fields, values)
    setErrors(v)
    if (Object.keys(v).length) {
      setFormError("Please fix the highlighted fields.")
      return
    }
    if (!isNew && !dirty) {
      toast.success("No changes to save.")
      return
    }

    setSaving(true)
    try {
      const crud = createCrud(cfg)
      if (isNew) {
        const created = await crud.create(values)
        setChanged([])
        toast.success(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} created.`)
        router.replace(`${listHref}/${created.id}`)
      } else {
        const updated = await crud.update(id, values, changed)
        setRecord(updated)
        setValues(recordToValues(updated, cfg.fields))
        setChanged([])
        toast.success("Changes saved.")
      }
    } catch (err) {
      const { message, fieldErrors } = parseError(err, isNew ? "create" : "update")
      setErrors(fieldErrors)
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  async function doDelete() {
    setDeleting(true)
    try {
      await createCrud(cfg).remove(id)
      setChanged([])
      toast.success(`Deleted ${cfg.singular}.`)
      router.replace(listHref)
    } catch (err) {
      toast.error(parseError(err, "delete").message)
      setDeleting(false)
    }
  }

  const heading = isNew
    ? `New ${cfg.singular}`
    : (cfg.titleField && record?.[cfg.titleField]) || `Edit ${cfg.singular}`

  return (
    <form onSubmit={save} className="mx-auto w-full max-w-4xl space-y-4" noValidate>
      <Link
        href={listHref}
        onClick={(e) => {
          if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) e.preventDefault()
        }}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ChevronLeft size={15} /> {cfg.label}
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/95">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{heading}</h1>
            {record && (
              <p className="text-xs text-slate-400">
                Last updated {formatDateTime(record.updated)} · ID {record.id}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {dirty && <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Unsaved changes</span>}
            {!isNew && canDelete && record && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            <button
              type="submit"
              disabled={saving || loading || Boolean(loadError)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-cyan-600 px-4 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isNew ? "Create" : "Save changes"}
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </div>
          ) : loadError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
              <Link href={listHref} className="mt-3 inline-block text-sm font-semibold text-cyan-700 hover:underline">Back to {cfg.label.toLowerCase()}</Link>
            </div>
          ) : (
            <>
              {formError && (
                <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <CmsForm
                fields={cfg.fields}
                values={values}
                record={record}
                errors={errors}
                saving={saving}
                onFieldChange={onFieldChange}
              />
            </>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={(open) => !open && !deleting && setConfirmDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {cfg.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              “{heading}” will be removed from the website permanently, along with its uploaded files. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                doDelete()
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
    </form>
  )
}
