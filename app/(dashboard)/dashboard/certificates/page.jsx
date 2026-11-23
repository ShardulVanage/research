"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import pb, { getImageUrl } from "@/lib/pocketbase"
import { Award, ArrowLeft, Download, ShieldCheck, Clock, ExternalLink } from "lucide-react"

const statusColors = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  approved: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  generated: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400",
  sent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
}
const defaultStatusColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"

export default function UserCertificatesPage() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadCertificates()
  }, [user])

  async function loadCertificates() {
    setLoading(true)
    try {
      const result = await pb.collection("conf_certificates").getList(1, 50, {
        filter: `user = "${user.id}"`,
        sort: "-created",
        expand: "registration",
      })
      setCertificates(result.items || [])
    } catch (err) {
      console.error("Error loading certificates:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 no-underline transition-colors hover:bg-cyan-50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-400"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="m-0 text-[22px] font-bold text-slate-800 dark:text-slate-100">
            My Certificates
          </h1>
          <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
            Track certificate requests, download issued certificates, and verify credentials
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                <Award size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                No certificates requested yet
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You can request certificates for completed conference registrations.
              </p>
              <Link
                href="/dashboard/conferences"
                className="mt-4 inline-block rounded-[10px] bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400"
              >
                View My Conferences
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => {
                const pdfUrl = cert.pdf ? getImageUrl(cert, cert.pdf) : null
                const isGenerated = cert.status === "generated" || cert.status === "sent"

                return (
                  <div
                    key={cert.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                      <Award size={22} />
                    </div>

                    <div className="min-w-[220px] flex-1">
                      <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                        {cert.expand?.registration?.ticket_name || `Certificate ${cert.certificate_no}`}
                      </h4>
                      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Type: <strong className="font-semibold capitalize">{cert.certificate_type || "participation"}</strong>
                        </span>
                        <span>
                          No: <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{cert.certificate_no}</code>
                        </span>
                        {cert.verification_code && (
                          <span>
                            Code: <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{cert.verification_code}</code>
                          </span>
                        )}
                      </div>
                      {cert.status === "rejected" && (cert.rejection_reason || cert.rejected_reason) && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          Reason: {cert.rejection_reason || cert.rejected_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[cert.status] || defaultStatusColor}`}
                      >
                        {cert.status}
                      </span>

                      {/* Download PDF Button */}
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                          <Download size={14} /> Download PDF
                        </a>
                      )}

                      {/* Verify Certificate Button */}
                      {cert.verification_code && (
                        <Link
                          href={`/verify/${cert.verification_code}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500 bg-cyan-50 px-3.5 py-1.5 text-[13px] font-semibold text-cyan-600 no-underline transition-colors hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 dark:hover:bg-cyan-900/40"
                        >
                          <ShieldCheck size={14} /> Verify <ExternalLink size={12} />
                        </Link>
                      )}
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