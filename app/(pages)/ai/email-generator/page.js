import { EmailGenerator } from "@/components/features/EmailGenerator"
import { ProtectedRoute } from "@/components/protected-route"

export default function EmailGeneratorPage() {
  return (
    <ProtectedRoute>
      <EmailGenerator />
    </ProtectedRoute>
  )
}
