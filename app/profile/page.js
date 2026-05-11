"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import {
  getUserPublications,
  deletePublication,
  getEducation,
  getExperiences,
  getCertifications,
  getProjects,
  getSkills,
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
