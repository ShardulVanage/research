"use client"

import { useState } from "react"
import { BookOpen, Edit3, Trash2 } from "lucide-react"
import { PublicationCard } from "@/components/publication-card"
import Link from "next/link"

export function PublicationsSection({ publications = [], loading, stats, onDeletePublication }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Publications</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {publications.length} publication{publications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.publications}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Publications</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Views</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalCitations}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Citations</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-2">
            <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Downloads</div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading publications...</span>
          </div>
        ) : publications.length > 0 ? (
          <div className="space-y-6">
            {publications.map((publication) => (
              <div key={publication.id} className="relative">
                <PublicationCard publication={publication} />
                {/* Edit/Delete Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Link
                    href={`/edit-publication/${publication.id}`}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Edit Publication"
                  >
                    <Edit3 size={16} className="text-gray-600 dark:text-gray-400" />
                  </Link>
                  <button
                    onClick={() => onDeletePublication(publication.id)}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete Publication"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share your research with the community by creating your first publication.
            </p>
            <a
              href="/create-publication"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <BookOpen size={16} />
              Create Publication
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
