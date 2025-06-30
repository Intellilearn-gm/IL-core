'use client'

import { LoginCallBack } from '@opencampus/ocid-connect-js'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6]">
    Processing login...
  </div>
)

const ErrorComponent = ({ error }: { error?: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E5E1D8] to-[#FFE8D6] text-red-500">
    Login failed: {error?.message || 'An unknown error occurred.'}
  </div>
)

export default function AuthCallbackPage() {
  const router = useRouter()
  // We use the same isClient pattern to delay rendering of LoginCallBack
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const onSuccess = () => {
    // Redirect to the dashboard upon successful login
    router.replace('/dashboard')
  }

  const onError = (err: Error) => {
    console.error("OCID Callback Error:", err)
    // Redirect back to the login page after a short delay
    setTimeout(() => router.replace('/login'), 3000)
  }

  // During server-side render and initial client-side mount, show a loading state.
  // This prevents LoginCallBack from rendering prematurely.
  if (!isClient) {
    return <Loading />
  }

  // Once we're on the client, it's safe to render the component that uses the context.
  return (
    <LoginCallBack
      successCallback={onSuccess}
      errorCallback={onError}
      customLoadingComponent={<Loading />}
      customErrorComponent={<ErrorComponent />}
    />
  )
}