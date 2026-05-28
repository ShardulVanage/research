import { AIToolsPage } from "@/components/pages/AIToolsPage"
import { ProtectedRoute } from "@/components/protected-route"

export default function AIPage() {
  return (
    <ProtectedRoute>
      <AIToolsPage />
    </ProtectedRoute>
  )
}
