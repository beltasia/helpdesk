"use client"

import * as React from "react"
import { z } from "zod"
import { Plus, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Schema = z.object({
  subject: z.string().min(3),
  description: z.string().min(3),
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.string().optional(),
})

export default function NewTicketDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    subject: "",
    description: "",
    requesterName: "",
    requesterEmail: "",
    priority: "medium",
    tags: "",
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = Schema.safeParse(form)
    if (!parsed.success) {
      setError("Please check the form fields.")
      return
    }
    setLoading(true)
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...parsed.data,
        tags: parsed.data.tags ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }),
    })
    setLoading(false)
    if (!res.ok) {
      setError("Failed to create ticket. Please try again.")
      return
    }
    setOpen(false)
    setForm({
      subject: "",
      description: "",
      requesterName: "",
      requesterEmail: "",
      priority: "medium",
      tags: "",
    })
    // Consider triggering a refresh on the list via a custom event
    window.dispatchEvent(new CustomEvent("tickets:refresh"))
  }

  React.useEffect(() => {
    const handler = () => setOpen(false)
    window.addEventListener("tickets:created", handler as EventListener)
    return () => window.removeEventListener("tickets:created", handler as EventListener)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children ?? <Button><Plus className="h-4 w-4 mr-2" />New Ticket</Button>}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="requesterName">Requester name</Label>
              <Input id="requesterName" value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterEmail">Requester email</Label>
              <Input id="requesterEmail" type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="billing, bug, premium" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Create Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
