import { ConferenceRecommendation } from "@/components/features/ConferenceRecommendation"
import { ProtectedRoute } from "@/components/protected-route"

export default function ConferenceRecommendationPage() {
  return (
    <ProtectedRoute>
      <ConferenceRecommendation />
    </ProtectedRoute>
  )
}
