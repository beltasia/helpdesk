import { NextResponse } from "next/server"
import db from "@/lib/db"
import { TicketCreateSchema } from "@/lib/validators"
import { notifyTicketCreated } from "@/lib/notifications"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? undefined
  const status = (searchParams.get("status") as any) ?? undefined
  const priority = (searchParams.get("priority") as any) ?? undefined
  const page = Number(searchParams.get("page") ?? "1")
  const limit = Number(searchParams.get("limit") ?? "50")
  const data = db.listTickets({ q, status, priority, page, limit })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const json = await request.json()
  const parse = TicketCreateSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parse.error.flatten() }, { status: 400 })
  }
  const t = db.createTicket(parse.data)
  const baseUrl = new URL(request.url).origin
  // Fire and forget; do not block API response on email
  notifyTicketCreated(t, baseUrl).catch((e) => console.error("notifyTicketCreated failed", e))
  return NextResponse.json(t, { status: 201 })
}
