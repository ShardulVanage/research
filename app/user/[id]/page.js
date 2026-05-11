"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { PublicationCard } from "@/components/publication-card"
import { ExpandableText } from "@/components/profile/expandable-text"
import {
  getUserById,
  getUserPublications,
  getEducation,
  getExperiences,
  getCertifications,
  getProjects,
  getSkills,
  getImageUrl,
} from "@/lib/pocketbase"
import { Mail, Globe, Building, MapPin, BookOpen, Eye, Users, Award, Loader2, Briefcase, GraduationCap, Award as AwardIcon, Code2 } from "lucide-react"

export default function UserProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [publications, setPublications] = useState([])
  const [education, setEducation] = useState([])
  const [experiences, setExperiences] = useState([])
  const [certifications, setCertifications] = useState([])
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [publicationsLoading, setPublicationsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (id) {
      loadUserProfile()
      loadAllData()
    }
  }, [id])

  const loadUserProfile = async () => {
    setLoading(true)
    const result = await getUserById(id)

    if (result.success) {
      setUser(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const loadAllData = async () => {
    setPublicationsLoading(true)
    try {
      const [pubResult, eduResult, expResult, certResult, projResult, skillResult] = await Promise.all([
        getUserPublications(id),
        getEducation(id),
        getExperiences(id),
        getCertifications(id),
        getProjects(id),
        getSkills(id),
      ])

      if (pubResult.success) setPublications(pubResult.data.items)
      if (eduResult.success) setEducation(eduResult.data.items || [])
      if (expResult.success) setExperiences(expResult.data.items || [])
      if (certResult.success) setCertifications(certResult.data.items || [])
      if (projResult.success) setProjects(projResult.data.items || [])
      if (skillResult.success) setSkills(skillResult.data.items || [])
    } catch (err) {
      console.error("Error loading data:", err)
    }
    setPublicationsLoading(false)
  }

  const stats = {
    publications: publications.length,
    totalViews: publications.reduce((sum, pub) => sum + (pub.views_count || 0), 0),
    totalCitations: publications.reduce((sum, pub) => sum + (pub.citations_count || 0), 0),
    totalDownloads: publications.reduce((sum, pub) => sum + (pub.downloads_count || 0), 0),
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {error || "The user profile you're looking for doesn't exist."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden">
            {/* Banner Image */}
            <div className="relative w-full h-48 bg-gradient-to-r from-cyan-400 to-blue-500 overflow-hidden">
              {user.profile_banner ? (
                <img
                  src={getImageUrl(user, user.profile_banner) || "/placeholder.svg"}
                  alt="Profile Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
              )}
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:gap-6 -mt-16 mb-6 relative z-10">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user, user.avatar) || "/placeholder.svg"}
                      alt={user.name}
                      className="w-48 h-48 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-cyan-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                      <span className="text-4xl font-bold text-white">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
              </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name || user.email}</h1>

                  {user.position && user.institution && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                      {user.position} at {user.institution}
                    </p>
                  )}

                  {user.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
                      <MapPin size={16} />
                      {user.location}
                    </p>
                  )}

                  {/* Contact Info Row */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {user.email}
                    </span>
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Globe size={14} />
                        Website
                      </a>
                    )}
                  </div>

                  {/* Researcher Badge */}
                  {user.is_scientific && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                        ✓ Scientific Researcher
                      </span>
                    </div>
                  )}
                </div>

              {/* Bio Section */}
              {user.bio && (
                <div className="mt-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <ExpandableText text={user.bio} maxLength={250} />
                </div>
              )}

              {/* Professional Details Grid */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                {user.company && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Company</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user.company}</p>
                  </div>
                )}
                {user.department && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Department</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user.department}</p>
                  </div>
                )}
                {user.institution && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Institution</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user.institution}</p>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publications}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Publications</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
                    <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCitations}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Citations</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-2">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                </div>
              </div>
            </div>
          </div>

          {/* Publications Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Publications</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {publications.length} publication{publications.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-6">
              {publicationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading publications...</span>
                </div>
              ) : publications.length > 0 ? (
                <div className="space-y-6">
                  {publications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">This researcher hasn't published any work yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Experience Section */}
          {experiences.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={24} />
                  Experience
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                    {exp.description && (
                      <div className="mt-2">
                        <ExpandableText text={exp.description} maxLength={150} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap size={24} />
                  Education
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {education.map((edu) => (
                  <div key={edu.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{edu.school}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {edu.degree}
                      {edu.field_of_study && ` in ${edu.field_of_study}`}
                    </p>
                    {edu.description && (
                      <div className="mt-2">
                        <ExpandableText text={edu.description} maxLength={150} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {certifications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AwardIcon size={24} />
                  Certifications
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {certifications.map((cert) => (
                  <div key={cert.id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Code2 size={24} />
                  Projects
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{proj.title}</h3>
                    {proj.description && (
                      <div className="mt-2">
                        <ExpandableText text={proj.description} maxLength={150} />
                      </div>
                    )}
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm inline-block mt-2"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300 rounded-full text-sm font-medium"
                    >
                      {skill.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
