"use client"

import * as React from "react"
import { Loader2, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { agents } from "@/lib/agents"

export default function TicketActions({
  id,
  status = "open",
  priority = "medium",
  assignedTo = "",
}: {
  id: string
  status?: "open" | "in_progress" | "waiting" | "resolved" | "closed"
  priority?: "low" | "medium" | "high" | "urgent"
  assignedTo?: string
}) {
  const [form, setForm] = React.useState({ status, priority, assignedTo })
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function save() {
    setSaving(true)
    setMessage(null)
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) {
      setMessage("Failed to update ticket.")
      return
    }
    setMessage("Saved")
  }

  React.useEffect(() => {
    const t = setTimeout(() => setMessage(null), 2000)
    return () => clearTimeout(t)
  }, [message])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Update Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as typeof form.priority })}>
            <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Assignee</Label>
          <Select
            value={form.assignedTo || "unassigned"}
            onValueChange={(v) => setForm({ ...form, assignedTo: v === "unassigned" ? "" : v })}
          >
            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="pt-1">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save changes
          </Button>
          {message && <span className="ml-3 text-sm text-muted-foreground">{message}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
