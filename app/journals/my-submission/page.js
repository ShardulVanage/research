"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserSubmissions, getImageUrl } from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

function MySubmissionContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadSubmissions = async () => {
      setLoading(true)
      const result = await getUserSubmissions(user.id, 1, 50)
      if (result.success) {
        setSubmissions(result.data.items || [])
      }
      setLoading(false)
    }

    loadSubmissions()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-12 px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-12">
        <div className="mb-8">
          <Button
            onClick={() => router.push("/journals")}
            variant="outline"
            className="mb-4"
          >
            ← Back to Journals
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Submissions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your paper submissions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              You haven't submitted any papers yet.
            </p>
            <Button onClick={() => router.push("/journals")}>
              Browse Journals
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Paper Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {submission.paper_title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Journal:</span> {submission.journal_name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Author:</span> {submission.author}
                      </p>
                      {submission.co_author && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Co-Authors:</span> {submission.co_author}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {submission.organization && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Organization</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {submission.organization}
                          </p>
                        </div>
                      )}
                      {submission.department && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Department</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {submission.department}
                          </p>
                        </div>
                      )}
                      {submission.country && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Country</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {submission.country}
                          </p>
                        </div>
                      )}
                      {submission.email && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-white font-medium break-all">
                            {submission.email}
                          </p>
                        </div>
                      )}
                    </div>

                    {submission.message && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Message
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {submission.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Submission Date
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(submission.created).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      {submission.file && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Status
                          </p>
                          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            File Uploaded
                          </span>
                        </div>
                      )}
                    </div>

                    {submission.file && (
                      <Button
                        onClick={() => window.open(getImageUrl(submission, submission.file))}
                        variant="outline"
                        className="mt-4"
                      >
                        View Paper
                      </Button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submission ID: {submission.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MySubmissionPage() {
  return (
    <ProtectedRoute>
      <MySubmissionContent />
    </ProtectedRoute>
  )
}
