"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardData } from "@/contexts/dashboard-context"
import { getImageUrl } from "@/lib/pocketbase"
import {
  conferenceImage as confImage,
  conferenceDate,
  conferenceVenue,
  conferenceRegisterUrl,
  formatConferenceDate as formatDate,
  isFutureConference,
  registrationConference,
  registrationDate,
} from "@/lib/conference-utils"
import RequestCertificateButton from "@/components/dashboard/RequestCertificateButton"
import RefreshDashboardButton from "@/components/dashboard/RefreshDashboardButton"
import {
  CalendarDays,
  BookOpen,
  MapPin,
  Download,
  FileText,
  Award,
  ArrowRight,
  ClipboardList,
  Send,
  Star,
  Zap,
  Headphones,
  FolderOpen,
  Eye,
  BookMarked,
} from "lucide-react"

// Unsplash imagery
const HERO_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=80"
const CITY_IMGS = [
  "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=70", // Singapore
  "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=70", // Kuala Lumpur
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=70", // Bangkok
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=70", // Tokyo
]
const HIGHLIGHT_IMGS = [
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=70",
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { conferences, registrations, publications, loading, initializeDashboardData } =
    useDashboardData()
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (!user) return
    initializeDashboardData(user.id)
  }, [user, initializeDashboardData])

  const userName = user?.name || user?.email?.split("@")[0] || "User"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const avatarUrl = user?.avatar ? getImageUrl(user, user.avatar) : null

  const now = new Date()
  // Linked Conference record: expanded relation, or matched by id from the conference list
  const conferencesById = new Map(conferences.map((c) => [c.id, c]))
  const regConference = (reg) => registrationConference(reg, conferencesById)
  const regDate = (reg) => registrationDate(reg, regConference(reg))
  const upcomingCount = registrations.filter((r) => {
    const d = regDate(r)
    return d && d > now
  }).length

  const registeredConfIds = new Set(registrations.map((r) => r.conference).filter(Boolean))
  const futureConferences = conferences.filter((c) => isFutureConference(c, now))
  const featured =
    futureConferences.find((c) => !registeredConfIds.has(c.id)) || futureConferences[0]
  const featuredUrl = conferenceRegisterUrl(featured)
  const highlights = futureConferences.slice(0, 4)
  const activeSlide = highlights.length ? slide % highlights.length : 0
  const current = highlights[activeSlide]

  return (
    <div className="zd">
      {/* ===== Hero ===== */}
      <section className="zd-hero fade-in-up" style={{ backgroundImage: `url(${HERO_IMG})` }}>
        <div className="zd-hero-overlay" />
        <div className="zd-hero-content">
          <h1>
            Welcome to ZepResearch
            <br />
            Conference Portal!
          </h1>
          <p>
            Hi {userName}, your one-stop access to all your conference information,
            resources and more.
          </p>
        </div>
        <div className="zd-hero-tag">
          Learn • Share • Grow
          <span />
        </div>
      </section>

      {/* ===== Main grid ===== */}
      <div className="zd-grid fade-in-up fade-in-up-delay-1">
        {/* My Conferences */}
        <section className="zd-card zd-conferences">
          <header className="zd-card-head">
            <h2>
              <span className="zd-head-icon blue"><CalendarDays size={18} /></span>
              My Conferences
            </h2>
            <div className="zd-head-actions">
              <RefreshDashboardButton />
              <Link href="/dashboard/conferences" className="zd-link">
                View All <ArrowRight size={15} />
              </Link>
            </div>
          </header>

          {loading ? (
            <div className="zd-conf-list">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 128, borderRadius: 14 }} />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><ClipboardList size={28} /></div>
              <h3>No registrations yet</h3>
              <p>Register for a conference to see it here and access your resources.</p>
              <Link href="/dashboard/future-conferences" className="zd-btn" style={{ marginTop: 12 }}>
                Browse Future Conferences
              </Link>
            </div>
          ) : (
            <div className="zd-conf-list">
              {registrations.slice(0, 3).map((reg, index) => {
                const conf = regConference(reg)
                const confDate = regDate(reg)
                const isUpcoming = confDate && confDate > now
                const place = conf
                  ? conferenceVenue(conf)
                  : reg.city
                    ? `${reg.city}${reg.country ? `, ${reg.country}` : ""}`
                    : "Online"
                const confTitle = conf
                  ? `${conf.short_form || conf.title}${confDate ? ` ${confDate.getFullYear()}` : ""}`
                  : reg.ticket_name || "Conference Registration"
                const confImg = confImage(conf) || CITY_IMGS[index % CITY_IMGS.length]
                const tiles = [
                  { label: "Certificate", icon: Download, href: "/dashboard/certificates", tone: "blue" },
                  {
                    label: "Proceedings",
                    icon: FileText,
                    href: "https://www.zepresearch.com/past-conferences-proceedings",
                    tone: "purple",
                    external: true,
                  },
                  { label: "Submissions", icon: Send, href: "/dashboard/conference-submissions", tone: "green" },
                  { label: "Publications", icon: BookOpen, href: "/dashboard/publications", tone: "orange" },
                  { label: "Documents", icon: FolderOpen, href: "/dashboard/documents", tone: "indigo" },
                  { label: "Details", icon: Eye, href: `/dashboard/registrations/${reg.id}`, tone: "teal" },
                ]

                return (
                  <article key={reg.id} className="zd-conf">
                    <div
                      className="zd-conf-img"
                      style={{ backgroundImage: `url(${confImg})` }}
                    />
                    <div className="zd-conf-body">
                      <div className="zd-conf-top">
                        <div>
                          <div className="zd-conf-title">
                            <h3 title={conf?.title}>{confTitle}</h3>
                            <span className={`zd-pill ${isUpcoming ? "registered" : "attended"}`}>
                              {isUpcoming ? "Registered" : "Attended"}
                            </span>
                          </div>
                          <p className="zd-conf-meta">
                            <MapPin size={13} /> {place} · {formatDate(confDate)}
                          </p>
                        </div>
                        {!isUpcoming && (
                          <RequestCertificateButton registrationId={reg.id} conferenceEnded />
                        )}
                      </div>
                      <div className="zd-tiles">
                        {tiles.map(({ label, icon: Icon, href, tone, external }) =>
                          external ? (
                            <a
                              key={label}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="zd-tile"
                            >
                              <Icon size={18} className={`zd-tone-${tone}`} />
                              <span>{label}</span>
                            </a>
                          ) : (
                            <Link key={label} href={href} className="zd-tile">
                              <Icon size={18} className={`zd-tone-${tone}`} />
                              <span>{label}</span>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="zd-side">
          {/* Profile */}
          <section className="zd-card zd-profile">
            <div className="zd-profile-top">
              <div className="zd-avatar">
                {avatarUrl ? <img src={avatarUrl} alt={userName} /> : initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3>{userName}</h3>
                <p>{user?.email}</p>
                <Link href="/profile" className="zd-link">
                  View Profile <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <ul className="zd-stats">
              <li>
                <CalendarDays size={18} className="zd-tone-blue" />
                Total Conferences <strong>{registrations.length}</strong>
              </li>
              <li>
                <Star size={18} className="zd-tone-blue" fill="currentColor" />
                Upcoming <strong>{upcomingCount}</strong>
              </li>
              <li>
                <BookMarked size={18} className="zd-tone-blue" />
                Publications <strong>{publications.length}</strong>
              </li>
            </ul>
          </section>

          {/* Future Conferences */}
          <section className="zd-card zd-future">
            <header className="zd-card-head small">
              <h2>
                <Star size={18} className="zd-tone-purple" fill="currentColor" />
                Future Conferences
              </h2>
              <Link href="/dashboard/future-conferences" className="zd-link">
                View All <ArrowRight size={14} />
              </Link>
            </header>
            {loading ? (
              <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
            ) : featured ? (
              <>
                <div className="zd-future-row">
                  <div
                    className="zd-future-img"
                    style={{ backgroundImage: `url(${confImage(featured) || CITY_IMGS[3]})` }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <h4 title={featured.title}>
                      {featured.short_form || featured.title || "Upcoming Conference"}
                    </h4>
                    <p><CalendarDays size={12} /> {formatDate(conferenceDate(featured))}</p>
                    <p><MapPin size={12} /> {conferenceVenue(featured)}</p>
                  </div>
                </div>
                {registeredConfIds.has(featured.id) ? (
                  <span className="zd-btn purple" aria-disabled="true" style={{ opacity: 0.7 }}>
                    Already Registered
                  </span>
                ) : featuredUrl ? (
                  <a href={featuredUrl} target="_blank" rel="noopener noreferrer" className="zd-btn purple">
                    Register Now
                  </a>
                ) : (
                  <Link href="/dashboard/future-conferences" className="zd-btn purple">View Details</Link>
                )}
              </>
            ) : (
              <p className="zd-muted">New conferences will be announced soon.</p>
            )}
          </section>
        </div>
      </div>

      {/* ===== Bottom row ===== */}
      <div className="zd-bottom fade-in-up fade-in-up-delay-2">
        {/* Quick Access */}
        <section className="zd-card">
          <header className="zd-card-head small">
            <h2><Zap size={18} className="zd-tone-orange" fill="currentColor" /> Quick Access</h2>
          </header>
          <div className="zd-quick">
            <Link href="/dashboard/publications" className="zd-quick-item q-purple">
              <BookOpen size={22} /> Publications
            </Link>
            <Link href="/dashboard/conference-submissions" className="zd-quick-item q-green">
              <Send size={22} /> Submit Paper
            </Link>
            <Link href="/dashboard/certificates" className="zd-quick-item q-orange">
              <Award size={22} /> Certificates
            </Link>
            <Link href="/dashboard/support" className="zd-quick-item q-blue">
              <Headphones size={22} /> Support
            </Link>
          </div>
        </section>

        {/* Conference Highlights */}
        <section className="zd-card">
          <header className="zd-card-head small">
            <h2><Star size={18} className="zd-tone-orange" fill="currentColor" /> Conference Highlights</h2>
            <Link href="/dashboard/future-conferences" className="zd-link">
              View All <ArrowRight size={14} />
            </Link>
          </header>
          <div className="zd-highlight">
            <div
              className="zd-highlight-img"
              style={{
                backgroundImage: `url(${(current && confImage(current)) || HIGHLIGHT_IMGS[activeSlide % HIGHLIGHT_IMGS.length]})`,
              }}
            />
            <div>
              <h4>{current?.title || "Our International Conferences"}</h4>
              <p>
                {current?.description?.trim() ||
                  "Relive the best moments from our international conferences and see what's coming next."}
              </p>
              {current?.websiteUrl ? (
                <a href={current.websiteUrl} target="_blank" rel="noopener noreferrer" className="zd-link">
                  Explore Conference <ArrowRight size={14} />
                </a>
              ) : (
                <Link href="/dashboard/conferences" className="zd-link">
                  Explore Conferences <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
          {highlights.length > 1 && (
            <div className="zd-dots">
              {highlights.map((c, i) => (
                <button
                  key={c.id}
                  className={i === activeSlide ? "active" : ""}
                  onClick={() => setSlide(i)}
                  aria-label={`Show highlight ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Need Help */}
        <section className="zd-card zd-help">
          <h2><Headphones size={20} className="zd-tone-blue" /> Need Help?</h2>
          <p>Our support team is here to help you with any queries.</p>
          <Link href="/dashboard/support" className="zd-btn">
            Contact Support <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  )
}
