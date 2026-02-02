import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Megaphone, CheckSquare, Calendar, Users, ArrowRight, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Profile, Announcement, Task, ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/types"
import { format } from "date-fns"

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-muted text-muted-foreground",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, author:profiles!announcements_author_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: myTasks } = await supabase
    .from("tasks")
    .select("*, assignee:profiles!tasks_assigned_to_fkey(full_name)")
    .or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`)
    .in("status", ["pending", "in_progress"])
    .order("due_date", { ascending: true })
    .limit(5)

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5)

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: pendingTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "in_progress"])

  const permissions = ROLE_PERMISSIONS[profile?.role || "employee"]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's what's happening at your parish today."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Announcements
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Pending tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        {permissions.canManageUsers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Total users</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif">Recent Announcements</CardTitle>
              <CardDescription>Latest updates from the parish</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/announcements">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <div className="flex flex-col gap-3">
                {announcements.map((announcement: Announcement & { author: { full_name: string } | null }) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{announcement.title}</h4>
                        <Badge variant="secondary" className={priorityColors[announcement.priority]}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {announcement.author?.full_name || "Unknown"} • {format(new Date(announcement.created_at), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Megaphone className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No announcements yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif">My Tasks</CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/tasks">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myTasks && myTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {myTasks.map((task: Task & { assignee: { full_name: string } | null }) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                        <Badge variant="secondary" className={statusColors[task.status]}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Due {format(new Date(task.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                    {task.priority === "urgent" && (
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No pending tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif">Upcoming Events</CardTitle>
            <CardDescription>Scheduled masses, meetings, and ceremonies</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/schedule">
              View Calendar <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase">
                      {event.event_type}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.start_time), "EEEE, MMM d 'at' h:mm a")}
                  </p>
                  {event.location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
