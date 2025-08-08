import { Badge } from "@/components/ui/badge"

export default function TicketStatusBadge({ status = "open" as const }: { status?: "open" | "in_progress" | "waiting" | "resolved" | "closed" }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    open: { label: "Open", variant: "default" },
    in_progress: { label: "In Progress", variant: "secondary" },
    waiting: { label: "Waiting", variant: "outline" },
    resolved: { label: "Resolved", variant: "outline" },
    closed: { label: "Closed", variant: "outline" },
  }
  const conf = map[status] ?? map.open
  return <Badge variant={conf.variant} className="capitalize">{conf.label}</Badge>
}
