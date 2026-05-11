"use client"

import { useState } from "react"
import { Zap, Plus, Trash2, X, Save } from "lucide-react"
import { createSkill, updateSkill, deleteSkill } from "@/lib/pocketbase"

export function SkillsSection({ skills = [], userId, onUpdate }) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [skillName, setSkillName] = useState("")

  const handleAddSkill = async () => {
    if (!skillName.trim()) {
      setError("Skill name is required")
      return
    }

    setLoading(true)
    try {
      const result = await createSkill({
        name: skillName,
        user: userId,
        endorsement_count: 0,
      })

      if (result.success) {
        setSkillName("")
        setIsAdding(false)
        onUpdate?.()
      } else {
        setError(result.error || "Failed to add skill")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    }
    setLoading(false)
  }

  const handleDeleteSkill = async (id) => {
    if (!confirm("Delete this skill?")) return

    setLoading(true)
    try {
      const result = await deleteSkill(id)
      if (result.success) {
        onUpdate?.()
      } else {
        setError("Failed to delete skill")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    }
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="text-cyan-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add
          </button>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isAdding ? (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => {
                  setSkillName(e.target.value)
                  setError("")
                }}
                placeholder="e.g., Python, Machine Learning, React"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSkillName("")
                  setIsAdding(false)
                  setError("")
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Add Skill
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-700 rounded-full group hover:shadow-md transition-shadow"
              >
                <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                {skill.endorsement_count > 0 && (
                  <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                    {skill.endorsement_count} {skill.endorsement_count === 1 ? "endorsement" : "endorsements"}
                  </span>
                )}
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No skills yet. Add your first skill to get started!</p>
        )}
      </div>
    </div>
  )
}
