import { redirect } from 'next/navigation'

export default function RootPage() {
  // The dashboard page will handle the authentication check and redirect to login if necessary.
  // This makes the root page a simple entry point to the authenticated part of the app.
  redirect('/dashboard')
}