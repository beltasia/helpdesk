import type { Ticket, Comment } from "@/lib/db"

function shortId(id: string) {
  return id.slice(0, 8)
}

function linkToTicket(baseUrl: string, ticketId: string) {
  return `${baseUrl}/tickets/${ticketId}`
}

function layoutHtml(title: string, bodyHtml: string) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; padding: 24px;">
    <h2 style="margin: 0 0 16px; font-size: 20px;">${title}</h2>
    <div>${bodyHtml}</div>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #666; font-size: 12px;">You are receiving this because you interacted with a ticket on our Help Desk.</p>
  </div>
  `
}

export function ticketCreatedTemplate(ticket: Ticket, baseUrl: string) {
  const subject = `[#${shortId(ticket.id)}] Ticket received: ${ticket.subject}`
  const url = linkToTicket(baseUrl, ticket.id)
  const html = layoutHtml(
    subject,
    `
      <p>Hi ${ticket.requesterName},</p>
      <p>We've received your request and created a ticket. Our support team will follow up.</p>
      <ul>
        <li><strong>Status:</strong> ${ticket.status}</li>
        <li><strong>Priority:</strong> ${ticket.priority}</li>
      </ul>
      <p>You can view your ticket here: <a href="${url}">${url}</a></p>
    `
  )
  const text =
    `Hi ${ticket.requesterName},\n\n` +
    `We've received your request and created a ticket.\n` +
    `Status: ${ticket.status}\nPriority: ${ticket.priority}\n\n` +
    `View your ticket: ${url}\n`
  return { subject, html, text }
}

export function ticketUpdatedTemplate(
  ticket: Ticket,
  changed: Partial<Pick<Ticket, "status" | "priority" | "assignedTo">>,
  baseUrl: string
) {
  const parts: string[] = []
  if (changed.status) parts.push(`Status → ${changed.status}`)
  if (changed.priority) parts.push(`Priority → ${changed.priority}`)
  if (changed.assignedTo !== undefined) parts.push(`Assignee → ${changed.assignedTo || "Unassigned"}`)
  const changes = parts.join(", ")
  const subject = `[#${shortId(ticket.id)}] Ticket updated: ${ticket.subject}`
  const url = linkToTicket(baseUrl, ticket.id)
  const html = layoutHtml(
    subject,
    `
      <p>Your ticket has been updated.</p>
      <p><strong>Changes:</strong> ${changes || "No visible changes"}</p>
      <p>View details: <a href="${url}">${url}</a></p>
    `
  )
  const text =
    `Your ticket has been updated.\n` +
    `Changes: ${changes || "No visible changes"}\n` +
    `View details: ${url}\n`
  return { subject, html, text }
}

export function commentAddedTemplate(ticket: Ticket, comment: Comment, baseUrl: string) {
  const subject = `[#${shortId(ticket.id)}] New comment on: ${ticket.subject}`
  const url = linkToTicket(baseUrl, ticket.id)
  const html = layoutHtml(
    subject,
    `
      <p><strong>${comment.author}</strong> commented:</p>
      <blockquote style="margin: 12px 0; padding: 12px; background: #f8f8f8; border-left: 3px solid #ddd;">
        ${comment.body.replace(/\n/g, "<br/>")}
      </blockquote>
      <p>Reply or view the thread: <a href="${url}">${url}</a></p>
    `
  )
  const text =
    `${comment.author} commented:\n\n` +
    `${comment.body}\n\n` +
    `Reply: ${url}\n`
  return { subject, html, text }
}
