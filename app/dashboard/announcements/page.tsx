import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Profile, Announcement, ROLE_PERMISSIONS } from "@/lib/types"
import { AnnouncementsList } from "@/components/dashboard/announcements-list"

export default async function AnnouncementsPage() {
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

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, author:profiles!announcements_author_id_fkey(id, full_name, role)")
    .order("created_at", { ascending: false })

  const permissions = ROLE_PERMISSIONS[currentProfile?.role || "employee"]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
          Announcements
        </h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with the latest parish news and updates.
        </p>
      </div>

      <AnnouncementsList
        announcements={(announcements as (Announcement & { author: Pick<Profile, 'id' | 'full_name' | 'role'> | null })[]) || []}
        currentUserId={user.id}
        canManage={permissions.canManageAnnouncements}
        userRole={currentProfile?.role || "employee"}
      />
    </div>
  )
}
