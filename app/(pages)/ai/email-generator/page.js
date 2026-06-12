import { EmailGenerator } from "@/components/features/EmailGenerator"
import { MemberRoute } from "@/components/membership-route"
import { ProtectedRoute } from "@/components/protected-route"

export default function EmailGeneratorPage() {
  return (
    <ProtectedRoute>
      <MemberRoute>
      <EmailGenerator />
      </MemberRoute>
    </ProtectedRoute>
  )
}
