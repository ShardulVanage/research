"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, FileText, CalendarDays, BookOpen, Images, BookMarked, Clapperboard, Video } from "lucide-react"
import { cmsCollections } from "@/lib/cms/config"
import { createCrud } from "@/lib/cms/client"

const icons = {
  blogs: FileText,
  conferences: CalendarDays,
  journals: BookOpen,
  gallery: Images,
  proceedings: BookMarked,
  testimonials: Clapperboard,
  videos: Video,
}

export default function CmsHomePage() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    cmsCollections.forEach((cfg) => {
      createCrud(cfg)
        .count()
        .then((n) => setCounts((c) => ({ ...c, [cfg.route]: n })))
        .catch(() => setCounts((c) => ({ ...c, [cfg.route]: "—" })))
    })
  }, [])

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Website content</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add, edit and delete what appears on the public website. Changes are saved straight to PocketBase.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cmsCollections.map((cfg) => {
          const Icon = icons[cfg.route] || FileText
          return (
            <Link
              key={cfg.route}
              href={`/admin/cms/${cfg.route}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-700"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Icon size={19} />
                </span>
                <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {counts[cfg.route] ?? <span className="inline-block h-6 w-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />}
                </span>
              </div>
              <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">{cfg.label}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">{cfg.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 dark:text-cyan-400">
                Manage <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
