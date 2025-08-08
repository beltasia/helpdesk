"use client"

import * as React from "react"
import { Loader2, Send } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatRelative } from "@/lib/format"

type Comment = {
  id: string
  ticketId: string
  author: string
  body: string
  createdAt: string
}

export default function CommentThread({ ticketId }: { ticketId: string }) {
  const [comments, setComments] = React.useState<Comment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [body, setBody] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/tickets/${ticketId}/comments`, { cache: "no-store" })
    const data = await res.json()
    setComments(data.items ?? [])
    setLoading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSaving(true)
    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, author: "You" }),
    })
    setSaving(false)
    if (res.ok) {
      setBody("")
      load()
    }
  }

  React.useEffect(() => {
    load()
  }, [ticketId])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Comments</h3>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading comments…</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-muted-foreground">No comments yet.</div>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{c.author.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{c.author}</span>{" "}
                  <span className="text-muted-foreground">• {formatRelative(c.createdAt)}</span>
                </div>
                <p className="text-sm leading-6">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="space-y-2">
        <Label htmlFor="body">Add a comment</Label>
        <Textarea id="body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your reply…" />
        <div>
          <Button type="submit" disabled={saving || !body.trim()}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}
