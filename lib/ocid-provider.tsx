// lib/ocid-provider.tsx
'use client'

import { OCConnect } from '@opencampus/ocid-connect-js'
import React from 'react'

export function OcidProvider({ children }: { children: React.ReactNode }) {
  // 1️⃣  Early-out on the server: render the tree without OCID at all
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  // 2️⃣  Browser only ⇒ it’s safe to touch `window`
  const ocidOpts = {
    redirectUri: `${window.location.origin}/auth/callback`,
    clientId: process.env.NEXT_PUBLIC_OCID_CLIENT_ID
  }

  return (
    <OCConnect opts={ocidOpts} sandboxMode={true}>
      {children}
    </OCConnect>
  )
}
