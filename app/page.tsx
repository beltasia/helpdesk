import Link from "next/link"
import { Suspense } from "react"
import { Plus, LifeBuoy, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TicketList from "@/components/ticket-list"
import NewTicketDialog from "@/components/new-ticket-dialog"
import db from "@/lib/db"

export default async function Page() {
  // Server Component (default) renders the shell and streams the list below. [^1]
  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Help Desk</h1>
            <p className="text-sm text-muted-foreground">
              Track, triage, and resolve customer issues efficiently.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NewTicketDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </NewTicketDialog>
          <Button variant="outline" asChild>
            <Link href="/tickets/open">
              <Filter className="h-4 w-4 mr-2" />
              Views
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-6 w-16 bg-muted rounded animate-pulse" />}>
              {/* Lightweight counter via list API */}
              <OpenCount />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-6 w-16 bg-muted rounded animate-pulse" />}>
              <InProgressCount />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-6 w-16 bg-muted rounded animate-pulse" />}>
              <WaitingCount />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-6 w-16 bg-muted rounded animate-pulse" />}>
              <ResolvedCount />
            </Suspense>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold">All Tickets</h2>
        </div>
        <TicketList />
      </section>
    </main>
  )
}

// Small server components to fetch counts
async function countByStatus(status: string) {
  const { total } = db.listTickets({ status: status as any })
  return total
}

async function OpenCount() {
  const n = await countByStatus("open")
  return <p className="text-2xl font-bold">{n}</p>
}
async function InProgressCount() {
  const n = await countByStatus("in_progress")
  return <p className="text-2xl font-bold">{n}</p>
}
async function WaitingCount() {
  const n = await countByStatus("waiting")
  return <p className="text-2xl font-bold">{n}</p>
}
async function ResolvedCount() {
  const n = await countByStatus("resolved")
  return <p className="text-2xl font-bold">{n}</p>
}
