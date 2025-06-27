// components/ProfileSetupCard.tsx
"use client"

import React, { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { supabase } from "@/lib/supabaseClient"
import { CheckCircle, XCircle } from "lucide-react"

interface ProfileSetupCardProps {
  isOpen: boolean
  walletAddress: string
  onClose: () => void
  onProfileCreated: (profile: { username: string; avatar_url: string }) => void
}

// A default set of emojis; expand this array as you like.
const EMOJI_LIST = [
    "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
    "🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚",
    "😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥳",
    "🤩","😏","😒","😞","😔","😟","😕","🙁","☹️","😣",
    "😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬",
    "🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗",
    "🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯",
    "😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐",
    "🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈",
    "👿","👹","👺","🤡","💩","👻","💀","☠️","👽","👾",
    "🤖","🎃","🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼",
    "🦁","🐯","🐨","🐸","🐵","🙈","🙉","🙊","🐒","🦍"
  ]

export default function ProfileSetupCard({
  isOpen,
  walletAddress,
  onClose,
  onProfileCreated,
}: ProfileSetupCardProps) {
  const [username, setUsername] = useState("")
  const [emoji, setEmoji] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // reset form whenever the dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log("[ProfileSetupCard] opening, resetting form")
      setUsername("")
      setEmoji(null)
      setError(null)
      setSaving(false)
    }
  }, [isOpen])

  // character-count validation
  const trimmed = username.trim()
  const charCount = trimmed.length
  const validUsername = charCount >= 3 && charCount <= 20
  const validEmoji = !!emoji
  const canSave = validUsername && validEmoji && !saving

  const handleSave = async () => {
    if (!canSave) {
      console.log("[ProfileSetupCard] cannot save yet", { validUsername, validEmoji, saving })
      return
    }
    console.log("[ProfileSetupCard] saving profile", { walletAddress, username: trimmed, emoji })
    setSaving(true)
    setError(null)

    try {
      const { data, error: supaErr } = await supabase
        .from("profiles")
        .insert({
          wallet_address: walletAddress,
          username: trimmed,
          avatar_url: emoji!,
        })
        .select()
        .single()

      if (supaErr) {
        console.error("[ProfileSetupCard] supabase error:", supaErr)
        setError("Failed to save. Please retry.")
      } else {
        console.log("[ProfileSetupCard] saved row:", data)
        onProfileCreated({ username: data.username, avatar_url: data.avatar_url })
        onClose()
      }
    } catch (err) {
      console.error("[ProfileSetupCard] unexpected error:", err)
      setError("Unexpected error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
      <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md max-h-[90vh] overflow-auto -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl z-50">
        <Dialog.Title className="mb-4 text-lg font-semibold bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] text-white py-2 px-4 rounded">
          Create Your Profile
        </Dialog.Title>

        {/* Username Input */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B8A]"
            placeholder="3–20 characters"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {!validUsername && charCount > 0 && (
            <p className="mt-1 text-sm text-red-600">
              Username must be 3–20 characters (you have {charCount}).
            </p>
          )}
        </div>

        {/* Emoji Grid */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Pick an Emoji Avatar</label>
          <div className="grid grid-cols-5 gap-2">
            {EMOJI_LIST.map((e) => (
              <button
                key={e}
                type="button"
                className={`text-2xl p-2 rounded ${
                  emoji === e
                    ? "ring-2 ring-offset-1 ring-[#FF6B8A]"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  console.log("[ProfileSetupCard] picked emoji", e)
                  setEmoji(e)
                }}
              >
                {e}
              </button>
            ))}
          </div>
          {!validEmoji && (
            <p className="mt-1 text-sm text-red-600">Please choose an emoji.</p>
          )}
        </div>

        {/* Selected Preview */}
        {emoji && (
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            <span className="text-lg">You picked: {emoji}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600">
            <XCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`w-full py-2 rounded text-white font-medium transition ${
            canSave
              ? "bg-gradient-to-r from-[#FF6B8A] to-[#FFA45C] hover:from-[#FF3D4A] hover:to-[#FF6B8A]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </Dialog.Content>
    </Dialog.Root>
  )
}
