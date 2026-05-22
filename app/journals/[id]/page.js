"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getJournalById, getImageUrl, submitPaperForm } from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"

export default function JournalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [journal, setJournal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    user: user?.id || "",
    author: "",
    journal_name: "",
    phone_number: "",
    email: "",
    country: "",
    co_author: "",
    paper_title: "",
    department: "",
    organization: "",
    file: null,
    message: "",
    status: "pending",
  })
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    const loadJournal = async () => {
      if (!params.id) return
      
      setLoading(true)
      const result = await getJournalById(params.id)
      if (result.success) {
        setJournal(result.data)
        setFormData(prev => ({
          ...prev,
          journal_name: result.data.title || ""
        }))
      } else {
        console.error("Failed to load journal:", result.error)
      }
      setLoading(false)
    }

    loadJournal()
  }, [params.id])

  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        user: user.id,
        author: user.name || "",
        email: user.email || ""
      }))
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || "" : value
    }))
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0] || null
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id) {
      setSubmitMessage("Please log in to submit a paper")
      return
    }

    setSubmitting(true)
    try {
      const submitData = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === "file" && formData[key]) {
          submitData.append(key, formData[key])
        } else if (key !== "file") {
          submitData.append(key, formData[key])
        }
      })

      const result = await submitPaperForm(submitData)
      
      if (result.success) {
        // Send admin notification email
        try {
          const emailResponse = await fetch('/api/notify-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              author: formData.author,
              email: formData.email,
              paper_title: formData.paper_title,
              journal_name: formData.journal_name,
              organization: formData.organization,
              department: formData.department,
              country: formData.country,
              co_author: formData.co_author,
              phone_number: formData.phone_number,
              message: formData.message,
              submissionId: result.data?.id || 'N/A',
              fileField: result.data?.file || null
            })
          })
          
          if (!emailResponse.ok) {
            const errorData = await emailResponse.json()
            console.error('Email API error:', errorData)
          } else {
            const emailData = await emailResponse.json()
            console.log('Admin email sent successfully:', emailData)
          }
        } catch (emailError) {
          console.error('Failed to send admin notification:', emailError)
        }

        setSubmitMessage("Thank you for your submission! Our team will follow up within 48 hours.")
        setFormData({
          user: user.id,
          author: user.name || "",
          journal_name: journal?.title || "",
          phone_number: "",
          email: user.email || "",
          country: "",
          co_author: "",
          paper_title: "",
          department: "",
          organization: "",
          file: null,
          message: "",
          status: "pending",
        })
        setTimeout(() => {
          setSubmitMessage("")
        }, 5000)
      } else {
        setSubmitMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setSubmitMessage(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!journal) {
    return (
      <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Journal not found</h1>
        <Button onClick={() => router.push("/journals")}>Back to Journals</Button>
      </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-12 px-4 sm:px-6 lg:px-8">
        <Navbar></Navbar>
      <div className="max-w-7xl mx-auto pt-12">
        <Button
          onClick={() => router.push("/journals")}
          variant="outline"
          className="mb-8"
        >
          ← Back to Journals
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Images and Details */}
          <div className="flex flex-col items-center justify-start gap-4">
            {journal.img && (
              <div className="w-full">
                <img
                  src={journal.img}
                  alt={journal.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
            {journal.imgs && (
              <div className="w-full">
                <img
                  src={getImageUrl(journal, journal.imgs)}
                  alt={journal.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Journal Details Below Images */}
            <div className="w-full mt-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {journal.title}
              </h1>

              {journal.issncode && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    ISSN Code
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white font-mono">
                    {journal.issncode}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {journal.indexType && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Index Type
                    </h3>
                    <div className="flex gap-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                        {journal.indexType}
                      </span>
                    </div>
                  </div>
                )}

                {journal.by_zep && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Status
                    </h3>
                    <div className="flex gap-2">
                      <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                        Recognized by ZEP
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {journal.web_url && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Website
                  </h3>
                  <a
                    href={journal.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-lg break-all"
                  >
                    {journal.web_url}
                  </a>
                </div>
              )}

              {journal.created && (
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Added on {new Date(journal.created).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Submission Form */}
          <div className="flex flex-col justify-start">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Submit Your Paper</h2>
              
              {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg ${submitMessage.includes("Thank you") ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"}`}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author Name *
                    </label>
                    <Input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Your country"
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization
                    </label>
                    <Input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="Your organization"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <Input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Your department"
                    />
                  </div>

                  {/* Paper Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paper Title *
                    </label>
                    <Input
                      type="text"
                      name="paper_title"
                      value={formData.paper_title}
                      onChange={handleInputChange}
                      placeholder="Your paper title"
                      required
                    />
                  </div>

                  {/* Co-Authors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Co-Authors (comma separated)
                    </label>
                    <Input
                      type="text"
                      name="co_author"
                      value={formData.co_author}
                      onChange={handleInputChange}
                      placeholder="Co-author 1, Co-author 2, ..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paper File (PDF) *
                    </label>
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      required
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message / Additional Notes
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Any additional information or message..."
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : "Submit Paper"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      
      </div>
    </div>
    </ProtectedRoute>
  )
}
