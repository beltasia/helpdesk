"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Filter, Clock, User2, ChevronRight } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TicketStatusBadge from "./ticket-status-badge"
import { formatRelative } from "@/lib/format"

type Ticket = {
  id: string
  subject: string
  requesterName: string
  requesterEmail: string
  createdAt: string
  updatedAt: string
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  tags: string[]
  assignedTo?: string
}

export default function TicketList() {
  const [q, setQ] = React.useState("")
  // Use "all" as sentinel instead of empty string to avoid SelectItem value=""
  const [status, setStatus] = React.useState<string>("all")
  const [priority, setPriority] = React.useState<string>("all")
  const [tickets, setTickets] = React.useState<Ticket[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchTickets = React.useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (status !== "all") params.set("status", status)
    if (priority !== "all") params.set("priority", priority)
    const res = await fetch(`/api/tickets?${params.toString()}`, { cache: "no-store" })
    const data = await res.json()
    setTickets(data.items)
    setLoading(false)
  }, [q, status, priority])

  React.useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Listen for external refreshes (e.g., after creating a new ticket)
  React.useEffect(() => {
    const onRefresh = () => fetchTickets()
    window.addEventListener("tickets:refresh", onRefresh as EventListener)
    return () => window.removeEventListener("tickets:refresh", onRefresh as EventListener)
  }, [fetchTickets])

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject, requester, or email"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchTickets()
            }}
            aria-label="Search tickets"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchTickets}>
            <Filter className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </div>
      </div>

      <div className="divide-y rounded-md border bg-card">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No tickets found.</div>
        ) : (
          tickets.map((t) => (
            <Link key={t.id} href={`/tickets/${t.id}`} className="block focus:outline-none focus:ring-2 focus:ring-ring">
              <div className="p-4 hover:bg-muted/40 transition-colors flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <TicketStatusBadge status={t.status} />
                    <span className="font-medium truncate">{t.subject}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User2 className="h-3.5 w-3.5" />
                      {t.requesterName} {"<"}{t.requesterEmail}{">"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Updated {formatRelative(t.updatedAt)}
                    </span>
                    {t.assignedTo && <Badge variant="secondary">Assigned to {t.assignedTo}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">{t.priority}</Badge>
                    {t.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
