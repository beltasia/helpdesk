import { NextResponse } from "next/server"
import db from "@/lib/db"
import { TicketUpdateSchema } from "@/lib/validators"
import { notifyTicketUpdated } from "@/lib/notifications"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const t = db.getTicket(params.id)
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(t)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json()
  const parse = TicketUpdateSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parse.error.flatten() }, { status: 400 })
  }
  const prev = db.getTicket(params.id)
  const t = db.updateTicket(params.id, parse.data)
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const changed: any = {}
  if (prev && parse.data.status && parse.data.status !== prev.status) changed.status = parse.data.status
  if (prev && parse.data.priority && parse.data.priority !== prev.priority) changed.priority = parse.data.priority
  if (prev && parse.data.assignedTo !== undefined && parse.data.assignedTo !== prev.assignedTo) changed.assignedTo = parse.data.assignedTo

  const baseUrl = new URL(request.url).origin
  notifyTicketUpdated(t, prev, changed, baseUrl).catch((e) => console.error("notifyTicketUpdated failed", e))

  return NextResponse.json(t)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ok = db.deleteTicket(params.id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
