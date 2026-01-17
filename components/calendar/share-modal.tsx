"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Copy, Check, Link } from "lucide-react"

interface ShareModalProps {
  onClose: () => void
  shareCode: string
}

export function ShareModal({ onClose, shareCode }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/join/${shareCode}` : `/join/${shareCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleEmailInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setEmailSent(true)
    setEmail("")
    setTimeout(() => setEmailSent(false), 3000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Share Calendar</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Share Code */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Share Code</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Share this code with friends to join your calendar</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-2 font-mono text-lg text-center tracking-wider">
                {shareCode}
              </div>
              <Button onClick={handleCopyCode} variant="outline" className="gap-2 bg-transparent">
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Link className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Share via Link</h3>
            </div>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1 text-sm" />
              <Button onClick={handleCopyLink} variant="outline" className="gap-2 bg-transparent">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Calendar Permissions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>View all shared events</li>
              <li>Add personal events (visible to all)</li>
              <li>Choose personal calendar color</li>
              <li>Participate in meetup planning</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
