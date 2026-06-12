import { AbstractSummarizer } from "@/components/features/AbstractSummarizer"
import { MemberRoute } from "@/components/membership-route"
import { ProtectedRoute } from "@/components/protected-route"

export default function AbstractSummarizerPage() {
  return (
    <ProtectedRoute>
      <MemberRoute>
      <AbstractSummarizer />
      </ MemberRoute>
    </ProtectedRoute>
  )
}
