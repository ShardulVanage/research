"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { Trash2, Plus, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, ExternalLink } from "lucide-react"
import {
  getUserPublications,
  deletePublication,
  getEducation,
  getExperiences,
  getCertifications,
  getProjects,
  getSkills,
  updateUserProfile,
} from "@/lib/pocketbase"
import { ProfileHeader } from "@/components/profile/profile-header"
import { EducationSection } from "@/components/profile/education-section"
import { ExperienceSection } from "@/components/profile/experience-section"
import { CertificationsSection } from "@/components/profile/certifications-section"
import { ProjectsSection } from "@/components/profile/projects-section"
import { SkillsSection } from "@/components/profile/skills-section"
import { PublicationsSection } from "@/components/profile/publications-section"

export default function ProfilePage() {
  const { user } = useAuth()
  const [publications, setPublications] = useState([])
  const [education, setEducation] = useState([])
  const [experiences, setExperiences] = useState([])
  const [certifications, setCertifications] = useState([])
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [socialLinks, setSocialLinks] = useState(user?.social_links || {})
  const [newPlatform, setNewPlatform] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [savingSocialLinks, setSavingSocialLinks] = useState(false)

  const platforms = ["github", "linkedin", "twitter", "instagram", "facebook", "youtube", "portfolio", "other"]

  const loadAllData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [pubResult, eduResult, expResult, certResult, projResult, skillResult] = await Promise.all([
        getUserPublications(user.id),
        getEducation(user.id),
        getExperiences(user.id),
        getCertifications(user.id),
        getProjects(user.id),
        getSkills(user.id),
      ])

      if (pubResult.success) setPublications(pubResult.data.items || [])
      if (eduResult.success) setEducation(eduResult.data.items || [])
      if (expResult.success) setExperiences(expResult.data.items || [])
      if (certResult.success) setCertifications(certResult.data.items || [])
      if (projResult.success) setProjects(projResult.data.items || [])
      if (skillResult.success) setSkills(skillResult.data.items || [])
    } catch (err) {
      setError("Failed to load profile data")
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [user])

  const stats = {
    publications: publications.length,
    totalViews: publications.reduce((sum, pub) => sum + (pub.views_count || 0), 0),
    totalCitations: publications.reduce((sum, pub) => sum + (pub.citations_count || 0), 0),
    totalDownloads: publications.reduce((sum, pub) => sum + (pub.downloads_count || 0), 0),
  }

  const getSocialIcon = (platform) => {
    const iconProps = { size: 16, className: "flex-shrink-0" }
    switch (platform.toLowerCase()) {
      case "github":
        return <Github {...iconProps} />
      case "linkedin":
        return <Linkedin {...iconProps} />
      case "twitter":
        return <Twitter {...iconProps} />
      case "instagram":
        return <Instagram {...iconProps} />
      case "facebook":
        return <Facebook {...iconProps} />
      case "youtube":
        return <Youtube {...iconProps} />
      case "portfolio":
        return <ExternalLink {...iconProps} />
      default:
        return <ExternalLink {...iconProps} />
    }
  }

  const ensureAbsoluteUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    return "https://" + url
  }

  const isValidUrl = (url) => {
    try {
      // If URL doesn't start with http/https, add https:// for validation
      const urlToValidate = url.startsWith("http://") || url.startsWith("https://") ? url : "https://" + url
      new URL(urlToValidate)
      return true
    } catch {
      return false
    }
  }

  const handleDeletePublication = async (publicationId) => {
    if (!confirm("Are you sure you want to delete this publication? This action cannot be undone.")) {
      return
    }

    const result = await deletePublication(publicationId)
    if (result.success) {
      setPublications(publications.filter((pub) => pub.id !== publicationId))
    } else {
      setError("Failed to delete publication")
    }
  }

  const handleToggleOpenToWork = async () => {
    const result = await updateUserProfile(user.id, { open_to_work: !user.open_to_work })
    if (result.success) {
      loadAllData()
    } else {
      setError("Failed to update open to work status")
    }
  }

  const handleAddSocialLink = async () => {
    if (!newPlatform || !newUrl) {
      setError("Please enter both platform and URL")
      return
    }

    if (!isValidUrl(newUrl)) {
      setError("Please enter a valid URL (e.g., https://instagram.com/username or instagram.com/username)")
      return
    }

    const absoluteUrl = ensureAbsoluteUrl(newUrl)
    const updatedLinks = {
      ...socialLinks,
      [newPlatform]: absoluteUrl,
    }

    setSavingSocialLinks(true)
    const result = await updateUserProfile(user.id, { social_links: updatedLinks })
    setSavingSocialLinks(false)

    if (result.success) {
      setSocialLinks(updatedLinks)
      setNewPlatform("")
      setNewUrl("")
      setError("")
    } else {
      setError("Failed to add social link")
    }
  }

  const handleDeleteSocialLink = async (platform) => {
    const updatedLinks = { ...socialLinks }
    delete updatedLinks[platform]

    setSavingSocialLinks(true)
    const result = await updateUserProfile(user.id, { social_links: updatedLinks })
    setSavingSocialLinks(false)

    if (result.success) {
      setSocialLinks(updatedLinks)
      setError("")
    } else {
      setError("Failed to delete social link")
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Profile Header */}
          <ProfileHeader user={user} onUpdate={loadAllData} />

          {/* Open to Work Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Open to Work</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Let recruiters and colleagues know you're looking for opportunities
                </p>
              </div>
              <button
                onClick={handleToggleOpenToWork}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  user.open_to_work
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {user.open_to_work ? "🎯 Open to Work" : "Not Available"}
              </button>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Links</h3>
            </div>

            {/* Add Social Link Form */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Add a new social link</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">URL format: https://instagram.com/username or just instagram.com/username</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/username"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleAddSocialLink}
                  disabled={savingSocialLinks || !newPlatform || !newUrl}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Link
                </button>
              </div>
            </div>

            {/* Social Links List */}
            {Object.keys(socialLinks).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <div
                    key={platform}
                    className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                  >
                    <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                      {getSocialIcon(platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white capitalize text-sm">{platform}</p>
                      <a
                        href={ensureAbsoluteUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm truncate block"
                      >
                        {url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteSocialLink(platform)}
                      disabled={savingSocialLinks}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete social link"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 text-sm">No social links added yet. Add one above!</p>
              </div>
            )}
          </div>

          {/* Experience Section */}
          <ExperienceSection experiences={experiences} userId={user?.id} onUpdate={loadAllData} />

          {/* Education Section */}
          <EducationSection education={education} userId={user?.id} onUpdate={loadAllData} />

          {/* Skills Section */}
          <SkillsSection skills={skills} userId={user?.id} onUpdate={loadAllData} />

          {/* Certifications Section */}
          <CertificationsSection certifications={certifications} userId={user?.id} onUpdate={loadAllData} />

          {/* Projects Section */}
          <ProjectsSection projects={projects} userId={user?.id} onUpdate={loadAllData} />

          {/* Publications Section */}
          <PublicationsSection
            publications={publications}
            loading={false}
            stats={stats}
            onDeletePublication={handleDeletePublication}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
