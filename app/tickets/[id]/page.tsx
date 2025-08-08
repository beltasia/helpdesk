import { notFound } from "next/navigation"
import db from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TicketStatusBadge from "@/components/ticket-status-badge"
import TicketActions from "@/components/ticket-actions"
import CommentThread from "@/components/comment-thread"
import { formatDateTime } from "@/lib/format"

async function getTicket(id: string) {
  return db.getTicket(id)
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const ticket = await getTicket(id)
  if (!ticket) return notFound()

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl md:text-2xl">{ticket.subject}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Ticket #{ticket.id.slice(0, 8)} • Created {formatDateTime(ticket.createdAt)} by{" "}
              <span className="font-medium">{ticket.requesterName}</span>{" "}
              {"<"}{ticket.requesterEmail}{">"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm leading-6">{ticket.description}</p>
              </section>
              <section>
                <CommentThread ticketId={ticket.id} />
              </section>
            </div>
            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{ticket.status.replaceAll("_", " ")}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="font-medium capitalize">{ticket.priority}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Assignee</span>
                    <span className="font-medium">{ticket.assignedTo ?? "Unassigned"}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="font-medium">{formatDateTime(ticket.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
              <TicketActions
                id={ticket.id}
                status={ticket.status}
                priority={ticket.priority}
                assignedTo={ticket.assignedTo ?? ""}
              />
            </aside>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
