type Priority = "low" | "medium" | "high" | "urgent"
type Status = "open" | "in_progress" | "waiting" | "resolved" | "closed"

export type Ticket = {
  id: string
  subject: string
  description: string
  requesterName: string
  requesterEmail: string
  createdAt: string
  updatedAt: string
  status: Status
  priority: Priority
  tags: string[]
  assignedTo?: string
}

export type Comment = {
  id: string
  ticketId: string
  author: string
  body: string
  createdAt: string
}

class InMemoryDB {
  private tickets = new Map<string, Ticket>()
  private comments = new Map<string, Comment[]>()
  private seeded = false

  private now() {
    return new Date().toISOString()
  }

  seed() {
    if (this.seeded) return
    const sample: Array<Partial<Ticket> & Pick<Ticket, "subject" | "description" | "requesterName" | "requesterEmail" | "priority">> = [
      {
        subject: "Cannot access premium features",
        description: "I upgraded to premium but features are still locked.",
        requesterName: "Jane Doe",
        requesterEmail: "jane@example.com",
        priority: "high",
      },
      {
        subject: "Bug: Checkout shows wrong total",
        description: "Cart total differs between pages.",
        requesterName: "Mike Ross",
        requesterEmail: "mike@example.com",
        priority: "urgent",
      },
      {
        subject: "Request for data export",
        description: "Need CSV export of last month's orders.",
        requesterName: "Priya Sharma",
        requesterEmail: "priya@example.com",
        priority: "medium",
      },
      {
        subject: "How to reset password?",
        description: "I forgot my password.",
        requesterName: "Omar Ali",
        requesterEmail: "omar@example.com",
        priority: "low",
      },
    ]
    sample.forEach((s, i) => {
      const id = crypto.randomUUID()
      const createdAt = new Date(Date.now() - (i + 1) * 3600_000).toISOString()
      const t: Ticket = {
        id,
        subject: s.subject,
        description: s.description,
        requesterName: s.requesterName,
        requesterEmail: s.requesterEmail,
        createdAt,
        updatedAt: createdAt,
        status: i === 0 ? "open" : i === 1 ? "in_progress" : i === 2 ? "waiting" : "resolved",
        priority: s.priority,
        tags: i === 1 ? ["bug"] : i === 2 ? ["export", "reporting"] : ["account"],
        assignedTo: i % 2 === 0 ? "Alex Johnson" : undefined,
      }
      this.tickets.set(id, t)
      this.comments.set(id, [
        {
          id: crypto.randomUUID(),
          ticketId: id,
          author: "System",
          body: "Ticket created",
          createdAt,
        },
      ])
    })
    this.seeded = true
  }

  listTickets(params: { q?: string; status?: Status; priority?: Priority; page?: number; limit?: number }) {
    this.seed()
    const q = params.q?.toLowerCase() ?? ""
    const status = params.status
    const priority = params.priority
    let items = Array.from(this.tickets.values())
    if (q) {
      items = items.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q) ||
          t.requesterEmail.toLowerCase().includes(q)
      )
    }
    if (status) items = items.filter((t) => t.status === status)
    if (priority) items = items.filter((t) => t.priority === priority)
    items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const total = items.length
    const page = Math.max(1, params.page ?? 1)
    const limit = Math.max(1, params.limit ?? 50)
    const start = (page - 1) * limit
    const end = start + limit
    return { total, items: items.slice(start, end), page, limit }
  }

  getTicket(id: string) {
    this.seed()
    return this.tickets.get(id) ?? null
  }

  createTicket(data: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status"> & { status?: Status }) {
    this.seed()
    const id = crypto.randomUUID()
    const now = this.now()
    const t: Ticket = {
      id,
      subject: data.subject,
      description: data.description,
      requesterName: data.requesterName,
      requesterEmail: data.requesterEmail,
      createdAt: now,
      updatedAt: now,
      status: data.status ?? "open",
      priority: data.priority,
      tags: data.tags,
      assignedTo: data.assignedTo,
    }
    this.tickets.set(id, t)
    this.comments.set(id, [
      {
        id: crypto.randomUUID(),
        ticketId: id,
        author: "System",
        body: "Ticket created",
        createdAt: now,
      },
    ])
    return t
  }

  updateTicket(id: string, patch: Partial<Omit<Ticket, "id" | "createdAt">>) {
    this.seed()
    const t = this.tickets.get(id)
    if (!t) return null
    const updated: Ticket = {
      ...t,
      ...patch,
      updatedAt: this.now(),
    }
    this.tickets.set(id, updated)
    return updated
  }

  deleteTicket(id: string) {
    this.seed()
    const existed = this.tickets.delete(id)
    this.comments.delete(id)
    return existed
  }

  listComments(ticketId: string) {
    this.seed()
    return this.comments.get(ticketId) ?? []
  }

  addComment(ticketId: string, data: { author: string; body: string }) {
    this.seed()
    const c: Comment = {
      id: crypto.randomUUID(),
      ticketId,
      author: data.author,
      body: data.body,
      createdAt: this.now(),
    }
    const list = this.comments.get(ticketId) ?? []
    list.push(c)
    this.comments.set(ticketId, list)
    // bump ticket updatedAt
    const t = this.tickets.get(ticketId)
    if (t) {
      t.updatedAt = this.now()
      this.tickets.set(ticketId, t)
    }
    return c
  }
}

const db = new InMemoryDB()
export default db
