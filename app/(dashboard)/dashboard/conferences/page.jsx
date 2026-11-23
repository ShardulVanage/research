"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useDashboardData } from "@/contexts/dashboard-context"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import RequestCertificateButton from "@/components/dashboard/RequestCertificateButton"
import { useAuth } from "@/contexts/auth-context"
import {
  conferenceImage,
  conferenceVenue,
  formatConferenceDate,
  registrationConference,
  registrationDate,
} from "@/lib/conference-utils"
import { CalendarDays, MapPin, ArrowLeft, Clock, Award, Globe, Eye } from "lucide-react"

export default function MyConferencesPage() {
  const { user } = useAuth()
  const { conferences, registrations, loading, initializeDashboardData } = useDashboardData()

  useEffect(() => {
    if (!user) return
    initializeDashboardData(user.id)
  }, [user, initializeDashboardData])

  const conferencesById = new Map(conferences.map((c) => [c.id, c]))
  const now = new Date()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 no-underline transition-colors hover:bg-cyan-50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-400"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1">
            <h1 className="m-0 text-[22px] font-bold text-slate-800 dark:text-slate-100">
              My Conferences
            </h1>
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
              Conferences you have registered for. Request certificates once a conference ends.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <RefreshDashboardButton />
          <Link
            href="/dashboard/future-conferences"
            className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-[13px] font-semibold text-cyan-600 no-underline transition-colors hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400 dark:hover:bg-cyan-900/40"
          >
            Future Conferences →
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                <CalendarDays size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                No registered conferences yet
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You haven&apos;t registered for any conferences yet.
              </p>
              <Link
                href="/dashboard/future-conferences"
                className="mt-4 inline-block rounded-[10px] bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400"
              >
                Browse Future Conferences
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg, index) => {
                const conf = registrationConference(reg, conferencesById)
                const confDate = registrationDate(reg, conf)
                const isUpcoming = confDate && confDate > now
                const imgUrl = conferenceImage(conf)
                const title = conf?.title || reg.ticket_name || "Conference Registration"
                const place = conf
                  ? conferenceVenue(conf)
                  : reg.city
                    ? `${reg.city}${reg.country ? `, ${reg.country}` : ""}`
                    : "Online"
                const createdDate = reg.created
                  ? new Date(reg.created.replace(" ", "T")).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""

                return (
                  <div
                    key={reg.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-cyan-200 dark:border-slate-800 dark:hover:border-cyan-900"
                  >
                    <div
                      className={`flex h-20 w-full shrink-0 items-center justify-center rounded-xl bg-cover bg-center p-2 text-center text-[11px] font-semibold text-white md:w-[120px] ${
                        imgUrl
                          ? "[text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
                          : index % 2 === 1
                            ? "bg-sky-600 dark:bg-sky-700"
                            : "bg-cyan-600 dark:bg-cyan-700"
                      }`}
                      style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : undefined}
                    >
                      {!imgUrl && (conf?.short_form || title.split(" ").slice(0, 3).join(" "))}
                    </div>

                    <div className="min-w-[220px] flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        {conf?.short_form && (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {conf.short_form}
                          </span>
                        )}
                        {conf?.format && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {conf.format}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">{title}</h4>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} /> {formatConferenceDate(confDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {place}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                        {createdDate && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> Registered: {createdDate}
                          </span>
                        )}
                        {(reg.ticket_type || reg.ticket_name) && (
                          <span className="flex items-center gap-1">
                            <Award size={11} /> {reg.ticket_type || reg.ticket_name}
                          </span>
                        )}
                        {conf?.cpd_accredited && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            CPD Accredited{conf.cpd_hours ? ` (${conf.cpd_hours}h)` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                          isUpcoming
                            ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {isUpcoming ? "Upcoming" : "Attended"}
                      </span>
                      {conf?.websiteUrl && (
                        <a
                          href={conf.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-cyan-600 no-underline hover:text-cyan-700 dark:text-cyan-400"
                        >
                          <Globe size={12} /> Website
                        </a>
                      )}
                      <Link
                        href={`/dashboard/registrations/${reg.id}`}
                        className="flex items-center gap-1 text-xs font-medium text-slate-600 no-underline hover:text-cyan-600 dark:text-slate-300"
                      >
                        <Eye size={12} /> Details
                      </Link>
                      <RequestCertificateButton registrationId={reg.id} conferenceEnded={!isUpcoming} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
