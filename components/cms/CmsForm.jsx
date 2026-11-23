"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { FileText, ImageIcon, Loader2, Upload, X, RotateCcw, ExternalLink } from "lucide-react"
import { fileUrl, isFileField } from "@/lib/cms/client"

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-[370px] animate-pulse rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50" />,
})

const inputClass = (invalid) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/20 ${
    invalid ? "border-red-400" : "border-slate-200 dark:border-slate-700"
  }`

function FileInput({ field, value, record, onChange, invalid }) {
  const isImage = field.type === "image"
  const [preview, setPreview] = useState("")

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview("")
  }, [value])

  const original = record?.[field.name] || ""
  const existingUrl = typeof value === "string" && value ? fileUrl(record, value) : ""
  const shownUrl = preview || existingUrl
  const fileName = value instanceof File ? value.name : typeof value === "string" ? value : ""
  const accept = isImage ? "image/*" : "application/pdf"

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center ${
        invalid ? "border-red-400" : "border-slate-300 dark:border-slate-700"
      }`}
    >
      <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 sm:w-36 dark:bg-slate-800">
        {isImage && shownUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownUrl} alt="" className="h-full w-full object-cover" />
        ) : isImage ? (
          <ImageIcon size={26} className="text-slate-400" />
        ) : (
          <FileText size={26} className={fileName ? "text-red-500" : "text-slate-400"} />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {value instanceof File
            ? `New file: ${fileName} (${(value.size / 1024 / 1024).toFixed(2)} MB)`
            : value === null
              ? "File will be removed when you save."
              : fileName || "No file selected."}
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600">
            <Upload size={13} />
            {fileName ? "Replace" : "Choose file"}
            <input
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onChange(file)
                e.target.value = ""
              }}
            />
          </label>
          {!isImage && existingUrl && (
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ExternalLink size={13} /> Open
            </a>
          )}
          {value instanceof File && (
            <button
              type="button"
              onClick={() => onChange(original || "")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw size={13} /> Undo
            </button>
          )}
          {!field.required && typeof value === "string" && value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <X size={13} /> Remove
            </button>
          )}
          {value === null && (
            <button
              type="button"
              onClick={() => onChange(original)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw size={13} /> Keep file
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldInput({ field, value, record, onChange, invalid }) {
  const id = `cms-${field.name}`

  switch (field.type) {
    case "textarea":
      return <textarea id={id} rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass(invalid)} />
    case "richtext":
      return <RichTextEditor value={value ?? ""} onChange={onChange} invalid={invalid} />
    case "number":
      return <input id={id} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass(invalid)} max-w-[12rem]`} />
    case "date":
      return <input id={id} type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass(invalid)} max-w-[14rem]`} />
    case "url":
      return <input id={id} type="url" placeholder="https://" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass(invalid)} />
    case "bool":
      return (
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${value ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-700"}`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${value ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      )
    case "select": {
      // Keep a stored value visible even when it isn't one of the options (e.g. "Hybrid ").
      const opts = value && !field.options.includes(value) ? [...field.options, value] : field.options
      return (
        <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass(invalid)} max-w-xs`}>
          <option value="">Not set</option>
          {opts.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )
    }
    case "image":
    case "pdf":
      return <FileInput field={field} value={value} record={record} onChange={onChange} invalid={invalid} />
    default:
      return <input id={id} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass(invalid)} />
  }
}

function isEmpty(field, v) {
  if (isFileField(field)) return !v
  if (field.type === "bool") return false
  return v === undefined || v === null || String(v).replace(/<[^>]*>/g, "").trim() === ""
}

export function validate(fields, values) {
  const errors = {}
  for (const f of fields) {
    if (f.showIf && !f.showIf(values)) continue
    const v = values[f.name]
    if (f.required && isEmpty(f, v)) errors[f.name] = `${f.label} is required.`
    else if (f.type === "url" && v && !/^https?:\/\/\S+$/i.test(v)) errors[f.name] = "Enter a full URL starting with https://"
    else if (isFileField(f) && v instanceof File) {
      if (v.size > 5 * 1024 * 1024) errors[f.name] = "File is larger than 5 MB."
      else if (f.type === "image" && !v.type.startsWith("image/")) errors[f.name] = "Choose an image file."
      else if (f.type === "pdf" && v.type !== "application/pdf") errors[f.name] = "Choose a PDF file."
    }
  }
  return errors
}

export default function CmsForm({ fields, values, record, errors, onFieldChange, saving }) {
  const visible = useMemo(() => fields.filter((f) => !f.showIf || f.showIf(values)), [fields, values])

  return (
    <fieldset disabled={saving} className="space-y-5">
      {visible.map((f) => {
        const err = errors[f.name]
        const inline = f.type === "bool"
        return (
          <div key={f.name} className={inline ? "flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800" : "space-y-1.5"}>
            <label htmlFor={`cms-${f.name}`} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              {f.label}
              {f.required && <span className="ml-0.5 text-red-500">*</span>}
              {inline && f.help && <span className="block text-xs font-normal text-slate-400">{f.help}</span>}
            </label>
            <FieldInput field={f} value={values[f.name]} record={record} invalid={Boolean(err)} onChange={(v) => onFieldChange(f.name, v)} />
            {!inline && f.help && !err && <p className="text-xs text-slate-400 dark:text-slate-500">{f.help}</p>}
            {err && <p className="text-xs font-medium text-red-600 dark:text-red-400">{err}</p>}
          </div>
        )
      })}
      {saving && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Saving…
        </p>
      )}
    </fieldset>
  )
}
