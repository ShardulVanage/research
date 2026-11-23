"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardData } from "@/contexts/dashboard-context"
import {
  conferenceImage,
  conferenceDate,
  conferenceVenue,
  conferenceRegisterUrl,
  formatConferenceDate,
  isFutureConference,
} from "@/lib/conference-utils"
import { CalendarDays, MapPin, Clock, Globe, Award, ExternalLink, Send, Star } from "lucide-react"

export default function FutureConferencesPage() {
  const { user } = useAuth()
  const { conferences, registrations, loading, initializeDashboardData } = useDashboardData()

  useEffect(() => {
    if (user) initializeDashboardData(user.id)
  }, [user, initializeDashboardData])

  const now = new Date()
  const future = conferences.filter((c) => isFutureConference(c, now))
  const registeredIds = new Set(registrations.map((r) => r.conference).filter(Boolean))

  return (
    <div className="zd">
      <section className="zd-card">
        <header className="zd-card-head" style={{ marginBottom: 6 }}>
          <h2>
            <span className="zd-head-icon purple"><Star size={18} fill="currentColor" /></span>
            Future Conferences
          </h2>
        </header>
        <p className="zd-muted">
          Upcoming ZepResearch conferences. Register early to secure your spot and submit your paper
          before the abstract deadline.
        </p>
      </section>

      {loading ? (
        <div className="zd-future-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 380, borderRadius: 16 }} />
          ))}
        </div>
      ) : future.length === 0 ? (
        <section className="zd-card">
          <div className="empty-state">
            <div className="empty-icon"><CalendarDays size={28} /></div>
            <h3>No upcoming conferences</h3>
            <p>New conferences will be announced soon. Check back later.</p>
          </div>
        </section>
      ) : (
        <div className="zd-future-grid fade-in-up">
          {future.map((conf) => {
            const img = conferenceImage(conf)
            const date = conferenceDate(conf)
            const registerUrl = conferenceRegisterUrl(conf)
            const isRegistered = registeredIds.has(conf.id)

            return (
              <article key={conf.id} className="zd-card zd-fc">
                <div
                  className="zd-fc-img"
                  style={img ? { backgroundImage: `url(${img})` } : undefined}
                >
                  {conf.short_form && <span className="zd-fc-badge">{conf.short_form}</span>}
                  {conf.format && <span className="zd-fc-format">{conf.format}</span>}
                </div>

                <div className="zd-fc-body">
                  <h3>{conf.title}</h3>
                  <ul className="zd-fc-meta">
                    <li><CalendarDays size={14} /> {formatConferenceDate(date)}</li>
                    <li><MapPin size={14} /> {conferenceVenue(conf)}</li>
                    {conf.abstract_deadline && (
                      <li><Clock size={14} /> Abstract deadline: {conf.abstract_deadline}</li>
                    )}
                    {conf.cpd_accredited && (
                      <li>
                        <Award size={14} /> CPD accredited
                        {conf.cpd_hours ? ` · ${conf.cpd_hours} hrs` : ""}
                      </li>
                    )}
                  </ul>
                  {conf.description?.trim() && <p className="zd-fc-desc">{conf.description.trim()}</p>}

                  <div className="zd-fc-actions">
                    {isRegistered ? (
                      <span className="zd-btn purple" aria-disabled="true" style={{ opacity: 0.7, marginTop: 0 }}>
                        Already Registered
                      </span>
                    ) : registerUrl ? (
                      <a
                        href={registerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="zd-btn purple"
                        style={{ marginTop: 0 }}
                      >
                        Register Now
                      </a>
                    ) : null}
                    <div className="zd-fc-links">
                      {conf.websiteUrl && (
                        <a href={conf.websiteUrl} target="_blank" rel="noopener noreferrer" className="zd-link">
                          <Globe size={14} /> Website <ExternalLink size={12} />
                        </a>
                      )}
                      {conf.website_submittion_url && (
                        <a
                          href={conf.website_submittion_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="zd-link"
                        >
                          <Send size={14} /> Submit Paper <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
