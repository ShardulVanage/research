import { ConferenceRecommendation } from "@/components/features/ConferenceRecommendation"
import { MemberRoute } from "@/components/membership-route"
import { ProtectedRoute } from "@/components/protected-route"

export default function ConferenceRecommendationPage() {
  return (
    <ProtectedRoute>
      <MemberRoute>
      <ConferenceRecommendation />
      </MemberRoute>
    </ProtectedRoute>
  )
}
