import { AIToolsPage } from "@/components/pages/AIToolsPage"
import { MemberRoute } from "@/components/membership-route"
import { ProtectedRoute } from "@/components/protected-route"

export default function AIPage() {
  return (
    <ProtectedRoute>
    <MemberRoute>
      <AIToolsPage />
    </MemberRoute>
    </ProtectedRoute>
  )
}