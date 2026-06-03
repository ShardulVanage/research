"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Edit3, Save, X, MapPin, Mail, Globe, Briefcase, Crown, Star, Zap, Shield } from "lucide-react"
import { getImageUrl, updateUserProfile, checkUserMembership } from "@/lib/pocketbase"
import { ExpandableText } from "./expandable-text"

// ── Membership Badge ──────────────────────────────────────────────────────────
function MembershipBadge({ plan }) {
   const configs = {
    trial: {
      label: "Zep Member",
      icon: <Crown size={11} />,
      className: "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-gray-400/40",
    },
    basic: {
      label: "Zep Member",
      icon: <Star size={11} />,
      className: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-400/40",
    },
    pro: {
      label: "Pro",
      icon: <Shield size={11} />,
      className: "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-400/40",
    },
    premium: {
      label: "Premium",
      icon: <Crown size={11} />,
      className: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-400/40",
    },
  }
  const config = configs[plan?.toLowerCase()] ?? configs.basic

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shadow-md tracking-wide uppercase ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ProfileHeader({ user, onUpdate }) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [membership, setMembership] = useState(null) // { isMember, data }
  const headerRef = useRef(null)

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    location: user?.location || "",
    bio: user?.bio || "",
    website: user?.website || "",
    position: user?.position || "",
    institution: user?.institution || "",
    department: user?.department || "",
    company: user?.company || "",
    is_scientific: user?.is_scientific || false,
    avatar: null,
    profile_banner: null,
  })

  // Fetch membership on mount / when user changes
  useEffect(() => {
    if (!user?.id) return
    checkUserMembership(user.id).then((result) => {
      if (result.success) {
        setMembership(result)
      }
    })
  }, [user?.id])

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target
    if ((name === "avatar" || name === "profile_banner") && files?.[0]) {
      setProfileData((prev) => ({ ...prev, [name]: files[0] }))
    } else if (type === "checkbox") {
      setProfileData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }))
    }
    setError("")
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const updateData = new FormData()
      Object.keys(profileData).forEach((key) => {
        if ((key === "avatar" || key === "profile_banner") && profileData[key]) {
          updateData.append(key, profileData[key])
        } else if (key === "is_scientific") {
          updateData.append(key, profileData[key])
        } else if (key !== "avatar" && key !== "profile_banner" && profileData[key] !== "") {
          updateData.append(key, profileData[key])
        }
      })

      const result = await updateUserProfile(user.id, updateData)
      if (result.success) {
        setEditMode(false)
        onUpdate?.()
        headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      } else {
        let errorMessage = result.error
        if (result.details?.data) {
          const fieldErrors = Object.entries(result.details.data)
            .map(([field, error]) => `${field}: ${error.message || error}`)
            .join(", ")
          errorMessage = `${result.error}. Details: ${fieldErrors}`
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    }
    setSaving(false)
  }

  const isMember = membership?.isMember
  const memberPlan = membership?.data?.plan

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
      ref={headerRef}
    >
      {/* ── Profile Banner ── */}
      <div className="relative h-48 bg-gradient-to-r from-cyan-400 to-blue-500 overflow-hidden group">
        {user?.profile_banner ? (
          <img
            src={getImageUrl(user, user.profile_banner)}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500" />
        )}

        {editMode && (
          <label className="absolute bottom-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-lg">
            <Camera size={16} className="text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Edit Banner</span>
            <input type="file" name="profile_banner" onChange={handleChange} accept="image/*" className="hidden" />
          </label>
        )}
      </div>

      {/* ── Profile Content ── */}
      <div className="px-6 pb-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Avatar + Edit Button row */}
        <div className="flex flex-col md:flex-row md:items-end md:gap-6 mb-6 -mt-24 relative z-10">
          {/* Avatar */}
          <div className="relative">
            {user?.avatar ? (
              <img
                src={getImageUrl(user, user.avatar)}
                alt={user.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 bg-cyan-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* ── Membership Badge — overlaid on avatar bottom-left ── */}
            {isMember && (
              <div className="absolute -bottom-2 -left-1 z-20">
                <MembershipBadge plan={memberPlan} />
              </div>
            )}

            {editMode && (
              <label className="absolute bottom-2 right-2 bg-cyan-500 text-white p-3 rounded-full cursor-pointer hover:bg-cyan-600 transition-colors shadow-lg z-50">
                <Camera size={18} />
                <input type="file" name="avatar" onChange={handleChange} accept="image/*" className="hidden" />
              </label>
            )}
          </div>

          {/* Edit / Save buttons */}
          <div className="flex gap-2 ml-auto">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ── Main Info ── */}
        {editMode ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline</label>
              <input
                type="text"
                name="headline"
                value={profileData.headline}
                onChange={handleChange}
                placeholder="e.g., PhD Researcher at University | Passionate about AI"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleChange}
                  placeholder="https://your-website.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={profileData.institution}
                  onChange={handleChange}
                  placeholder="e.g., MIT, Stanford University"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Biology"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={profileData.company}
                  onChange={handleChange}
                  placeholder="e.g., Google, Apple"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                <input
                  type="text"
                  name="position"
                  value={profileData.position}
                  onChange={handleChange}
                  placeholder="e.g., Senior Researcher, Lead Scientist"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="checkbox"
                name="is_scientific"
                id="is_scientific"
                checked={profileData.is_scientific}
                onChange={handleChange}
                className="rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="is_scientific" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                I am a scientific researcher
              </label>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            {/* Name + inline membership badge */}
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user?.name || user?.email}
              </h1>
              {isMember && <MembershipBadge plan={memberPlan} />}
            </div>

            {user?.headline && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{user.headline}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {user?.location && (
                <span className="flex items-center gap-2">
                  <MapPin size={14} />
                  {user.location}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Mail size={14} />
                {user?.email}
              </span>
              {user?.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <Globe size={14} />
                  Website
                </a>
              )}
            </div>

            {user?.bio && (
              <div className="mt-4">
                <ExpandableText text={user.bio} maxLength={200} />
              </div>
            )}
          </div>
        )}

        {/* ── Additional Info ── */}
        {!editMode && (
          <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {user?.institution && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Briefcase size={16} />
                <span className="font-medium">{user.institution}</span>
              </div>
            )}
            {user?.department && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Briefcase size={16} />
                <span>{user.department}</span>
              </div>
            )}
            {user?.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Briefcase size={16} />
                <span>{user.company}</span>
              </div>
            )}
            {user?.position && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Briefcase size={16} />
                <span>{user.position}</span>
              </div>
            )}
            {user?.is_scientific && (
              <div className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium">
                Scientific Researcher
              </div>
            )}
            {/* Membership expiry hint */}
            {isMember && membership?.data?.end_date && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 ml-auto">
                <Crown size={12} />
                Member until{" "}
                {new Date(membership.data.end_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}