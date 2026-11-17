"use client"

import { SessionProvider } from "next-auth/react"
import AuthSessionBridge from "@/components/AuthSessionBridge"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AuthSessionBridge />
      {children}
    </SessionProvider>
  )
}
