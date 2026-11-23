"use client"

import { createContext, useContext, useState, useEffect } from "react"
import pb from "@/lib/pocketbase"

const DashboardContext = createContext({})

export const useDashboardData = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardProvider")
  }
  return context
}

// Cache keys for sessionStorage
const CACHE_KEYS = {
  CONFERENCES: "dashboard_conferences",
  REGISTRATIONS: "dashboard_registrations",
  PUBLICATIONS: "dashboard_publications",
  MEMBERSHIP: "dashboard_membership",
  CONFERENCE_SUBMISSIONS: "dashboard_conference_submissions",
  JOURNAL_SUBMISSIONS: "dashboard_journal_submissions",
  CACHE_TIMESTAMP: "dashboard_cache_timestamp",
  SESSION_ID: "dashboard_session_id",
}

export const DashboardProvider = ({ children }) => {
  const [conferences, setConferences] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [publications, setPublications] = useState([])
  const [membership, setMembership] = useState(null)
  const [conferenceSubmissions, setConferenceSubmissions] = useState([])
  const [journalSubmissions, setJournalSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Initialize session detection on mount
  useEffect(() => {
    // Generate a unique session ID
    const generateSessionId = () => Math.random().toString(36).substring(7)
    const currentSessionId = generateSessionId()
    const storedSessionId = sessionStorage.getItem(CACHE_KEYS.SESSION_ID)

    // If session ID changed, it means page was reloaded - clear cache
    if (storedSessionId !== currentSessionId) {
      sessionStorage.setItem(CACHE_KEYS.SESSION_ID, currentSessionId)
      // Clear all cache on page reload
      sessionStorage.removeItem(CACHE_KEYS.CONFERENCES)
      sessionStorage.removeItem(CACHE_KEYS.REGISTRATIONS)
      sessionStorage.removeItem(CACHE_KEYS.PUBLICATIONS)
      sessionStorage.removeItem(CACHE_KEYS.MEMBERSHIP)
    }
  }, [])

  // Load cached data from sessionStorage
  const loadFromCache = () => {
    try {
      const cached = {
        conferences: JSON.parse(sessionStorage.getItem(CACHE_KEYS.CONFERENCES)) || [],
        registrations: JSON.parse(sessionStorage.getItem(CACHE_KEYS.REGISTRATIONS)) || [],
        publications: JSON.parse(sessionStorage.getItem(CACHE_KEYS.PUBLICATIONS)) || [],
        membership: JSON.parse(sessionStorage.getItem(CACHE_KEYS.MEMBERSHIP)) || null,
        conferenceSubmissions: JSON.parse(sessionStorage.getItem(CACHE_KEYS.CONFERENCE_SUBMISSIONS)) || [],
        journalSubmissions: JSON.parse(sessionStorage.getItem(CACHE_KEYS.JOURNAL_SUBMISSIONS)) || [],
      }
      return cached
    } catch (err) {
      console.error("Error loading from cache:", err)
      return null
    }
  }

  // Save data to sessionStorage
  const saveToCache = (data) => {
    try {
      sessionStorage.setItem(CACHE_KEYS.CONFERENCES, JSON.stringify(data.conferences))
      sessionStorage.setItem(CACHE_KEYS.REGISTRATIONS, JSON.stringify(data.registrations))
      sessionStorage.setItem(CACHE_KEYS.PUBLICATIONS, JSON.stringify(data.publications))
      sessionStorage.setItem(CACHE_KEYS.MEMBERSHIP, JSON.stringify(data.membership))
      sessionStorage.setItem(CACHE_KEYS.CONFERENCE_SUBMISSIONS, JSON.stringify(data.conferenceSubmissions))
      sessionStorage.setItem(CACHE_KEYS.JOURNAL_SUBMISSIONS, JSON.stringify(data.journalSubmissions))
      sessionStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, new Date().toISOString())
    } catch (err) {
      console.error("Error saving to cache:", err)
    }
  }

  // Fetch fresh data from PocketBase
  const fetchDashboardData = async (userId) => {
    setLoading(true)
    try {
      const data = {
        conferences: [],
        registrations: [],
        publications: [],
        membership: null,
        conferenceSubmissions: [],
        journalSubmissions: [],
      }

      // Check if user is authenticated
      if (!userId) {
        console.error("User ID is missing - user may not be authenticated")
        setLoading(false)
        return
      }

      // Fetch conferences from the main (admin.zepresearch.com) PocketBase, soonest first
      data.conferences = await pb
        .collection("Conference")
        .getFullList({ sort: "date" })
        .catch((err) => {
          console.error("Error fetching conferences:", err)
          return []
        })

      // Fetch user's registrations, with the linked Conference record expanded
      const regsResult = await pb
        .collection("conf_registration")
        .getList(1, 50, {
          filter: pb.filter("user = {:userId}", { userId }),
          sort: "-created",
          expand: "conference",
        })
        .catch((err) => {
          console.error("Error fetching registrations:", err)
          return { items: [], totalItems: 0 }
        })
      data.registrations = regsResult.items || []

      // Fetch publications
      const pubsResult = await pb
        .collection("publications")
        .getList(1, 50, {
          filter: `user = "${userId}"`,
          sort: "-created",
        })
        .catch((err) => {
          console.error("Error fetching publications:", err)
          return { items: [], totalItems: 0 }
        })
      data.publications = pubsResult.items || []

      // Fetch membership
      const membershipResult = await pb
        .collection("membership")
        .getList(1, 1, {
          filter: `user = "${userId}"`,
          sort: "-created",
        })
        .catch((err) => {
          console.error("Error fetching membership:", err)
          return { items: [] }
        })
      data.membership = membershipResult.items?.[0] || null

      // Fetch conference submissions
      const confSubResult = await pb
        .collection("conf_paper_submission_all")
        .getList(1, 50, {
          filter: `user = "${userId}"`,
          expand: "conference",
        })
        .catch((err) => {
          console.error("Error fetching conference submissions:", err.message, err)
          return { items: [], totalItems: 0 }
        })
      data.conferenceSubmissions = confSubResult.items || []
      console.log("Conference submissions fetched:", data.conferenceSubmissions)

      // Fetch journal submissions
      const journalSubResult = await pb
        .collection("conf_paper_submission_all")
        .getList(1, 50, {
          filter: `user = "${userId}"`,
          expand: "conference",
        })
        .catch((err) => {
          console.error("Error fetching journal submissions:", err.message, err)
          return { items: [], totalItems: 0 }
        })
      data.journalSubmissions = journalSubResult.items || []

      // Update state and cache
      setConferences(data.conferences)
      setRegistrations(data.registrations)
      setPublications(data.publications)
      setMembership(data.membership)
      setConferenceSubmissions(data.conferenceSubmissions)
      setJournalSubmissions(data.journalSubmissions)
      saveToCache(data)
      setDataLoaded(true)
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Initialize data - check cache first, then fetch if needed
  const initializeDashboardData = (userId) => {
    if (dataLoaded) return // Already loaded in this session

    const cached = loadFromCache()
    if (cached && (cached.conferences.length > 0 || cached.registrations.length > 0)) {
      // Use cached data
      setConferences(cached.conferences)
      setRegistrations(cached.registrations)
      setPublications(cached.publications)
      setMembership(cached.membership)
      setConferenceSubmissions(cached.conferenceSubmissions)
      setJournalSubmissions(cached.journalSubmissions)
      setDataLoaded(true)
      setLoading(false)
    } else {
      // No cache, fetch fresh data
      fetchDashboardData(userId)
    }
  }

  // Manually refetch data (for refresh button, etc.)
  const refreshData = (userId) => {
    // Clear cache and fetch fresh data
    sessionStorage.removeItem(CACHE_KEYS.CONFERENCES)
    sessionStorage.removeItem(CACHE_KEYS.REGISTRATIONS)
    sessionStorage.removeItem(CACHE_KEYS.PUBLICATIONS)
    sessionStorage.removeItem(CACHE_KEYS.MEMBERSHIP)
    sessionStorage.removeItem(CACHE_KEYS.CONFERENCE_SUBMISSIONS)
    sessionStorage.removeItem(CACHE_KEYS.JOURNAL_SUBMISSIONS)
    setDataLoaded(false)
    fetchDashboardData(userId)
  }

  const value = {
    conferences,
    registrations,
    publications,
    membership,
    conferenceSubmissions,
    journalSubmissions,
    loading,
    dataLoaded,
    initializeDashboardData,
    refreshData,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}
