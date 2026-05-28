"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import {
  getPublicationById,
  getComments,
  createComment,
  incrementViewCount,
  getImageUrl,
  getPublicationFiles,
  incrementDownloadCount,
} from "@/lib/pocketbase"
import { Calendar, User, Eye, Download, MessageCircle, ExternalLink, Send, Loader2, FileText } from "lucide-react"
import { ImageGallery } from "@/components/image-gallery"

export default function PublicationDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [publication, setPublication] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [newComment, setNewComment] = useState("")
  const [publicationFiles, setPublicationFiles] = useState([])
  const [filesLoading, setFilesLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadPublication()
      loadComments()
      loadPublicationFiles()
      // Increment view count
      incrementViewCount(id)
    }
  }, [id])

  const loadPublication = async () => {
    setLoading(true)
    const result = await getPublicationById(id)

    if (result.success) {
      setPublication(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const loadComments = async () => {
    setCommentsLoading(true)
    const result = await getComments(id)

    if (result.success) {
      setComments(result.data.items)
    }
    setCommentsLoading(false)
  }

  const loadPublicationFiles = async () => {
    setFilesLoading(true)
    const result = await getPublicationFiles(id)

    if (result.success) {
      setPublicationFiles(result.data.items)
    }
    setFilesLoading(false)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommentSubmitting(true)
    const result = await createComment({
      publication: id,
      user: user.id,
      content: newComment.trim(),
    })

    if (result.success) {
      setNewComment("")
      loadComments() // Reload comments
    } else {
      setError(result.error)
    }
    setCommentSubmitting(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTypeColor = (type) => {
    const colors = {
      Article: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Book: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Conference Paper": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Thesis: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Preprint: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    }
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const handleDownload = async (file) => {
    try {
      const fileUrl = getImageUrl(file, file.file)
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = file.file
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Increment download count
      await incrementDownloadCount(id)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading publication...</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !publication) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Publication Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {error || "The publication you're looking for doesn't exist or has been removed."}
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Publication Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-8">
              {/* Type and Date */}
              <div className="flex items-center gap-4 mb-6">
                {publication.type && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(publication.type)}`}>
                    {publication.type}
                  </span>
                )}
                {publication.publication_date && (
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={16} />
                    {formatDate(publication.publication_date)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{publication.title}</h1>

              {/* Authors */}
              <div className="flex items-center gap-2 mb-6">
                <User size={16} className="text-gray-400" />
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Link
                    href={`/user/${publication.expand?.user?.id}`}
                    className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium"
                  >
                    {publication.expand?.user?.name || publication.expand?.user?.email}
                  </Link>
                  {publication.expand?.co_authors_list && publication.expand.co_authors_list.length > 0 && (
                    <>
                      <span>, </span>
                      <span>+{publication.expand.co_authors_list.length} co-authors</span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {publication.views_count || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Download size={16} />
                  {publication.downloads_count || 0} downloads
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  {comments.length} comments
                </span>
              </div>

              {/* Preview Images Gallery */}
              {publication.preview_img && publication.preview_img.length > 0 && (
                <div className="mb-8">
                  <ImageGallery images={publication.preview_img} record={publication} alt={publication.title} />
                </div>
              )}

              {/* Abstract */}
              {publication.abstract && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Abstract</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {publication.abstract}
                  </p>
                </div>
              )}

              {/* Publication Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {publication.journal && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Journal</h3>
                    <p className="text-gray-900 dark:text-white">{publication.journal}</p>
                  </div>
                )}
                {publication.conference && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Conference</h3>
                    <p className="text-gray-900 dark:text-white">{publication.conference}</p>
                  </div>
                )}
                {publication.volume && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Volume</h3>
                    <p className="text-gray-900 dark:text-white">{publication.volume}</p>
                  </div>
                )}
                {publication.issue && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Issue</h3>
                    <p className="text-gray-900 dark:text-white">{publication.issue}</p>
                  </div>
                )}
                {publication.pages && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pages</h3>
                    <p className="text-gray-900 dark:text-white">{publication.pages}</p>
                  </div>
                )}
                {publication.publisher && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Publisher</h3>
                    <p className="text-gray-900 dark:text-white">{publication.publisher}</p>
                  </div>
                )}
                {publication.doi && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">DOI</h3>
                    <a
                      href={`https://doi.org/${publication.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                    >
                      {publication.doi}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>

              {/* Keywords */}
              {publication.keywords && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {publication.keywords.split(",").map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Publication Files */}
              {publicationFiles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Files</h3>
                  <div className="space-y-3">
                    {publicationFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{file.file}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{file.file_type}</span>
                              <span>v{file.version}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  file.visibility === "Public"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                }`}
                              >
                                {file.visibility}
                              </span>
                            </div>
                            {file.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{file.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(file)}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comments ({comments.length})</h2>
            </div>

            <div className="p-6">
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user, user.avatar) || "/placeholder.svg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || commentSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {commentSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading comments...</span>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        {comment.expand?.user?.avatar ? (
                          <img
                            src={getImageUrl(comment.expand.user, comment.expand.user.avatar) || "/placeholder.svg"}
                            alt={comment.expand.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {(comment.expand?.user?.name || comment.expand?.user?.email || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/user/${comment.expand?.user?.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                          >
                            {comment.expand?.user?.name || comment.expand?.user?.email}
                          </Link>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
