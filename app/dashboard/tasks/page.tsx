import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Profile, Task, ROLE_PERMISSIONS } from "@/lib/types"
import { TasksList } from "@/components/dashboard/tasks-list"

export default async function TasksPage() {
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

  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles!tasks_assigned_to_fkey(id, full_name, role),
      creator:profiles!tasks_created_by_fkey(id, full_name, role)
    `)
    .order("created_at", { ascending: false })

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("full_name")

  const permissions = ROLE_PERMISSIONS[currentProfile?.role || "employee"]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
          Tasks
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and track parish tasks and assignments.
        </p>
      </div>

      <TasksList
        tasks={(tasks as (Task & { 
          assignee: Pick<Profile, 'id' | 'full_name' | 'role'> | null
          creator: Pick<Profile, 'id' | 'full_name' | 'role'> | null
        })[]) || []}
        users={(allUsers as Pick<Profile, 'id' | 'full_name' | 'role'>[]) || []}
        currentUserId={user.id}
        canManage={permissions.canManageTasks}
      />
    </div>
  )
}
