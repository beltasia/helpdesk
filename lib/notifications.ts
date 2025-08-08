import { Resend } from "resend"
import type { Ticket, Comment } from "@/lib/db"
import { agentDirectory } from "@/lib/agents"
import { ticketCreatedTemplate, ticketUpdatedTemplate, commentAddedTemplate } from "@/lib/email-templates"

const FROM = process.env.NOTIFY_FROM || "noreply@example.com"
const SUPPORT = process.env.NOTIFY_SUPPORT_EMAIL // optional internal notifications

function getResend() {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

type SendArgs = { to: string | string[]; subject: string; html: string; text: string }

async function sendEmail({ to, subject, html, text }: SendArgs) {
  const resend = getResend()
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean)
  if (recipients.length === 0) return { id: "skipped-no-recipient" }

  if (!resend) {
    // Fallback for preview/dev without env vars
    console.log("[Email Preview] Would send:", { from: FROM, to: recipients, subject, text })
    return { id: "dev-log" }
  }
  try {
    const res = await resend.emails.send({
      from: FROM,
      to: recipients,
      subject,
      html,
      text,
    })
    if (res.error) {
      console.error("Resend error:", res.error)
      return { id: "error", error: res.error }
    }
    return { id: res.data?.id ?? "ok" }
  } catch (err) {
    console.error("Email send failed:", err)
    return { id: "error", error: String(err) }
  }
}

function agentEmail(name?: string) {
  if (!name) return undefined
  return agentDirectory[name]?.email
}

export async function notifyTicketCreated(ticket: Ticket, baseUrl: string) {
  const { subject, html, text } = ticketCreatedTemplate(ticket, baseUrl)
  const to: string[] = [ticket.requesterEmail]
  if (SUPPORT) to.push(SUPPORT) // optional: alert support team
  return sendEmail({ to, subject, html, text })
}

export async function notifyTicketUpdated(
  ticket: Ticket,
  previous: Ticket | null,
  changed: Partial<Pick<Ticket, "status" | "priority" | "assignedTo">>,
  baseUrl: string
) {
  const { subject, html, text } = ticketUpdatedTemplate(ticket, changed, baseUrl)
  // Notify requester and current assignee (if any)
  const to: string[] = [ticket.requesterEmail]
  const assigneeTo = agentEmail(ticket.assignedTo)
  if (assigneeTo) to.push(assigneeTo)

  // Optional: if assignee changed, notify the new assignee specifically
  if (changed.assignedTo && changed.assignedTo !== previous?.assignedTo) {
    const newAssigneeEmail = agentEmail(changed.assignedTo)
    if (newAssigneeEmail) to.push(newAssigneeEmail)
  }

  return sendEmail({ to, subject, html, text })
}

export async function notifyCommentAdded(ticket: Ticket, comment: Comment, baseUrl: string) {
  const { subject, html, text } = commentAddedTemplate(ticket, comment, baseUrl)
  // Notify requester and assignee
  const to: string[] = [ticket.requesterEmail]
  const assigneeTo = agentEmail(ticket.assignedTo)
  if (assigneeTo) to.push(assigneeTo)
  return sendEmail({ to, subject, html, text })
}
