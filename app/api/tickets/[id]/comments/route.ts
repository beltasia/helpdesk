import { NextResponse } from "next/server"
import db from "@/lib/db"
import { CommentCreateSchema } from "@/lib/validators"
import { notifyCommentAdded } from "@/lib/notifications"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = db.listComments(params.id)
  return NextResponse.json({ items })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json()
  const parse = CommentCreateSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parse.error.flatten() }, { status: 400 })
  }
  const comment = db.addComment(params.id, parse.data)
  const ticket = db.getTicket(params.id)
  if (ticket) {
    const baseUrl = new URL(request.url).origin
    notifyCommentAdded(ticket, comment, baseUrl).catch((e) => console.error("notifyCommentAdded failed", e))
  }
  return NextResponse.json(comment, { status: 201 })
}
