import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Profile, ChurchEvent, ROLE_PERMISSIONS } from "@/lib/types"
import { EventsCalendar } from "@/components/dashboard/events-calendar"

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      creator:profiles!events_created_by_fkey(id, full_name, role)
    `)
    .order("start_time", { ascending: true })

  const permissions = ROLE_PERMISSIONS[currentProfile?.role || "employee"]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
          Schedule
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage parish events, masses, and ceremonies.
        </p>
      </div>

      <EventsCalendar
        events={(events as (ChurchEvent & { creator: Pick<Profile, 'id' | 'full_name' | 'role'> | null })[]) || []}
        currentUserId={user.id}
        canManage={permissions.canManageEvents}
      />
    </div>
  )
}
