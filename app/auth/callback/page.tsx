'use client'

import { LoginCallBack } from '@opencampus/ocid-connect-js'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

const Loading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFD166] via-[#FF6B8A] to-[#FFA45C] relative overflow-hidden">
    {/* Fun animated loader: spinning blockchain ring with bouncing coins */}
    <div className="relative mb-8">
      {/* Spinning ring */}
      <div className="w-32 h-32 border-8 border-dashed border-white/60 rounded-full animate-spin-slow mx-auto" style={{ borderTopColor: '#FF6B8A', borderBottomColor: '#FFD166', borderLeftColor: '#FFA45C', borderRightColor: '#fff' }} />
      {/* Bouncing coins */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
        <span className="block w-8 h-8 bg-yellow-300 rounded-full shadow-lg animate-bounce [animation-delay:0.1s] border-2 border-yellow-500 flex items-center justify-center text-xl">🪙</span>
        <span className="block w-8 h-8 bg-yellow-300 rounded-full shadow-lg animate-bounce [animation-delay:0.3s] border-2 border-yellow-500 flex items-center justify-center text-xl">🪙</span>
        <span className="block w-8 h-8 bg-yellow-300 rounded-full shadow-lg animate-bounce [animation-delay:0.5s] border-2 border-yellow-500 flex items-center justify-center text-xl">🪙</span>
      </div>
    </div>
    <h2 className="text-2xl font-bold text-white drop-shadow mb-2 tracking-wide animate-pulse">Logging you in...</h2>
    <p className="text-lg text-white/80 mb-4">Connecting to the blockchain and verifying your credentials.</p>
    <p className="text-sm text-white/60 italic">This should only take a moment. <span className="inline-block animate-spin">🔗</span></p>
    {/* Fun background sparkles */}
    <div className="pointer-events-none absolute inset-0 z-0">
      {[...Array(20)].map((_, i) => (
        <span key={i} className="absolute bg-white/30 rounded-full" style={{
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: 'blur(1.5px)',
          animation: `floaty 3s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}
      <style>{`
        @keyframes floaty {
          0% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(-20px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.7; }
        }
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  </div>
)

const ErrorComponent = ({ message }: { message?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FF6B8A] to-[#FFD166] text-white relative overflow-hidden">
    <div className="text-6xl mb-4 animate-bounce">❌</div>
    <h2 className="text-2xl font-bold mb-2 drop-shadow">Login Failed</h2>
    <p className="text-lg mb-4">{message || 'An unknown error occurred.'}</p>
    <p className="text-sm text-white/70">Redirecting you back to login...</p>
    {/* Fun background sparkles */}
    <div className="pointer-events-none absolute inset-0 z-0">
      {[...Array(20)].map((_, i) => (
        <span key={i} className="absolute bg-white/30 rounded-full" style={{
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: 'blur(1.5px)',
          animation: `floaty 3s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}
    </div>
  </div>
)

export default function AuthCallbackPage() {
  const router = useRouter()
  // We use the same isClient pattern to delay rendering of LoginCallBack
  const [isClient, setIsClient] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [rawError, setRawError] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const onSuccess = () => {
    // Redirect to the dashboard upon successful login
    router.replace('/dashboard')
  }

  const onError = (err: unknown) => {
    console.error("OCID Callback Error (full object):", err)
    setRawError(err)
    let message = "An unknown error occurred."
    if (err instanceof Error) {
      message = err.message
    } else if (typeof err === "string") {
      message = err
    } else if (err && typeof err === "object" && "message" in err) {
      message = (err as any).message
    }
    setErrorMessage(message)
    // Redirect back to the login page after a short delay
    setTimeout(() => router.replace('/login'), 3000)
  }

  // During server-side render and initial client-side mount, show a loading state.
  // This prevents LoginCallBack from rendering prematurely.
  if (!isClient) {
    return <Loading />
  }

  if (errorMessage) {
    return (
      <div>
        <ErrorComponent message={errorMessage} />
        {rawError && (
          <pre className="bg-gray-900 text-white p-4 rounded mt-4 overflow-x-auto text-xs max-w-2xl mx-auto">
            {JSON.stringify(rawError, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  // Once we're on the client, it's safe to render the component that uses the context.
  return (
    <LoginCallBack
      successCallback={onSuccess}
      errorCallback={onError}
      customLoadingComponent={<Loading />}
      customErrorComponent={<ErrorComponent message={errorMessage || undefined} />}
    />
  )
}