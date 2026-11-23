import { getImageUrl } from "@/lib/pocketbase"

// Helpers for records from the `Conference` collection on the main
// (admin.zepresearch.com) PocketBase.

export function conferenceImage(conf) {
  if (!conf?.img) return null
  return conf.img.startsWith("http") ? conf.img : getImageUrl(conf, conf.img)
}

export function conferenceDate(conf) {
  if (!conf?.date) return null
  const d = new Date(conf.date.replace(" ", "T"))
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatConferenceDate(d) {
  return d
    ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Date TBA"
}

export function conferenceVenue(conf) {
  return conf?.Venue?.trim() || (conf?.format?.toLowerCase() === "online" ? "Online" : "Venue TBA")
}

export function conferenceRegisterUrl(conf) {
  return conf?.registration_url || conf?.websiteUrl || null
}

// Conference record linked to a conf_registration: the expanded relation, or a
// lookup by id in an already-loaded conference list.
export function registrationConference(reg, conferencesById) {
  const expanded = reg?.expand?.conference
  if (expanded) return Array.isArray(expanded) ? expanded[0] || null : expanded
  const id = Array.isArray(reg?.conference) ? reg.conference[0] : reg?.conference
  return (id && conferencesById?.get(id)) || null
}

// Conference date for a registration, falling back to the registration's conf_date.
export function registrationDate(reg, conf) {
  if (conf) {
    const d = conferenceDate(conf)
    if (d) return d
  }
  if (!reg?.conf_date) return null
  const d = new Date(reg.conf_date.replace(" ", "T"))
  return Number.isNaN(d.getTime()) ? null : d
}

export function isFutureConference(conf, now = new Date()) {
  const d = conferenceDate(conf)
  return !!d && d > now
}
