import { AbstractSummarizer } from "@/components/features/AbstractSummarizer"
import { ProtectedRoute } from "@/components/protected-route"

export default function AbstractSummarizerPage() {
  return (
    <ProtectedRoute>
      <AbstractSummarizer />
    </ProtectedRoute>
  )
}
