import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Profile, ROLE_PERMISSIONS } from "@/lib/types"
import { UsersTable } from "@/components/dashboard/users-table"

export default async function UsersPage() {
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

  const permissions = ROLE_PERMISSIONS[currentProfile?.role || "employee"]

  if (!permissions.canManageUsers) {
    redirect("/dashboard")
  }

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage parish staff, volunteers, and their roles.
        </p>
      </div>

      <UsersTable users={(users as Profile[]) || []} currentUserId={user.id} />
    </div>
  )
}
