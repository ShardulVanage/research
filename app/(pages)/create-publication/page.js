"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { createPublication } from "@/lib/pocketbase"
import { Save, Upload, Calendar, FileText, Globe, Lock } from "lucide-react"
import { CoAuthorManager } from "@/components/co-author-manager"
import { FileManager } from "@/components/file-manager"
import { createCoAuthor, createPublicationFile } from "@/lib/pocketbase"

export default function CreatePublicationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [coAuthors, setCoAuthors] = useState([])
  const [files, setFiles] = useState([])

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    abstract: "",
    publication_date: "",
    doi: "",
    journal: "",
    conference: "",
    volume: "",
    issue: "",
    pages: "",
    publisher: "",
    keywords: "",
    public: true,
    preview_img: [], // Change to array
  })

  const publicationTypes = [
    "Article",
    "Book",
    "Chapter",
    "Code",
    "Conference Paper",
    "Cover Page",
    "Data",
    "Experiment Findings",
    "Method",
    "Negative Results",
    "Patent",
    "Poster",
    "Preprint",
    "Presentation",
    "Raw Data",
    "Research Proposal",
    "Technical Report",
    "Thesis",
  ]

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === "file" && name === "preview_img") {
      // Handle multiple files
      const fileArray = Array.from(files)
      setFormData((prev) => ({ ...prev, [name]: fileArray }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const publicationData = new FormData()

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          if (key === "preview_img" && formData[key].length > 0) {
            // Add multiple preview images
            formData[key].forEach((file) => {
              publicationData.append(key, file)
            })
          } else if (key !== "preview_img") {
            publicationData.append(key, formData[key])
          }
        }
      })

      // Add user ID
      publicationData.append("user", user.id)

      // Initialize counts
      publicationData.append("views_count", 0)
      publicationData.append("downloads_count", 0)
      publicationData.append("citations_count", 0)

      const result = await createPublication(publicationData)

      if (result.success) {
        const publicationId = result.data.id

        // Create co-authors
        for (const coAuthor of coAuthors) {
          await createCoAuthor({
            ...coAuthor,
            publication: publicationId,
          })
        }

        // Create publication files
        for (const file of files) {
          const fileData = new FormData()
          fileData.append("publication", publicationId)
          fileData.append("file", file.file)
          fileData.append("file_type", file.file_type)
          fileData.append("visibility", file.visibility)
          fileData.append("version", file.version)
          fileData.append("description", file.description)

          await createPublicationFile(fileData)
        }

        router.push(`/publication/${publicationId}`)
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

    setLoading(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Publication</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Share your research with the scientific community</p>
            </div>

            {error && (
              <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} />
                  Basic Information
                </h3>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter publication title"
                  />
                </div>

                {/* Type and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publication Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select type</option>
                      {publicationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publication Date
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="date"
                        name="publication_date"
                        value={formData.publication_date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Abstract */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abstract *</label>
                  <textarea
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Provide a detailed abstract of your publication..."
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords</label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter keywords separated by commas"
                  />
                </div>
              </div>

              {/* Publication Details */}
              <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Publication Details</h3>

                {/* DOI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DOI</label>
                  <input
                    type="text"
                    name="doi"
                    value={formData.doi}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="10.1000/xyz123"
                  />
                </div>

                {/* Journal/Conference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Journal</label>
                    <input
                      type="text"
                      name="journal"
                      value={formData.journal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Journal name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conference
                    </label>
                    <input
                      type="text"
                      name="conference"
                      value={formData.conference}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Conference name"
                    />
                  </div>
                </div>

                {/* Volume, Issue, Pages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volume</label>
                    <input
                      type="text"
                      name="volume"
                      value={formData.volume}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Volume"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue</label>
                    <input
                      type="text"
                      name="issue"
                      value={formData.issue}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pages</label>
                    <input
                      type="text"
                      name="pages"
                      value={formData.pages}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="1-10"
                    />
                  </div>
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Publisher name"
                  />
                </div>
              </div>

              {/* Media & Visibility */}
              <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Media & Visibility</h3>

                {/* Preview Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      name="preview_img"
                      onChange={handleChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="preview-upload"
                    />
                    <label htmlFor="preview-upload" className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                      <br />
                      <span className="text-xs">PNG, JPG, GIF up to 5MB each (multiple files allowed)</span>
                    </label>
                    {formData.preview_img.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-900 dark:text-white mb-2">
                          Selected {formData.preview_img.length} image(s):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.preview_img.map((file, index) => (
                            <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {file.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="public"
                      checked={formData.public}
                      onChange={handleChange}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      {formData.public ? <Globe size={16} /> : <Lock size={16} />}
                      Make this publication public
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    Public publications can be viewed by anyone. Private publications are only visible to you.
                  </p>
                </div>
              </div>

              {/* Co-Authors */}
              <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <CoAuthorManager coAuthors={coAuthors} setCoAuthors={setCoAuthors} />
              </div>

              {/* Publication Files */}
              <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <FileManager files={files} setFiles={setFiles} />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
