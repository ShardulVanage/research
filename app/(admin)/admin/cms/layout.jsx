"use client"

import { Toaster } from "@/components/ui/sonner"

export default function CmsLayout({ children }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  )
}
