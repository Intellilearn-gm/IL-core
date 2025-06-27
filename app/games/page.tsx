// app/games/page.tsx
import { redirect } from 'next/navigation'

export default function GamesIndex() {
  // whenever someone hits /games exactly, send them home
  redirect('/dashboard')
}
