import { z } from "zod"

export const TicketCreateSchema = z.object({
  subject: z.string().min(3),
  description: z.string().min(3),
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  tags: z.array(z.string()).default([]),
})

export const TicketUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "waiting", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  subject: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
})

export const CommentCreateSchema = z.object({
  author: z.string().min(1),
  body: z.string().min(1),
})
