"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { MessageCircle, Send, Loader2, Reply, ChevronDown, ChevronUp } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"

export function CommentSection({
  publicationId,
  currentUser,
  comments = [],
  commentsLoading = false,
  onSubmitComment,
  onSubmitReply,
  commentSubmitting = false,
}) {
  const [newComment, setNewComment] = useState("")
  const [replyingToId, setReplyingToId] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [expandedReplies, setExpandedReplies] = useState({})
  const replyTextareaRef = useRef(null)
  const mainCommentRef = useRef(null)

  // Auto-focus reply textarea when reply form opens
  useEffect(() => {
    if (replyingToId && replyTextareaRef.current) {
      setTimeout(() => {
        replyTextareaRef.current?.focus()
      }, 0)
    }
  }, [replyingToId])

  // Auto-focus main comment textarea
  useEffect(() => {
    if (mainCommentRef.current && newComment === "") {
      // Don't auto-focus unless user clicks
    }
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    onSubmitComment(newComment.trim())
    setNewComment("")
  }

  const handleReplySubmit = (e, parentCommentId) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    onSubmitReply(replyContent.trim(), parentCommentId)
    setReplyContent("")
    setReplyingToId(null)
  }

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  // Filter top-level comments (no parent)
  const topLevelComments = comments.filter((comment) => !comment.parent_comment)

  // Get replies for a comment
  const getReplies = (parentCommentId) => {
    return comments.filter((comment) => comment.parent_comment === parentCommentId)
  }

  const CommentItem = ({ comment, isReply = false, level = 0 }) => {
    const replies = getReplies(comment.id)
    const isExpanded = expandedReplies[comment.id]

    return (
      <div key={comment.id} className={`${isReply ? "ml-6 md:ml-12" : ""}`}>
        <div className="flex gap-4 mb-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {comment.expand?.user?.avatar ? (
              <Link href={`/user/${comment.expand?.user?.id}`}>
                <img
                  src={getImageUrl(comment.expand.user, comment.expand.user.avatar) || "/placeholder.svg"}
                  alt={comment.expand?.user?.name}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  title={comment.expand?.user?.name || comment.expand?.user?.email}
                />
              </Link>
            ) : (
              <Link href={`/user/${comment.expand?.user?.id}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-sm font-bold text-white">
                    {(comment.expand?.user?.name || comment.expand?.user?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* Comment Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link
                href={`/user/${comment.expand?.user?.id}`}
                className="font-medium text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                title="View user profile"
              >
                {comment.expand?.user?.name || comment.expand?.user?.email}
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.created)}</span>
              {comment.updated > comment.created && (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">(edited)</span>
              )}
            </div>

            {/* Comment Body */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <Reply size={14} />
                Reply
              </button>
              {replies.length > 0 && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={14} />
                      Hide replies ({replies.length})
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Show replies ({replies.length})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingToId === comment.id && (
              <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                <input
                  ref={replyTextareaRef}
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  autoFocus
                  dir="ltr"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToId(null)
                      setReplyContent("")
                    }}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || commentSubmitting}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {commentSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Nested Replies */}
            {replies.length > 0 && isExpanded && (
              <div className="mt-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                {replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} level={level + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle size={20} />
          Comments ({comments.filter((c) => !c.parent_comment).length})
        </h2>
      </div>

      <div className="p-6">
        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={getImageUrl(currentUser, currentUser.avatar) || "/placeholder.svg"}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {(currentUser?.name || currentUser?.email || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={mainCommentRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                dir="ltr"
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
        ) : topLevelComments.length > 0 ? (
          <div className="space-y-6">
            {topLevelComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
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
  )
}
